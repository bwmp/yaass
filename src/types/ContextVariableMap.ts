declare module 'hono' {
	interface ContextVariableMap {
		/**
		 * Domain (and optionally port) the request was called via
		 */
		domain: string;
		
		/**
		 * Authenticated user for protected routes
		 */
		user: import('./User.ts').User;
	}
}
