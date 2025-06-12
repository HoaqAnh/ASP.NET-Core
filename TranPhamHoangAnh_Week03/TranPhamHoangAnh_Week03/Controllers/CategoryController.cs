using Microsoft.AspNetCore.Mvc;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class CategoryController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Category hoặc /Category/Index
        public async Task<IActionResult> Index()
        {
            var initialCategories = await _context.Categories
                                                  .OrderBy(c => c.Name)
                                                  .ToListAsync();
            return View(initialCategories);
        }
    }
}