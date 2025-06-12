using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;
using TranPhamHoangAnh_2280600123.Models;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/quiz-attempts")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class QuizAttemptController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuizAttemptController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/quiz-attempts/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz(SubmitQuizDto submission)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var questionIds = submission.Answers.Select(a => a.QuestionId).ToList();
            var correctAnswers = await _context.Questions
                .Where(q => q.QuizId == submission.QuizId && questionIds.Contains(q.QuestionId))
                .ToDictionaryAsync(q => q.QuestionId, q => q.CorrectAnswer);

            int score = 0;
            foreach (var answer in submission.Answers)
            {
                if (correctAnswers.TryGetValue(answer.QuestionId, out var correctAnswer) &&
                    answer.SelectedAnswer.Equals(correctAnswer, StringComparison.OrdinalIgnoreCase))
                {
                    score++;
                }
            }

            var historyQuiz = new HistoryQuiz
            {
                QuizId = submission.QuizId,
                UserId = userId,
                Score = score,
                CompletedDate = DateTime.UtcNow
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.HistoryQuizzes.Add(historyQuiz);
                await _context.SaveChangesAsync();

                foreach (var answer in submission.Answers)
                {
                    var historyQuestion = new HistoryQuestion
                    {
                        QuestionId = answer.QuestionId,
                        UserAnswer = answer.SelectedAnswer,
                        UserId = userId,
                        HistoryQuizId = historyQuiz.HistoryQuizId
                    };
                    _context.HistoryQuestions.Add(historyQuestion);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { historyQuizId = historyQuiz.HistoryQuizId });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi xảy ra khi lưu kết quả.");
            }
        }

        // GET: api/quiz-attempts/{historyId} - Lấy kết quả một lần làm bài
        [HttpGet("{historyId}")]
        public async Task<IActionResult> GetQuizResult(int historyId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var quizAttempt = await _context.HistoryQuizzes
                .Include(hq => hq.Quiz)
                    .ThenInclude(q => q.Questions)
                .Include(hq => hq.HistoryQuestions)
                .FirstOrDefaultAsync(hq => hq.HistoryQuizId == historyId);

            if (quizAttempt == null) return NotFound();
            if (quizAttempt.UserId != userId) return Forbid();

            // Chuyển đổi dữ liệu để trả về cho frontend
            var result = new
            {
                historyId = quizAttempt.HistoryQuizId,
                quizTitle = quizAttempt.Quiz.Title,
                score = quizAttempt.Score,
                totalQuestions = quizAttempt.Quiz.Questions.Count,
                completedDate = quizAttempt.CompletedDate,
                questions = quizAttempt.Quiz.Questions.Select(q => new
                {
                    q.QuestionId,
                    q.Content,
                    q.OptionA,
                    q.OptionB,
                    q.OptionC,
                    q.OptionD,
                    q.CorrectAnswer,
                    userAnswer = quizAttempt.HistoryQuestions
                                    .FirstOrDefault(uq => uq.QuestionId == q.QuestionId)?.UserAnswer
                })
            };

            return Ok(result);
        }
    }
}