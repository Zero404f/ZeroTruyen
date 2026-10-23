package demo.Repository;

import demo.Model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long>{
    // Tìm tài khoản để kiểm tra đăng nhập
    TaiKhoan findByTenDangNhap(String tenDangNhap);
}
