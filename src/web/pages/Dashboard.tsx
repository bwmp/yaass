import Head from '../components/Head.tsx';
import type { Upload } from '../../types/Upload.ts';
import type { User } from '../../types/User.ts';

export default (user: User, uploads: Upload[]) => {
	return (
		<html>
			<Head title='Dashboard' />
			<body class='h-full flex flex-row'>
				<div class='h-full flex-none flex flex-col justify-center items-center p-16 gap-8'>
					<i class='icon not-italic'>A</i>
					<i class='icon not-italic'>B</i>
					<i class='icon not-italic'>C</i>
				</div>
				<div class='h-screen w-screen flex pr-16 py-16'>
					<div class='w-full p-8 flex flex-col overflow-scroll rounded-2xl dark:bg-stone-800'>
						<h1 class='font-bold text-7xl'>Welcome, {user.name}</h1>
						<div class='mt-8'>
							<h2 class='font-bold text-4xl mb-4'>Your Files</h2>
							<div class='grid grid-cols-3 gap-4'>
								{uploads.map((upload) => (
									<div key={upload.sid} class='flex flex-col items-center p-4 border rounded dark:border-stone-700'>
										<span class='dark:text-white'>{upload.filename}</span>
										{upload.type.startsWith('image/') && (
											<img
												src={`/${upload.sid}/inline`}
												alt={upload.filename}
												class='mt-2 max-w-full rounded'
											/>
										)}
										<button
											class='mt-2 p-2 bg-red-500 text-white rounded'
											onClick={() => {
												fetch(`/delete/${upload.sid}`, { method: 'DELETE' })
													.then((response) => {
													if (response.ok) {
														location.reload();
													} else {
														console.error('Failed to delete file');
													}
												})
												.catch((error) => console.error('Error:', error));
											}}
										>
											Delete
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
};
