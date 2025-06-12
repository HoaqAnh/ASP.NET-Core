using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using TranPhamHoangAnh_Week03.ViewModels;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using TranPhamHoangAnh_Week03.Services;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext context, IEmailService emailService, ILogger<AuthController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        // GET: /Auth/Register
        [HttpGet]
        public IActionResult Register()
        {
            return View(new RegisterViewModel());
        }

        // POST: /Auth/Register
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
                if (existingUser != null)
                {
                    ModelState.AddModelError("Email", "Địa chỉ email này đã được sử dụng.");
                    _logger.LogWarning($"Registration attempt for existing email: {model.Email}");
                    return View(model);
                }

                var user = new User(
                    model.FullName,
                    model.Email,
                    model.Password,
                    model.Address,
                    model.PhoneNumber,
                    role: "Customer"
                );

                user.GenerateOtp();
                user.EmailConfirmed = false;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"User {user.Email} created successfully. OTP: {user.OtpCode}");

                try
                {
                    // Gửi email OTP
                    await _emailService.SendOtpEmailAsync(user.Email, user.OtpCode, user.FullName);
                    _logger.LogInformation($"OTP email sent to {user.Email}.");

                    // Lưu email vào TempData để trang VerifyEmail có thể lấy và hiển thị
                    TempData["EmailForVerification"] = user.Email;
                    TempData["ShowOtpMessage"] = "Đăng ký gần hoàn tất! Vui lòng kiểm tra email để lấy mã OTP và xác thực tài khoản.";

                    // Chuyển hướng đến trang nhập OTP
                    return RedirectToAction(nameof(VerifyEmail));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send OTP email to {user.Email}.");
                    ModelState.AddModelError(string.Empty, "Đã xảy ra lỗi trong quá trình đăng ký. Không thể gửi email xác thực. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
                    return View(model);
                }
            }
            _logger.LogWarning("Register POST: ModelState is invalid.");
            return View(model);
        }

        // GET: /Auth/VerifyEmail
        [HttpGet]
        public IActionResult VerifyEmail()
        {
            var email = TempData["EmailForVerification"] as string;
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("VerifyEmail GET: EmailForVerification is missing from TempData.");
                return RedirectToAction(nameof(Register));
            }

            ViewBag.Email = email;
            ViewBag.ShowOtpMessage = TempData["ShowOtpMessage"];
            return View(new VerifyEmailViewModel { Email = email });
        }

        // POST: /Auth/VerifyEmail
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> VerifyEmail(VerifyEmailViewModel model)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.Email = model.Email;
                return View(model);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Địa chỉ email không tồn tại.");
                _logger.LogWarning($"VerifyEmail POST: User not found for email {model.Email}");
                ViewBag.Email = model.Email;
                return View(model);
            }

            if (user.EmailConfirmed)
            {
                TempData["InfoMessage"] = "Email của bạn đã được xác thực trước đó.";
                _logger.LogInformation($"VerifyEmail POST: Email {model.Email} already confirmed.");
                return RedirectToAction(nameof(Login));
            }

            if (user.OtpCode != model.OtpCode)
            {
                ModelState.AddModelError("OtpCode", "Mã OTP không chính xác.");
                _logger.LogWarning($"VerifyEmail POST: Invalid OTP for {model.Email}. Entered: {model.OtpCode}, Expected: {user.OtpCode}");
                ViewBag.Email = model.Email;
                return View(model);
            }

            if (user.OtpExpiryTime == null || user.OtpExpiryTime < DateTime.UtcNow)
            {
                ModelState.AddModelError(string.Empty, "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.");
                _logger.LogWarning($"VerifyEmail POST: OTP expired for {model.Email}. Expiry: {user.OtpExpiryTime}");
                ViewBag.Email = model.Email;
                return View(model);
            }

            // Xác thực thành công
            user.EmailConfirmed = true;
            user.OtpCode = null;
            user.OtpExpiryTime = null;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Email {user.Email} confirmed successfully.");
            TempData["SuccessMessage"] = "Xác thực email thành công! Bạn có thể đăng nhập ngay.";
            return RedirectToAction(nameof(Login));
        }

        // GET: /Auth/ResendOtp
        [HttpGet]
        public IActionResult ResendOtp(string? email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return View("RequestResendOtp");
            }
            ViewBag.Email = email;
            return View("RequestResendOtp", new ResendOtpViewModel { Email = email });
        }


        // POST: /Auth/ResendOtp
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResendOtp(ResendOtpViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("RequestResendOtp", model);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                ModelState.AddModelError("Email", "Không tìm thấy tài khoản với địa chỉ email này.");
                return View("RequestResendOtp", model);
            }

            if (user.EmailConfirmed)
            {
                TempData["InfoMessage"] = "Email của bạn đã được xác thực.";
                return RedirectToAction(nameof(Login));
            }

            if (user.OtpExpiryTime.HasValue && user.OtpExpiryTime.Value.AddMinutes(-8) > DateTime.UtcNow) // OTP 10 phút, cho gửi lại sau 2 phút
            {
                TimeSpan timeToWait = user.OtpExpiryTime.Value.AddMinutes(-8) - DateTime.UtcNow;
                ModelState.AddModelError(string.Empty, $"Vui lòng đợi {timeToWait.Minutes} phút {timeToWait.Seconds} giây nữa để yêu cầu mã OTP mới.");
                return View("RequestResendOtp", model);
            }


            user.GenerateOtp();
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Resending OTP for {user.Email}. New OTP: {user.OtpCode}");

            try
            {
                await _emailService.SendOtpEmailAsync(user.Email, user.OtpCode, user.FullName);
                _logger.LogInformation($"Resent OTP email to {user.Email}.");
                TempData["ShowOtpMessage"] = "Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra và xác thực.";
                TempData["EmailForVerification"] = user.Email;
                return RedirectToAction(nameof(VerifyEmail));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to resend OTP email to {user.Email}.");
                ModelState.AddModelError(string.Empty, "Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
                return View("RequestResendOtp", model);
            }
        }

        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View(new LoginViewModel { ReturnUrl = returnUrl });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            ViewData["ReturnUrl"] = model.ReturnUrl;
            if (ModelState.IsValid)
            {
                var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

                if (userInDb == null || !Models.User.VerifyPassword(model.Password, userInDb.PasswordHash, userInDb.PasswordSalt))
                {
                    ModelState.AddModelError(string.Empty, "Thông tin đăng nhập không chính xác.");
                    return View(model);
                }

                if (!userInDb.EmailConfirmed)
                {
                    ModelState.AddModelError(string.Empty, "Vui lòng xác thực email của bạn trước khi đăng nhập.");
                    TempData["EmailForVerification"] = userInDb.Email;
                    TempData["ShowOtpMessage"] = "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để lấy mã OTP.";
                    return RedirectToAction(nameof(VerifyEmail), new { email = userInDb.Email });
                }

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, userInDb.Id.ToString()),
                    new Claim(ClaimTypes.Name, userInDb.Email),
                    new Claim(ClaimTypes.GivenName, userInDb.FullName),
                    new Claim(ClaimTypes.Role, userInDb.Role)
                };

                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = model.RememberMe,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddDays(model.RememberMe ? 30 : 1)
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                _logger.LogInformation($"Người dùng {userInDb.Email} đã đăng nhập thành công lúc {DateTime.UtcNow}.");

                // CHUYỂN HƯỚNG ĐẾN Home/Index SAU KHI ĐĂNG NHẬP THÀNH CÔNG
                if (!string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl))
                {
                    return Redirect(model.ReturnUrl);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }

            return View(model);
        }


        // POST: /Auth/Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            _logger.LogInformation("User logged out.");
            return RedirectToAction("Index", "Home");
        }
        
        // GET: /Auth/ForgotPassword
        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View(new ForgotPasswordViewModel());
        }

        // POST: /Auth/ForgotPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
                if (user == null)
                {
                    _logger.LogWarning($"Password reset requested for non-existent email: {model.Email}");
                    ViewBag.SuccessMessage = "Nếu địa chỉ email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một link để đặt lại mật khẩu.";
                    return View(model);
                }

                // Tạo token reset
                user.PasswordResetToken = Guid.NewGuid().ToString("N");
                user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(30); // Token hết hạn sau 30 phút

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Generated password reset token for user {user.Email}.");

                // Tạo link reset
                var resetLink = Url.Action("ResetPassword", "Auth",
                    new { email = user.Email, token = user.PasswordResetToken },
                    Request.Scheme);

                try
                {
                    await _emailService.SendPasswordResetLinkAsync(user.Email, resetLink, user.FullName);
                    _logger.LogInformation($"Password reset link sent to {user.Email}. Link: {resetLink}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send password reset email to {user.Email}");
                }

                ViewBag.SuccessMessage = "Nếu địa chỉ email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một link để đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam).";
                return View(model);
            }

            return View(model);
        }

        // GET: /Auth/ResetPassword
        [HttpGet]
        public IActionResult ResetPassword(string email, string token)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Index", "Home");
            }

            var model = new ResetPasswordViewModel { Email = email, Token = token };
            return View(model);
        }

        // POST: /Auth/ResetPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Yêu cầu không hợp lệ.");
                return View(model);
            }

            // Kiểm tra token
            if (user.PasswordResetToken != model.Token || user.ResetTokenExpiry <= DateTime.UtcNow)
            {
                ModelState.AddModelError(string.Empty, "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
                _logger.LogWarning($"Invalid or expired password reset attempt for {user.Email}.");
                return View(model);
            }

            // Đặt lại mật khẩu thành công
            user.SetPassword(model.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Password for user {user.Email} has been reset successfully.");

            TempData["SuccessMessage"] = "Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.";
            return RedirectToAction(nameof(Login));
        }
    }
}