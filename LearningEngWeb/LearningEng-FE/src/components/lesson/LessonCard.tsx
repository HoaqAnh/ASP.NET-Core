import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lesson } from '@/types/lesson.types';
import "@styles/components/LessonCard.css"

interface LessonCardProps {
  lesson: Lesson;
}

const LessonCard = ({ lesson }: LessonCardProps): JSX.Element => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/lessons/${lesson.lessonId}`);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return '#22c55e'; // Green
      case 'intermediate': return '#f97316'; // Orange
      case 'advanced': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div className="lesson-card" onClick={handleCardClick}>
      <div 
        className="level-badge" 
        style={{ backgroundColor: getLevelColor(lesson.level) }}
      >
        {lesson.level}
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
    </div>
  );
};

export default LessonCard;