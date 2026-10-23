package demo.Controller;

import demo.Model.*;
import demo.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/v1/tuong-tac")
public class DanhGiaController {

    @Autowired private DanhGiaRepository danhGiaRepository;
    @Autowired private TaiKhoanRepository taiKhoanRepository;
    @Autowired private TruyenRepository truyenRepository;
    @Autowired private ChuongRepository chuongRepository;

    // 1. GỬI HOẶC CẬP NHẬT ĐÁNH GIÁ
    @PostMapping("/danh-gia/{truyenId}")
    public ResponseEntity<?> guiDanhGia(@PathVariable Long truyenId, @RequestBody Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.badRequest().body("Lỗi: Bạn cần đăng nhập để đánh giá!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        NguoiDung nd = taiKhoan.getNguoiDung();
        Truyen truyen = truyenRepository.findById(truyenId).orElse(null);

        if (truyen == null) return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy truyện!");
        
        int diem;
        try { diem = Integer.parseInt(payload.get("diem").toString()); } 
        catch (Exception e) { return ResponseEntity.badRequest().body("Lỗi: Điểm không hợp lệ!"); }
        
        String noiDung = payload.get("noiDung") != null ? payload.get("noiDung").toString() : "";
        if (diem < 1 || diem > 5) return ResponseEntity.badRequest().body("Lỗi: Điểm phải từ 1 đến 5 sao!");

        DanhGia danhGiaCu = danhGiaRepository.findByNguoiDungIdAndTruyenId(nd.getId(), truyen.getId());
        if (danhGiaCu != null) {
            danhGiaCu.setDiem(diem);
            danhGiaCu.setNoiDung(noiDung);
            danhGiaCu.setThoiGian(LocalDateTime.now());
            danhGiaRepository.save(danhGiaCu);
        } else {
            DanhGia danhGiaMoi = new DanhGia();
            danhGiaMoi.setNguoiDung(nd);
            danhGiaMoi.setTruyen(truyen);
            danhGiaMoi.setDiem(diem);
            danhGiaMoi.setNoiDung(noiDung);
            danhGiaMoi.setThoiGian(LocalDateTime.now());
            danhGiaRepository.save(danhGiaMoi);
        }

        List<DanhGia> dsDanhGia = danhGiaRepository.findByTruyenId(truyen.getId());
        double tongDiem = 0;
        for (DanhGia dg : dsDanhGia) { tongDiem += dg.getDiem(); }
        truyen.setDiemTrungBinh(tongDiem / dsDanhGia.size());
        truyen.setLuotDanhGia(dsDanhGia.size());
        truyenRepository.save(truyen);

        return ResponseEntity.ok("Đánh giá thành công!");
    }

    // 2. LẤY BÀI ĐÁNH GIÁ CỦA RIÊNG TÔI
    @GetMapping("/danh-gia/{truyenId}/cua-toi")
    public ResponseEntity<?> layDanhGiaCuaToi(@PathVariable Long truyenId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.ok().build(); 
        }
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        DanhGia dg = danhGiaRepository.findByNguoiDungIdAndTruyenId(taiKhoan.getNguoiDung().getId(), truyenId);
        
        if (dg == null) return ResponseEntity.ok().build(); 

        Map<String, Object> response = new HashMap<>();
        response.put("id", dg.getId());
        response.put("diem", dg.getDiem());
        response.put("noiDung", dg.getNoiDung());
        
        return ResponseEntity.ok(response); 
    }

    // 3. XÓA BÀI ĐÁNH GIÁ CỦA TÔI
    @DeleteMapping("/danh-gia/{id}")
    public ResponseEntity<?> xoaDanhGia(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.status(403).body("Lỗi: Bạn cần đăng nhập!");
        }

        DanhGia dg = danhGiaRepository.findById(id).orElse(null);
        if (dg == null) return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy đánh giá!");

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (!dg.getNguoiDung().getId().equals(taiKhoan.getNguoiDung().getId())) {
            return ResponseEntity.status(403).body("Lỗi: Bạn không có quyền xóa!");
        }

        Long truyenIdLuu = dg.getTruyen().getId();
        danhGiaRepository.delete(dg);

        Truyen truyen = truyenRepository.findById(truyenIdLuu).orElse(null);
        if (truyen != null) {
            List<DanhGia> dsDanhGia = danhGiaRepository.findByTruyenId(truyenIdLuu);
            if (dsDanhGia.isEmpty()) {
                truyen.setDiemTrungBinh(0.0); // Đã sửa ép kiểu Double
                truyen.setLuotDanhGia(0);
            } else {
                double tongDiem = 0;
                for (DanhGia d : dsDanhGia) { tongDiem += d.getDiem(); }
                truyen.setDiemTrungBinh(tongDiem / dsDanhGia.size());
                truyen.setLuotDanhGia(dsDanhGia.size());
            }
            truyenRepository.save(truyen);
        }
        return ResponseEntity.ok("Đã xóa đánh giá của bạn!");
    }

    // 4. LẤY TẤT CẢ ĐÁNH GIÁ
    @GetMapping("/danh-gia/{truyenId}")
    public ResponseEntity<?> layDanhGia(@PathVariable Long truyenId) {
        List<DanhGia> dsDanhGia = danhGiaRepository.findByTruyenId(truyenId);
        List<Map<String, Object>> ketQua = new ArrayList<>();
        
        for (DanhGia dg : dsDanhGia) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", dg.getId());
            map.put("diem", dg.getDiem());
            map.put("noiDung", dg.getNoiDung());
            map.put("thoiGian", dg.getThoiGian());
            
            Map<String, Object> userMap = new HashMap<>();
            if (dg.getNguoiDung() != null) {
                userMap.put("tenTaiKhoan", dg.getNguoiDung().getTenTaiKhoan());
                userMap.put("anhDaiDien", dg.getNguoiDung().getAnhDaiDien());
            }
            map.put("nguoiDung", userMap);
            
            ketQua.add(map);
        }
        return ResponseEntity.ok(ketQua);
    }

    // 5. TĂNG LƯỢT XEM CHO CẢ CHƯƠNG VÀ TRUYỆN
    @PostMapping("/tang-view/{chuongId}")
    public ResponseEntity<?> tangLuotXem(@PathVariable Long chuongId) {
        Chuong chuong = chuongRepository.findById(chuongId).orElse(null);
        if (chuong != null) {
            // 1. Tăng view cho Chương (Kèm check null an toàn)
            int viewChuongHienTai = chuong.getLuotXem() == null ? 0 : chuong.getLuotXem();
            chuong.setLuotXem(viewChuongHienTai + 1);
            chuongRepository.save(chuong);

            // 2. Tăng view tổng cho Truyện
            Truyen truyen = chuong.getTruyen();
            if (truyen != null) {
                int viewTruyenHienTai = truyen.getLuotXem() == null ? 0 : truyen.getLuotXem();
                truyen.setLuotXem(viewTruyenHienTai + 1);
                truyenRepository.save(truyen);
            }
            
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}