using Microsoft.AspNetCore.Mvc;

namespace TranPhamHoangAnh_Week03.Controllers
{
    public class AuthController : Controller
    {
        // GET: /Auth/Register
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        public IActionResult Login()
        {
            return View();
        }
    }
}