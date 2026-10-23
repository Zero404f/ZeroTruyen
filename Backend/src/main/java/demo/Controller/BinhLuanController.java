package demo.Controller;

import demo.Model.BinhLuan;
import demo.Model.Chuong;
import demo.Model.TaiKhoan;
import demo.Model.Truyen;
import demo.Repository.BinhLuanRepository;
import demo.Repository.ChuongRepository;
import demo.Repository.TaiKhoanRepository;
import demo.Repository.TruyenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/v1")
public class BinhLuanController {

    @Autowired
    private BinhLuanRepository binhLuanRepository;
    @Autowired
    private TruyenRepository truyenRepository;
    @Autowired
    private ChuongRepository chuongRepository;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    // Dành cho trang Chi tiết: Lấy tất cả bình luận của 1 truyện
    @GetMapping("/truyen/{truyenId}/binh-luan")
    public List<BinhLuan> layBinhLuanTruyen(@PathVariable Long truyenId) {
        return binhLuanRepository.findByTruyenIdOrderByThoiGianDesc(truyenId);
    }

    // Dành cho trang Đọc truyện: Lấy bình luận của riêng 1 chương
    @GetMapping("/chuong/{chuongId}/binh-luan")
    public List<BinhLuan> layBinhLuanChuong(@PathVariable Long chuongId) {
        return binhLuanRepository.findByChuongIdOrderByThoiGianDesc(chuongId);
    }

    // Đăng bình luận mới (Dùng chung cho cả Truyện và Chương)
    @PostMapping("/binh-luan")
    public Object dangBinhLuan(@RequestParam(required = false) Long truyenId,
                               @RequestParam(required = false) Long chuongId,
                               @RequestBody BinhLuan binhLuan) {
                                
        // Lấy thẻ thông hành JWT để biết ai đang bình luận
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return "Lỗi: Bạn cần đăng nhập để bình luận!";
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoan == null) return "Lỗi: Tài khoản không hợp lệ!";

        if (binhLuan.getNoiDung() == null || binhLuan.getNoiDung().trim().isEmpty()) {
            return "Lỗi: Nội dung bình luận không được để trống!";
        }

        // Đóng dấu thời gian và người viết
        binhLuan.setThoiGian(LocalDateTime.now());
        binhLuan.setNguoiDung(taiKhoan.getNguoiDung());

        // Nếu bình luận ngoài trang chi tiết truyện
        if (truyenId != null) {
            Truyen truyen = truyenRepository.findById(truyenId).orElse(null);
            if (truyen != null) binhLuan.setTruyen(truyen);
        }

        // Nếu bình luận bên trong lúc đang đọc 1 chương
        if (chuongId != null) {
            Chuong chuong = chuongRepository.findById(chuongId).orElse(null);
            if (chuong != null) {
                binhLuan.setChuong(chuong);
                binhLuan.setTruyen(chuong.getTruyen()); // Gắn luôn id Truyện để trang chi tiết cũng có thể kéo ra hiển thị
            }
        }

        return binhLuanRepository.save(binhLuan);
    }

    // Xóa bình luận
    @DeleteMapping("/binh-luan/{id}")
    public String xoaBinhLuan(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return "Lỗi: Bạn chưa đăng nhập!";
        }

        BinhLuan binhLuan = binhLuanRepository.findById(id).orElse(null);
        if (binhLuan == null) {
            return "Lỗi: Không tìm thấy bình luận!";
        }

        // Lấy thông tin tài khoản đang gọi API
        TaiKhoan taiKhoanGoiApi = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoanGoiApi == null) return "Lỗi: Tài khoản không hợp lệ!";

        // KIỂM TRA BẢO MẬT MỚI: So sánh bằng ID người dùng
        boolean laChuToa = taiKhoanGoiApi.getNguoiDung().getId().equals(binhLuan.getNguoiDung().getId());
        boolean laAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (laChuToa || laAdmin) {
            binhLuanRepository.delete(binhLuan);
            return "Xóa bình luận thành công!";
        } else {
            return "Lỗi: Bạn không có quyền xóa bình luận của người khác!";
        }
    }

    // Sửa bình luận
    @PutMapping("/binh-luan/{id}")
    public String suaBinhLuan(@PathVariable Long id, @RequestBody BinhLuan binhLuanMoi) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return "Lỗi: Bạn chưa đăng nhập!";
        }

        BinhLuan binhLuanCu = binhLuanRepository.findById(id).orElse(null);
        if (binhLuanCu == null) return "Lỗi: Không tìm thấy bình luận!";

        // Lấy thông tin tài khoản đang gọi API
        TaiKhoan taiKhoanGoiApi = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoanGoiApi == null) return "Lỗi: Tài khoản không hợp lệ!";

        // KIỂM TRA BẢO MẬT MỚI: So sánh bằng ID người dùng
        if (!taiKhoanGoiApi.getNguoiDung().getId().equals(binhLuanCu.getNguoiDung().getId())) {
            return "Lỗi: Bạn chỉ được sửa bình luận của chính mình!";
        }

        binhLuanCu.setNoiDung(binhLuanMoi.getNoiDung());
        binhLuanRepository.save(binhLuanCu);
        return "Sửa bình luận thành công!";
    }
}