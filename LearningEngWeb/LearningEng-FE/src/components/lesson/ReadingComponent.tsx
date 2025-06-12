import { useEffect, type JSX } from 'react';
import type { Reading } from '@/types/lesson.types';
import { markActivityAsCompleted } from '@/services/progressService'; // Import service

const ReadingComponent = ({ reading }: { reading: Reading }): JSX.Element => {
  useEffect(() => {
    markActivityAsCompleted({
      activityType: 'reading',
      activityId: reading.readingId
    }).catch(error => {
      console.error("Lỗi khi lưu tiến độ Reading:", error);
    });
  }, [reading.readingId]);

  return (
    <div>
      <h3>Bài đọc: {reading.title}</h3>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        {reading.readingContent}
      </div>
    </div>
  );
};

export default ReadingComponent;