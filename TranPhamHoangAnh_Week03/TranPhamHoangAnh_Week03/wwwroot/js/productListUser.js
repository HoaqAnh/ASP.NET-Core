document.addEventListener('DOMContentLoaded', function () {
    console.log("USER_VIEW: DOM đã tải xong. Bắt đầu thực thi productListUser.js.");

    // ----- LẤY CÁC ELEMENT CHO TRANG USER -----
    const productGrid = document.getElementById('productGridUserList');
    console.log("USER_VIEW: productGridUserList:", productGrid ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const searchInput = document.getElementById('searchProductUserList');
    console.log("USER_VIEW: searchProductUserList:", searchInput ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const categoryFilter = document.getElementById('categoryFilterUserList');
    console.log("USER_VIEW: categoryFilterUserList:", categoryFilter ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const sortOrderFilter = document.getElementById('sortOrderUserList');
    console.log("USER_VIEW: sortOrderUserList:", sortOrderFilter ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const paginationContainer = document.getElementById('paginationUserList');
    console.log("USER_VIEW: paginationUserList:", paginationContainer ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const paginationNumbers = document.getElementById('paginationNumbersUserList');
    console.log("USER_VIEW: paginationNumbersUserList:", paginationNumbers ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const prevPageButton = document.getElementById('prevPageUserList');
    console.log("USER_VIEW: prevPageUserList:", prevPageButton ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const nextPageButton = document.getElementById('nextPageUserList');
    console.log("USER_VIEW: nextPageUserList:", nextPageButton ? "Tìm thấy" : "KHÔNG TÌM THẤY");

    const emptyStateContainer = document.getElementById('emptyStateUserList'); // Lấy element empty state
    console.log("USER_VIEW: emptyStateUserList:", emptyStateContainer ? "Tìm thấy" : "KHÔNG TÌM THẤY");


    // ----- BIẾN GLOBAL -----
    let currentPage = 1;
    const pageSize = 12; // Số sản phẩm mỗi trang cho user, có thể khác admin
    let totalProducts = 0;
    const API_URL = '/api/Products'; // Dùng chung API endpoint
    console.log("USER_VIEW: API_URL:", API_URL);

    // ----- FETCH AND RENDER PRODUCTS -----
    async function fetchAndRenderProducts() {
        console.log(`USER_VIEW: fetchAndRenderProducts. Trang: ${currentPage}, PageSize: ${pageSize}`);
        const searchTerm = searchInput ? searchInput.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const sortBy = sortOrderFilter ? sortOrderFilter.value : 'newest';
        console.log(`USER_VIEW: Filters - Search: '${searchTerm}', Category: '${category}', SortBy: '${sortBy}'`);

        let url = `${API_URL}?pageNumber=${currentPage}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchString=${encodeURIComponent(searchTerm)}`;
        if (category) url += `&categoryName=${encodeURIComponent(category)}`;
        if (sortBy) url += `&sortBy=${sortBy}`;
        console.log("USER_VIEW: Gọi API URL:", url);

        if (productGrid) productGrid.innerHTML = '<div class="text-center p-5 col-span-full"><i class="fas fa-spinner fa-spin fa-3x text-blue-500"></i><p>Đang tải sản phẩm...</p></div>'; // Loading indicator
        if (emptyStateContainer) emptyStateContainer.style.display = 'none'; // Ẩn empty state khi tải

        try {
            const response = await fetch(url);
            console.log("USER_VIEW: Phản hồi từ API status:", response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Lỗi ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.message || 'Không thể tải danh sách sản phẩm');
            }
            const data = await response.json();
            console.log("USER_VIEW: Dữ liệu nhận được:", data);

            if (data && data.items) {
                renderUserProducts(data.items);
                totalProducts = data.totalCount;
                updateUserPaginationControls();
            } else {
                renderUserProducts([]);
                totalProducts = 0;
                updateUserPaginationControls();
            }
        } catch (error) {
            console.error("USER_VIEW: Lỗi khi tải sản phẩm:", error);
            if (productGrid) productGrid.innerHTML = `<div class="text-center text-danger p-5 col-span-full">Lỗi khi tải sản phẩm: ${error.message}</div>`;
            if (paginationContainer) paginationContainer.style.display = 'none';
            if (emptyStateContainer) emptyStateContainer.style.display = 'flex'; // Hiện empty state nếu lỗi
        }
    }

    function renderUserProducts(products) {
        console.log("USER_VIEW: renderUserProducts. Số lượng:", products ? products.length : 0);
        if (!productGrid) {
            console.error("USER_VIEW: productGrid không tìm thấy.");
            return;
        }
        productGrid.innerHTML = ''; // Xóa nội dung cũ hoặc loading indicator

        if (!products || products.length === 0) {
            console.log("USER_VIEW: Không có sản phẩm để render, hiển thị empty state.");
            if (emptyStateContainer) {
                emptyStateContainer.style.display = 'flex'; // Hiển thị empty state từ HTML
            } else { // Fallback nếu empty state không có trong HTML ban đầu
                productGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 2rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11 9h2V7h-2zm1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.48 4 2 8.48 2 14s4.48 10 10 10s10-4.48 10-10S17.52 4 12 4m0 11c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2"/>
                        </svg>
                        <p>Không tìm thấy sản phẩm nào.</p>
                    </div>`;
            }
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        if (emptyStateContainer) emptyStateContainer.style.display = 'none'; // Ẩn empty state nếu có sản phẩm
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
                </div>`;
            productGrid.insertAdjacentHTML('beforeend', productCard);
        });
        console.log("USER_VIEW: Render sản phẩm user hoàn tất.");
    }

    // ----- PAGINATION -----
    function updateUserPaginationControls() {
        console.log("USER_VIEW: updateUserPaginationControls. Tổng SP:", totalProducts, "Trang:", currentPage);
        if (!paginationNumbers || !prevPageButton || !nextPageButton) {
            console.warn("USER_VIEW: Thiếu element pagination."); return;
        }
        paginationNumbers.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / pageSize);
        console.log("USER_VIEW: Tổng số trang:", totalPages);

        if (totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        if (paginationContainer) paginationContainer.style.display = 'flex';

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
        }
        if (currentPage > totalPages - 3) {
            startPage = Math.max(1, totalPages - 4);
        }

        if (startPage > 1) {
            const firstPageSpan = document.createElement('span');
            firstPageSpan.textContent = '1';
            firstPageSpan.dataset.page = 1;
            paginationNumbers.appendChild(firstPageSpan);
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.classList.add('dots');
                paginationNumbers.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageSpan = document.createElement('span');
            pageSpan.textContent = i;
            pageSpan.dataset.page = i;
            if (i === currentPage) {
                pageSpan.classList.add('active');
            }
            paginationNumbers.appendChild(pageSpan);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.classList.add('dots');
                paginationNumbers.appendChild(dots);
            }
            const lastPageSpan = document.createElement('span');
            lastPageSpan.textContent = totalPages;
            lastPageSpan.dataset.page = totalPages;
            paginationNumbers.appendChild(lastPageSpan);
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage >= totalPages;
    }

    if (paginationNumbers) {
        paginationNumbers.addEventListener('click', function (event) {
            if (event.target.tagName === 'SPAN' && event.target.dataset.page) {
                const page = parseInt(event.target.dataset.page);
                if (page !== currentPage) {
                    currentPage = page;
                    fetchAndRenderProducts();
                }
            }
        });
    }

    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            console.log("USER_VIEW: prevPageButton clicked.");
            if (currentPage > 1) { currentPage--; fetchAndRenderProducts(); }
        });
    } else { console.warn("USER_VIEW: prevPageButton không tìm thấy."); }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            console.log("USER_VIEW: nextPageButton clicked.");
            const totalPages = Math.ceil(totalProducts / pageSize);
            if (currentPage < totalPages) { currentPage++; fetchAndRenderProducts(); }
        });
    } else { console.warn("USER_VIEW: nextPageButton không tìm thấy."); }


    // ----- EVENT LISTENERS CHO FILTERS VÀ SEARCH -----
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
            console.log("USER_VIEW: searchInput changed, value:", searchInput.value);
            currentPage = 1; fetchAndRenderProducts();
        }, 350));
    } else { console.warn("USER_VIEW: searchInput (ID: searchProductUserList) không tìm thấy."); }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            console.log("USER_VIEW: categoryFilter changed, value:", categoryFilter.value);
            currentPage = 1; fetchAndRenderProducts();
        });
    } else { console.warn("USER_VIEW: categoryFilter (ID: categoryFilterUserList) không tìm thấy."); }

    if (sortOrderFilter) {
        sortOrderFilter.addEventListener('change', () => {
            console.log("USER_VIEW: sortOrderFilter changed, value:", sortOrderFilter.value);
            currentPage = 1; fetchAndRenderProducts();
        });
    } else { console.warn("USER_VIEW: sortOrderFilter (ID: sortOrderUserList) không tìm thấy."); }

    // ----- INITIAL FETCH -----
    console.log("USER_VIEW: Gọi fetchAndRenderProducts lần đầu.");
    fetchAndRenderProducts();
});