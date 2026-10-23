package demo.Repository;

import demo.Model.LichSuDoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuDocRepository extends JpaRepository<LichSuDoc, Long> {
    // Tìm toàn bộ lịch sử của 1 người dùng, sắp xếp ngày đọc mới nhất lên đầu
    List<LichSuDoc> findByNguoiDungIdOrderByThoiGianDocDesc(Long nguoiDungId);
    
    // Tìm xem người dùng này đã từng đọc bộ truyện này chưa (để ghi đè chương mới)
    LichSuDoc findByNguoiDungIdAndTruyenId(Long nguoiDungId, Long truyenId);
}