package demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tenTaiKhoan;
    private String email;
    private String anhDaiDien;
    // Mối quan hệ Một - Nhiều: 1 Người dùng có thể tạo Nhiều Tài khoản
    // Khách vãng lai thì danh sách này sẽ trống rỗng.
    @OneToMany(mappedBy = "nguoiDung", cascade = CascadeType.ALL)
    @JsonIgnore // Tránh bị lặp vòng lặp vô tận khi in ra JSON
    private List<TaiKhoan> danhSachTaiKhoan;
}
