document.addEventListener('DOMContentLoaded', function () {
    console.log("Login page script loaded.");

    const loginFormEl = document.getElementById('loginClientForm'); // ID của form trong HTML
    const emailInput = document.getElementById('Email'); // Đảm bảo ID khớp với asp-for="Email"
    const passwordInput = document.getElementById('Password'); // Đảm bảo ID khớp với asp-for="Password"
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordEyeIcon = document.getElementById('passwordEyeIcon');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput && passwordEyeIcon) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordEyeIcon.classList.toggle('fa-eye');
            passwordEyeIcon.classList.toggle('fa-eye-slash');
        });
    } else {
        if (!togglePasswordBtn) console.warn("togglePassword button not found");
        if (!passwordInput) console.warn("password input not found for toggle");
        if (!passwordEyeIcon) console.warn("passwordEyeIcon not found for toggle");
    }

    // Client-side validation (cơ bản, vì server-side validation của ASP.NET Core là chính)
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', function (event) {
            let isValid = true;
            clearClientSideErrors(); // Xóa lỗi client-side cũ

            // Validate Email
            if (!emailInput.value.trim()) {
                displayClientSideError(emailInput, "Vui lòng nhập email.");
                isValid = false;
            } else if (emailInput.value.indexOf('@') === -1 || emailInput.value.indexOf('.') === -1) {
                displayClientSideError(emailInput, "Địa chỉ email không hợp lệ.");
                isValid = false;
            }

            // Validate Password
            if (!passwordInput.value) { // Chỉ cần kiểm tra có trống không, độ phức tạp sẽ do server xử lý
                displayClientSideError(passwordInput, "Vui lòng nhập mật khẩu.");
                isValid = false;
            }

            if (!isValid) {
                event.preventDefault(); // Ngăn submit nếu lỗi client-side
                console.log("Client-side validation failed for login.");
                const firstErrorField = loginFormEl.querySelector('.input-error, input:invalid');
                if (firstErrorField) firstErrorField.focus();
                return;
            }

            // Nếu validation client OK, cho phép form submit lên server
            console.log("Client-side validation passed. Submitting login form to server...");
            const loginBtnText = document.getElementById('loginBtnText');
            const loginSpinner = document.getElementById('loginSpinner');
            if (loginBtnText) loginBtnText.style.display = 'none';
            if (loginSpinner) loginSpinner.classList.remove('hidden');
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.disabled = true;

            // Form sẽ được submit theo cách truyền thống
        });
    }

    function displayClientSideError(inputElement, message) {
        // Tìm span lỗi tương ứng với input (do asp-validation-for tạo ra)
        let errorSpan = document.querySelector(`span[data-valmsg-for="${inputElement.name}"]`);

        if (errorSpan) {
            errorSpan.textContent = message;
            // asp-validation-for sẽ tự thêm/xóa class field-validation-error, field-validation-valid
        } else {
            // Fallback nếu không tìm thấy span chuẩn (ít khi xảy ra với tag helper)
            errorSpan = inputElement.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('text-red-500')) {
                const newErrorSpan = document.createElement('span');
                newErrorSpan.className = 'text-red-500 text-sm mt-1 client-error-js'; // Dùng class riêng để phân biệt
                newErrorSpan.textContent = message;
                inputElement.parentNode.insertBefore(newErrorSpan, inputElement.nextSibling);
            } else {
                errorSpan.textContent = message;
            }
        }
        inputElement.classList.add('input-error'); // Thêm class viền đỏ cho input
    }

    function clearClientSideErrors() {
        document.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
        // Xóa các lỗi do JS thêm vào (nếu có)
        document.querySelectorAll('.client-error-js').forEach(span => span.remove());
        // Để asp-validation-for tự xử lý việc xóa lỗi của nó khi người dùng nhập liệu lại
    }

});