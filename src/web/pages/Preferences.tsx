import Head from '../components/Head.tsx';
import type { User } from '../../types/User.ts';
import type { UserPreferences } from '../../types/UserPreferences.ts';

export default (user: User, preferences: UserPreferences, error?: string, success?: string) => {
	return (
		<html>
			<Head title='Preferences' />
			<body class='h-full flex flex-col'>
				<div class='flex-1 p-8'>
					<div class='max-w-4xl mx-auto'>
						<div class='flex justify-between items-center mb-8'>
							<h1 class='font-bold text-4xl'>Preferences</h1>
							<a href='/dashboard' class='button'>← Back to Dashboard</a>
						</div>

						{error && (
							<div class='bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4'>
								{error}
							</div>
						)}

						{success && (
							<div class='bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4'>
								{success}
							</div>
						)}

						<form method='post' action='/dashboard/preferences' class='dark:bg-stone-800 rounded-2xl p-6 space-y-6'>
							<div>
								<h2 class='font-bold text-2xl mb-4'>Upload Settings</h2>
								
								<div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<label class='block text-sm font-medium mb-2'>Default Short ID Method</label>
										<select name='defaultSidMethod' class='input-text w-full'>
											<option value='default' selected={preferences.defaultSidMethod !== 'gfycat'}>
												Random String
											</option>
											<option value='gfycat' selected={preferences.defaultSidMethod === 'gfycat'}>
												Gfycat Style (Adjective-Animal)
											</option>
										</select>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Random String Length</label>
										<input 
											type='number' 
											name='defaultSidSize' 
											min='4' 
											max='32' 
											value={preferences.defaultSidSize || 10}
											class='input-text w-full'
										/>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Gfycat Adjective Count</label>
										<input 
											type='number' 
											name='defaultGfySize' 
											min='1' 
											max='5' 
											value={preferences.defaultGfySize || 2}
											class='input-text w-full'
										/>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Auto-delete files after (days)</label>
										<input 
											type='number' 
											name='autoDeleteAfter' 
											min='0' 
											max='365' 
											value={preferences.autoDeleteAfter || 0}
											class='input-text w-full'
											placeholder='0 = never delete'
										/>
									</div>
								</div>
							</div>							<div>
								<h2 class='font-bold text-2xl mb-4'>Appearance</h2>
								
								<div class='space-y-4'>
									<div>
										<label class='block text-sm font-medium mb-2'>Embed Accent Color</label>
										<input 
											type='color' 
											name='embedColor' 
											value={preferences.embedColor || '#f43f5e'}
											class='input-text w-32'
										/>
										<p class='text-xs text-gray-500 dark:text-gray-400 mt-1'>
											Color used in Discord/social media embeds
										</p>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Embed Title</label>
										<input 
											type='text' 
											name='embedTitle' 
											value={preferences.embedTitle || ''}
											class='input-text w-full'
											placeholder='Use {filename} for dynamic filename (default: {filename})'
										/>
										<p class='text-xs text-gray-500 dark:text-gray-400 mt-1'>
											Title shown in embeds. Use {'{filename}'} to include the actual filename.
										</p>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Embed Description</label>
										<input 
											type='text' 
											name='embedDescription' 
											value={preferences.embedDescription || ''}
											class='input-text w-full'
											placeholder='Custom description for embeds (default: "Meow fuck out the way")'
										/>
										<p class='text-xs text-gray-500 dark:text-gray-400 mt-1'>
											Description text shown in social media embeds
										</p>
									</div>

									<div>
										<label class='block text-sm font-medium mb-2'>Site Name</label>
										<input 
											type='text' 
											name='embedSiteName' 
											value={preferences.embedSiteName || ''}
											class='input-text w-full'
											placeholder='Custom site name (default: "Twink For Sale")'
										/>
										<p class='text-xs text-gray-500 dark:text-gray-400 mt-1'>
											Site name shown in social media embeds
										</p>
									</div>
								</div>
							</div>

							<div class='flex justify-end'>
								<button type='submit' class='button bg-blue-500 hover:bg-blue-600'>
									Save Preferences
								</button>
							</div>
						</form>
					</div>
				</div>
			</body>
		</html>
	);
};
