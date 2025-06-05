export interface UserPreferences {
	defaultSidMethod?: 'default' | 'gfycat';
	defaultSidSize?: number;
	defaultGfySize?: number;
	autoDeleteAfter?: number; // days, 0 = never
	embedColor?: string;
	embedTitle?: string;
	embedDescription?: string;
	embedSiteName?: string;
}
