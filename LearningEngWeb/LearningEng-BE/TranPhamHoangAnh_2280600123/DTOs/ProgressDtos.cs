using System.ComponentModel.DataAnnotations;
using TranPhamHoangAnh_2280600123.Models;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class MarkProgressDto
    {
        [Required]
        public ActivityType ActivityType { get; set; }

        [Required]
        public int ActivityId { get; set; }
    }
}