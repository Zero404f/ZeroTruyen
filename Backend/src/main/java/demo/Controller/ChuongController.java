package demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import demo.Model.AnhChuong;
import demo.Model.Chuong;
import demo.Model.ChuongTomTat;
import demo.Model.Truyen;
import demo.Repository.ChuongRepository;
import demo.Repository.TruyenRepository;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/v1") 
public class ChuongController {

    @Autowired
    private ChuongRepository chuongRepository;

    @Autowired
    private TruyenRepository truyenRepository;

    // Lấy danh sách chương của 1 truyện
    @GetMapping("/truyen/{truyenId}/chuong")
    public List<ChuongTomTat> layDanhSachChuong(@PathVariable Long truyenId) {
        return chuongRepository.findByTruyenId(truyenId);
    }

    // Xem chi tiết 1 chương (bao gồm danh sách ảnh)
    @GetMapping("/chuong/{chuongId}")
    public Chuong xemChiTietChuong(@PathVariable Long chuongId) {
        return chuongRepository.findById(chuongId).orElse(null);
    }

    //Thêm chương
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/truyen/{truyenId}/chuong")
    public Chuong themChuong(@PathVariable Long truyenId, @RequestBody Chuong chuongMoi) {
        return truyenRepository.findById(truyenId).map(truyen -> {
            chuongMoi.setTruyen(truyen);

            // Gắn liên kết khóa ngoại chuong_id cho từng ảnh trước khi lưu
            if (chuongMoi.getDanhSachAnh() != null) {
                for (AnhChuong anh : chuongMoi.getDanhSachAnh()) {
                    anh.setChuong(chuongMoi);
                }
            }

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
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/chuong/{chuongId}")
    public Chuong suaChuong(@PathVariable Long chuongId, @RequestBody Chuong chuongMoi) {
        return chuongRepository.findById(chuongId).map(chuongCu -> {
            chuongCu.setTenChuong(chuongMoi.getTenChuong());

            // Cập nhật lại danh sách ảnh của chương
            if (chuongCu.getDanhSachAnh() == null) {
                chuongCu.setDanhSachAnh(new ArrayList<>());
            }
            chuongCu.getDanhSachAnh().clear();
            if (chuongMoi.getDanhSachAnh() != null) {
                for (AnhChuong anh : chuongMoi.getDanhSachAnh()) {
                    anh.setIdAnh(null); // Tạo bản ghi mới theo đúng thứ tự đã sắp xếp
                    anh.setChuong(chuongCu);
                    chuongCu.getDanhSachAnh().add(anh);
                }
            }

            // Cập nhật lại thời gian của truyện lúc sửa chương
            Truyen truyen = chuongCu.getTruyen();
            if (truyen != null) {
                truyen.setThoiGianCapNhat(LocalDateTime.now());
                truyenRepository.save(truyen);
            }

            return chuongRepository.save(chuongCu);
        }).orElse(null);
    }

    //Xóa chương
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/chuong/{chuongId}")
    public String xoaChuong(@PathVariable Long chuongId){
        // TÌM TRUYỆN ĐỂ TRỪ ĐI 1 CHƯƠNG TRƯỚC KHI XÓA
        Chuong chuongCanXoa = chuongRepository.findById(chuongId).orElse(null);
        if (chuongCanXoa == null) {
            return "Không tìm thấy chương số: " + chuongId;
        }

        if (chuongCanXoa.getTruyen() != null) {
            demo.Model.Truyen truyen = chuongCanXoa.getTruyen(); // Phải ghi rõ demo.Model.Truyen để tránh trùng tên
            int soChuongCu = truyen.getTongSoChuong() != null ? truyen.getTongSoChuong() : 0;
            
            // Trừ 1 (đảm bảo không bị âm)
            if (soChuongCu > 0) {
                truyen.setTongSoChuong(soChuongCu - 1);
                truyenRepository.save(truyen);
            }
        }
        
        // Tiến hành xóa chương
        chuongRepository.delete(chuongCanXoa);
        return "Đã xóa chương số: " + chuongId;
    }
}