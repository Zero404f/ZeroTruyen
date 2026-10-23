package demo.Repository;

import demo.Model.TheoDoiTruyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TheoDoiTruyenRepository extends JpaRepository<TheoDoiTruyen, Long> {
    // Tìm bản ghi để xem user đã theo dõi truyện này chưa
    TheoDoiTruyen findByNguoiDungIdAndTruyenId(Long nguoiDungId, Long truyenId);
    
    // Lấy danh sách truyện đang theo dõi, xếp truyện mới theo dõi lên đầu
    List<TheoDoiTruyen> findByNguoiDungIdOrderByThoiGianTheoDoiDesc(Long nguoiDungId);
}