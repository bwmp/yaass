// Dashboard upload functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const dropText = document.getElementById('dropText');

    // File selection and drag-drop handlers
    let selectedFiles = [];

    const updateUploadButton = () => {
        uploadBtn.disabled = selectedFiles.length === 0;
        uploadBtn.textContent = selectedFiles.length > 0 ? 
            `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}` : 
            'Upload Files';
    };

    const displaySelectedFiles = () => {
        if (selectedFiles.length > 0) {
            dropText.innerHTML = `
                <p class="text-lg">${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected</p>
                <ul class="text-sm text-gray-500 mt-2 max-h-20 overflow-y-auto">
                    ${selectedFiles.map(file => `<li>• ${file.name} (${Math.round(file.size / 1024)}KB)</li>`).join('')}
                </ul>
            `;
        } else {
            dropText.innerHTML = `
                <p class="text-xl">Drag & drop files here or click to select</p>
                <p class="text-sm text-gray-500 mt-2">Supports multiple files</p>
            `;
        }
    };

    // Click to select files
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        displaySelectedFiles();
        updateUploadButton();
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-rose-500', 'bg-rose-50', 'dark:bg-rose-900/20');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-rose-500', 'bg-rose-50', 'dark:bg-rose-900/20');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-rose-500', 'bg-rose-50', 'dark:bg-rose-900/20');
        
        selectedFiles = Array.from(e.dataTransfer.files);
        displaySelectedFiles();
        updateUploadButton();
    });

    // Upload handler
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (selectedFiles.length === 0) return;

        uploadBtn.disabled = true;
        uploadProgress.classList.remove('hidden');
        uploadProgress.innerHTML = '';

        // Upload files one by one to show individual progress
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const progressContainer = document.createElement('div');
            progressContainer.className = 'border dark:border-stone-600 rounded p-3';
            progressContainer.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium">${file.name}</span>
                    <span class="text-xs text-gray-500">${Math.round(file.size / 1024)}KB</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-rose-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">Uploading...</div>
            `;
            uploadProgress.appendChild(progressContainer);

            const progressBar = progressContainer.querySelector('.bg-rose-500');
            const statusText = progressContainer.querySelector('.text-xs');

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    progressBar.style.width = '100%';
                    statusText.textContent = 'Uploaded successfully!';
                    statusText.className = 'text-xs text-green-600 mt-1';
                } else {
                    progressBar.style.width = '100%';
                    progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                    statusText.textContent = 'Upload failed!';
                    statusText.className = 'text-xs text-red-600 mt-1';
                }
            } catch (error) {
                progressBar.style.width = '100%';
                progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                statusText.textContent = 'Upload error!';
                statusText.className = 'text-xs text-red-600 mt-1';
            }
        }

        // Reset form after all uploads
        setTimeout(() => {
            selectedFiles = [];
            fileInput.value = '';
            displaySelectedFiles();
            updateUploadButton();
            uploadProgress.classList.add('hidden');
            uploadBtn.disabled = false;
            
            // Reload page to show new files
            location.reload();
        }, 2000);
    });

    // Bulk file management
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const fileCheckboxes = document.querySelectorAll('.file-checkbox');

    const updateDeleteButton = () => {
        const checkedBoxes = document.querySelectorAll('.file-checkbox:checked');
        deleteSelectedBtn.disabled = checkedBoxes.length === 0;
        deleteSelectedBtn.textContent = checkedBoxes.length > 0 ? 
            `Delete ${checkedBoxes.length} selected` : 
            'Delete Selected';
    };

    fileCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateDeleteButton);
    });

    selectAllBtn.addEventListener('click', () => {
        const allChecked = Array.from(fileCheckboxes).every(cb => cb.checked);
        fileCheckboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        selectAllBtn.textContent = allChecked ? 'Select All' : 'Unselect All';
        updateDeleteButton();
    });

    deleteSelectedBtn.addEventListener('click', async () => {
        const checkedBoxes = document.querySelectorAll('.file-checkbox:checked');
        const uploadUids = Array.from(checkedBoxes).map(cb => cb.dataset.uploadUid);
        
        if (!confirm(`Delete ${uploadUids.length} selected files? This cannot be undone.`)) {
            return;
        }

        deleteSelectedBtn.disabled = true;
        deleteSelectedBtn.textContent = 'Deleting...';

        try {
            const response = await fetch('/dashboard/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploadUids })
            });

            if (response.ok) {
                location.reload();
            } else {
                alert('Failed to delete some files');
                deleteSelectedBtn.disabled = false;
                updateDeleteButton();
            }
        } catch (error) {
            alert('Error deleting files');
            deleteSelectedBtn.disabled = false;
            updateDeleteButton();
        }
    });

    // Initialize button states
    updateUploadButton();
    updateDeleteButton();
});
