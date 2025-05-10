using System; 
using System.Collections.Generic; 
using System.Linq; 
using System.Web;
using System.ComponentModel.DataAnnotations;
namespace TranPhamHoangAnh_Week02.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public int PublicYear { get; set; }
        public decimal Price { get; set; }
        public string Cover { get; set; }
    }
}