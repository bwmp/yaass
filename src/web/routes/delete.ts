import { Hono } from 'hono';
import { DB } from '../../database/db.ts';
import { log, SECRET } from '../../utils.ts';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

const route = new Hono();

route.use('*', async (ctx, next) => {
	const token = getCookie(ctx, 'yaass');
	if (!token) return ctx.text('Unauthorized', 401);

	try {
		await verify(token, await SECRET(), 'HS512');
		await next();
	} catch {
		return ctx.text('Unauthorized', 401);
	}
});

route.delete('/:sid', async (ctx) => {
	const sid = ctx.req.param('sid');
	const upload = DB.getUpload(sid);

	if (!upload) {
		return ctx.text('File not found', 404);
	}

	try {
		DB.deleteUpload(sid);
		log.info(`Deleted file: ${upload.filename} [${sid}]`);
		return ctx.text('File deleted successfully', 200);
	} catch (error: any) {
		log.error(`Failed to delete file: ${error.message}`);
		return ctx.text('Failed to delete file', 500);
	}
});

export default route;
