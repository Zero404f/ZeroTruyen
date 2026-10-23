package demo.Repository;

import demo.Model.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    DanhGia findByNguoiDungIdAndTruyenId(Long nguoiDungId, Long truyenId);
    List<DanhGia> findByTruyenId(Long truyenId);
}