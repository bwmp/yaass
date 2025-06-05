import { Hono } from 'hono';
import { join, WHO_AM_I } from '../../utils.ts';
import deleteRoute from './delete.ts';

const route = new Hono();

route.get('/', async (ctx) => {
	// favicon loader
	if (ctx.req.url.endsWith('.ico') || ctx.req.url.endsWith('.png')) {
		const isPng = ctx.req.url.endsWith('.png');
		ctx.header('Content-Type', isPng ? 'image/png' : 'image/x-icon');
		return ctx.body(await Bun.file(join(isPng ? 'assets/yaass-logo.png' : 'assets/yaass.ico')).bytes());
	}

	return ctx.text(WHO_AM_I);
});

route.route('/delete', deleteRoute);

export default route;
