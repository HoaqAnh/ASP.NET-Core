document.addEventListener('DOMContentLoaded', function () {
    const productGrid = document.querySelector('.product-grid');
    const productModalElement = document.getElementById('productModal');
    const deleteModalElement = document.getElementById('deleteModal');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnAddProduct = document.getElementById('btnAddProduct');
    const btnAddEmptyState = document.querySelector('.empty-state .btn-add');
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOrderFilter = document.getElementById('sortOrder');

    // Pagination elements
    const paginationContainer = document.querySelector('.pagination');
    const paginationNumbers = document.querySelector('.pagination-numbers');
    const prevPageButton = document.querySelector('.pagination-prev');
    const nextPageButton = document.querySelector('.pagination-next');


    let currentProductId = null;
    let currentPage = 1;
    const pageSize = 10;
    let totalProducts = 0;

    const API_URL = '/api/Products';

    // ----- UTILITY FUNCTIONS -----
    function openModal(modalElement) { // Sử dụng tên biến đã khai báo ở đầu file, ví dụ `productModal`
        if (modalElement) {
            console.log("Mở modal:", modalElement.id);
            modalElement.classList.add('open'); // Thêm class 'open'
        } else {
            console.error("Modal element không tồn tại để mở.");
        }
    }

    function closeModal(modalElement) { // Sử dụng tên biến đã khai báo ở đầu file
        if (modalElement) {
            console.log("Đóng modal:", modalElement.id);
            modalElement.classList.remove('open'); // Xóa class 'open'
        } else {
            console.error("Modal element không tồn tại để đóng.");
        }
    }

    function resetForm() {
        productForm.reset();
        document.getElementById('productId').value = '';
        // Reset select to default option
        document.getElementById('productCategory').selectedIndex = 0;
        currentProductId = null;
        // Xóa các thông báo lỗi cũ (nếu có)
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());
    }

    function displayFormErrors(errors) {
        // Xóa các thông báo lỗi cũ
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());

        for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
                const messages = errors[key];
                // Input name trong form thường là PascalCase (ví dụ: "Name", "Price")
                // JavaScript key có thể là camelCase (ví dụ: "name", "price")
                // Tìm input field. Cần chuẩn hóa key (ví dụ, key 'name' trong lỗi có thể ứng với input id 'productName')
                let inputField;
                if (key.toLowerCase().includes("categoryid") || key.toLowerCase().includes("category.name")) {
                    inputField = document.getElementById('productCategory');
                } else {
                    inputField = document.getElementById(`product${key.charAt(0).toUpperCase() + key.slice(1)}`) || productForm.elements[key];
                }


                if (inputField && messages.length > 0) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message-field';
                    errorDiv.style.color = 'red';
                    errorDiv.style.fontSize = '0.9em';
                    errorDiv.textContent = messages.join(', ');
                    inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);
                } else {
                    console.warn(`Lỗi form không tìm thấy field cho key: ${key}`, messages);
                }
            }
        }
    }


    // ----- FETCH AND RENDER PRODUCTS (READ) -----
    async function fetchAndRenderProducts() {
        const searchTerm = searchInput.value;
        const category = categoryFilter.value;
        const sortBy = sortOrderFilter.value;

        let url = `${API_URL}?pageNumber=${currentPage}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchString=${encodeURIComponent(searchTerm)}`;
        if (category) url += `&categoryName=${encodeURIComponent(category)}`;
        if (sortBy) url += `&sortBy=${sortBy}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Không thể tải sản phẩm'}`);
            }
            const data = await response.json();
            renderProducts(data.items);
            totalProducts = data.totalCount;
            updatePaginationControls();

        } catch (error) {
            console.error("Failed to fetch products:", error);
            productGrid.innerHTML = `<p class="error-message">${error.message}</p>`;
            paginationContainer.style.display = 'none';
        }
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';
        if (!products || products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11 9h2V7h-2zm1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.48 4 2 8.48 2 14s4.48 10 10 10s10-4.48 10-10S17.52 4 12 4m0 11c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2"/>
                    </svg>
                    <p>Không có sản phẩm nào phù hợp</p>
                    ${!searchInput.value && !categoryFilter.value ? '<button class="btn-add" id="btnAddEmptyStateRendered">Thêm sản phẩm mới</button>' : ''}
                </div>`;
            const btnAddEmptyStateRendered = document.getElementById('btnAddEmptyStateRendered');
            if (btnAddEmptyStateRendered) {
                btnAddEmptyStateRendered.addEventListener('click', handleOpenAddModal);
            }
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageUrl || '/images/placeholder.jpg'}" alt="${product.name}" loading="lazy"/>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        <p class="product-category">${product.category ? product.category.name : 'Chưa phân loại'}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn-edit" data-id="${product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zm20.71 5.63l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41"/></svg> Sửa
                        </button>
                        <button class="btn-delete" data-id="${product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg> Xóa
                        </button>
                    </div>
                </div>`;
            productGrid.insertAdjacentHTML('beforeend', productCard);
        });
    }


    // ----- PAGINATION -----
    function updatePaginationControls() {
        if (!paginationNumbers) return;
        paginationNumbers.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / pageSize);

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        const currentPageSpan = document.createElement('span');
        currentPageSpan.textContent = currentPage;
        currentPageSpan.classList.add('active');
        paginationNumbers.appendChild(currentPageSpan);


        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchAndRenderProducts();
            }
        });
    }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(totalProducts / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                fetchAndRenderProducts();
            }
        });
    }


    // ----- ADD PRODUCT (CREATE) -----
    function handleOpenAddModal() {
        resetForm();
        modalTitle.textContent = 'Thêm sản phẩm mới';
        openModal(productModalElement);
    }

    // ----- EDIT PRODUCT (UPDATE) -----
    async function handleOpenEditModal(productId) {
        resetForm(); // Gọi resetForm trước
        currentProductId = productId;
        try {
            const response = await fetch(`${API_URL}/${productId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Không tìm thấy sản phẩm." }));
                throw new Error(errorData.message);
            }
            const product = await response.json();

            // console.log("Sản phẩm để sửa:", product); // Debug

            if (document.getElementById('productId')) document.getElementById('productId').value = product.id;
            if (document.getElementById('productName')) document.getElementById('productName').value = product.name;
            if (document.getElementById('productPrice')) document.getElementById('productPrice').value = product.price;

            const quantityInput = document.getElementById('productQuantity');
            if (quantityInput) quantityInput.value = product.quantity || 0;

            if (document.getElementById('productDescription')) document.getElementById('productDescription').value = product.description || '';
            if (document.getElementById('productImage')) document.getElementById('productImage').value = product.imageUrl || '';

            const categorySelect = document.getElementById('productCategory');
            if (categorySelect) {
                if (product.categoryId) {
                    categorySelect.value = product.categoryId; // Chọn categoryId trong dropdown
                } else {
                    categorySelect.value = ""; // Không có category hoặc chọn "Chọn danh mục"
                }
            }

            if (modalTitle) modalTitle.textContent = 'Cập nhật sản phẩm';
            openModal(productModalElement); // Sử dụng biến productModalElement
            // Hoặc productModal nếu đó là tên biến bạn dùng
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm để sửa:", error);
            alert(`Lỗi khi tải sản phẩm để sửa: ${error.message}`);
        }
    }

    // ----- SAVE PRODUCT (CREATE/UPDATE) -----
    if (productForm) {
        productForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const idInput = document.getElementById('productId');
            const id = idInput ? idInput.value : null;
            const isUpdating = !!id;

            const productNameInput = document.getElementById('productName');
            const productPriceInput = document.getElementById('productPrice');
            const productCategorySelect = document.getElementById('productCategory');
            const productQuantityInput = document.getElementById('productQuantity');
            const productDescriptionInput = document.getElementById('productDescription');
            const productImageInput = document.getElementById('productImage');

            const productName = productNameInput ? productNameInput.value : '';
            const productPrice = productPriceInput ? productPriceInput.value : '';
            const selectedCategoryId = productCategorySelect ? productCategorySelect.value : '';


            // Client-side validation
            if (!productName.trim()) {
                alert("Tên sản phẩm không được để trống.");
                if (productNameInput) productNameInput.focus();
                return;
            }
            if (isNaN(parseFloat(productPrice)) || parseFloat(productPrice) < 0) {
                alert("Giá sản phẩm không hợp lệ.");
                if (productPriceInput) productPriceInput.focus();
                return;
            }
            const quantityValue = productQuantityInput ? parseInt(productQuantityInput.value) : 0;
            if (productQuantityInput && (isNaN(quantityValue) || quantityValue < 0)) {
                alert("Số lượng không hợp lệ.");
                productQuantityInput.focus();
                return;
            }
            if (!selectedCategoryId) { // category bắt buộc
                alert("Vui lòng chọn danh mục.");
                if(productCategorySelect) productCategorySelect.focus();
                return;
            }

            const productData = {
                id: isUpdating ? parseInt(id) : 0,
                name: productName,
                price: parseFloat(productPrice),
                description: productDescriptionInput ? productDescriptionInput.value : '',
                imageUrl: productImageInput ? productImageInput.value : '',
                quantity: quantityValue,
                categoryId: selectedCategoryId ? parseInt(selectedCategoryId) : null
            };

            console.log("Đang gửi dữ liệu sản phẩm:", productData);

            try {
                const response = await fetch(isUpdating ? `${API_URL}/${id}` : API_URL, {
                    method: isUpdating ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });

                if (!response.ok) {
                    let errorData;
                    try { errorData = await response.json(); }
                    catch (e) { errorData = { message: `Lỗi máy chủ: ${response.status} ${response.statusText}`, errors: {} }; }

                    console.error("Lỗi từ server:", errorData);
                    if (errorData.errors) {
                        displayFormErrors(errorData.errors, productForm);
                        alert(`Lỗi khi lưu sản phẩm. Vui lòng kiểm tra lại thông tin.`);
                    } else {
                        alert(`Lỗi khi lưu sản phẩm: ${errorData.title || errorData.message || 'Lỗi không xác định.'}`);
                    }
                    return;
                }

                closeModal(productModalElement);
                await fetchAndRenderProducts();
                alert(isUpdating ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm đã được thêm mới!');
            } catch (error) {
                console.error("Lỗi khi lưu sản phẩm (catch chung):", error);
                alert(`Đã xảy ra lỗi kết nối hoặc lỗi không xác định: ${error.message}`);
            }
        });
    } else {
        console.error("Product form (#productForm) không tìm thấy.");
    }

    // ----- DELETE PRODUCT -----
    function handleOpenDeleteModal(productId) {
        currentProductId = productId;
        // Optional: Hiển thị tên sản phẩm trong modal xác nhận xóa
        const productName = document.querySelector(`.product-card button[data-id="${productId}"]`).closest('.product-card').querySelector('h3').textContent;
        document.querySelector('#deleteModal .product-name-to-delete').textContent = productName;
        openModal(deleteModalElement);
    }

    const btnDeleteConfirm = document.querySelector('#deleteModal .btn-delete-confirm');
    if (btnDeleteConfirm) {
        btnDeleteConfirm.addEventListener('click', async function () {
            if (!currentProductId) return;

            try {
                const response = await fetch(`${API_URL}/${currentProductId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Lỗi khi xóa: ${response.statusText}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json().catch(() => ({ message: 'Sản phẩm đã được xóa.' }));

                closeModal(deleteModalElement);
                await fetchAndRenderProducts();
                alert(result.message || 'Sản phẩm đã được xóa.');
                currentProductId = null;
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert(`Lỗi khi xóa sản phẩm: ${error.message}`);
            }
        });
    }


    // ----- EVENT LISTENERS -----
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', handleOpenAddModal);
    }
    if (btnAddEmptyState) {
        btnAddEmptyState.addEventListener('click', handleOpenAddModal);
    }

    // Close modals
    document.querySelectorAll('.modal .modal-close, .modal .btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const modalToClose = this.closest('.modal');
            if (modalToClose) {
                closeModal(modalToClose);
            }
        });
    });

    productGrid.addEventListener('click', function (event) {
        const editButton = event.target.closest('.btn-edit');
        const deleteButton = event.target.closest('.btn-delete');

        if (editButton) {
            const productId = editButton.dataset.id;
            handleOpenEditModal(productId);
        } else if (deleteButton) {
            const productId = deleteButton.dataset.id;
            handleOpenDeleteModal(productId);
        }
    });

    // Filters and Search
    if (searchInput) searchInput.addEventListener('input', debounce(fetchAndRenderProducts, 300));
    if (categoryFilter) categoryFilter.addEventListener('change', () => { currentPage = 1; fetchAndRenderProducts(); });
    if (sortOrderFilter) sortOrderFilter.addEventListener('change', () => { currentPage = 1; fetchAndRenderProducts(); });


    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    fetchAndRenderProducts();
});