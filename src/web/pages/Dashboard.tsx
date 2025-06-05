import Head from '../components/Head.tsx';
import type { Upload } from '../../types/Upload.ts';
import type { User } from '../../types/User.ts';

export default (user: User, uploads: Upload[]) => {
	return (		<html>
			<Head title='Dashboard'>
				<script src='/dashboard/files.js'></script>
			</Head>
			<body class='h-full flex flex-row'>
				<div class='h-full flex-none flex flex-col justify-center items-center p-16 gap-8'>
					<a href='/dashboard' class='icon not-italic' title='Dashboard'>📁</a>
					<a href='/dashboard/api-keys' class='icon not-italic' title='API Keys'>🔑</a>
					<a href='/dashboard/preferences' class='icon not-italic' title='Preferences'>⚙️</a>
				</div>
				<div class='h-screen w-screen flex pr-16 py-16'>
					<div class='w-full p-8 flex flex-col rounded-2xl dark:bg-stone-800'>
						<h1 class='font-bold text-7xl'>Welcome, {user.name}</h1>
						
						<div class='mt-8'>
							<div class='flex justify-between items-center mb-4'>
								<h2 class='font-bold text-4xl'>Your Files</h2>
								<div class='flex gap-2'>
									<button id='selectAllBtn' class='button bg-gray-500 hover:bg-gray-600'>Select All</button>
									<button id='deleteSelectedBtn' class='button bg-red-500 hover:bg-red-600' disabled>Delete Selected</button>
								</div>
							</div><div class='grid grid-cols-3 gap-4'>
								{uploads.map((upload) => (
									<div key={upload.sid} class='flex flex-col items-center p-4 border rounded dark:border-stone-700 relative'>
										<input 
											type='checkbox' 
											class='file-checkbox absolute top-2 left-2' 
											data-upload-uid={upload.uid}
										/>
										<div class='flex flex-col items-center w-full'>
											<span class='dark:text-white font-medium text-center mb-2'>{upload.filename}</span>
											<div class='flex flex-wrap gap-1 text-xs text-gray-500 mb-3'>
												<span>{upload.type}</span>
												<span>•</span>
												<span>{Math.round(upload.size / 1024)}KB</span>
												<span>•</span>
												<span>{new Date(upload.timestamp).toLocaleDateString()}</span>
											</div>
											{upload.type.startsWith('image/') && (
												<img
													src={`/${upload.sid}/inline`}
													alt={upload.filename}
													class='mt-2 max-w-full max-h-48 rounded object-cover'
												/>
											)}
											{upload.type.startsWith('video/') && (
												<video
													src={`/${upload.sid}/inline`}
													class='mt-2 max-w-full max-h-48 rounded'
													controls
													preload='metadata'
												/>
											)}
											<div class='flex gap-2 mt-4 w-full'>
												<a 
													href={`/${upload.sid}`} 
													target='_blank'
													class='button bg-blue-500 hover:bg-blue-600 flex-1 text-center text-sm'
												>
													View
												</a>												<button
													class='button bg-green-500 hover:bg-green-600 flex-1 text-sm'
													onclick={`navigator.clipboard.writeText(window.location.origin + '/${upload.sid}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy URL', 2000)`}
												>
													Copy URL
												</button>
												<button
													class='button bg-red-500 hover:bg-red-600 flex-1 text-sm'
													onclick={`if(confirm('Delete ${upload.filename}?')) { fetch('/delete/${upload.sid}', { method: 'DELETE' }).then(() => window.location.reload()) }`}
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								))}								{uploads.length === 0 && (
									<div class='col-span-3 text-center py-12 text-gray-500'>
										<p class='text-xl'>No files uploaded yet</p>
										<p class='text-sm mt-2'>Use ShareX with your API key to upload files</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
};
