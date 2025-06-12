using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.Models
{
    public class ActivityProgress
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ActivityProgressId { get; set; }

        public bool IsCompleted { get; set; } = false;

        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public int? ReadingId { get; set; }
        [ForeignKey("ReadingId")]
        public virtual Reading? Reading { get; set; }

        public int? ListeningId { get; set; }
        [ForeignKey("ListeningId")]
        public virtual Listening? Listening { get; set; }

        public int? WritingId { get; set; }
        [ForeignKey("WritingId")]
        public virtual Writing? Writing { get; set; }
    }
}
