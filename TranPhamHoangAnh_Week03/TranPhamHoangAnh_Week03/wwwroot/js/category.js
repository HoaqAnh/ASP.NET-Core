document.addEventListener('DOMContentLoaded', function () {
    const categoryTableBody = document.getElementById('categoryTableBody');
    const categoryModalElement = document.getElementById('categoryModal');
    const deleteCategoryModalElement = document.getElementById('deleteCategoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const categoryModalTitle = document.getElementById('categoryModalTitle');
    const btnAddCategory = document.getElementById('btnAddCategory');
    // Nút thêm trong empty state sẽ được xử lý khi render
    // const btnAddCategoryEmptyState = document.getElementById('btnAddCategoryEmptyState');

    let currentCategoryId = null;
    const API_URL = '/api/Categories';

    // ----- UTILITY FUNCTIONS -----
    function openModal(modalElem) {
        if (modalElem) {
            modalElem.classList.add('open'); //modalElem.style.display = 'flex'; // Hoặc modalElem.classList.add('open'); nếu dùng CSS class
        }
    }

    function closeModal(modalElem) {
        if (modalElem) {
            modalElem.classList.remove('open');  //modalElem.style.display = 'none'; // Hoặc modalElem.classList.remove('open');
        }
    }

    function resetCategoryForm() {
        if (categoryForm) {
            categoryForm.reset();
            document.getElementById('categoryId').value = '';
        }
        currentCategoryId = null;
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());
    }

    function displayFormErrors(errors, formElement) {
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());
        if (!errors || !formElement) return;

        for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
                const messages = errors[key];
                const inputField = formElement.elements[key];

                if (inputField && messages.length > 0) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message-field';
                    errorDiv.textContent = messages.join(', ');
                    inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);
                } else {
                    console.warn(`Lỗi form không tìm thấy field cho key: ${key}`, messages);
                    const generalErrorContainer = formElement.querySelector('.form-actions');
                    if (generalErrorContainer) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message-field';
                        errorDiv.textContent = `${key}: ${messages.join(', ')}`;
                        generalErrorContainer.parentNode.insertBefore(errorDiv, generalErrorContainer);
                    }
                }
            }
        }
    }

    // ----- FETCH AND RENDER CATEGORIES -----
    async function fetchAndRenderCategories() {
        if (!categoryTableBody) return;
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Không thể tải danh mục'}`);
            }
            const categories = await response.json();
            renderCategories(categories);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            categoryTableBody.innerHTML = `<tr><td colspan="3" class="empty-state-cell">${error.message}</td></tr>`;
        }
    }

    function renderCategories(categories) {
        if (!categoryTableBody) return;
        categoryTableBody.innerHTML = '';

        if (!categories || categories.length === 0) {
            categoryTableBody.innerHTML = `
                <tr id="categoryEmptyStateRow">
                    <td colspan="3" class="empty-state-cell">
                        <div class="empty-state-content">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M11 9h2V7h-2zm1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.48 4 2 8.48 2 14s4.48 10 10 10s10-4.48 10-10S17.52 4 12 4m0 11c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2"/></svg>
                            <p>Không có danh mục nào.</p>
                            <button class="btn-add small" id="btnAddCategoryEmptyState">Thêm danh mục mới</button>
                        </div>
                    </td>
                </tr>`;
            const btnAddEmptyState = document.getElementById('btnAddCategoryEmptyState');
            if (btnAddEmptyState) {
                btnAddEmptyState.addEventListener('click', handleOpenAddCategoryModal);
            }
            return;
        }

        categories.forEach(category => {
            const row = categoryTableBody.insertRow();
            row.setAttribute('data-id', category.id);
            row.innerHTML = `
                <td data-label="Tên danh mục">${category.name}</td>
                <td data-label="Mô tả">${category.description || ''}</td>
                <td data-label="Hành động">
                    <button class="btn-icon btn-edit" data-id="${category.id}" title="Sửa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 5.63l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41"/></svg>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${category.id}" title="Xóa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
                    </button>
                </td>
            `;
        });
    }

    // ----- ADD CATEGORY -----
    function handleOpenAddCategoryModal() {
        resetCategoryForm();
        if (categoryModalTitle) categoryModalTitle.textContent = 'Thêm danh mục mới';
        openModal(categoryModalElement);
    }

    // ----- EDIT CATEGORY -----
    async function handleOpenEditCategoryModal(categoryId) {
        resetCategoryForm();
        currentCategoryId = categoryId;
        try {
            const response = await fetch(`${API_URL}/${categoryId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Không tìm thấy danh mục." }));
                throw new Error(errorData.message);
            }
            const category = await response.json();

            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';

            if (categoryModalTitle) categoryModalTitle.textContent = 'Cập nhật danh mục';
            openModal(categoryModalElement);
        } catch (error) {
            console.error("Lỗi khi tải danh mục để sửa:", error);
            alert(`Lỗi khi tải danh mục để sửa: ${error.message}`);
        }
    }

    // ----- SAVE CATEGORY (CREATE/UPDATE) -----
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const id = document.getElementById('categoryId').value;
            const isUpdating = !!id;

            const categoryName = document.getElementById('categoryName').value;
            const categoryDescription = document.getElementById('categoryDescription').value;

            if (!categoryName.trim()) {
                alert("Tên danh mục không được để trống.");
                document.getElementById('categoryName').focus();
                return;
            }

            const categoryData = {
                id: isUpdating ? parseInt(id) : 0,
                name: categoryName,
                description: categoryDescription
            };

            try {
                const response = await fetch(isUpdating ? `${API_URL}/${id}` : API_URL, {
                    method: isUpdating ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData)
                });

                if (!response.ok) {
                    let errorData;
                    try { errorData = await response.json(); }
                    catch (e) { errorData = { message: `Lỗi máy chủ: ${response.status} ${response.statusText}`, errors: {} }; }

                    console.error("Lỗi từ server:", errorData);
                    if (errorData.errors) {
                        displayFormErrors(errorData.errors, categoryForm);
                        alert(`Lỗi khi lưu danh mục. Vui lòng kiểm tra lại thông tin.`);
                    } else {
                        alert(`Lỗi khi lưu danh mục: ${errorData.title || errorData.message || 'Lỗi không xác định.'}`);
                    }
                    return;
                }

                closeModal(categoryModalElement);
                await fetchAndRenderCategories();
                alert(isUpdating ? 'Danh mục đã được cập nhật!' : 'Danh mục đã được thêm mới!');

            } catch (error) {
                console.error("Lỗi khi lưu danh mục:", error);
                alert(`Đã xảy ra lỗi kết nối hoặc lỗi không xác định: ${error.message}`);
            }
        });
    }

    // ----- DELETE CATEGORY -----
    function handleOpenDeleteCategoryModal(categoryId) {
        currentCategoryId = categoryId;
        const categoryRow = categoryTableBody.querySelector(`tr[data-id="${categoryId}"]`);
        const categoryNameElement = document.getElementById('categoryNameToDelete');

        if (categoryRow && categoryNameElement) {
            const name = categoryRow.cells[0].textContent;
            categoryNameElement.textContent = name;
        } else {
            if (categoryNameElement) categoryNameElement.textContent = "";
        }
        openModal(deleteCategoryModalElement);
    }

    const btnDeleteCategoryConfirm = deleteCategoryModalElement?.querySelector('.btn-delete-confirm');
    if (btnDeleteCategoryConfirm) {
        btnDeleteCategoryConfirm.addEventListener('click', async function () {
            if (!currentCategoryId) return;

            try {
                const response = await fetch(`${API_URL}/${currentCategoryId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Lỗi khi xóa: ${response.statusText}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json().catch(() => ({ message: 'Danh mục đã được xóa.' }));

                closeModal(deleteCategoryModalElement);
                await fetchAndRenderCategories();
                alert(result.message || 'Danh mục đã được xóa.');
                currentCategoryId = null;

            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                alert(`Lỗi khi xóa danh mục: ${error.message}`);
            }
        });
    }

    // ----- EVENT LISTENERS -----
    if (btnAddCategory) {
        btnAddCategory.addEventListener('click', handleOpenAddCategoryModal);
    }

    document.querySelectorAll('.modal .modal-close, .modal .btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const modalToClose = this.closest('.modal');
            if (modalToClose) closeModal(modalToClose);
        });
    });

    if (categoryTableBody) {
        categoryTableBody.addEventListener('click', function (event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            const categoryId = targetButton.dataset.id;
            if (targetButton.classList.contains('btn-edit')) {
                handleOpenEditCategoryModal(categoryId);
            } else if (targetButton.classList.contains('btn-delete')) {
                handleOpenDeleteCategoryModal(categoryId);
            }
        });
    }

    // Initial load
    fetchAndRenderCategories();
});