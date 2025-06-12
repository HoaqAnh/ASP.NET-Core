using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace TranPhamHoangAnh_2280600123.Models
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

        public bool IsEnabled { get; set; }

        public virtual ICollection<HistoryQuiz> HistoryQuizzes { get; set; } = new List<HistoryQuiz>();
        public virtual ICollection<HistoryQuestion> HistoryQuestions { get; set; } = new List<HistoryQuestion>();
        public virtual ICollection<ActivityProgress> ActivityProgresses { get; set; } = new List<ActivityProgress>();


        public User() { }

        public User(string fullName, string email, string plainTextPassword, string? address, string? phoneNumber, string role = "Student")
        {
            if (string.IsNullOrWhiteSpace(plainTextPassword))
                throw new ArgumentException("Mật khẩu không được để trống.", nameof(plainTextPassword));

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

            IsEnabled = true;
        }

        public void GenerateOtp()
        {
            this.OtpCode = new Random().Next(100000, 999999).ToString();
            this.OtpExpiryTime = DateTime.UtcNow.AddMinutes(10);
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
    }
}
