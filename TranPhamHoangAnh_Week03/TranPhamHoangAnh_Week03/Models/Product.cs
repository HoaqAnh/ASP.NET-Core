using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_Week03.Models
{
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        [StringLength(200, ErrorMessage = "Tên sản phẩm không được vượt quá 200 ký tự")]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Range(0, (double)decimal.MaxValue, ErrorMessage = "Giá sản phẩm phải là một số không âm")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng phải là một số không âm")]
        public int Quantity { get; set; }

        [StringLength(500, ErrorMessage = "Đường dẫn hình ảnh không được vượt quá 500 ký tự")]
        public string? ImageUrl { get; set; }

        public int? CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        public Product() { }

        public Product(string name, string? description, decimal price, int quantity, string? imageUrl, int? categoryId)
        {
            Name = name;
            Description = description;
            Price = price;
            Quantity = quantity;
            ImageUrl = imageUrl;
            CategoryId = categoryId;
        }
    }
}