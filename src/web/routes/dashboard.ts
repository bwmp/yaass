import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { DB } from '../../database/db.ts';
import { log, SECRET } from '../../utils.ts';
import Dashboard from '../pages/Dashboard.tsx';
import LoginRegister from '../pages/LoginRegister.tsx';
import type { JWTPayload } from '../../types/JWTPayload.ts';

const route = new Hono();

route.get('/', async (ctx) => {
	const unauthResponse = () => ctx.html(LoginRegister('login', 'You must be logged in'));
	const token = getCookie(ctx, 'yaass');
	if (!token) return unauthResponse();
	try {
		const payload = await verify(token, await SECRET(), 'HS512') as JWTPayload;
		const user = DB.getUser(payload.user);
		
		if (!user) return unauthResponse();

		// Get only this user's uploads
		const uploads = DB.getUserUploads(user.uid);

		return ctx.html(Dashboard(user, uploads));
	} catch (ex) {
		const err = ex as { name: string; message: string };
		log.error(`dashboard auth failed [${err.name}]: ${err.message}`);
		return unauthResponse();
	}
});

export default route;
