using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_Week03.Data;
using TranPhamHoangAnh_Week03.Models;
using TranPhamHoangAnh_Week03.Services;

namespace TranPhamHoangAnh_Week03.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPhotoService _photoService;

        public ProductsController(ApplicationDbContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
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
                                   p.ImagePublicId,
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
                                        .Select(p => new
                                        {
                                            p.Id,
                                            p.Name,
                                            p.Description,
                                            p.Price,
                                            p.Quantity,
                                            p.ImageUrl,
                                            p.ImagePublicId,
                                            p.CategoryId,
                                            Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
                                        })
                                        .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID {id}" });
            }

            return Ok(product);
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromForm] ProductCreateUpdateDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                Quantity = productDto.Quantity,
                CategoryId = productDto.CategoryId
            };

            if (productDto.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == productDto.CategoryId.Value);
                if (!categoryExists)
                {
                    ModelState.AddModelError("CategoryId", $"Danh mục với ID {productDto.CategoryId.Value} không tồn tại.");
                    return BadRequest(ModelState);
                }
            }
            else
            {
                if (productDto.CategoryId == 0) product.CategoryId = null;
            }


            if (productDto.ImageFile != null && productDto.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(productDto.ImageFile, "products");
                if (uploadResult.Error != null)
                {
                    ModelState.AddModelError("ImageFile", $"Lỗi upload ảnh: {uploadResult.Error.Message}");
                    return BadRequest(ModelState);
                }
                product.ImageUrl = uploadResult.SecureUrl.ToString();
                product.ImagePublicId = uploadResult.PublicId;
            }
            else if (!string.IsNullOrEmpty(productDto.ImageUrl))
            {
                product.ImageUrl = productDto.ImageUrl;
            }


            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            if (product.CategoryId.HasValue)
            {
                await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            }

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Quantity,
                product.ImageUrl,
                product.ImagePublicId,
                product.CategoryId,
                Category = product.Category != null ? new { product.Category.Id, product.Category.Name } : null
            });
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromForm] ProductCreateUpdateDto productDto)
        {
            if (id != productDto.Id)
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

            productInDb.Name = productDto.Name;
            productInDb.Description = productDto.Description;
            productInDb.Price = productDto.Price;
            productInDb.Quantity = productDto.Quantity;

            if (productDto.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == productDto.CategoryId.Value);
                if (!categoryExists)
                {
                    ModelState.AddModelError("CategoryId", $"Danh mục với ID {productDto.CategoryId.Value} không tồn tại.");
                    return BadRequest(ModelState);
                }
                productInDb.CategoryId = productDto.CategoryId.Value;
            }
            else
            {
                if (productDto.CategoryId == 0) productInDb.CategoryId = null;
            }


            if (productDto.ImageFile != null && productDto.ImageFile.Length > 0)
            {
                if (!string.IsNullOrEmpty(productInDb.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(productInDb.ImagePublicId);
                }

                var uploadResult = await _photoService.AddPhotoAsync(productDto.ImageFile, "products");
                if (uploadResult.Error != null)
                {
                    ModelState.AddModelError("ImageFile", $"Lỗi upload ảnh: {uploadResult.Error.Message}");
                    return BadRequest(ModelState);
                }
                productInDb.ImageUrl = uploadResult.SecureUrl.ToString();
                productInDb.ImagePublicId = uploadResult.PublicId;
            }
            else if (productDto.ClearCurrentImage == true && !string.IsNullOrEmpty(productInDb.ImagePublicId))
            {
                await _photoService.DeletePhotoAsync(productInDb.ImagePublicId);
                productInDb.ImageUrl = null;
                productInDb.ImagePublicId = null;
            }
            else if (string.IsNullOrEmpty(productDto.ImageUrl) && !string.IsNullOrEmpty(productInDb.ImagePublicId) && productDto.ImageFile == null && productDto.ClearCurrentImage != true)
            {
                await _photoService.DeletePhotoAsync(productInDb.ImagePublicId);
                productInDb.ImageUrl = null;
                productInDb.ImagePublicId = null;
            }
            else if (!string.IsNullOrEmpty(productDto.ImageUrl) && productDto.ImageUrl != productInDb.ImageUrl && productDto.ImageFile == null)
            {
                productInDb.ImageUrl = productDto.ImageUrl;
            }


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id)) { return NotFound(new { message = "Lỗi concurrency: Sản phẩm có thể đã bị xóa." }); }
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

            if (!string.IsNullOrEmpty(product.ImagePublicId))
            {
                var deletionResult = await _photoService.DeletePhotoAsync(product.ImagePublicId);
                if (deletionResult.Error != null && deletionResult.Result.ToLower() == "not found")
                {
                    Console.WriteLine($"Cloudinary: Ảnh với Public ID {product.ImagePublicId} không tìm thấy để xóa, có thể đã bị xóa thủ công.");
                }
                else if (deletionResult.Error != null)
                {
                    Console.WriteLine($"Cloudinary error deleting image {product.ImagePublicId}: {deletionResult.Error.Message}");
                }
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

    public class ProductCreateUpdateDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        [StringLength(200)]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Range(0, (double)decimal.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public int? CategoryId { get; set; }

        public IFormFile? ImageFile { get; set; }

        public string? ImageUrl { get; set; }
        public bool? ClearCurrentImage { get; set; }

    }
}