using CloudinaryDotNet.Actions;

namespace TranPhamHoangAnh_2280600123.Services
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file, string folderName = null, string publicId = null);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
        Task<UploadResult> AddAudioAsync(IFormFile file);
    }
}
