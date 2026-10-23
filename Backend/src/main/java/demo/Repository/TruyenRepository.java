package demo.Repository;

import demo.Model.Truyen; // Đưa class Truyen vào
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TruyenRepository extends JpaRepository<Truyen, Long>{
    // Tìm truyện có tên chứa từ khóa, không phân biệt hoa thường
    List<Truyen> findByTenTruyenContainingIgnoreCase(String tuKhoa);
    List<Truyen> findByDanhSachTheLoai_Id(Long theLoaiId);

    // Truy vấn Tìm kiếm nâng cao đa điều kiện
    @Query("SELECT DISTINCT t FROM Truyen t LEFT JOIN t.danhSachTheLoai tl WHERE " +
           "(:tuKhoa IS NULL OR LOWER(t.tenTruyen) LIKE LOWER(CONCAT('%', :tuKhoa, '%'))) AND " +
           "(:theLoaiId IS NULL OR tl.id = :theLoaiId) AND " +
           "(:trangThai IS NULL OR t.trangThai = :trangThai)")
    List<Truyen> timKiemNangCao(@Param("tuKhoa") String tuKhoa, 
                                @Param("theLoaiId") Long theLoaiId, 
                                @Param("trangThai") String trangThai);
}