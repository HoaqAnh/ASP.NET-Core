using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class ProductPageController : Controller // Hoặc tên controller bạn muốn
    {
        private readonly ApplicationDbContext _context;

        public ProductPageController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Lấy danh sách sản phẩm ban đầu (có thể là danh sách rỗng và để JS tự load)
            var initialProducts = await _context.Products
                                                .Include(p => p.Category)
                                                .OrderByDescending(p => p.Id)
                                                .Take(0) // Lấy 0 sản phẩm ban đầu, JS sẽ load
                                                .ToListAsync();

            ViewBag.Categories = await _context.Categories.OrderBy(c => c.Name).ToListAsync();
            return View(initialProducts); // Trả về View Index.cshtml với model và ViewBag
        }
    }
}