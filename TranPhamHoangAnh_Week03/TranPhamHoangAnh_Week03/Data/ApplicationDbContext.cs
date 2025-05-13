namespace TranPhamHoangAnh_Week03.Data;
using Microsoft.EntityFrameworkCore;
using TranPhamHoangAnh_Week03.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<User> Users { get; set; }
}