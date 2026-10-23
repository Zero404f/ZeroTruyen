package demo.Repository;

import demo.Model.Chuong;
import demo.Model.ChuongTomTat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChuongRepository extends JpaRepository<Chuong, Long>{
    // Tự động sinh ra câu lệnh SQL lấy toàn bộ chương của 1 truyện
    List<ChuongTomTat> findByTruyenId(Long truyenId);
}