using TranPhamHoangAnh_Week02.Models;
using TranPhamHoangAnh_Week02.Utils;
using Microsoft.AspNetCore.Mvc;

namespace LapTrinhWeb_LeHoangGiaDai_Week02.Controllers
{
    public class BooksController : Controller
    {
        private static readonly List<Book> listBooks = new List<Book>
        {
            new Book { Id = 1, Title = "Sách 1", Author = "Tác giả sách 1", PublicYear = 2020, Price = 400, Cover = "Content/images/book1.jpg" },
            new Book { Id = 2, Title = "Sách 2", Author = "Tác giả sách 2", PublicYear = 2021, Price = 500, Cover = "Content/images/book2.jpg" },
            new Book { Id = 3, Title = "Sách 3", Author = "Tác giả sách 3", PublicYear = 2021, Price = 1000, Cover = "Content/images/book3.jpg" }
        };

        // GET: Books/ListBooks
        public IActionResult ListBooks(string searchString, string sortBy, string sortOrder)
        {
            ViewBag.TitlePageName = "Book view page";

            // Lọc sách theo từ khóa tìm kiếm (nếu có)
            var books = listBooks.AsEnumerable();
            if (!string.IsNullOrEmpty(searchString))
            {
                var searchStringNoDiacritics = StringUtils.RemoveDiacritics(searchString).ToLower();
                books = books.Where(b =>
                    StringUtils.RemoveDiacritics(b.Title).ToLower().Contains(searchStringNoDiacritics) ||
                    StringUtils.RemoveDiacritics(b.Author).ToLower().Contains(searchStringNoDiacritics));
            }

            // Sắp xếp danh sách sách
            books = (sortBy, sortOrder) switch
            {
                ("Title", "Descending") => books.OrderByDescending(b => b.Title),
                ("Title", _) => books.OrderBy(b => b.Title),
                ("Price", "Descending") => books.OrderByDescending(b => b.Price),
                ("Price", _) => books.OrderBy(b => b.Price),
                _ => books.OrderBy(b => b.Title) // Mặc định sắp xếp theo Title tăng dần
            };

            // Lưu các tham số để hiển thị lại trong form
            ViewBag.SearchString = searchString;
            ViewBag.SortBy = sortBy;
            ViewBag.SortOrder = sortOrder;

            return View(books);
        }

        // GET: Books/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Books/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Book book)
        {
            if (ModelState.IsValid)
            {
                book.Id = listBooks.Any() ? listBooks.Max(b => b.Id) + 1 : 1;
                listBooks.Add(book);
                return RedirectToAction(nameof(ListBooks));
            }
            return View(book);
        }

        // GET: Books/Edit/5
        public IActionResult Edit(int id)
        {
            var book = listBooks.FirstOrDefault(b => b.Id == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        // POST: Books/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Book book)
        {
            if (id != book.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                var existingBook = listBooks.FirstOrDefault(b => b.Id == id);
                if (existingBook == null)
                {
                    return NotFound();
                }

                existingBook.Title = book.Title;
                existingBook.Author = book.Author;
                existingBook.PublicYear = book.PublicYear;
                existingBook.Price = book.Price;
                existingBook.Cover = book.Cover;

                return RedirectToAction(nameof(ListBooks));
            }
            return View(book);
        }

        // GET: Books/Delete/5
        public IActionResult Delete(int id)
        {
            var book = listBooks.FirstOrDefault(b => b.Id == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        // POST: Books/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            var book = listBooks.FirstOrDefault(b => b.Id == id);
            if (book != null)
            {
                listBooks.Remove(book);
            }
            return RedirectToAction(nameof(ListBooks));
        }

        // GET: Books/Details/5
        public IActionResult Details(int id)
        {
            var book = listBooks.FirstOrDefault(b => b.Id == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }
    }
}