import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResult } from '@/services/quizAttemptService';
import type { QuizResult } from '@/types/quizAttempt.types';

const QuizResultPage = (): JSX.Element => {
  const { historyId } = useParams<{ historyId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (historyId) {
      getQuizResult(Number(historyId)).then(setResult);
    }
  }, [historyId]);

  if (!result) return <div>Đang tải kết quả...</div>;

  const getOptionStyle = (userAnswer: string, correctAnswer: string, option: string): React.CSSProperties => {
    if (option === correctAnswer) {
      return { color: 'green', fontWeight: 'bold' };
    }
    if (option === userAnswer && userAnswer !== correctAnswer) {
      return { color: 'red', textDecoration: 'line-through' };
    }
    return {};
  };

  return (
    <div>
      <h1>Kết quả: {result.quizTitle}</h1>
      <h2>Điểm của bạn: {result.score} / {result.totalQuestions}</h2>
      <hr />
      {result.questions.map((q, index) => (
        <div key={q.questionId} style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
          <p><b>Câu {index + 1}:</b> {q.content}</p>
          <p style={getOptionStyle(q.userAnswer, q.correctAnswer, 'A')}>A. {q.optionA}</p>
          <p style={getOptionStyle(q.userAnswer, q.correctAnswer, 'B')}>B. {q.optionB}</p>
          <p style={getOptionStyle(q.userAnswer, q.correctAnswer, 'C')}>C. {q.optionC}</p>
          <p style={getOptionStyle(q.userAnswer, q.correctAnswer, 'D')}>D. {q.optionD}</p>
          {q.userAnswer !== q.correctAnswer && <p><b>Câu trả lời của bạn: {q.userAnswer} - Đáp án đúng: {q.correctAnswer}</b></p>}
        </div>
      ))}
      <button onClick={() => navigate('/')}>Quay về trang chủ</button>
    </div>
  );
};

export default QuizResultPage;