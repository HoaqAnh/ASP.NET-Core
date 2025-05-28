// File: wwwroot/js/product.js (Đã thêm console.log để debug)
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM đã tải xong. Bắt đầu thực thi product.js.");

    // ----- LẤY CÁC ELEMENT -----
    const productGrid = document.querySelector('.product-grid');
    console.log("productGrid:", productGrid ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const productModalElement = document.getElementById('productModal');
    console.log("productModalElement:", productModalElement ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const deleteModalElement = document.getElementById('deleteModal');
    console.log("deleteModalElement:", deleteModalElement ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const productForm = document.getElementById('productForm');
    console.log("productForm:", productForm ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const modalTitle = document.getElementById('modalTitle');
    console.log("modalTitle:", modalTitle ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const btnAddProduct = document.getElementById('btnAddProduct');
    console.log("btnAddProduct:", btnAddProduct ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    // btnAddEmptyState sẽ được tìm sau khi render empty state
    // const btnAddEmptyState = document.querySelector('.empty-state .btn-add'); // Sẽ log sau

    const searchInput = document.getElementById('searchProduct');
    console.log("searchInput:", searchInput ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const categoryFilter = document.getElementById('categoryFilter');
    console.log("categoryFilter:", categoryFilter ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const sortOrderFilter = document.getElementById('sortOrder');
    console.log("sortOrderFilter:", sortOrderFilter ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const paginationContainer = document.querySelector('.pagination');
    console.log("paginationContainer:", paginationContainer ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const paginationNumbers = document.querySelector('.pagination-numbers');
    console.log("paginationNumbers:", paginationNumbers ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const prevPageButton = document.querySelector('.pagination-prev');
    console.log("prevPageButton:", prevPageButton ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const nextPageButton = document.querySelector('.pagination-next');
    console.log("nextPageButton:", nextPageButton ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const productImageFileInput = document.getElementById('productImageFile');
    console.log("productImageFileInput:", productImageFileInput ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const imagePreview = document.getElementById('imagePreview');
    console.log("imagePreview:", imagePreview ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const currentImageUrlInput = document.getElementById('currentImageUrl');
    console.log("currentImageUrlInput:", currentImageUrlInput ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const currentImagePublicIdInput = document.getElementById('currentImagePublicId');
    console.log("currentImagePublicIdInput:", currentImagePublicIdInput ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const currentImageText = document.getElementById('currentImageText');
    console.log("currentImageText:", currentImageText ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const btnClearImage = document.getElementById('btnClearImage');
    console.log("btnClearImage:", btnClearImage ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    // ----- BIẾN GLOBAL -----
    let clearCurrentImageFlag = false;
    let currentProductId = null;
    let currentPage = 1;
    const pageSize = 10;
    let totalProducts = 0;
    const API_URL = '/api/Products';
    console.log("API_URL được đặt là:", API_URL);

    // ----- UTILITY FUNCTIONS -----
    function openModal(modalElement) {
        if (modalElement) {
            console.log(`FUNC openModal: Đang mở modal ID: ${modalElement.id}`);
            modalElement.classList.add('open');
        } else {
            console.error("FUNC openModal: Modal element không tồn tại.");
        }
    }

    function closeModal(modalElement) {
        if (modalElement) {
            console.log(`FUNC closeModal: Đang đóng modal ID: ${modalElement.id}`);
            modalElement.classList.remove('open');
        } else {
            console.error("FUNC closeModal: Modal element không tồn tại.");
        }
    }

    function resetForm() {
        console.log("FUNC resetForm: Bắt đầu reset form.");
        if (productForm) productForm.reset();
        if (document.getElementById('productId')) document.getElementById('productId').value = '';
        if (currentImageUrlInput) currentImageUrlInput.value = '';
        if (currentImagePublicIdInput) currentImagePublicIdInput.value = '';
        if (productImageFileInput) productImageFileInput.value = '';

        if (imagePreview) {
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
        }
        if (currentImageText) {
            currentImageText.textContent = '';
            currentImageText.style.display = 'none';
        }
        if (btnClearImage) btnClearImage.style.display = 'none';

        clearCurrentImageFlag = false;
        currentProductId = null;
        console.log("FUNC resetForm: currentProductId đã được reset về null.");
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());
        console.log("FUNC resetForm: Form đã được reset.");
    }

    function displayFormErrors(errors) {
        console.log("FUNC displayFormErrors: Đang hiển thị lỗi form:", errors);
        document.querySelectorAll('.error-message-field').forEach(el => el.remove());
        for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
                const messages = errors[key];
                let inputField;
                const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);

                if (normalizedKey === "categoryid" || normalizedKey === "category.name") {
                    inputField = document.getElementById('productCategory');
                } else if (normalizedKey === "imagefile") {
                    inputField = document.getElementById('productImageFile');
                } else {
                    inputField = document.getElementById(`product${key.charAt(0).toUpperCase() + key.slice(1)}`) ||
                        (productForm ? productForm.elements[key] : null) ||
                        (productForm ? productForm.elements[normalizedKey] : null);
                }

                if (inputField && messages.length > 0) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message-field text-danger'; // Thêm class Bootstrap
                    errorDiv.style.fontSize = '0.875em';
                    errorDiv.textContent = messages.join('; ');
                    inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);
                    console.log(`FUNC displayFormErrors: Hiển thị lỗi cho field '${key}': ${messages.join('; ')}`);
                } else {
                    console.warn(`FUNC displayFormErrors: Không tìm thấy input field cho lỗi key: ${key}. Lỗi: ${messages.join(', ')}`);
                    const generalErrorContainer = productForm ? productForm.querySelector('.general-form-errors') : null;
                    if (generalErrorContainer) {
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'text-danger';
                        errorMsg.textContent = `${key}: ${messages.join('; ')}`;
                        generalErrorContainer.appendChild(errorMsg);
                    }
                }
            }
        }
    }

    // ----- FETCH AND RENDER PRODUCTS (READ) -----
    async function fetchAndRenderProducts() {
        console.log(`FUNC fetchAndRenderProducts: Bắt đầu tải sản phẩm. Trang: ${currentPage}, PageSize: ${pageSize}`);
        const searchTerm = searchInput ? searchInput.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const sortBy = sortOrderFilter ? sortOrderFilter.value : 'newest';
        console.log(`FUNC fetchAndRenderProducts: Filters - Search: '${searchTerm}', Category: '${category}', SortBy: '${sortBy}'`);


        let url = `${API_URL}?pageNumber=${currentPage}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchString=${encodeURIComponent(searchTerm)}`;
        if (category) url += `&categoryName=${encodeURIComponent(category)}`;
        if (sortBy) url += `&sortBy=${sortBy}`;
        console.log("FUNC fetchAndRenderProducts: Gọi API URL:", url);

        try {
            const response = await fetch(url);
            console.log("FUNC fetchAndRenderProducts: Phản hồi từ API status:", response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Lỗi ${response.status}: ${response.statusText}` }));
                console.error("FUNC fetchAndRenderProducts: Lỗi API:", errorData);
                throw new Error(errorData.message || 'Không thể tải sản phẩm');
            }
            const data = await response.json();
            console.log("FUNC fetchAndRenderProducts: Dữ liệu nhận được từ API:", data);
            if (data && data.items) {
                renderProducts(data.items);
                totalProducts = data.totalCount;
                updatePaginationControls();
            } else {
                console.log("FUNC fetchAndRenderProducts: Không có items trong dữ liệu API hoặc dữ liệu không hợp lệ.");
                renderProducts([]);
                totalProducts = 0;
                updatePaginationControls();
            }
        } catch (error) {
            console.error("FUNC fetchAndRenderProducts: Lỗi catch khi tải sản phẩm:", error);
            if (productGrid) productGrid.innerHTML = `<div class="col-12 text-center text-danger mt-5">Lỗi khi tải sản phẩm: ${error.message}</div>`;
            if (paginationContainer) paginationContainer.style.display = 'none';
        }
    }

    function renderProducts(products) {
        console.log("FUNC renderProducts: Bắt đầu render sản phẩm. Số lượng:", products ? products.length : 0);
        if (!productGrid) {
            console.error("FUNC renderProducts: productGrid không tồn tại.");
            return;
        }
        productGrid.innerHTML = '';
        if (!products || products.length === 0) {
            console.log("FUNC renderProducts: Không có sản phẩm để render, hiển thị empty state.");
            productGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11 9h2V7h-2zm1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.48 4 2 8.48 2 14s4.48 10 10 10s10-4.48 10-10S17.52 4 12 4m0 11c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2"/>
                    </svg>
                    <p>Không tìm thấy sản phẩm nào.</p>
                    ${(!searchInput || !searchInput.value) && (!categoryFilter || !categoryFilter.value) ? '<button class="btn-add" id="btnAddEmptyStateRendered">Thêm sản phẩm mới</button>' : ''}
                </div>`;
            const btnAddEmptyStateRendered = document.getElementById('btnAddEmptyStateRendered');
            if (btnAddEmptyStateRendered) {
                console.log("FUNC renderProducts: Gắn event cho btnAddEmptyStateRendered.");
                btnAddEmptyStateRendered.addEventListener('click', handleOpenAddModal);
            } else {
                console.log("FUNC renderProducts: btnAddEmptyStateRendered không tìm thấy để gắn event.");
            }
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        if (paginationContainer) paginationContainer.style.display = 'flex';

        products.forEach(product => {
            const productCard = `
                <div class="product-card" data-product-id="${product.id}" data-image-url="${product.imageUrl || ''}" data-image-public-id="${product.imagePublicId || ''}">
                    <div class="product-image">
                        <img src="${product.imageUrl || '/images/placeholder.jpg'}" alt="${product.name || 'Sản phẩm'}" loading="lazy"/>
                    </div>
                    <div class="product-info">
                        <h3>${product.name || 'N/A'}</h3>
                        <p class="product-price">${(product.price || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        <p class="product-category">${product.category ? product.category.name : 'Chưa phân loại'}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn-edit" data-id="${product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 5.63l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41"/></svg> Sửa
                        </button>
                        <button class="btn-delete" data-id="${product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg> Xóa
                        </button>
                    </div>
                </div>`;
            productGrid.insertAdjacentHTML('beforeend', productCard);
        });
        console.log("FUNC renderProducts: Render sản phẩm hoàn tất.");
    }

    function updatePaginationControls() {
        console.log("FUNC updatePaginationControls: Cập nhật pagination. Tổng sản phẩm:", totalProducts, "Trang hiện tại:", currentPage);
        if (!paginationNumbers || !prevPageButton || !nextPageButton) {
            console.warn("FUNC updatePaginationControls: Thiếu element pagination.");
            return;
        }
        paginationNumbers.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / pageSize);
        console.log("FUNC updatePaginationControls: Tổng số trang:", totalPages);


        if (totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            console.log("FUNC updatePaginationControls: Chỉ có 1 trang hoặc không có trang nào, ẩn pagination.");
            return;
        }
        if (paginationContainer) paginationContainer.style.display = 'flex';

        const currentPageSpan = document.createElement('span');
        currentPageSpan.textContent = currentPage;
        currentPageSpan.classList.add('active');
        paginationNumbers.appendChild(currentPageSpan);

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage >= totalPages;
        console.log("FUNC updatePaginationControls: Pagination updated.");
    }

    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            console.log("EVENT prevPageButton: Clicked. Trang hiện tại:", currentPage);
            if (currentPage > 1) { currentPage--; fetchAndRenderProducts(); }
        });
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            console.log("EVENT nextPageButton: Clicked. Trang hiện tại:", currentPage);
            const totalPages = Math.ceil(totalProducts / pageSize);
            if (currentPage < totalPages) { currentPage++; fetchAndRenderProducts(); }
        });
    }

    // ----- ADD PRODUCT (CREATE) -----
    function handleOpenAddModal() {
        console.log("FUNC handleOpenAddModal: Mở modal thêm sản phẩm.");
        resetForm();
        if (modalTitle) modalTitle.textContent = 'Thêm sản phẩm mới';
        if (imagePreview) imagePreview.style.display = 'none';
        if (currentImageText) currentImageText.style.display = 'none';
        if (btnClearImage) btnClearImage.style.display = 'none';
        openModal(productModalElement);
    }

    // ----- EDIT PRODUCT (UPDATE) -----
    async function handleOpenEditModal(productId) {
        console.log("FUNC handleOpenEditModal: Mở modal sửa sản phẩm. ID:", productId);
        resetForm();
        currentProductId = productId; // Gán currentProductId ở đây
        console.log("FUNC handleOpenEditModal: currentProductId đã được set:", currentProductId);
        try {
            const response = await fetch(`${API_URL}/${productId}`);
            console.log(`FUNC handleOpenEditModal: Gọi API lấy sản phẩm ID ${productId}. Status:`, response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Không tìm thấy sản phẩm." }));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }
            const product = await response.json();
            console.log("FUNC handleOpenEditModal: Dữ liệu sản phẩm để sửa:", product);

            if (document.getElementById('productId')) document.getElementById('productId').value = product.id;
            if (document.getElementById('productName')) document.getElementById('productName').value = product.name;
            // ... (các field khác tương tự) ...
            if (document.getElementById('productPrice')) document.getElementById('productPrice').value = product.price;
            if (document.getElementById('productQuantity')) document.getElementById('productQuantity').value = product.quantity || 0;
            if (document.getElementById('productDescription')) document.getElementById('productDescription').value = product.description || '';
            if (document.getElementById('productCategory')) document.getElementById('productCategory').value = product.categoryId || "";


            if (currentImageUrlInput) currentImageUrlInput.value = product.imageUrl || '';
            if (currentImagePublicIdInput) currentImagePublicIdInput.value = product.imagePublicId || '';

            if (product.imageUrl) {
                if (imagePreview) { imagePreview.src = product.imageUrl; imagePreview.style.display = 'block'; }
                if (currentImageText) currentImageText.style.display = 'none';
                if (btnClearImage) btnClearImage.style.display = 'block';
            } else {
                if (imagePreview) imagePreview.style.display = 'none';
                if (currentImageText) { currentImageText.textContent = 'Sản phẩm này chưa có ảnh.'; currentImageText.style.display = 'block'; }
                if (btnClearImage) btnClearImage.style.display = 'none';
            }
            if (productImageFileInput) productImageFileInput.value = '';

            if (modalTitle) modalTitle.textContent = 'Cập nhật sản phẩm';
            openModal(productModalElement);
        } catch (error) {
            console.error("FUNC handleOpenEditModal: Lỗi khi tải sản phẩm để sửa:", error);
            alert(`Lỗi khi tải sản phẩm để sửa: ${error.message}`);
        }
    }

    // Event listener cho input file ảnh
    if (productImageFileInput) {
        productImageFileInput.addEventListener('change', function (event) {
            console.log("EVENT productImageFileInput: File changed.");
            const file = event.target.files[0];
            if (file) {
                console.log("EVENT productImageFileInput: File selected:", file.name);
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (imagePreview) { imagePreview.src = e.target.result; imagePreview.style.display = 'block'; }
                    if (currentImageText) currentImageText.style.display = 'none';
                    if (btnClearImage) btnClearImage.style.display = 'block';
                    clearCurrentImageFlag = false;
                    console.log("EVENT productImageFileInput: Image preview updated. clearCurrentImageFlag set to false.");
                }
                reader.readAsDataURL(file);
            } else {
                console.log("EVENT productImageFileInput: No file selected or selection cancelled.");
                // Logic hiển thị lại ảnh cũ nếu có
                const currentUrl = currentImageUrlInput ? currentImageUrlInput.value : '';
                if (currentUrl && imagePreview) {
                    imagePreview.src = currentUrl;
                    imagePreview.style.display = 'block';
                    if (currentImageText) currentImageText.style.display = 'none';
                    if (btnClearImage) btnClearImage.style.display = 'block';
                    console.log("EVENT productImageFileInput: Restored old image preview.");
                } else {
                    if (imagePreview) { imagePreview.src = '#'; imagePreview.style.display = 'none'; }
                    if (currentImageText && !currentUrl) { currentImageText.textContent = 'Chưa có ảnh.'; currentImageText.style.display = 'block'; }
                    if (btnClearImage) btnClearImage.style.display = 'none';
                    console.log("EVENT productImageFileInput: No old image to restore or adding new, cleared preview.");
                }
            }
        });
    } else {
        console.warn("Element productImageFileInput không tìm thấy để gắn event 'change'.");
    }

    // Event listener cho nút "Xóa ảnh hiện tại"
    if (btnClearImage) {
        btnClearImage.addEventListener('click', function () {
            console.log("EVENT btnClearImage: Clicked.");
            if (productImageFileInput) productImageFileInput.value = '';
            if (imagePreview) { imagePreview.src = '#'; imagePreview.style.display = 'none'; }
            if (currentImageText) { currentImageText.textContent = 'Ảnh hiện tại sẽ được xóa khi lưu.'; currentImageText.style.display = 'block'; }
            this.style.display = 'none';
            clearCurrentImageFlag = true;
            console.log("EVENT btnClearImage: clearCurrentImageFlag set to true.");
        });
    } else {
        console.warn("Element btnClearImage không tìm thấy để gắn event 'click'.");
    }


    // ----- SAVE PRODUCT (CREATE/UPDATE) -----
    if (productForm) {
        productForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log("EVENT productForm: Form submitted.");

            const idField = document.getElementById('productId');
            const id = idField ? idField.value : null;
            const isUpdating = !!id;
            console.log(`EVENT productForm: isUpdating: ${isUpdating}, Product ID: ${id}`);

            // Client-side validation (đơn giản)
            const name = document.getElementById('productName').value.trim();
            const price = parseFloat(document.getElementById('productPrice').value);
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const categoryIdVal = document.getElementById('productCategory').value;

            if (!name) { alert("Tên sản phẩm không được để trống."); console.log("EVENT productForm: Validation failed - Tên rỗng."); return; }
            if (isNaN(price) || price < 0) { alert("Giá sản phẩm không hợp lệ."); console.log("EVENT productForm: Validation failed - Giá không hợp lệ."); return; }
            if (isNaN(quantity) || quantity < 0) { alert("Số lượng không hợp lệ."); console.log("EVENT productForm: Validation failed - Số lượng không hợp lệ."); return; }
            // if (!categoryIdVal) { alert("Vui lòng chọn danh mục."); console.log("EVENT productForm: Validation failed - Danh mục rỗng."); return; } // Bỏ nếu danh mục không bắt buộc

            const formData = new FormData();
            formData.append('Id', isUpdating ? parseInt(id) : 0);
            formData.append('Name', name);
            formData.append('Price', price);
            formData.append('Quantity', quantity);
            if (categoryIdVal) {
                formData.append('CategoryId', parseInt(categoryIdVal));
            }
            // else { formData.append('CategoryId', ''); } // Không gửi nếu rỗng để API hiểu là null cho int?
            formData.append('Description', document.getElementById('productDescription').value);

            const imageFile = productImageFileInput.files[0];
            if (imageFile) {
                formData.append('ImageFile', imageFile);
                console.log("EVENT productForm: Appended ImageFile to FormData:", imageFile.name);
            }

            if (clearCurrentImageFlag && isUpdating) {
                formData.append('ClearCurrentImage', 'true');
                console.log("EVENT productForm: Appended ClearCurrentImage=true to FormData.");
            }

            console.log("EVENT productForm: Dữ liệu FormData chuẩn bị gửi:", Object.fromEntries(formData.entries()));

            try {
                console.log(`EVENT productForm: Gọi API - Method: ${isUpdating ? 'PUT' : 'POST'}, URL: ${isUpdating ? `${API_URL}/${id}` : API_URL}`);
                const response = await fetch(isUpdating ? `${API_URL}/${id}` : API_URL, {
                    method: isUpdating ? 'PUT' : 'POST',
                    body: formData,
                });
                console.log("EVENT productForm: Phản hồi từ API submit:", response.status, response.statusText);

                if (!response.ok) {
                    let errorData;
                    try { errorData = await response.json(); }
                    catch (e) { errorData = { message: `Lỗi máy chủ: ${response.status} ${response.statusText}`, errors: {} }; }
                    console.error("EVENT productForm: Lỗi từ server khi submit:", errorData);
                    if (errorData && errorData.errors) {
                        displayFormErrors(errorData.errors);
                    } else if (errorData && errorData.message) {
                        alert(`Lỗi khi lưu sản phẩm: ${errorData.message}`);
                    } else if (errorData && errorData.title) {
                        alert(`Lỗi: ${errorData.title}`);
                        if (errorData.errors) displayFormErrors(errorData.errors);
                    } else {
                        alert('Lỗi không xác định khi lưu sản phẩm.');
                    }
                    return;
                }
                console.log("EVENT productForm: Submit thành công.");
                closeModal(productModalElement);
                currentPage = isUpdating ? currentPage : 1;
                await fetchAndRenderProducts();
                alert(isUpdating ? 'Sản phẩm đã được cập nhật thành công!' : 'Sản phẩm đã được thêm mới thành công!');

            } catch (error) {
                console.error("EVENT productForm: Lỗi JavaScript khi submit:", error);
                alert('Đã xảy ra lỗi khi gửi dữ liệu: ' + error.message);
            }
        });
    } else {
        console.error("Element productForm (#productForm) không tìm thấy để gắn event 'submit'.");
    }

    // ----- DELETE PRODUCT -----
    function handleOpenDeleteModal(productId) {
        console.log("FUNC handleOpenDeleteModal: Mở modal xóa sản phẩm. ID:", productId);
        currentProductId = productId;
        console.log("FUNC handleOpenDeleteModal: currentProductId đã được set:", currentProductId);
        const productNameElement = deleteModalElement ? deleteModalElement.querySelector('.product-name-to-delete') : null;
        // Lấy tên sản phẩm từ card đã render để hiển thị trong modal xác nhận
        const productCard = productGrid ? productGrid.querySelector(`.product-card[data-product-id="${productId}"]`) : null;
        if (productNameElement && productCard) {
            const name = productCard.querySelector('.product-info h3').textContent;
            productNameElement.textContent = name;
        } else if (productNameElement) {
            productNameElement.textContent = `ID ${productId}`; // Fallback nếu không tìm thấy tên
        }
        openModal(deleteModalElement);
    }

    const btnDeleteConfirm = deleteModalElement ? deleteModalElement.querySelector('.btn-delete-confirm') : null;
    if (btnDeleteConfirm) {
        btnDeleteConfirm.addEventListener('click', async function () {
            console.log("EVENT btnDeleteConfirm: Clicked. currentProductId:", currentProductId);
            if (!currentProductId) {
                console.error("EVENT btnDeleteConfirm: currentProductId là null, không thể xóa.");
                return;
            }

            try {
                console.log(`EVENT btnDeleteConfirm: Gọi API xóa sản phẩm ID ${currentProductId}`);
                const response = await fetch(`${API_URL}/${currentProductId}`, {
                    method: 'DELETE',
                });
                console.log("EVENT btnDeleteConfirm: Phản hồi từ API xóa:", response.status, response.statusText);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Lỗi khi xóa: ${response.statusText}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json().catch(() => ({ message: 'Sản phẩm đã được xóa.' }));
                console.log("EVENT btnDeleteConfirm: Kết quả xóa từ API:", result);

                closeModal(deleteModalElement);
                await fetchAndRenderProducts();
                alert(result.message || 'Sản phẩm đã được xóa thành công.');
                currentProductId = null;
            } catch (error) {
                console.error("EVENT btnDeleteConfirm: Lỗi JavaScript khi xóa:", error);
                alert(`Lỗi khi xóa sản phẩm: ${error.message}`);
            }
        });
    } else {
        console.warn("Element btnDeleteConfirm không tìm thấy để gắn event 'click'.");
    }


    // ----- EVENT LISTENERS CHUNG -----
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', () => {
            console.log("EVENT btnAddProduct: Clicked.");
            handleOpenAddModal();
        });
    } else {
        console.warn("Element btnAddProduct không tìm thấy để gắn event 'click'.");
    }

    // Nút "Thêm sản phẩm mới" trong empty state sẽ được gán listener khi renderProducts

    document.querySelectorAll('.modal .modal-close, .modal .btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const modalToClose = this.closest('.modal');
            console.log(`EVENT modal-close/btn-cancel: Clicked. Modal để đóng:`, modalToClose ? modalToClose.id : "không tìm thấy modal cha");
            if (modalToClose) {
                closeModal(modalToClose);
            }
        });
    });

    if (productGrid) {
        productGrid.addEventListener('click', function (event) {
            console.log("EVENT productGrid: Clicked on productGrid.");
            const editButton = event.target.closest('.btn-edit');
            const deleteButton = event.target.closest('.btn-delete');

            if (editButton) {
                const productId = editButton.dataset.id;
                console.log("EVENT productGrid: Nút SỬA được click. Product ID:", productId);
                if (productId) handleOpenEditModal(productId);
            } else if (deleteButton) {
                const productId = deleteButton.dataset.id;
                console.log("EVENT productGrid: Nút XÓA được click. Product ID:", productId);
                if (productId) handleOpenDeleteModal(productId);
            } else {
                console.log("EVENT productGrid: Click không trúng nút Sửa hoặc Xóa.");
            }
        });
    } else {
        console.warn("Element productGrid không tìm thấy để gắn event 'click' (delegation).");
    }

    // Filters and Search
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            console.log("EVENT searchInput: Input changed, value:", searchInput.value);
            currentPage = 1; fetchAndRenderProducts();
        }, 350));
    } else {
        console.warn("Element searchInput không tìm thấy.");
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            console.log("EVENT categoryFilter: Changed, value:", categoryFilter.value);
            currentPage = 1; fetchAndRenderProducts();
        });
    } else {
        console.warn("Element categoryFilter không tìm thấy.");
    }

    if (sortOrderFilter) {
        sortOrderFilter.addEventListener('change', () => {
            console.log("EVENT sortOrderFilter: Changed, value:", sortOrderFilter.value);
            currentPage = 1; fetchAndRenderProducts();
        });
    } else {
        console.warn("Element sortOrderFilter không tìm thấy.");
    }

    // Initial fetch
    console.log("Gọi fetchAndRenderProducts lần đầu khi tải trang.");
    fetchAndRenderProducts();
});