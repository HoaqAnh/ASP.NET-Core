using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.Models
{
    public class HistoryQuestion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HistoryQuestionId { get; set; }

        [Required]
        [StringLength(1)]
        public string UserAnswer { get; set; }
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public int QuestionId { get; set; }
        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }

        public int HistoryQuizId { get; set; }
        [ForeignKey("HistoryQuizId")]
        public virtual HistoryQuiz HistoryQuiz { get; set; }
    }
}
