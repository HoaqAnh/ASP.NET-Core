using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;
using TranPhamHoangAnh_2280600123.Models;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuizController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/quiz - Lấy danh sách tất cả Quiz (thông tin cơ bản)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetQuizzes()
        {
            return await _context.Quizzes
                .Select(q => new { q.QuizId, q.Title, q.LessonId })
                .ToListAsync();
        }

        // GET: api/quiz/{id} - Lấy thông tin chi tiết một Quiz và các câu hỏi của nó
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Quiz>> GetQuiz(int id)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.QuizId == id);

            if (quiz == null)
            {
                return NotFound();
            }

            return quiz;
        }

        // POST: api/quiz - Tạo một Quiz mới
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Quiz>> CreateQuiz(CreateQuizDto createQuizDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var lessonExists = await _context.Lessons.AnyAsync(l => l.LessonId == createQuizDto.LessonId);
            if (!lessonExists)
            {
                return BadRequest("Lesson ID không tồn tại.");
            }

            var quiz = new Quiz
            {
                Title = createQuizDto.Title,
                LessonId = createQuizDto.LessonId
            };

            foreach (var questionDto in createQuizDto.Questions)
            {
                quiz.Questions.Add(new Question
                {
                    Content = questionDto.Content,
                    OptionA = questionDto.OptionA,
                    OptionB = questionDto.OptionB,
                    OptionC = questionDto.OptionC,
                    OptionD = questionDto.OptionD,
                    CorrectAnswer = questionDto.CorrectAnswer
                });
            }

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetQuiz), new { id = quiz.QuizId }, quiz);
        }

        // PUT: api/quiz/{id} - Cập nhật một Quiz
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateQuiz(int id, UpdateQuizDto updateQuizDto)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.QuizId == id);

            if (quiz == null)
            {
                return NotFound();
            }

            quiz.Title = updateQuizDto.Title;
            quiz.LessonId = updateQuizDto.LessonId;

            var questionIdsFromDto = updateQuizDto.Questions.Select(q => q.QuestionId).ToHashSet();

            var questionsToDelete = quiz.Questions.Where(q => !questionIdsFromDto.Contains(q.QuestionId)).ToList();
            _context.Questions.RemoveRange(questionsToDelete);

            foreach (var questionDto in updateQuizDto.Questions)
            {
                var existingQuestion = quiz.Questions.FirstOrDefault(q => q.QuestionId == questionDto.QuestionId);
                if (existingQuestion != null)
                {
                    existingQuestion.Content = questionDto.Content;
                    existingQuestion.OptionA = questionDto.OptionA;
                    existingQuestion.OptionB = questionDto.OptionB;
                    existingQuestion.OptionC = questionDto.OptionC;
                    existingQuestion.OptionD = questionDto.OptionD;
                    existingQuestion.CorrectAnswer = questionDto.CorrectAnswer;
                }
                else
                {
                    quiz.Questions.Add(new Question
                    {
                        Content = questionDto.Content,
                        OptionA = questionDto.OptionA,
                        OptionB = questionDto.OptionB,
                        OptionC = questionDto.OptionC,
                        OptionD = questionDto.OptionD,
                        CorrectAnswer = questionDto.CorrectAnswer
                    });
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Quizzes.Any(e => e.QuizId == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/quiz/{id} - Xóa một Quiz
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
            {
                return NotFound();
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}