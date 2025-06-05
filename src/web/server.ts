import { Hono } from 'hono';
import index from './routes/index.ts';

const app = new Hono();

// domain middleware
app.use((ctx, next) => {
	const url = new URL(ctx.req.url);
	
	// Check for common proxy headers that indicate the original request was HTTPS
	const forwardedProto = ctx.req.header('x-forwarded-proto');
	const forwardedSsl = ctx.req.header('x-forwarded-ssl');
	const proto = ctx.req.header('x-forwarded-protocol');
	
	// Determine if the original request was HTTPS
	const isHttps = forwardedProto === 'https' || 
					forwardedSsl === 'on' || 
					proto === 'https' ||
					url.protocol === 'https:';
	
	// Set the domain with the correct protocol
	const domain = `${isHttps ? 'https' : 'http'}://${url.host}`;
	ctx.set('domain', domain);
	
	return next();
});

// defaults
app.route('/', index);
app.route('/favicon.ico', index);
app.route('/favicon.png', index);

// routes
app.route('/stylesheet.css', (await import('./routes/stylesheet.css.ts')).default);
app.route('/dashboard', (await import('./routes/dashboard.ts')).default);
app.route('/dashboard', (await import('./routes/dashboard-features.ts')).default);
app.route('/register', (await import('./routes/register.ts')).default);
app.route('/login', (await import('./routes/login.ts')).default);
app.route('/upload', (await import('./routes/upload.ts')).default);
app.route('/', (await import('./routes/needle.ts')).default);

export default app.fetch;
