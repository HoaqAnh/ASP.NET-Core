using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TranPhamHoangAnh_Week03.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] string? categoryName,
            [FromQuery] string? sortBy,
            [FromQuery] string? searchString,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            IQueryable<Product> query = _context.Products.Include(p => p.Category);

            if (!string.IsNullOrEmpty(categoryName))
            {
                query = query.Where(p => p.Category != null && p.Category.Name == categoryName);
            }

            if (!string.IsNullOrEmpty(searchString))
            {
                query = query.Where(p => p.Name.Contains(searchString) || (p.Description != null && p.Description.Contains(searchString)));
            }

            switch (sortBy?.ToLower())
            {
                case "price-asc": query = query.OrderBy(p => p.Price); break;
                case "price-desc": query = query.OrderByDescending(p => p.Price); break;
                case "name-asc": query = query.OrderBy(p => p.Name); break;
                case "newest": default: query = query.OrderByDescending(p => p.Id); break;
            }

            var totalProducts = await query.CountAsync();
            var products = await query
                                .Skip((pageNumber - 1) * pageSize)
                                .Take(pageSize)
                                .Select(p => new
                                {
                                    p.Id,
                                    p.Name,
                                    p.Description,
                                    p.Price,
                                    p.Quantity,
                                    p.ImageUrl,
                                    p.CategoryId,
                                    Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
                                })
                                .ToListAsync();

            return Ok(new { Items = products, TotalCount = totalProducts });
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                                        .Include(p => p.Category)
                                        .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID {id}" });
            }

            return Ok(new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Quantity,
                product.ImageUrl,
                product.CategoryId,
                Category = product.Category != null ? new { product.Category.Id, product.Category.Name } : null
            });
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (product.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId.Value);
                if (!categoryExists)
                {
                    ModelState.AddModelError("CategoryId", $"Danh mục với ID {product.CategoryId.Value} không tồn tại.");
                    return BadRequest(ModelState);
                }
            }

            product.Category = null;


            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] Product productDataFromClient)
        {
            if (id != productDataFromClient.Id)
            {
                return BadRequest(new { message = "Product ID trong URL và body không khớp." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var productInDb = await _context.Products.FindAsync(id);

            if (productInDb == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID {id} để cập nhật." });
            }

            productInDb.Name = productDataFromClient.Name;
            productInDb.Description = productDataFromClient.Description;
            productInDb.Price = productDataFromClient.Price;
            productInDb.Quantity = productDataFromClient.Quantity;
            productInDb.ImageUrl = productDataFromClient.ImageUrl;

            if (productDataFromClient.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == productDataFromClient.CategoryId.Value);
                if (!categoryExists)
                {
                    ModelState.AddModelError("CategoryId", $"Danh mục với ID {productDataFromClient.CategoryId.Value} không tồn tại.");
                    return BadRequest(ModelState);
                }
                productInDb.CategoryId = productDataFromClient.CategoryId.Value;
            }
            else
            {
                productInDb.CategoryId = null;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound(new { message = "Lỗi concurrency: Sản phẩm có thể đã bị xóa." });
                }
                else { throw; }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating product: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi server nội bộ khi cập nhật sản phẩm." });
            }

            return NoContent();
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID {id} để xóa." });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Sản phẩm với ID {id} đã được xóa thành công." });
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}