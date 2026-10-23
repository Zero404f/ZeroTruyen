package demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import demo.Model.Chuong;
import demo.Model.ChuongTomTat;
import demo.Model.Truyen;
import demo.Repository.ChuongRepository;
import demo.Repository.TruyenRepository;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/v1") 
public class ChuongController {

    @Autowired
    private ChuongRepository chuongRepository;

    @Autowired
    private TruyenRepository truyenRepository;
    //Thêm chương
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/truyen/{truyenId}/chuong")
    public Chuong themChuong(@PathVariable Long truyenId, @RequestBody Chuong chuongMoi) {
        return truyenRepository.findById(truyenId).map(truyen -> {
            chuongMoi.setTruyen(truyen);
            Chuong chuongDaLuu = chuongRepository.save(chuongMoi); // Lưu chương trước
            
            // CỘNG 1 VÀO TỔNG SỐ CHƯƠNG CỦA TRUYỆN
            int soChuongCu = truyen.getTongSoChuong() != null ? truyen.getTongSoChuong() : 0;
            truyen.setTongSoChuong(soChuongCu + 1);
            // Reset lại đồng hồ của truyện thành lúc vừa đăng chương
            truyen.setThoiGianCapNhat(LocalDateTime.now());

            truyenRepository.save(truyen); // Lưu lại truyện
            
            return chuongDaLuu;
        }).orElse(null);
    }

    //Sửa chương
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Truyen suaTruyen(@PathVariable Long id, @RequestBody Truyen truyenMoi) {
        return truyenRepository.findById(id).map(truyenCu ->{
            truyenCu.setTenTruyen(truyenMoi.getTenTruyen());
            truyenCu.setTacGia(truyenMoi.getTacGia());
            truyenCu.setAnhBia(truyenMoi.getAnhBia());
            truyenCu.setTrangThai(truyenMoi.getTrangThai());
            truyenCu.setMoTaTruyen(truyenMoi.getMoTaTruyen());
            
            // Cập nhật lại thời gian lúc sửa
            truyenCu.setThoiGianCapNhat(LocalDateTime.now()); 
            
            return truyenRepository.save(truyenCu);
        }).orElse(null);
    }

    //Xóa chương
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/chuong/{chuongId}")
    public String xoaChuong(@PathVariable Long chuongId){
        // TÌM TRUYỆN ĐỂ TRỪ ĐI 1 CHƯƠNG TRƯỚC KHI XÓA
        Chuong chuongCanXoa = chuongRepository.findById(chuongId).orElse(null);
        if (chuongCanXoa != null && chuongCanXoa.getTruyen() != null) {
            demo.Model.Truyen truyen = chuongCanXoa.getTruyen(); // Phải ghi rõ demo.Model.Truyen để tránh trùng tên
            int soChuongCu = truyen.getTongSoChuong() != null ? truyen.getTongSoChuong() : 0;
            
            // Trừ 1 (đảm bảo không bị âm)
            if (soChuongCu > 0) {
                truyen.setTongSoChuong(soChuongCu - 1);
                truyenRepository.save(truyen);
            }
        }
        
        // Tiến hành xóa chương
        chuongRepository.deleteById(chuongId);
        return "Đã xóa chương số:"+chuongId;
    }
}