using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_2280600123.Data;
using TranPhamHoangAnh_2280600123.DTOs;

namespace TranPhamHoangAnh_2280600123.Controllers
{
    [Route("api/user-management")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserManagementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserManagementController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/user-management/students
        /// <summary>
        /// Lấy danh sách tất cả tài khoản có vai trò là Student.
        /// </summary>
        [HttpGet("students")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
        {
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new StudentDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Address = u.Address,
                    PhoneNumber = u.PhoneNumber,
                    IsEnabled = u.IsEnabled
                })
                .ToListAsync();

            return Ok(students);
        }

        // PATCH: api/user-management/students/{id}/toggle-status
        /// <summary>
        /// Kích hoạt (Enable) hoặc Vô hiệu hóa (Disable) một tài khoản Student.
        /// </summary>
        /// <param name="id">ID của tài khoản Student</param>
        [HttpPatch("students/{id}/toggle-status")]
        public async Task<IActionResult> ToggleStudentStatus(Guid id)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Student");

            if (student == null)
            {
                return NotFound("Không tìm thấy tài khoản học viên.");
            }

            student.IsEnabled = !student.IsEnabled;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật trạng thái tài khoản thành công.",
                isEnabled = student.IsEnabled
            });
        }
    }
}