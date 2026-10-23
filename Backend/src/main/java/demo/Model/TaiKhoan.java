package demo.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
// Thư viện tạo luật
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Lỗi: Tên đăng nhập không được để trống!") // Tên tài khoản không được để trống
    private String tenDangNhap;
    @Size(min = 6, message = "Lỗi: Mật khẩu phải có ít nhất 6 ký tự!") // Mật khẩu phải dài từ 6 ký tự trở lên
    private String matKhau;
    private String quyen; // Role-Admin/Role-User

    //Khai báo thêm biến nhận Token
    @Transient
    private String tokenCloudflare;
    @Transient
    private String tokenGoogle;
    // Mối quan hệ Nhiều - Một: Nhiều Tài khoản có thể thuộc về 1 Người dùng gốc
    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id") 
    private NguoiDung nguoiDung;

    
}
