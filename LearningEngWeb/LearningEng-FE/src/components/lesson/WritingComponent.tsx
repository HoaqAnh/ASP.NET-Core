import { useEffect, type JSX } from 'react';
import type { Writing } from '@/types/lesson.types';
import { markActivityAsCompleted } from '@/services/progressService';

const WritingComponent = ({ writing }: { writing: Writing }): JSX.Element => {
  useEffect(() => {
    markActivityAsCompleted({
      activityType: 'writing',
      activityId: writing.writingId
    }).catch(error => {
      console.error("Lỗi khi lưu tiến độ Writing:", error);
    });
  }, [writing.writingId]);

  return (
    <div>
      <h3>Bài viết: {writing.title}</h3>
      <p><strong>Đề bài:</strong> {writing.content}</p>
      <textarea rows={10} style={{ width: '100%' }} placeholder="Viết bài của bạn vào đây..."></textarea>
    </div>
  );
};

export default WritingComponent;