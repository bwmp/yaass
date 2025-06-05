import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { DB } from '../../database/db.ts';
import { join, log, SECRET } from '../../utils.ts';
import ApiKeys from '../pages/ApiKeys.tsx';
import Preferences from '../pages/Preferences.tsx';
import type { JWTPayload } from '../../types/JWTPayload.ts';

const route = new Hono();

// Middleware to verify authentication
const requireAuth = async (ctx: any, next: any) => {
	const token = getCookie(ctx, 'yaass');
	if (!token) {
		return ctx.redirect('/login');
	}

	try {
		const payload = await verify(token, await SECRET(), 'HS512') as JWTPayload;
		const user = DB.getUser(payload.user);
		
		if (!user) {
			return ctx.redirect('/login');
		}
		
		ctx.set('user', user);
		await next();	} catch (ex) {
		log.error(`Auth verification failed: ${ex}`);
		return ctx.redirect('/login');
	}
};

// Apply auth middleware to all routes
route.use('*', requireAuth);

// Files JavaScript
route.get('/files.js', async (ctx) => {
	ctx.header('Content-Type', 'text/javascript');
	return ctx.body(await Bun.file(join('src/web/js/dashboard-files.js')).text());
});

// API Keys management
route.get('/api-keys', async (ctx) => {
	const user = ctx.get('user');
	const apiKeys = DB.getUserApiKeys(user.uid);
	return ctx.html(ApiKeys(user, apiKeys));
});

route.post('/api-keys/generate', async (ctx) => {
	const user = ctx.get('user');
	try {
		const newApiKey = DB.generateApiKey(user.uid);
		const apiKeys = DB.getUserApiKeys(user.uid);
		return ctx.html(ApiKeys(user, apiKeys, undefined, `New API key generated: ${newApiKey}`));
	} catch (error) {
		const apiKeys = DB.getUserApiKeys(user.uid);
		return ctx.html(ApiKeys(user, apiKeys, 'Failed to generate API key'));
	}
});

route.post('/api-keys/revoke', async (ctx) => {
	const user = ctx.get('user');
	const body = await ctx.req.parseBody();
	const apiKey = body.apiKey as string;
	
	if (!apiKey) {
		const apiKeys = DB.getUserApiKeys(user.uid);
		return ctx.html(ApiKeys(user, apiKeys, 'No API key specified'));
	}

	try {
		DB.revokeApiKey(user.uid, apiKey);
		const apiKeys = DB.getUserApiKeys(user.uid);
		return ctx.html(ApiKeys(user, apiKeys, undefined, 'API key revoked successfully'));
	} catch (error) {
		const apiKeys = DB.getUserApiKeys(user.uid);
		return ctx.html(ApiKeys(user, apiKeys, 'Failed to revoke API key'));
	}
});

// Preferences management
route.get('/preferences', async (ctx) => {
	const user = ctx.get('user');
	const preferences = DB.getUserPreferences(user.uid);
	return ctx.html(Preferences(user, preferences));
});

route.post('/preferences', async (ctx) => {
	const user = ctx.get('user');
	const body = await ctx.req.parseBody();
		const preferences = {
		defaultSidMethod: body.defaultSidMethod as 'default' | 'gfycat',
		defaultSidSize: parseInt(body.defaultSidSize as string) || 10,
		defaultGfySize: parseInt(body.defaultGfySize as string) || 2,
		autoDeleteAfter: parseInt(body.autoDeleteAfter as string) || 0,
		embedColor: body.embedColor as string || '#f43f5e',
		embedTitle: body.embedTitle as string || '',
		embedDescription: body.embedDescription as string || '',
		embedSiteName: body.embedSiteName as string || '',
	};

	try {
		DB.updateUserPreferences(user.uid, preferences);
		return ctx.html(Preferences(user, preferences, undefined, 'Preferences saved successfully'));
	} catch (error) {
		return ctx.html(Preferences(user, preferences, 'Failed to save preferences'));
	}
});

// Bulk file operations
route.post('/bulk-delete', async (ctx) => {
	const user = ctx.get('user');
	const body = await ctx.req.json();
	const uploadUids = body.uploadUids as string[];

	if (!uploadUids || !Array.isArray(uploadUids)) {
		return ctx.json({ error: 'Invalid upload UIDs' }, 400);
	}

	try {
		// Verify all uploads belong to this user
		const userUploads = DB.getUserUploads(user.uid);
		const userUploadUids = userUploads.map(u => u.uid);
		const invalidUids = uploadUids.filter(uid => !userUploadUids.includes(uid));

		if (invalidUids.length > 0) {
			return ctx.json({ error: 'Some files do not belong to you' }, 403);
		}

		// Delete files from filesystem
		for (const uid of uploadUids) {
			const upload = DB.getUpload(uid);
			if (upload) {
				try {
					await Bun.file(join(upload.location)).unlink();				} catch (error) {
					log.warn(`Failed to delete file: ${upload.location} - ${error}`);
				}
			}
		}

		// Delete from database
		DB.bulkDeleteUploads(uploadUids);
		
		log.info(`Bulk deleted ${uploadUids.length} files for user ${user.username}`);
		return ctx.json({ success: true });	} catch (error) {
		log.error(`Bulk delete failed: ${error}`);
		return ctx.json({ error: 'Failed to delete files' }, 500);
	}
});

export default route;
