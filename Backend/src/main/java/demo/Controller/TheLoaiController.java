package demo.Controller;

import demo.Model.TheLoai;
import demo.Repository.TheLoaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/v1/the-loai")

public class TheLoaiController{
    @Autowired
    private TheLoaiRepository theLoaiRepository;
    //Thêm thể loại
    @PostMapping
    public TheLoai themTheLoai(@RequestBody TheLoai theLoaiMoi) {
            return theLoaiRepository.save(theLoaiMoi);
    }

    //Sửa thể loại
    @PutMapping("/{id}")
    public TheLoai suaTheLoai(@PathVariable Long id, @RequestBody TheLoai theLoaiMoi) {
        return theLoaiRepository.findById(id).map(theLoaiCu ->{
            theLoaiCu.setTenTheLoai(theLoaiMoi.getTenTheLoai());
            return theLoaiRepository.save(theLoaiCu);
        }).orElse(null);
    }
    //Xóa thể loại
    @DeleteMapping("/{id}")
    public String xoaTheLoai(@PathVariable Long id){
        theLoaiRepository.deleteById(id);
        return "Đã xóa thành công thể loại số"+id;
    }

    //Xem danh sách thể loại
    @GetMapping
    public List<TheLoai> xemDanhSachTheLoai() {
        return theLoaiRepository.findAll();
    }
    
}