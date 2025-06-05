import { Hono } from 'hono';
import { DB } from '../../database/db.ts';
import Needle from '../pages/Needle.tsx';
import { log } from '../../utils.ts';

const route = new Hono();

route.get('/:needle/:disposition?', async (ctx) => {
	const needle = ctx.req.param('needle');
	const disposition = ctx.req.param('disposition') as 'attachment' | 'inline' | undefined;

	const upload = DB.getUpload(needle);
	if (!upload) return ctx.notFound();

	// * temporary condition to load inline images on discord
	// todo: replace with the fancy embed thing i forgot the name of
	if (ctx.req.header('User-Agent')?.includes('discord') && !disposition) {
		if (!upload) {
			return ctx.notFound();
		}

		// Determine the appropriate og:type and meta tags based on file type
		const isVideo = upload.type.startsWith('video/');
		const isImage = upload.type.startsWith('image/');
		const isAudio = upload.type.startsWith('audio/');

		let ogType = 'website';
		let mediaMetaTags = '';

		if (isVideo) {
			ogType = 'video.other';
			mediaMetaTags = `
				<meta property="og:video:url" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:video:secure_url" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:video:type" content="${upload.type}" />
				<meta property="og:video:width" content="1280" />
				<meta property="og:video:height" content="720" />
			`;
		} else if (isImage) {
			ogType = 'website';
			mediaMetaTags = `
				<meta property="og:image" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:image:secure_url" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:image:type" content="${upload.type}" />
			`;
		} else if (isAudio) {
			ogType = 'music.song';
			mediaMetaTags = `
				<meta property="og:audio" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:audio:secure_url" content="${ctx.get('domain')}/${upload.sid}/inline" />
				<meta property="og:audio:type" content="${upload.type}" />
			`;
		}

		const embedHtml = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta property="og:title" content="${upload.filename.replace(/"/g, '&quot;')}" />
				<meta property="og:description" content="Meow fuck out the way" />
				<meta property="og:url" content="${ctx.get('domain')}/${needle}" />
				<meta property="og:type" content="${ogType}" />
				<meta property="og:site_name" content="Twink For Sale" />
				${mediaMetaTags}
				<meta name="twitter:card" content="summary_large_image" />
				<title>${upload.filename.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
			</head>
			<body>
				<h1>Discord embed preview for ${upload.filename.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
				<p><a href="${ctx.get('domain')}/${upload.sid}/inline">View file directly</a></p>
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
