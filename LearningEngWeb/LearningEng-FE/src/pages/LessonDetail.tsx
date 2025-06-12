import { useState, useEffect, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonDetails } from "@/services/lessonService";
import type {
  Lesson,
  Activity,
  Reading,
  Listening,
  Writing,
} from "@/types/lesson.types";
import ReadingComponent from "@/components/lesson/ReadingComponent";
import ListeningComponent from "@/components/lesson/ListeningComponent";
import WritingComponent from "@/components/lesson/WritingComponent";

const LessonDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const quiz = lesson?.quizzes?.[0] || null;

  useEffect(() => {
    if (lessonId) {
      getLessonDetails(Number(lessonId))
        .then((data) => {
          setLesson(data);
          const assembledActivities: Activity[] = [
            ...data.readings.map((r: Reading) => ({
              type: "reading" as const,
              data: r,
            })),
            ...data.listenings.map((l: Listening) => ({
              type: "listening" as const,
              data: l,
            })),
            ...data.writings.map((w: Writing) => ({
              type: "writing" as const,
              data: w,
            })),
          ];
          setActivities(assembledActivities);
        })
        .finally(() => setIsLoading(false));
    }
  }, [lessonId]);

  const renderCurrentActivity = () => {
    const activity = activities[currentActivityIndex];
    if (!activity) return <p>Bài học này không có hoạt động nào.</p>;

    if (activity.type === "reading")
      return <ReadingComponent reading={activity.data} />;
    if (activity.type === "listening")
      return <ListeningComponent listening={activity.data} />;
    if (activity.type === "writing")
      return <WritingComponent writing={activity.data} />;
    return null;
  };

  if (isLoading) return <div>Đang tải bài học...</div>;
  if (!lesson) return <div>Không tìm thấy bài học.</div>;

  return (
    <div>
      <h1>{lesson.title}</h1>
      <p>
        <i>{lesson.description}</i>
      </p>
      <hr />

      <div className="activity-container">{renderCurrentActivity()}</div>

      {quiz && (
        <div
          className="quiz-entry"
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid blue",
          }}
        >
          <h3>Câu đố: {quiz.title}</h3>
          <p>Hoàn thành câu đố để củng cố kiến thức.</p>
          <button onClick={() => navigate(`/quiz/${quiz.quizId}`)}>
            Bắt đầu
          </button>
        </div>
      )}

      <div className="navigation-buttons" style={{ marginTop: "20px" }}>
        <button
          onClick={() => setCurrentActivityIndex((prev) => prev - 1)}
          disabled={currentActivityIndex === 0}
        >
          &larr; Hoạt động trước
        </button>
        <span style={{ margin: "0 10px" }}>
          {currentActivityIndex + 1} / {activities.length}
        </span>
        <button
          onClick={() => setCurrentActivityIndex((prev) => prev + 1)}
          disabled={currentActivityIndex >= activities.length - 1}
        >
          Hoạt động tiếp theo &rarr;
        </button>
      </div>
    </div>
  );
};

export default LessonDetail;
