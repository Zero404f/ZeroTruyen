package demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import demo.Model.NguoiDung;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long>{
    
}
