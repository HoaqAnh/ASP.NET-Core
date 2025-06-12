using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;
using TranPhamHoangAnh_2280600123.Models;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/progress")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class ActivityProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityProgressController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/progress/mark-completed
        [HttpPost("mark-completed")]
        public async Task<IActionResult> MarkActivityAsCompleted(MarkProgressDto progressDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            bool alreadyExists = await _context.ActivityProgresses.AnyAsync(p =>
                p.UserId == userId &&
                ((p.ReadingId == progressDto.ActivityId && progressDto.ActivityType == ActivityType.Reading) ||
                 (p.ListeningId == progressDto.ActivityId && progressDto.ActivityType == ActivityType.Listening) ||
                 (p.WritingId == progressDto.ActivityId && progressDto.ActivityType == ActivityType.Writing)));

            if (alreadyExists)
            {
                return Ok("Tiến độ đã được ghi nhận trước đó.");
            }

            var newProgress = new ActivityProgress
            {
                UserId = userId,
                IsCompleted = true
            };

            switch (progressDto.ActivityType)
            {
                case ActivityType.Reading:
                    newProgress.ReadingId = progressDto.ActivityId;
                    break;
                case ActivityType.Listening:
                    newProgress.ListeningId = progressDto.ActivityId;
                    break;
                case ActivityType.Writing:
                    newProgress.WritingId = progressDto.ActivityId;
                    break;
                default:
                    return BadRequest("Loại hoạt động không hợp lệ.");
            }

            _context.ActivityProgresses.Add(newProgress);
            await _context.SaveChangesAsync();

            return Ok("Lưu tiến độ thành công.");
        }
    }
}