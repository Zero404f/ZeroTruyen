package demo.Repository;

import demo.Model.TheLoai;
import demo.Model.Truyen;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheLoaiRepository extends JpaRepository<TheLoai, Long>{
    // Kho này dùng để lưu độc giả, lưu khách vãng lai
}