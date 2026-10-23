package demo.Model;
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
public class TheoDoiTruyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id")
    @JsonIgnoreProperties({"danhSachTaiKhoan", "danhSachLichSu"})
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "truyen_id")
    private Truyen truyen;

    private LocalDateTime thoiGianTheoDoi;
}
