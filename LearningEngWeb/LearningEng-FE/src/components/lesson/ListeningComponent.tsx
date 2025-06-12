import { useEffect, type JSX } from 'react';
import type { Listening } from '@/types/lesson.types';
import { markActivityAsCompleted } from '@/services/progressService';

const ListeningComponent = ({ listening }: { listening: Listening }): JSX.Element => {
  useEffect(() => {
    markActivityAsCompleted({
      activityType: 'listening',
      activityId: listening.listeningId
    }).catch(error => {
      console.error("Lỗi khi lưu tiến độ Listening:", error);
    });
  }, [listening.listeningId]);

  return (
    <div>
      <h3>Bài nghe: {listening.title}</h3>
      <audio controls src={listening.audioUrl} style={{ width: '100%' }}>
        Trình duyệt của bạn không hỗ trợ thẻ audio.
      </audio>
    </div>
  );
};

export default ListeningComponent;