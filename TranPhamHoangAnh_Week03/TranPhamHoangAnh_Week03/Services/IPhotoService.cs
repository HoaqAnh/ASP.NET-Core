using Microsoft.AspNetCore.Http;
using CloudinaryDotNet.Actions;

namespace TranPhamHoangAnh_Week03.Services
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file, string folderName = null, string publicId = null);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
    }
}
