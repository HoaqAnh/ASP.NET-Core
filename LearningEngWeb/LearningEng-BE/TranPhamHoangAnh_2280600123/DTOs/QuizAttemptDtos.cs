using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class UserAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        [StringLength(1)]
        public string SelectedAnswer { get; set; }
    }

    public class SubmitQuizDto
    {
        [Required]
        public int QuizId { get; set; }

        [Required]
        public List<UserAnswerDto> Answers { get; set; }
    }
}