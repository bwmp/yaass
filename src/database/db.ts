import { Database } from 'bun:sqlite';
import { log, generateRandomString } from '../utils.ts';
import type { Upload } from '../types/Upload.ts';
import type { User } from '../types/User.ts';

// Prepare database on filesystem
const database = new Database('data/yaass.db');

export const DB = {
	init: () => {
		const [version] = database.prepare('select sqlite_version();').values()!;

		// Create users table
		database.prepare(
			`CREATE TABLE IF NOT EXISTS users (
			_id INTEGER PRIMARY KEY AUTOINCREMENT,
			uid TEXT NOT NULL,
			name TEXT NOT NULL,
			username TEXT NOT NULL,
			passhash TEXT NOT NULL,
			tokens TEXT NOT NULL,
			owner BOOLEAN NOT NULL,
			meta JSON NOT NULL
		);`,
		).run();

		// Create uploads table
		database.prepare(
			`CREATE TABLE IF NOT EXISTS uploads (
			_id INTEGER PRIMARY KEY AUTOINCREMENT,
			uid TEXT NOT NULL,
			sid TEXT NOT NULL,
			filename TEXT NOT NULL,
			location TEXT NOT NULL,
			timestamp NUMBER NOT NULL,
			hash TEXT NOT NULL,
			type TEXT NOT NULL,
			size NUMBER NOT NULL,
			uploader_uid TEXT NOT NULL
		);`,
		).run();

		log.info(`using sqlite ${version}`);
		return;
	},

	putUpload: (image: Upload) =>
		database.prepare(`
			INSERT INTO uploads (uid, sid, filename, location, timestamp, hash, type, size, uploader_uid)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`).run(
			image.uid,
			image.sid,
			image.filename,
			image.location,
			image.timestamp,
			image.hash,
			image.type,
			image.size,
			image.uploader_uid,
		),

	getUpload: (needle: string) => database.prepare(`SELECT * FROM uploads WHERE uid = ? OR sid = ?;`).get(needle, needle) as Upload,

	getUploads: (needle: string) =>
		database.prepare(`SELECT * FROM uploads WHERE uploader_uid = ? OR filehash = ?;`).all(needle, needle) as Upload[],

	getAllUploads: () => database.prepare(`SELECT * FROM uploads;`).all() as Upload[],

	deleteUpload: (needle: string) =>
		database.prepare(`DELETE FROM uploads WHERE uid = ? OR sid = ?;`).run(needle, needle),

	createUser: (user: User) =>
		database.prepare(`
			INSERT INTO users (uid, name, username, passhash, tokens, owner, meta)
			VALUES (?, ?, ?, ?, ?, ?, ?);`).run(
			user.uid,
			user.name,
			user.username,
			user.passhash,
			user.tokens,
			user.owner,
			user.meta,
		),

	getUser: (needle: string) => database.prepare(`SELECT * FROM users WHERE uid = ? OR username = ?;`).get(needle, needle) as User,

	getUserByToken: (token: string) =>
		database.prepare(`SELECT * FROM users WHERE ',' || tokens || ',' LIKE ?;`).get(`%,${token},%`) as User,

	getUsers: () => database.prepare(`SELECT * FROM USERS;`).all() as User[],

	// API Key management
	generateApiKey: (userUid: string) => {
		const apiKey = generateRandomString(32);
		const user = DB.getUser(userUid);
		if (!user) throw new Error('User not found');
		
		const tokens = user.tokens ? user.tokens.split(',').filter(t => t) : [];
		tokens.push(apiKey);
		
		database.prepare(`UPDATE users SET tokens = ? WHERE uid = ?;`).run(tokens.join(','), userUid);
		return apiKey;
	},

	revokeApiKey: (userUid: string, apiKey: string) => {
		const user = DB.getUser(userUid);
		if (!user) throw new Error('User not found');
		
		const tokens = user.tokens ? user.tokens.split(',').filter(t => t && t !== apiKey) : [];
		database.prepare(`UPDATE users SET tokens = ? WHERE uid = ?;`).run(tokens.join(','), userUid);
	},

	getUserApiKeys: (userUid: string) => {
		const user = DB.getUser(userUid);
		if (!user) return [];
		return user.tokens ? user.tokens.split(',').filter(t => t) : [];
	},

	// User preferences management
	updateUserPreferences: (userUid: string, preferences: Record<string, any>) => {
		const user = DB.getUser(userUid);
		if (!user) throw new Error('User not found');
		
		const currentMeta = user.meta ? JSON.parse(user.meta) : {};
		const updatedMeta = { ...currentMeta, preferences };
		
		database.prepare(`UPDATE users SET meta = ? WHERE uid = ?;`).run(JSON.stringify(updatedMeta), userUid);
	},

	getUserPreferences: (userUid: string) => {
		const user = DB.getUser(userUid);
		if (!user) return {};
		
		const meta = user.meta ? JSON.parse(user.meta) : {};
		return meta.preferences || {};
	},

	// Enhanced file management
	getUserUploads: (userUid: string) => 
		database.prepare(`SELECT * FROM uploads WHERE uploader_uid = ? ORDER BY timestamp DESC;`).all(userUid) as Upload[],

	bulkDeleteUploads: (uploadUids: string[]) => {
		const placeholders = uploadUids.map(() => '?').join(',');
		database.prepare(`DELETE FROM uploads WHERE uid IN (${placeholders});`).run(...uploadUids);
	},

	debug: () => {
		log.debug('database details');
		console.debug(`------------ users ------------`);
		console.debug(database.prepare(`PRAGMA table_info(users);`).all());
		console.debug(`------------ uploads ------------`);
		console.debug(database.prepare(`PRAGMA table_info(uploads);`).all());
	},
};
