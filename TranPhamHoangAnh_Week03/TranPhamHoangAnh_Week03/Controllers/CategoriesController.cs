using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TranPhamHoangAnh_Week03.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.OrderBy(c => c.Name).ToListAsync();
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy danh mục với ID {id}" });
            }

            return category;
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategory = await _context.Categories
                                             .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower());
            if (existingCategory != null)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã tồn tại.");
                return BadRequest(ModelState);
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest(new { message = "ID danh mục trong URL và body không khớp." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategoryWithName = await _context.Categories
                                                     .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower() && c.Id != id);
            if (existingCategoryWithName != null)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã tồn tại.");
                return BadRequest(ModelState);
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound(new { message = $"Không tìm thấy danh mục với ID {id} để cập nhật." });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating category: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi server nội bộ khi cập nhật danh mục." });
            }

            return NoContent();
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy danh mục với ID {id} để xóa." });
            }

            if (category.Products != null && category.Products.Any())
            {
                return BadRequest(new { message = $"Không thể xóa danh mục '{category.Name}' vì đang có sản phẩm thuộc danh mục này." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Danh mục '{category.Name}' đã được xóa thành công." });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}