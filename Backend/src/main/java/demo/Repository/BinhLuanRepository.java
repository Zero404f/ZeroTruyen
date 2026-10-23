package demo.Repository;

import demo.Model.BinhLuan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BinhLuanRepository extends JpaRepository<BinhLuan, Long> {
    
    // Dùng cho trang Chi tiết: Lấy tất cả bình luận của truyện (bình luận truyện + bình luận các chương)
    List<BinhLuan> findByTruyenIdOrderByThoiGianDesc(Long truyenId);
    
    // Dùng cho trang Đọc Truyện: Lấy các bình luận thuộc về một Chương cụ thể
    List<BinhLuan> findByChuongIdOrderByThoiGianDesc(Long chuongId);
}