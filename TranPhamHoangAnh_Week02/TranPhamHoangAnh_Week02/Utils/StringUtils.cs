namespace TranPhamHoangAnh_Week02.Utils
{
    public static class StringUtils
    {
        public static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            var replacements = new Dictionary<string, string>
            {
                { "[àáảãạăắằẳẵặâấầẩẫậ]", "a" },
                { "[ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]", "A" },
                { "[èéẻẽẹêếềểễệ]", "e" },
                { "[ÈÉẺẼẸÊẾỀỂỄỆ]", "E" },
                { "[ìíỉĩị]", "i" },
                { "[ÌÍỈĨỊ]", "I" },
                { "[òóỏõọôốồổỗộơớờởỡợ]", "o" },
                { "[ÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]", "O" },
                { "[ùúủũụưứừửữự]", "u" },
                { "[ÙÚỦŨỤƯỨỪỬỮỰ]", "U" },
                { "[ỳýỷỹỵ]", "y" },
                { "[ỲÝỶỸỴ]", "Y" },
                { "[đ]", "d" },
                { "[Đ]", "D" }
            };

            string result = text;
            foreach (var pair in replacements)
            {
                result = System.Text.RegularExpressions.Regex.Replace(result, pair.Key, pair.Value);
            }

            return result;
        }
    }
}