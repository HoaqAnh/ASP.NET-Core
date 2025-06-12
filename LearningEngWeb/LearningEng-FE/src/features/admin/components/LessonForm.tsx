import { useState, useEffect, type JSX } from "react";
import {
  createLessonWithActivities,
  updateLesson,
} from "@/services/lessonService";
import type { Lesson } from "@/types/lesson.types";

import "@styles/components/LessonForm.css";

interface LessonFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Lesson | null;
}

const LessonForm = ({
  onSuccess,
  onCancel,
  initialData,
}: LessonFormProps): JSX.Element => {
  const isEditMode = !!initialData;

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [description, setDescription] = useState("");

  const [readingTitle, setReadingTitle] = useState("");
  const [readingContent, setReadingContent] = useState("");

  const [writingTitle, setWritingTitle] = useState("");
  const [writingContent, setWritingContent] = useState("");

  const [listeningTitle, setListeningTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title);
      setLevel(initialData.level);
      setDescription(initialData.description || "");
      setReadingTitle(initialData.readings[0]?.title || "");
      setReadingContent(initialData.readings[0]?.readingContent || "");
      setWritingTitle(initialData.writings[0]?.title || "");
      setWritingContent(initialData.writings[0]?.content || "");
      setListeningTitle(initialData.listenings[0]?.title || "");
      setCurrentAudioUrl(initialData.listenings[0]?.audioUrl || null);
    }
  }, [initialData, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && !audioFile) {
      setError("Vui lòng chọn file audio cho bài nghe.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Level", level);
    formData.append("Description", description);
    formData.append("Reading.Title", readingTitle);
    formData.append("Reading.Content", readingContent);
    formData.append("Writing.Title", writingTitle);
    formData.append("Writing.Content", writingContent);
    formData.append("ListeningTitle", listeningTitle);

    if (audioFile) {
      formData.append("AudioFile", audioFile);
    }

    try {
      if (isEditMode) {
        await updateLesson(initialData.lessonId, formData);
        alert("Cập nhật thành công!");
      } else {
        await createLessonWithActivities(formData);
        alert("Tạo bài học thành công!");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lesson-form">
      <h2 className="lesson-form__title">
        {isEditMode ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
      </h2>
      {error && <p className="lesson-form__error">{error}</p>}

      <fieldset className="lesson-form__fieldset">
        <legend className="lesson-form__legend">Thông tin chung</legend>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Tiêu đề bài học:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="lesson-form__input"
          />
        </div>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Cấp độ:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="lesson-form__select"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Mô tả:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="lesson-form__textarea"
          />
        </div>
      </fieldset>

      <fieldset className="lesson-form__fieldset">
        <legend className="lesson-form__legend">Bài đọc (Reading)</legend>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Tiêu đề bài đọc:</label>
          <input
            type="text"
            value={readingTitle}
            onChange={(e) => setReadingTitle(e.target.value)}
            required
            className="lesson-form__input"
          />
        </div>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Nội dung bài đọc:</label>
          <textarea
            value={readingContent}
            onChange={(e) => setReadingContent(e.target.value)}
            required
            className="lesson-form__textarea"
          />
        </div>
      </fieldset>

      <fieldset className="lesson-form__fieldset">
        <legend className="lesson-form__legend">Bài viết (Writing)</legend>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Tiêu đề bài viết:</label>
          <input
            type="text"
            value={writingTitle}
            onChange={(e) => setWritingTitle(e.target.value)}
            required
            className="lesson-form__input"
          />
        </div>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Nội dung/Đề bài:</label>
          <textarea
            value={writingContent}
            onChange={(e) => setWritingContent(e.target.value)}
            required
            className="lesson-form__textarea"
          />
        </div>
      </fieldset>

      <fieldset className="lesson-form__fieldset">
        <legend className="lesson-form__legend">Bài nghe (Listening)</legend>
        <div className="lesson-form__group">
          <label className="lesson-form__label">Tiêu đề bài nghe:</label>
          <input
            type="text"
            value={listeningTitle}
            onChange={(e) => setListeningTitle(e.target.value)}
            required
            className="lesson-form__input"
          />
        </div>

        {isEditMode && currentAudioUrl && (
          <div className="lesson-form__audio-preview">
            <label className="lesson-form__label">Audio hiện tại:</label>
            <audio
              controls
              src={currentAudioUrl}
              className="lesson-form__audio-player"
            />
          </div>
        )}

        <div className="lesson-form__group">
          <label className="lesson-form__label">
            {isEditMode
              ? "Chọn file audio mới (nếu muốn thay đổi):"
              : "File Audio:"}
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required={!isEditMode}
            className="lesson-form__file-input"
          />
        </div>
      </fieldset>

      <hr className="lesson-form__divider" />

      <div className="lesson-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="lesson-form__button lesson-form__button--cancel"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="lesson-form__button lesson-form__button--submit"
        >
          {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Lưu"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;
