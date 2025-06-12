using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.Models
{
    public class HistoryQuiz
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HistoryQuizId { get; set; }

        public int Score { get; set; }
        public DateTime CompletedDate { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public int QuizId { get; set; }
        [ForeignKey("QuizId")]
        public virtual Quiz Quiz { get; set; }

        public virtual ICollection<HistoryQuestion> HistoryQuestions { get; set; } = new List<HistoryQuestion>();
    }
}
