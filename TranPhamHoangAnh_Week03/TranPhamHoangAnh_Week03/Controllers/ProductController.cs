// File: Controllers/ProductController.cs
using Microsoft.AspNetCore.Mvc;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class ProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Lấy danh sách sản phẩm ban đầu
            var initialProducts = await _context.Products
                                                .Include(p => p.Category)
                                                .OrderByDescending(p => p.Id)
                                                .Take(10)
                                                .ToListAsync();

            var categories = await _context.Categories.OrderBy(c => c.Name).ToListAsync();
            ViewBag.Categories = categories;

            return View(initialProducts);
        }
    }
}