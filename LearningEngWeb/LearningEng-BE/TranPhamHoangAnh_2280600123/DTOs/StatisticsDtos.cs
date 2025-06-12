namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class AdminStatisticsDto
    {
        public List<LessonCompletionDto> LessonCompletions { get; set; } = new();
        public List<StudentQuizHistoryDto> StudentQuizHistories { get; set; } = new();
    }

    public class LessonCompletionDto
    {
        public int LessonId { get; set; }
        public string LessonTitle { get; set; }
        public int TotalActivities { get; set; }
        public int TotalCompletions { get; set; }
        public int TotalStudents { get; set; }
        public double AverageCompletionPercentage => TotalStudents > 0 ? ((double)TotalCompletions / (TotalActivities * TotalStudents)) * 100 : 0;
        public double _AverageCompletionPercentage { get; set; }
    }

    public class StudentQuizHistoryDto
    {
        public Guid StudentId { get; set; }
        public string StudentFullName { get; set; }
        public List<QuizAttemptDto> QuizAttempts { get; set; } = new();
    }

    public class StudentStatisticsDto
    {
        public List<MyLessonProgressDto> MyLessonProgresses { get; set; } = new();
        public List<QuizAttemptDto> MyQuizAttempts { get; set; } = new();
    }

    public class MyLessonProgressDto
    {
        public int LessonId { get; set; }
        public string LessonTitle { get; set; }
        public int TotalActivities { get; set; }
        public int CompletedActivities { get; set; }
        public double CompletionPercentage { get; set; }
    }

    public class QuizAttemptDto
    {
        public int HistoryQuizId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime CompletedDate { get; set; }
    }
}