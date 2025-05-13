
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace TranPhamHoangAnh_Week03.Models
{
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [StringLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự")]
        public string Name { get; set; }

        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự")]
        public string? Description { get; set; }

        public Category()
        {
            Name = string.Empty;
        }

        public Category(string name, string? description)
        {
            Name = name;
            Description = description;
        }

        // Navigation property để liên kết với Product (nếu bạn muốn hiển thị số lượng sản phẩm thuộc danh mục)
         public virtual ICollection<Product>? Products { get; set; }
    }
}