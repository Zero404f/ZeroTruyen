package demo.Controller;

import demo.Model.Truyen;
import demo.Repository.TruyenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/v1/truyen")

public class TruyenController {
    @Autowired
    private TruyenRepository truyenRepository;

    //Lấy danh sách các bộ truyện đang có trong Database
    @GetMapping
    public Page<Truyen> layDanhSachTruyen(
            @RequestParam(defaultValue = "0") int page,  // Chỉ số trang
            @RequestParam(defaultValue = "10") int size  // Số lượng lấy
    ){
        // Tạo một cái khuôn phân trang
        Pageable phanTrang = PageRequest.of(page, size);
        
        // Trả về dữ liệu đã được cắt gọn theo khuôn
        return truyenRepository.findAll(phanTrang);
    }

    //Chỉ ai có thẻ bài ROLE_ADMIN mới được gọi hàm này
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    //Thêm một bộ truyện mới vào Database
    @PostMapping
    public Truyen themTruyen(@RequestBody Truyen truyen){
        // Tự động lưu dữ liệu nhận được xuống MySQL
        return truyenRepository.save(truyen);
    }

    // Xem chi tiết 1 bộ truyện
    @GetMapping("/{id}")
    public Truyen xemChiTietTruyen(@PathVariable Long id) {
        return truyenRepository.findById(id).orElse(null);
    }

    //Sửa truyện
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Truyen suaTruyen(@PathVariable Long id, @RequestBody Truyen truyenMoi) {
        return truyenRepository.findById(id).map(truyenCu ->{
            truyenCu.setTenTruyen(truyenMoi.getTenTruyen());
            truyenCu.setTacGia(truyenMoi.getTacGia());
            truyenCu.setAnhBia(truyenMoi.getAnhBia());
            truyenCu.setTrangThai(truyenMoi.getTrangThai());
            truyenCu.setMoTaTruyen(truyenMoi.getMoTaTruyen());
            return truyenRepository.save(truyenCu);
        }).orElse(null);
    }
    //Xóa truyện
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public String xoaTruyen(@PathVariable Long id){
        truyenRepository.deleteById(id);
        return "Đã xóa thành công truyện id số: "+id;
    }

    //Tìm truyện
    @GetMapping("/tim-kiem")
    public List<Truyen> timKiemTruyen(@RequestParam String tuKhoa) {
        return truyenRepository.findByTenTruyenContainingIgnoreCase(tuKhoa);
    }
    
    // Lấy danh sách truyện theo Thể loại
    @GetMapping("/the-loai/{id}")
    public List<Truyen> layTruyenTheoTheLoai(@PathVariable Long id) {
        return truyenRepository.findByDanhSachTheLoai_Id(id);
    }

    // Tìm kiếm nâng cao (Từ khóa, Thể loại, Trạng thái, Sắp xếp, Số chương)
    @Transactional // THÊM DÒNG NÀY ĐỂ GIỮ KẾT NỐI DB KHI ĐẾM SỐ CHƯƠNG
    @GetMapping("/tim-kiem-nang-cao")
    public List<Truyen> timKiemNangCao(
            @RequestParam(required = false) String tuKhoa,
            @RequestParam(required = false) Long theLoaiId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String sapXep,
            @RequestParam(required = false) String soChuong) {

        // 1. Tạo danh sách CÓ THỂ CHỈNH SỬA (ArrayList) để tránh lỗi khi sort
        List<Truyen> danhSach = new ArrayList<>(truyenRepository.timKiemNangCao(tuKhoa, theLoaiId, trangThai));

        // 2. Lọc theo Số chương bằng Java
        if (soChuong != null && !soChuong.isEmpty()) {
            danhSach = danhSach.stream().filter(truyen -> {
                int tongSoChuong = (truyen.getDanhSachChuong() != null) ? truyen.getDanhSachChuong().size() : 0;
                
                if (soChuong.equals("duoi-100")) return tongSoChuong < 100;
                if (soChuong.equals("100-500")) return tongSoChuong >= 100 && tongSoChuong <= 500;
                if (soChuong.equals("tren-500")) return tongSoChuong > 500;
                return true;
            }).collect(Collectors.toList()); // Dùng collect thay cho toList() để an toàn
        }

        // 3. Xử lý Sắp xếp bằng Java
        if (sapXep != null) {
            if (sapXep.equals("cu-nhat")) {
                // SẮP XẾP THEO THỜI GIAN CŨ NHẤT (So sánh theo ThoiGianCapNhat)
                danhSach.sort((t1, t2) -> {
                    if (t1.getThoiGianCapNhat() == null) return 1;
                    if (t2.getThoiGianCapNhat() == null) return -1;
                    return t1.getThoiGianCapNhat().compareTo(t2.getThoiGianCapNhat());
                });
            } else {
                // SẮP XẾP THEO THỜI GIAN MỚI CẬP NHẤT (Mặc định)
                danhSach.sort((t1, t2) -> {
                    if (t1.getThoiGianCapNhat() == null) return 1;
                    if (t2.getThoiGianCapNhat() == null) return -1;
                    return t2.getThoiGianCapNhat().compareTo(t1.getThoiGianCapNhat());
                });
            }
        }

        return danhSach;
    }
}