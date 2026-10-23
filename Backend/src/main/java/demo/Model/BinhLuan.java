package demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BinhLuan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dùng TEXT để lưu được nội dung bình luận dài
    @Column(columnDefinition = "TEXT")
    private String noiDung;

    // Lưu thời gian bình luận
    private LocalDateTime thoiGian;

    // Bình luận với Truyện
    @ManyToOne
    @JoinColumn(name = "truyen_id")
    @JsonIgnore
    private Truyen truyen;

    // Liên kết Bình luận với Chương (Để trống/null nếu là bình luận chung)
    @ManyToOne
    @JoinColumn(name = "chuong_id")
    @JsonIgnore
    private Chuong chuong;

    // Người viết với bình luận
    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id")
    @JsonIgnoreProperties({"taiKhoan", "danhSachTruyenYeuThich", "danhSachLichSu"})
    private NguoiDung nguoiDung;
}