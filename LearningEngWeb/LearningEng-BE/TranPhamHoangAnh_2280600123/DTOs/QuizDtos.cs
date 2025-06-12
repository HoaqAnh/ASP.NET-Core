using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class QuestionDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public string OptionA { get; set; }
        [Required]
        public string OptionB { get; set; }
        [Required]
        public string OptionC { get; set; }
        [Required]
        public string OptionD { get; set; }

        [Required]
        [StringLength(1)]
        public string CorrectAnswer { get; set; }
    }

    public class CreateQuizDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public int LessonId { get; set; }

        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }

    public class UpdateQuestionDto : QuestionDto
    {
        public int QuestionId { get; set; }
    }

    public class UpdateQuizDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public int LessonId { get; set; }

        public List<UpdateQuestionDto> Questions { get; set; } = new List<UpdateQuestionDto>();
    }
}