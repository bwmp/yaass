// Dashboard file management functionality
document.addEventListener('DOMContentLoaded', () => {
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
    updateDeleteButton();
});
