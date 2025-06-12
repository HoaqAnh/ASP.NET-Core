namespace TranPhamHoangAnh_2280600123.Data;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_2280600123.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Reading> Readings { get; set; }
    public DbSet<Listening> Listenings { get; set; }
    public DbSet<Writing> Writings { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<ActivityProgress> ActivityProgresses { get; set; }
    public DbSet<HistoryQuiz> HistoryQuizzes { get; set; }
    public DbSet<HistoryQuestion> HistoryQuestions { get; set; }
}