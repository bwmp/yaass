import Head from '../components/Head.tsx';
import type { User } from '../../types/User.ts';

export default (user: User, apiKeys: string[], error?: string, success?: string) => {
	return (
		<html>
			<Head title='API Keys' />
			<body class='h-full flex flex-col'>
				<div class='flex-1 p-8'>
					<div class='max-w-4xl mx-auto'>
						<div class='flex justify-between items-center mb-8'>
							<h1 class='font-bold text-4xl'>API Keys</h1>
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

						<div class='dark:bg-stone-800 rounded-2xl p-6'>
							<div class='flex justify-between items-center mb-6'>
								<h2 class='font-bold text-2xl'>Your API Keys</h2>
								<form method='post' action='/dashboard/api-keys/generate' style='display: inline;'>
									<button type='submit' class='button bg-green-500 hover:bg-green-600'>
										Generate New Key
									</button>
								</form>
							</div>

							{apiKeys.length === 0 ? (
								<p class='text-gray-600 dark:text-gray-400 italic'>
									No API keys generated yet. Create one to upload files via ShareX or other tools.
								</p>
							) : (
								<div class='space-y-4'>
									{apiKeys.map((key, index) => (
										<div key={key} class='flex items-center justify-between p-4 border dark:border-stone-700 rounded-lg'>
											<div class='flex-1'>
												<span class='font-mono text-sm bg-gray-100 dark:bg-stone-700 px-3 py-1 rounded'>
													{key}
												</span>
											</div>
											<form method='post' action='/dashboard/api-keys/revoke' style='display: inline;'>
												<input type='hidden' name='apiKey' value={key} />
												<button 
													type='submit' 
													class='button bg-red-500 hover:bg-red-600 ml-4'
													onclick='return confirm("Are you sure you want to revoke this API key?")'
												>
													Revoke
												</button>
											</form>
										</div>
									))}
								</div>
							)}

							<div class='mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
								<h3 class='font-bold text-lg mb-2'>ShareX Configuration</h3>
								<p class='text-sm text-gray-600 dark:text-gray-400 mb-3'>
									Use this configuration for ShareX custom uploader:
								</p>
								<pre class='text-xs bg-gray-100 dark:bg-stone-700 p-3 rounded overflow-x-auto'>
{`{
  "Version": "15.0.0",
  "Name": "YAASS Upload",
  "DestinationType": "ImageUploader, FileUploader",
  "RequestMethod": "POST",
  "RequestURL": "${new URL('/upload', 'http://localhost:3000').toString()}",
  "Headers": {
    "Authorization": "YOUR_API_KEY_HERE"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "{json:url}"
}`}
								</pre>
								<p class='text-xs text-gray-500 dark:text-gray-500 mt-2'>
									Replace "YOUR_API_KEY_HERE" with one of your API keys above.
								</p>
							</div>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
};
