package demo.Controller;

import demo.Model.LichSuDoc;
import demo.Model.NguoiDung;
import demo.Model.TaiKhoan;
import demo.Model.Truyen;
import demo.Model.Chuong;

import demo.Repository.LichSuDocRepository;
import demo.Repository.NguoiDungRepository;
import demo.Repository.TaiKhoanRepository;
import demo.Repository.TruyenRepository;
import demo.Repository.ChuongRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/v1/nguoi-dung")
public class NguoiDungController {
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    //Gọi công cụ tạo thẻ
    @Autowired
    private demo.Config.JwtTokenUtil jwtTokenUtil;

    @Autowired
    private demo.Config.CloudflareService cloudflareService;

    @Autowired
    private LichSuDocRepository lichSuDocRepository;
    @Autowired
    private TruyenRepository truyenRepository;
    @Autowired
    private ChuongRepository chuongRepository;

    //Đăng kí tài khoản -------------------------
    @PostMapping("/dang-ky")
    public Object dangKiTaiKhoan(@Valid @RequestBody TaiKhoan taiKhoanMoi, BindingResult kiemDuyet) {
        
        // Kiểm tra Cloudflare Turnstile trước tiên
        boolean isCaptchaValid = cloudflareService.xacThucToken(taiKhoanMoi.getTokenCloudflare());
        if (!isCaptchaValid) {
            return "Lỗi: Xác thực an ninh thất bại. Vui lòng tải lại trang và thử lại!";
        }

        // Nếu phát hiện vi phạm luật
        if (kiemDuyet.hasErrors()) {
            // Lấy ngay cái thông báo lỗi đã cài đặt bên file TaiKhoan.java và thông báo cho người dùng
            return kiemDuyet.getAllErrors().get(0).getDefaultMessage();
        }

        // Nếu dữ liệu sạch, cho phép chạy tiếp đoạn code lưu vào Database cũ
        NguoiDung hoSoMoi = new NguoiDung();
        hoSoMoi.setTenTaiKhoan(taiKhoanMoi.getTenDangNhap());
        NguoiDung hoSoDaLuu = nguoiDungRepository.save(hoSoMoi);
        taiKhoanMoi.setNguoiDung(hoSoDaLuu);
        taiKhoanMoi.setQuyen("ROLE_USER");
        
        String matKhauMaHoa = passwordEncoder.encode(taiKhoanMoi.getMatKhau());
        taiKhoanMoi.setMatKhau(matKhauMaHoa);

        return taiKhoanRepository.save(taiKhoanMoi);
    }

    //Đăng nhập tài khoản ----------------------------
    @PostMapping("/dang-nhap")
    public Object dangNhap(@RequestBody TaiKhoan thongTinDangNhap) {
        
        // Kiểm tra Cloudflare Turnstile trước tiên
        boolean isCaptchaValid = cloudflareService.xacThucToken(thongTinDangNhap.getTokenCloudflare());
        if (!isCaptchaValid) {
            return "Lỗi: Xác thực an ninh thất bại. Vui lòng tải lại trang và thử lại!";
        }

        //Tìm tên đăng nhập trong Database
        TaiKhoan taiKhoanTrongDB = taiKhoanRepository.
        findByTenDangNhap(thongTinDangNhap.getTenDangNhap());
        //Kiểm tra xem tài khoản có tồn tại không
        if(taiKhoanTrongDB==null){
            return "Lỗi: Tài khoản không tồn tại!";
        }
        
        // Kiểm tra đối chiếu mật khẩu mã hóa
        boolean matKhauDung = passwordEncoder
        .matches(thongTinDangNhap.getMatKhau(), taiKhoanTrongDB.getMatKhau());

        //Kiểm tra mật khẩu
        if(matKhauDung){
            String theTu = jwtTokenUtil
            .taoThongHanh(taiKhoanTrongDB.getTenDangNhap(), taiKhoanTrongDB.getQuyen());
            // Đăng nhập thành công, trả về thông tin để giao diện web sử dụng
            return "Đăng nhập thành công! \n" + theTu;
        }else{
            return "Lỗi: Sai mật khẩu!";
        }
    }
    //Đăng nhập bằng Google ----------------------------
    @PostMapping("/google-login")
    public Object googleLogin(@RequestBody TaiKhoan request) {
        String tokenGoogle = request.getTokenGoogle();
        if (tokenGoogle == null || tokenGoogle.isEmpty()) {
            return "Lỗi: Không nhận được dữ liệu từ Google!";
        }

        try {
            // Mang Token lên máy chủ Google để xác minh
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + tokenGoogle;
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, Object> googleInfo = restTemplate.getForObject(url, java.util.Map.class);

            if (googleInfo == null || googleInfo.get("email") == null) {
                return "Lỗi: Thông tin tài khoản Google không hợp lệ!";
            }

            // Bóc tách dữ liệu Google trả về
            String emailGoogle = (String) googleInfo.get("email");
            String tenGoogle = (String) googleInfo.get("name");
            String anhDaiDienGoogle = (String) googleInfo.get("picture");

            TaiKhoan taiKhoanTrongDB = taiKhoanRepository.findByTenDangNhap(emailGoogle);

            if (taiKhoanTrongDB == null) {
                NguoiDung hoSoMoi = new NguoiDung();
                hoSoMoi.setTenTaiKhoan(tenGoogle);
                hoSoMoi.setEmail(emailGoogle);
                hoSoMoi.setAnhDaiDien(anhDaiDienGoogle);
                NguoiDung hoSoDaLuu = nguoiDungRepository.save(hoSoMoi);

                taiKhoanTrongDB = new TaiKhoan();
                taiKhoanTrongDB.setTenDangNhap(emailGoogle); 
                taiKhoanTrongDB.setMatKhau(passwordEncoder.encode("GOOGLE_PASS_" + Math.random())); 
                taiKhoanTrongDB.setQuyen("ROLE_USER");
                taiKhoanTrongDB.setNguoiDung(hoSoDaLuu);

                taiKhoanTrongDB = taiKhoanRepository.save(taiKhoanTrongDB);
            }

            // Cấp JWT Token
            String theTu = jwtTokenUtil.taoThongHanh(taiKhoanTrongDB.getTenDangNhap(), taiKhoanTrongDB.getQuyen());
            
            //Trả về một đối tượng JSON
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("thongBao", "Đăng nhập thành công!");
            response.put("token", theTu);
            response.put("tenUser", taiKhoanTrongDB.getNguoiDung().getTenTaiKhoan());
            response.put("avatar", taiKhoanTrongDB.getNguoiDung().getAnhDaiDien());
            
            return response;

        } catch (Exception e) {
            return "Lỗi: Mạng lỗi hoặc không thể kết nối tới Google!";
        }
    }

    // ==========================================
    // API: LƯU TIẾN ĐỘ ĐỌC VÀO DATABASE
    // ==========================================
    @PostMapping("/luu-lich-su")
    public String luuLichSu(@RequestParam Long truyenId, @RequestParam Long chuongId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return "Khách vãng lai, không cần lưu DB";
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        if (taiKhoan == null) return "Lỗi: Không tìm thấy tài khoản!";
        
        NguoiDung nguoiDung = taiKhoan.getNguoiDung();
        Truyen truyen = truyenRepository.getReferenceById(truyenId);
        Chuong chuong = chuongRepository.getReferenceById(chuongId);

        if (truyen != null && chuong != null) {
            LichSuDoc lichSuCu = lichSuDocRepository.findByNguoiDungIdAndTruyenId(nguoiDung.getId(), truyenId);
            
            if (lichSuCu != null) {
                lichSuCu.setChuong(chuong);
                lichSuCu.setThoiGianDoc(LocalDateTime.now());
                lichSuDocRepository.save(lichSuCu);
            } else {
                LichSuDoc lichSuMoi = new LichSuDoc();
                lichSuMoi.setNguoiDung(nguoiDung);
                lichSuMoi.setTruyen(truyen);
                lichSuMoi.setChuong(chuong);
                lichSuMoi.setThoiGianDoc(LocalDateTime.now());
                lichSuDocRepository.save(lichSuMoi);
            }
        }
        return "Lưu lịch sử thành công!";
    }

    // ==========================================
    // API: LẤY LỊCH SỬ CHO TAB "TÀI KHOẢN"
    // ==========================================
    @GetMapping("/lich-su")
    public List<LichSuDoc> layLichSu() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return null;
        }
        
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        return lichSuDocRepository.findByNguoiDungIdOrderByThoiGianDocDesc(taiKhoan.getNguoiDung().getId());
    }

    // ==========================================
    // API: LẤY THÔNG TIN CÁ NHÂN
    // ==========================================
    @GetMapping("/thong-tin")
    public java.util.Map<String, Object> layThongTinCaNhan() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        NguoiDung nd = taiKhoan.getNguoiDung();
        
        java.util.Map<String, Object> thongTin = new java.util.HashMap<>();
        thongTin.put("tenTaiKhoan", nd.getTenTaiKhoan());
        thongTin.put("email", nd.getEmail());
        thongTin.put("anhDaiDien", nd.getAnhDaiDien());
        
        // Nhận diện tài khoản Google: Tên đăng nhập chính là Email (chứa còng @)
        boolean isGoogle = taiKhoan.getTenDangNhap().contains("@");
        thongTin.put("laGoogle", isGoogle);
        
        return thongTin;
    }

    // ==========================================
    // API: CẬP NHẬT HỒ SƠ
    // ==========================================
    @PutMapping("/cap-nhat")
    public String capNhatHoSo(@RequestBody NguoiDung formCaiDat) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        NguoiDung nd = taiKhoan.getNguoiDung();
        
        nd.setTenTaiKhoan(formCaiDat.getTenTaiKhoan());
        nd.setAnhDaiDien(formCaiDat.getAnhDaiDien());
        
        // Chỉ cho phép đổi Email nếu không phải tài khoản Google
        if (!taiKhoan.getTenDangNhap().contains("@")) {
            nd.setEmail(formCaiDat.getEmail());
        }
        
        nguoiDungRepository.save(nd);
        return "Cập nhật hồ sơ thành công!";
    }

    // ==========================================
    // API: ĐỔI MẬT KHẨU
    // ==========================================
    @PutMapping("/doi-mat-khau")
    public String doiMatKhau(@RequestBody java.util.Map<String, String> formMatKhau) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(auth.getName());
        
        // Chặn tài khoản Google đổi mật khẩu
        if (taiKhoan.getTenDangNhap().contains("@")) {
            return "Lỗi: Tài khoản Google không sử dụng mật khẩu!";
        }

        String mkCu = formMatKhau.get("matKhauCu");
        String mkMoi = formMatKhau.get("matKhauMoi");

        if (!passwordEncoder.matches(mkCu, taiKhoan.getMatKhau())) {
            return "Lỗi: Mật khẩu cũ không chính xác!";
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(mkMoi));
        taiKhoanRepository.save(taiKhoan);
        return "Đổi mật khẩu thành công!";
    }
}