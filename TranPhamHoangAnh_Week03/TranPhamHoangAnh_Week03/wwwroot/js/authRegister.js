document.addEventListener('DOMContentLoaded', function () {
    const registerFormEl = document.getElementById('registerForm');
    const passwordInput = document.getElementById('Password'); // Đảm bảo ID khớp với HTML
    const confirmPasswordInput = document.getElementById('ConfirmPassword'); // Đảm bảo ID khớp
    const fullNameInput = document.getElementById('FullName'); // Đảm bảo ID khớp
    const emailInput = document.getElementById('Email'); // Đảm bảo ID khớp

    // Elements cho password strength
    const lengthCheck = document.getElementById('lengthCheck');
    const upperCheck = document.getElementById('upperCheck');
    const lowerCheck = document.getElementById('lowerCheck');
    const numberCheck = document.getElementById('numberCheck');

    // Elements cho toggle password visibility
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordEyeIcon = document.getElementById('passwordEyeIcon');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const confirmPasswordEyeIcon = document.getElementById('confirmPasswordEyeIcon');

    // --- Password Strength Validation ---
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const value = this.value;
            validatePasswordCriteria(value);
            validateConfirmPassword(); // Kiểm tra lại confirm password mỗi khi password chính thay đổi
        });
    }

    function validatePasswordCriteria(password) {
        updateCriteriaCheck(lengthCheck, password.length >= 8);
        updateCriteriaCheck(upperCheck, /[A-Z]/.test(password));
        updateCriteriaCheck(lowerCheck, /[a-z]/.test(password));
        updateCriteriaCheck(numberCheck, /[0-9]/.test(password));
    }

    function updateCriteriaCheck(element, isValid) {
        if (!element) return;
        element.classList.remove('valid', 'invalid', 'default');
        element.classList.add(isValid ? 'valid' : 'invalid');
    }

    // --- Confirm Password Validation ---
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }

    function validateConfirmPassword() {
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        // Sử dụng asp-validation-for="ConfirmPassword" để hiển thị lỗi từ server,
        // nhưng vẫn có thể dùng một span riêng cho lỗi client-side nếu muốn hoặc tận dụng nó.
        const errorSpan = document.querySelector('span[data-valmsg-for="ConfirmPassword"]');

        let isValid = true;
        if (confirmPassword && password !== confirmPassword) {
            if (errorSpan) {
                errorSpan.textContent = "Mật khẩu và mật khẩu xác nhận không khớp.";
                errorSpan.classList.remove('hidden'); // Đảm bảo span hiển thị
            }
            if (confirmPasswordInput) confirmPasswordInput.classList.add('input-error');
            isValid = false;
        } else {
            if (errorSpan) {
                // Chỉ xóa lỗi client-side, lỗi server-side sẽ được xóa bởi unobtrusive validation
                // nếu form được submit lại và server không trả về lỗi đó nữa.
                // Hoặc bạn có thể kiểm tra xem lỗi hiện tại có phải do client-side set không.
                // Tạm thời để trống để Tag Helper tự quản lý khi không có lỗi.
                // errorSpan.textContent = "";
                // errorSpan.classList.add('hidden'); // Ẩn đi nếu không có lỗi
            }
            if (confirmPasswordInput) confirmPasswordInput.classList.remove('input-error');
        }
        return isValid;
    }

    // --- Toggle Password Visibility ---
    function togglePasswordVisibility(inputElement, iconElement) {
        if (!inputElement || !iconElement) return;
        const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
        inputElement.setAttribute('type', type);
        iconElement.classList.toggle('fa-eye');
        iconElement.classList.toggle('fa-eye-slash');
    }

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(passwordInput, passwordEyeIcon);
        });
    }
    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordEyeIcon);
        });
    }

    // --- Form Submission ---
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', function (event) {
            clearClientSideErrors(); // Xóa các lỗi client-side cũ
            let isValidClient = true;

            // FullName validation
            if (!fullNameInput.value.trim()) {
                displayClientSideError(fullNameInput, "Họ tên không được để trống.");
                isValidClient = false;
            }

            // Email validation
            const emailValue = emailInput.value.trim();
            if (!emailValue) {
                displayClientSideError(emailInput, "Email không được để trống.");
                isValidClient = false;
            } else if (emailValue.indexOf('@') === -1 || emailValue.indexOf('.') === -1) { // Đã sửa lỗi Razor
                displayClientSideError(emailInput, "Địa chỉ email không hợp lệ.");
                isValidClient = false;
            }

            // Password validation
            const passwordValue = passwordInput.value;
            if (!(passwordValue.length >= 8 && /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue) && /[0-9]/.test(passwordValue))) {
                displayClientSideError(passwordInput, "Mật khẩu không đủ mạnh (ít nhất 8 ký tự, chữ hoa, chữ thường, số).");
                isValidClient = false;
            }

            // Confirm password validation
            if (!validateConfirmPassword()) {
                isValidClient = false;
            }

            if (!isValidClient) {
                event.preventDefault(); // Ngăn form submit nếu client validation thất bại
                console.log("Client-side validation failed. Form submission prevented.");
                const firstErrorField = registerFormEl.querySelector('.input-error, input:invalid, textarea:invalid, select:invalid');
                if (firstErrorField) firstErrorField.focus();
                return;
            }

            // Nếu client validation OK, form sẽ submit lên server.
            // Server-side validation (ModelState) sẽ là lớp kiểm tra cuối cùng.
            console.log("Client-side validation passed. Submitting form to server...");
            // Hiển thị spinner (tùy chọn)
            const registerBtnText = document.getElementById('registerBtnText');
            const registerSpinner = document.getElementById('registerSpinner');
            if (registerBtnText) registerBtnText.style.display = 'none';
            if (registerSpinner) registerSpinner.classList.remove('hidden');
            const registerBtn = document.getElementById('registerBtn');
            if (registerBtn) registerBtn.disabled = true;
        });
    }

    function displayClientSideError(inputElement, message) {
        // Ưu tiên hiển thị lỗi vào span do asp-validation-for tạo ra
        let errorSpan = document.querySelector(`span[data-valmsg-for="${inputElement.name}"]`);

        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden'); // Đảm bảo span được hiển thị
            errorSpan.classList.add('field-validation-error'); // Class mặc định của unobtrusive validation
            errorSpan.classList.remove('field-validation-valid');
        } else {
            // Fallback: tạo một span lỗi mới nếu không tìm thấy span của tag helper
            errorSpan = inputElement.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('client-error-placeholder')) {
                // Tạo một placeholder nếu không có, để không làm xô lệch layout nhiều
                const placeholder = document.createElement('span');
                placeholder.className = 'text-red-500 text-sm error-text client-error-placeholder client-error';
                inputElement.parentNode.insertBefore(placeholder, inputElement.nextSibling);
                errorSpan = placeholder;
            }
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
        inputElement.classList.add('input-error'); // Thêm class viền đỏ cho input
        inputElement.setAttribute('aria-invalid', 'true');
    }

    function clearClientSideErrors() {
        // Xóa class lỗi và aria-invalid khỏi input
        document.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
            input.removeAttribute('aria-invalid');
        });

        // Xóa nội dung và ẩn các span lỗi client-side (hoặc các span của tag helper nếu chỉ chứa lỗi client)
        document.querySelectorAll('span.text-red-500.error-text').forEach(span => {
            // Chỉ xóa/ẩn nếu lỗi đó là do client-side thêm vào,
            // hoặc nếu nó là span của tag helper nhưng không có lỗi từ server
            if (span.classList.contains('client-error') || (span.hasAttribute('data-valmsg-for') && !span.classList.contains('field-validation-error-from-server'))) {
                //  ^ (Cần thêm class 'field-validation-error-from-server' từ server nếu muốn phân biệt)
                //  Hiện tại, đơn giản là xóa text và ẩn đi
                span.textContent = '';
                // span.classList.add('hidden'); // Có thể không cần ẩn nếu CSS đã xử lý span rỗng
            }
        });
        // jQuery Unobtrusive Validation sẽ tự xóa lỗi của nó khi người dùng sửa input.
        // Nếu bạn muốn xóa tất cả lỗi (cả client và server đã hiển thị) một cách thủ công:
        // $('.field-validation-error').html('');
        // $('.validation-summary-errors').find('ul').html('');
    }

    // Các hàm và logic cho OTP form và Success Message có thể được giữ lại ở đây
    // nếu bạn vẫn muốn xử lý chúng bằng JavaScript sau này,
    // nhưng chúng sẽ không được gọi trừ khi bạn có logic API trả về để kích hoạt chúng.
    // Ví dụ:
    // const otpFormEl = document.getElementById('otpForm');
    // const successMessageEl = document.getElementById('successMessage');
    // ... (các element khác của OTP form)
});