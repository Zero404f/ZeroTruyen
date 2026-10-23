package demo.Controller;

import demo.Model.NguoiDung;
import demo.Model.TaiKhoan;
import demo.Model.Truyen;
import demo.Model.TheoDoiTruyen;
import demo.Repository.TaiKhoanRepository;
import demo.Repository.TruyenRepository;
import demo.Repository.TheoDoiTruyenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/v1/theo-doi")
public class TheoDoiTruyenController {
    @Autowired
    private TheoDoiTruyenRepository theoDoiTruyenRepository;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;
    @Autowired
    private TruyenRepository truyenRepository;

    // ==========================================
    // 1. API: THÊM VÀO HOẶC XÓA KHỎI DANH SÁCH
    // ==========================================
    @PostMapping("/{truyenId}")
    public String thaoTacTheoDoi(@PathVariable Long truyenId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return "Lỗi: Bạn cần đăng nhập để theo dõi truyện!";
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoan == null) return "Lỗi: Tài khoản không hợp lệ!";
        
        NguoiDung nguoiDung = taiKhoan.getNguoiDung();
        Truyen truyen = truyenRepository.findById(truyenId).orElse(null);
        if (truyen == null) return "Lỗi: Không tìm thấy truyện!";

        // Tìm xem người này đã theo dõi truyện này chưa
        TheoDoiTruyen daTheoDoi = theoDoiTruyenRepository.findByNguoiDungIdAndTruyenId(nguoiDung.getId(), truyen.getId());

        if (daTheoDoi != null) {
            // Nếu đã theo dõi rồi thì xóa đi (Hủy theo dõi)
            theoDoiTruyenRepository.delete(daTheoDoi);
            return "Đã hủy theo dõi truyện!";
        } else {
            // Nếu chưa theo dõi thì tạo mới
            TheoDoiTruyen theoDoiMoi = new TheoDoiTruyen();
            theoDoiMoi.setNguoiDung(nguoiDung);
            theoDoiMoi.setTruyen(truyen);
            theoDoiMoi.setThoiGianTheoDoi(LocalDateTime.now());
            theoDoiTruyenRepository.save(theoDoiMoi);
            return "Đã thêm truyện vào danh sách theo dõi!";
        }
    }

    // ==========================================
    // 2. API: KIỂM TRA ĐỂ TÔ MÀU NÚT THEO DÕI
    // ==========================================
    @GetMapping("/kiem-tra/{truyenId}")
    public boolean kiemTraTrangThai(@PathVariable Long truyenId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return false;
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoan == null) return false;

        TheoDoiTruyen daTheoDoi = theoDoiTruyenRepository.findByNguoiDungIdAndTruyenId(taiKhoan.getNguoiDung().getId(), truyenId);
        return daTheoDoi != null; // Trả về true nếu đã theo dõi, false nếu chưa
    }

    // ==========================================
    // 3. API: LẤY TOÀN BỘ DANH SÁCH CHO TAB THEO DÕI
    // ==========================================
    @GetMapping("/danh-sach")
    public List<TheoDoiTruyen> layDanhSachTheoDoi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return null;
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoan == null) return null;
        
        return theoDoiTruyenRepository.findByNguoiDungIdOrderByThoiGianTheoDoiDesc(taiKhoan.getNguoiDung().getId());
    }
}
