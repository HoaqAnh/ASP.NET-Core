using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text;

namespace TranPhamHoangAnh_Week03.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(255)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        [StringLength(255)]
        public string Email { get; set; }

        [StringLength(255)]
        public string? Address { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string Role { get; set; }

        public string? AvatarUrl { get; set; }

        [Required]
        public string PasswordHash { get; private set; }

        [Required]
        public string PasswordSalt { get; private set; }

        public bool EmailConfirmed { get; set; }
        public bool PhoneNumberConfirmed { get; set; }

        [Required]
        public string SecurityStamp { get; private set; }

        [StringLength(10)]
        public string? OtpCode { get; set; }

        public DateTime? OtpExpiryTime { get; set; }

        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        public User() {
            FullName = string.Empty;
            Email = string.Empty;
            Role = "Customer";
            PasswordHash = string.Empty;
            PasswordSalt = string.Empty;
            SecurityStamp = Guid.NewGuid().ToString("N");
        }

        public User(string fullName, string email, string plainTextPassword, string? address, string? phoneNumber, string role = "Customer")
        {
            if (string.IsNullOrWhiteSpace(plainTextPassword))
                throw new ArgumentException("Mật khẩu không được để trống.", nameof(plainTextPassword));
            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException("Họ tên không được để trống.", nameof(fullName));
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email không được để trống.", nameof(email));

            Id = Guid.NewGuid();
            FullName = fullName;
            Email = email;
            Address = address;
            PhoneNumber = phoneNumber;
            Role = role;
            AvatarUrl = null;

            PasswordSalt = GenerateSalt();
            PasswordHash = HashPassword(plainTextPassword, PasswordSalt);

            EmailConfirmed = false;
            PhoneNumberConfirmed = false;
            SecurityStamp = Guid.NewGuid().ToString("N");

            OtpCode = null;
            OtpExpiryTime = null;
        }

        private static string GenerateSalt(int byteSize = 32)
        {
            if (byteSize <= 0) throw new ArgumentOutOfRangeException(nameof(byteSize), "Kích thước salt phải lớn hơn 0.");

            byte[] saltBytes = RandomNumberGenerator.GetBytes(byteSize);
            return Convert.ToBase64String(saltBytes);
        }

        private static string HashPassword(string password, string saltBase64, int iterations = 10000, int hashByteSize = 32)
        {
            if (string.IsNullOrEmpty(password)) throw new ArgumentNullException(nameof(password));
            if (string.IsNullOrEmpty(saltBase64)) throw new ArgumentNullException(nameof(saltBase64));
            if (iterations <= 0) throw new ArgumentOutOfRangeException(nameof(iterations));
            if (hashByteSize <= 0) throw new ArgumentOutOfRangeException(nameof(hashByteSize));

            byte[] saltBytes = Convert.FromBase64String(saltBase64);

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, iterations, HashAlgorithmName.SHA256))
            {
                byte[] hashBytes = pbkdf2.GetBytes(hashByteSize);
                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool VerifyPassword(string enteredPassword, string storedHashBase64, string storedSaltBase64, int iterations = 10000, int hashByteSize = 32)
        {
            if (string.IsNullOrEmpty(enteredPassword)) return false;
            if (string.IsNullOrEmpty(storedHashBase64) || string.IsNullOrEmpty(storedSaltBase64)) return false;

            try
            {
                byte[] saltBytes = Convert.FromBase64String(storedSaltBase64);
                byte[] actualStoredHashBytes = Convert.FromBase64String(storedHashBase64);

                using (var pbkdf2 = new Rfc2898DeriveBytes(enteredPassword, saltBytes, iterations, HashAlgorithmName.SHA256))
                {
                    byte[] testHashBytes = pbkdf2.GetBytes(hashByteSize);
                    return CryptographicOperations.FixedTimeEquals(testHashBytes, actualStoredHashBytes);
                }
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public void SetPassword(string newPlainTextPassword)
        {
            if (string.IsNullOrWhiteSpace(newPlainTextPassword))
                throw new ArgumentException("Mật khẩu mới không được để trống.", nameof(newPlainTextPassword));

            PasswordSalt = GenerateSalt();
            PasswordHash = HashPassword(newPlainTextPassword, PasswordSalt);
            SecurityStamp = Guid.NewGuid().ToString("N");
        }

        public void GenerateOtp(int otpLength = 6, int expiryMinutes = 10)
        {
            var random = new Random();
            var otpBuilder = new StringBuilder();
            for (int i = 0; i < otpLength; i++)
            {
                otpBuilder.Append(random.Next(0, 10).ToString());
            }
            this.OtpCode = otpBuilder.ToString();
            this.OtpExpiryTime = DateTime.UtcNow.AddMinutes(expiryMinutes);
        }
    }
}