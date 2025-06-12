using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TranPhamHoangAnh_2280600123.Models
{
    public class Lesson
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LessonId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public string? Content { get; set; }

        [StringLength(50)]
        public string Level { get; set; }

        public virtual ICollection<Reading> Readings { get; set; } = new List<Reading>();
        public virtual ICollection<Listening> Listenings { get; set; } = new List<Listening>();
        public virtual ICollection<Writing> Writings { get; set; } = new List<Writing>();
        public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    }
}
