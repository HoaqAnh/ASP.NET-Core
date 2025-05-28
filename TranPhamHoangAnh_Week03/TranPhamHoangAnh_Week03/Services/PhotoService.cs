using CloudinaryDotNet.Actions;
using CloudinaryDotNet;

namespace TranPhamHoangAnh_Week03.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        public PhotoService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file, string folderName = null, string publicIdOverwrite = null)
        {
            var uploadResult = new ImageUploadResult();
            if (file != null && file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.FileName, stream)
                    };
                    if (!string.IsNullOrEmpty(folderName))
                    {
                        uploadParams.Folder = folderName;
                    }
                    if (!string.IsNullOrEmpty(publicIdOverwrite))
                    {
                        uploadParams.PublicId = publicIdOverwrite;
                        uploadParams.Overwrite = true;
                    }
                    else
                    {
                        string safeFileName = Path.GetFileNameWithoutExtension(file.FileName).ToLower().Replace(" ", "-");
                        safeFileName = System.Text.RegularExpressions.Regex.Replace(safeFileName, @"[^a-zA-Z0-9\-_.]", "");
                        uploadParams.PublicId = $"{safeFileName}-{Path.GetRandomFileName().Split('.')[0]}";
                    }
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);
                }
            }
            else
            {
                uploadResult.Error = new Error { Message = "File không được cung cấp hoặc rỗng." };
            }
            return uploadResult;
        }

        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
            {
                return new DeletionResult { Result = "Error", Error = new Error { Message = "PublicId không được cung cấp." } };
            }
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result;
        }
    }
}
