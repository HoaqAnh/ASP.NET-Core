using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class ProductPageController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductPageController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var initialProducts = await _context.Products
                                                .Include(p => p.Category)
                                                .OrderByDescending(p => p.Id)
                                                .Take(0)
                                                .ToListAsync();

            ViewBag.Categories = await _context.Categories.OrderBy(c => c.Name).ToListAsync();
            return View(initialProducts);
        }
    }
}