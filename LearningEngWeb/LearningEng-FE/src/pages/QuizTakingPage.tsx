import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetails } from '@/services/quizService';
import { submitQuiz } from '@/services/quizAttemptService';
import type { Quiz } from '@/types/quiz.types';
import type { UserAnswer } from '@/types/quizAttempt.types';

const QuizTakingPage = (): JSX.Element => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quizId) {
      getQuizDetails(Number(quizId)).then(setQuiz);
    }
  }, [quizId]);

  const handleSelectAnswer = (questionId: number, selectedAnswer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
  };

  const handleSubmit = async () => {
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) {
      alert('Vui lòng trả lời hết tất cả các câu hỏi.');
      return;
    }
    setIsLoading(true);
    const payloadAnswers: UserAnswer[] = Object.entries(answers).map(([qid, ans]) => ({
      questionId: Number(qid),
      selectedAnswer: ans,
    }));

    try {
      const result = await submitQuiz({ quizId: quiz.quizId, answers: payloadAnswers });
      navigate(`/quiz/result/${result.historyQuizId}`);
    } catch (error) {
      alert('Nộp bài thất bại!');
      setIsLoading(false);
    }
  };

  if (!quiz) return <div>Đang tải bài quiz...</div>;

  return (
    <div>
      <h1>{quiz.title}</h1>
      {quiz.questions.map((q, index) => (
        <div key={q.questionId} style={{marginBottom: '20px'}}>
          <p><b>Câu {index + 1}:</b> {q.content}</p>
          {['A', 'B', 'C', 'D'].map(option => (
            <div key={option}>
              <input 
                type="radio" 
                id={`q${q.questionId}-opt${option}`}
                name={`question-${q.questionId}`}
                value={option}
                checked={answers[q.questionId] === option}
                onChange={() => handleSelectAnswer(q.questionId, option)}
              />
              <label htmlFor={`q${q.questionId}-opt${option}`}>
                {option}. {q[`option${option}` as keyof typeof q]}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Đang nộp...' : 'Nộp bài'}</button>
      <button onClick={() => navigate(-1)} style={{marginLeft: '10px'}}>Bỏ cuộc</button>
    </div>
  );
};

export default QuizTakingPage;