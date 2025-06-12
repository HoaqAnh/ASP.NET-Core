using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;
using TranPhamHoangAnh_2280600123.Models;
using TranPhamHoangAnh_2280600123.Services;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings, IEmailService emailService)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _emailService = emailService;
        }

        /// <summary>
        /// Đăng ký tài khoản người dùng mới.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.Email == registerDto.Email);
            if (userExists)
            {
                return BadRequest(new { message = "Email đã tồn tại." });
            }

            var user = new User(
                fullName: registerDto.FullName,
                email: registerDto.Email,
                plainTextPassword: registerDto.Password,
                address: null,
                phoneNumber: null,
                role: "Student"
            );

            user.GenerateOtp();

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                var message = $"<h1>Xác nhận địa chỉ email</h1><p>Mã OTP của bạn là: <strong>{user.OtpCode}</strong></p><p>Mã này sẽ hết hạn trong 10 phút.</p>";
                await _emailService.SendEmailAsync(user.Email, "Xác nhận email đăng ký - Learning Eng", message);
            }
            catch (Exception ex)
            {

            }

            return Ok(new { message = "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP và xác nhận tài khoản." });
        }

        /// <summary>
        /// Đăng nhập.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !Models.User.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt))
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            if (!user.IsEnabled)
            {
                return Unauthorized(new { message = "Tài khoản của bạn đã bị vô hiệu hóa." });
            }

            if (user.Role == "Student")
            {
                if (!user.EmailConfirmed)
                {
                    return Unauthorized(new { message = "Vui lòng xác nhận email trước khi đăng nhập." });
                }
                var studentToken = GenerateJwtToken(user);

                return Ok(new AuthResponseDto
                {
                    Token = studentToken,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role
                });
            }

            if (user.Role == "Admin")
            {
                user.GenerateOtp();
                await _context.SaveChangesAsync();

                var message = $"<h1>Xác thực đăng nhập Admin</h1><p>Mã OTP của bạn là: <strong>{user.OtpCode}</strong></p><p>Mã này sẽ hết hạn trong 10 phút.</p>";
                await _emailService.SendEmailAsync(user.Email, "Mã OTP đăng nhập Admin", message);

                return Ok(new { OtpRequired = true, Email = user.Email });
            }

            return Unauthorized();
        }

        // Endpoint để xác nhận email cho người dùng mới
        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] OtpVerificationDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return BadRequest("Email không hợp lệ.");

            if (user.OtpCode == dto.OtpCode && user.OtpExpiryTime > DateTime.UtcNow)
            {
                user.EmailConfirmed = true;
                user.OtpCode = null;
                user.OtpExpiryTime = null;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xác nhận email thành công. Bây giờ bạn có thể đăng nhập." });
            }
            return BadRequest("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        // Endpoint để xác thực OTP cho Admin khi đăng nhập
        [HttpPost("verify-admin-otp")]
        public async Task<IActionResult> VerifyAdminOtp([FromBody] OtpVerificationDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Role == "Admin");
            if (user == null) return BadRequest("Tài khoản không hợp lệ.");

            if (user.OtpCode == dto.OtpCode && user.OtpExpiryTime > DateTime.UtcNow)
            {
                user.OtpCode = null;
                user.OtpExpiryTime = null;
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);
                return Ok(new AuthResponseDto
                {
                    Token = token,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role
                });
            }
            return BadRequest("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8), // token timelife
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}