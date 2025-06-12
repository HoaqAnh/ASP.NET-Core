using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatisticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/statistics/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminStatisticsDto>> GetAdminStatistics()
        {
            var students = await _context.Users.Where(u => u.Role == "Student").ToListAsync();
            var lessons = await _context.Lessons
                .Include(l => l.Readings)
                .Include(l => l.Listenings)
                .Include(l => l.Writings)
                .Include(l => l.Quizzes)
                .ToListAsync();

            var allQuizHistories = await _context.HistoryQuizzes
                .AsNoTracking()
                .ToListAsync();

            var allActivityProgress = await _context.ActivityProgresses
                .AsNoTracking()
                .ToListAsync();

            var lessonCompletions = new List<LessonCompletionDto>();
            foreach (var lesson in lessons)
            {
                int totalActivitiesInLesson = lesson.Readings.Count + lesson.Listenings.Count + lesson.Writings.Count + lesson.Quizzes.Count;
                if (totalActivitiesInLesson == 0) continue;

                double totalPercentageSum = 0;
                int studentsWhoAttempted = 0;

                foreach (var student in students)
                {
                    int completedNonQuizActivities = allActivityProgress.Count(ap =>
                        ap.UserId == student.Id &&
                        ((ap.ReadingId.HasValue && lesson.Readings.Any(r => r.ReadingId == ap.ReadingId)) ||
                         (ap.ListeningId.HasValue && lesson.Listenings.Any(l => l.ListeningId == ap.ListeningId)) ||
                         (ap.WritingId.HasValue && lesson.Writings.Any(w => w.WritingId == ap.WritingId)))
                    );

                    int completedQuizActivities = allQuizHistories.Count(qh =>
                        qh.UserId == student.Id &&
                        lesson.Quizzes.Any(q => q.QuizId == qh.QuizId)
                    );

                    int totalCompletedByStudent = completedNonQuizActivities + completedQuizActivities;

                    if (totalCompletedByStudent > 0)
                    {
                        studentsWhoAttempted++;
                        double studentCompletionPercentage = ((double)totalCompletedByStudent / totalActivitiesInLesson) * 100;
                        totalPercentageSum += studentCompletionPercentage;
                    }
                }

                double averagePercentage = (studentsWhoAttempted > 0)
                    ? totalPercentageSum / studentsWhoAttempted
                    : 0;

                lessonCompletions.Add(new LessonCompletionDto
                {
                    LessonId = lesson.LessonId,
                    LessonTitle = lesson.Title,
                    TotalActivities = totalActivitiesInLesson,
                    TotalCompletions = 0,
                    TotalStudents = students.Count,
                    _AverageCompletionPercentage = averagePercentage
                });
            }

            var studentQuizHistories = await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new StudentQuizHistoryDto
                {
                    StudentId = u.Id,
                    StudentFullName = u.FullName,
                    QuizAttempts = _context.HistoryQuizzes
                        .Where(hq => hq.UserId == u.Id)
                        .Include(hq => hq.Quiz)
                            .ThenInclude(q => q.Questions)
                        .Select(hq => new QuizAttemptDto
                        {
                            HistoryQuizId = hq.HistoryQuizId,
                            QuizId = hq.QuizId,
                            QuizTitle = hq.Quiz.Title,
                            Score = hq.Score,
                            TotalQuestions = hq.Quiz.Questions.Count,
                            CompletedDate = hq.CompletedDate
                        }).ToList()
                }).ToListAsync();

            return Ok(new AdminStatisticsDto
            {
                LessonCompletions = lessonCompletions,
                StudentQuizHistories = studentQuizHistories
            });
        }

        // GET: api/statistics/student
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<StudentStatisticsDto>> GetStudentStatistics()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var lessons = await _context.Lessons
                .Include(l => l.Readings)
                .Include(l => l.Listenings)
                .Include(l => l.Writings)
                .Include(l => l.Quizzes)
                .ToListAsync();

            var myQuizHistories = await _context.HistoryQuizzes
                .Where(hq => hq.UserId == userId)
                .Select(hq => new QuizAttemptDto
                {
                    HistoryQuizId = hq.HistoryQuizId,
                    QuizId = hq.QuizId,
                    QuizTitle = hq.Quiz.Title,
                    Score = hq.Score,
                    TotalQuestions = hq.Quiz.Questions.Count,
                    CompletedDate = hq.CompletedDate
                }).ToListAsync();

            var myActivityProgress = await _context.ActivityProgresses
                .Where(ap => ap.UserId == userId).ToListAsync();

            var myLessonProgresses = lessons.Select(lesson =>
            {
                int totalActivities = lesson.Readings.Count + lesson.Listenings.Count + lesson.Writings.Count + lesson.Quizzes.Count;

                int completedReadings = myActivityProgress
                    .Where(p => p.ReadingId.HasValue && lesson.Readings.Any(r => r.ReadingId == p.ReadingId))
                    .Select(p => p.ReadingId)
                    .Distinct()
                    .Count();

                int completedListenings = myActivityProgress
                    .Where(p => p.ListeningId.HasValue && lesson.Listenings.Any(l => l.ListeningId == p.ListeningId))
                    .Select(p => p.ListeningId)
                    .Distinct()
                    .Count();

                int completedWritings = myActivityProgress
                    .Where(p => p.WritingId.HasValue && lesson.Writings.Any(w => w.WritingId == p.WritingId))
                    .Select(p => p.WritingId)
                    .Distinct()
                    .Count();

                int completedQuizzes = myQuizHistories
                    .Where(qh => lesson.Quizzes.Any(q => q.QuizId == qh.QuizId))
                    .Select(qh => qh.QuizId)
                    .Distinct()
                    .Count();

                int totalCompletedUniqueActivities = completedReadings + completedListenings + completedWritings + completedQuizzes;

                double completionPercentage = (totalActivities > 0)
                    ? ((double)totalCompletedUniqueActivities / totalActivities) * 100
                    : 0;

                return new MyLessonProgressDto
                {
                    LessonId = lesson.LessonId,
                    LessonTitle = lesson.Title,
                    TotalActivities = totalActivities,
                    CompletedActivities = totalCompletedUniqueActivities,
                    CompletionPercentage = completionPercentage
                };
            }).ToList();

            return Ok(new StudentStatisticsDto
            {
                MyLessonProgresses = myLessonProgresses,
                MyQuizAttempts = myQuizHistories
            });
        }
    }
}