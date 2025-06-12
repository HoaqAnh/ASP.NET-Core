using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class CreateLessonDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public string? Content { get; set; }

        [Required]
        [StringLength(50)]
        public string Level { get; set; }
    }

    public class UpdateLessonDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public string? Content { get; set; }

        [Required]
        [StringLength(50)]
        public string Level { get; set; }
    }

    public class ReadingSubDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
    }

    public class WritingSubDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
    }

    public class CreateLessonWithActivitiesDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        [StringLength(500)]
        public string Description { get; set; }
        public string? Content { get; set; }
        [Required]
        [StringLength(50)]
        public string Level { get; set; }

        public ReadingSubDto Reading { get; set; }
        public WritingSubDto Writing { get; set; }

        [Required]
        public string ListeningTitle { get; set; }
        public IFormFile AudioFile { get; set; }
    }

    public class UpdateLessonWithActivitiesDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        [StringLength(500)]
        public string Description { get; set; }
        public string? Content { get; set; }
        [Required]
        [StringLength(50)]
        public string Level { get; set; }

        public ReadingSubDto Reading { get; set; }
        public WritingSubDto Writing { get; set; }

        [Required]
        public string ListeningTitle { get; set; }

        // AudioFile là optional trong trường hợp cập nhật
        public IFormFile? AudioFile { get; set; }
    }
}