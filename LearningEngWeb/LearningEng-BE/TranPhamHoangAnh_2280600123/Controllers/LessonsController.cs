using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;
using TranPhamHoangAnh_2280600123.Models;
using TranPhamHoangAnh_2280600123.Services;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPhotoService _photoService;

        public LessonsController(ApplicationDbContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
        }

        // GET: api/lessons - Lấy tất cả bài học
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetLessons()
        {
            return await _context.Lessons
                .Include(l => l.Readings)
                .Include(l => l.Listenings)
                .Include(l => l.Writings)
                .ToListAsync();
        }

        // GET: api/lessons/{id} - Lấy một bài học theo ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Readings)
                .Include(l => l.Listenings)
                .Include(l => l.Writings)
                .Include(l => l.Quizzes)
                    .ThenInclude(q => q.Questions)
                .FirstOrDefaultAsync(l => l.LessonId == id);

            if (lesson == null)
            {
                return NotFound();
            }

            return lesson;
        }

        // POST: api/lessons - Tạo bài học mới với đầy đủ các hoạt động
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Lesson>> CreateLessonWithActivities([FromForm] CreateLessonWithActivitiesDto dto)
        {
            if (dto.AudioFile == null || dto.AudioFile.Length == 0)
            {
                return BadRequest("Vui lòng cung cấp file audio.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var audioUploadResult = await _photoService.AddAudioAsync(dto.AudioFile);
                if (audioUploadResult.Error != null)
                {
                    throw new Exception($"Lỗi upload file audio: {audioUploadResult.Error.Message}");
                }

                var lesson = new Lesson
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Content = dto.Content,
                    Level = dto.Level
                };
                _context.Lessons.Add(lesson);
                await _context.SaveChangesAsync();

                var reading = new Reading { Title = dto.Reading.Title, ReadingContent = dto.Reading.Content, LessonId = lesson.LessonId };
                _context.Readings.Add(reading);

                var writing = new Writing { Title = dto.Writing.Title, Content = dto.Writing.Content, LessonId = lesson.LessonId };
                _context.Writings.Add(writing);

                var listening = new Listening { Title = dto.ListeningTitle, AudioUrl = audioUploadResult.SecureUrl.AbsoluteUri, LessonId = lesson.LessonId };
                _context.Listenings.Add(listening);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetLesson), new { id = lesson.LessonId }, lesson);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi nội bộ server: {ex.Message}");
            }
        }

        // PUT: api/lessons/{id} - Cập nhật bài học và các hoạt động con
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLessonWithActivities(int id, [FromForm] UpdateLessonWithActivitiesDto dto)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Readings)
                .Include(l => l.Listenings)
                .Include(l => l.Writings)
                .FirstOrDefaultAsync(l => l.LessonId == id);

            if (lesson == null)
            {
                return NotFound();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                lesson.Title = dto.Title;
                lesson.Description = dto.Description;
                lesson.Content = dto.Content;
                lesson.Level = dto.Level;

                var reading = lesson.Readings.FirstOrDefault();
                if (reading != null)
                {
                    reading.Title = dto.Reading.Title;
                    reading.ReadingContent = dto.Reading.Content;
                }

                var writing = lesson.Writings.FirstOrDefault();
                if (writing != null)
                {
                    writing.Title = dto.Writing.Title;
                    writing.Content = dto.Writing.Content;
                }

                var listening = lesson.Listenings.FirstOrDefault();
                if (listening != null)
                {
                    listening.Title = dto.ListeningTitle;

                    if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                    {
                        var audioUploadResult = await _photoService.AddAudioAsync(dto.AudioFile);
                        if (audioUploadResult.Error != null)
                        {
                            throw new Exception($"Lỗi upload file audio: {audioUploadResult.Error.Message}");
                        }
                        listening.AudioUrl = audioUploadResult.SecureUrl.AbsoluteUri;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi nội bộ server: {ex.Message}");
            }
        }

        // DELETE: api/lessons/{id} - Xóa bài học
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}