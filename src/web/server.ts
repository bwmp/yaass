import { Hono } from 'hono';
import index from './routes/index.ts';

const app = new Hono();

// domain middleware
app.use((ctx, next) => (ctx.set('domain', new URL(ctx.req.url).origin), next()));

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
