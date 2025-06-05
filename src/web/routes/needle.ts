import { Hono } from 'hono';
import { DB } from '../../database/db.ts';
import Needle from '../pages/Needle.tsx';

const route = new Hono();

route.get('/:needle/:disposition?', async (ctx) => {
	const needle = ctx.req.param('needle');
	const disposition = ctx.req.param('disposition') as 'attachment' | 'inline' | undefined;

	const upload = DB.getUpload(needle);
	if (!upload) return ctx.notFound();

	// * temporary condition to load inline images on discord
	// todo: replace with the fancy embed thing i forgot the name of
	if (ctx.req.header('User-Agent')?.includes('discord') && disposition != 'inline') {
		return ctx.redirect(ctx.get('domain').concat(`/${needle}/inline`));
	}

	// Add support for Discord embed
	if (ctx.req.header('User-Agent')?.includes('discord') && !disposition) {
		const embedHtml = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta property="og:title" content="${upload.filename}" />
				<meta property="og:description" content="File uploaded to YAASS" />
				<meta property="og:image" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:url" content="${ctx.get('domain')}/${needle}" />
			</head>
			<body>
				<p>Discord embed preview for ${upload.filename}</p>
			</body>
			</html>
		`;
		return ctx.html(embedHtml);
	}

	if (disposition == 'attachment' || disposition == 'inline') {
		ctx.header('Content-Length', `${upload.size}`);
		ctx.header('Content-Type', upload.type);
		ctx.header('Content-Disposition', `${disposition}; filename=${upload.filename}`);
		ctx.header('Cache-Control', 'public, max-age=2592000'); // 1 month
		ctx.header('Accept-Ranges', 'bytes');

		// todo: potentially re-optimize?
		return ctx.body(await Bun.file(upload.location).arrayBuffer());
		/*return honostream(ctx, async (stream) => {
			stream.onAbort(() => log.warn(`stream aborted!`));

			// asynchronously pipe file as response
			using file = await Deno.open(upload.location, { read: true });
			await stream.pipe(file.readable);
		}, (err, stream) => {
			log.error(`${err.name}: ${err.message}\n${err.stack}`);
			return Promise.resolve(stream.abort());
		});*/
	}

	return ctx.html(Needle(upload, `${ctx.get('domain')}/${upload.sid}/inline`));
});

export default route;
