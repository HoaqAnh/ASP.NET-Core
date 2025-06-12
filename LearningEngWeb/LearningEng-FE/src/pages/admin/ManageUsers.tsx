import { useState, useEffect, type JSX } from "react";
import type { Student } from "@/types/userManagement.types";
import {
  getStudents,
  toggleStudentStatus,
} from "@/services/userManagementService";
import "@styles/pages/ManageUsers.css"

const ManageUsers = (): JSX.Element => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data);
      })
      .catch(() => {
        setError("Không thể tải danh sách người dùng.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleToggleStatus = async (studentId: string) => {
    try {
      await toggleStudentStatus(studentId);
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? { ...student, isEnabled: !student.isEnabled }
            : student
        )
      );
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  if (isLoading) return <div>Đang tải danh sách người dùng...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mu-container">
      <div className="mu-header">
        <h1 className="mu-header__title">Quản lý tài khoản Học viên</h1>
      </div>
      <div className="mu-table-wrapper">
        <table className="mu-table">
          <thead className="mu-table__head">
            <tr className="mu-table__row">
              <th className="mu-table__cell mu-table__cell--header">Họ tên</th>
              <th className="mu-table__cell mu-table__cell--header">Email</th>
              <th className="mu-table__cell mu-table__cell--header mu-table__cell--center">
                Trạng thái
              </th>
              <th className="mu-table__cell mu-table__cell--header mu-table__cell--center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="mu-table__body">
            {students.map((student) => (
              <tr key={student.id} className="mu-table__row">
                <td className="mu-table__cell">{student.fullName}</td>
                <td className="mu-table__cell">{student.email}</td>
                <td className="mu-table__cell mu-table__cell--center">
                  <span
                    className={`mu-status-badge ${
                      student.isEnabled
                        ? "mu-status-badge--active"
                        : "mu-status-badge--disabled"
                    }`}
                  >
                    {student.isEnabled ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </td>
                <td className="mu-table__cell mu-table__cell--center">
                  <button
                    onClick={() => handleToggleStatus(student.id)}
                    className={`mu-action-button ${
                      student.isEnabled
                        ? "mu-action-button--disable"
                        : "mu-action-button--enable"
                    }`}
                  >
                    {student.isEnabled ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
