package demo.Model;

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
public class LichSuDoc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với người dùng nào đang đọc
    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    // Liên kết với bộ truyện nào
    @ManyToOne
    @JoinColumn(name = "truyen_id")
    private Truyen truyen;

    // Liên kết với chương đang đọc dở
    @ManyToOne
    @JoinColumn(name = "chuong_id")
    private Chuong chuong;

    // Lưu lại thời gian đọc để sắp xếp truyện mới đọc lên đầu
    private LocalDateTime thoiGianDoc;
}