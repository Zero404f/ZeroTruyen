package demo.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/v1/file")
public class FileController {
    private static final String THU_MUC_LUU_TRU = "uploads/";

    @PostMapping("/tai-len")
    public String taiAnhLen(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Kiểm tra xem đã có thư mục "uploads" chưa, nếu chưa thì tự động tạo mới
            File thuMuc = new File(THU_MUC_LUU_TRU);
            if (!thuMuc.exists()) {
                thuMuc.mkdirs();
            }

            // 2. Đổi tên file để tránh việc 2 ảnh trùng tên nhau (Dùng UUID sinh ra mã ngẫu nhiên)
            String tenGoc = file.getOriginalFilename();
            // Lấy đuôi file (ví dụ: .jpg, .png)
            String duoiFile = tenGoc.substring(tenGoc.lastIndexOf(".")); 
            // Ghép mã ngẫu nhiên với đuôi file
            String tenMoi = UUID.randomUUID().toString() + duoiFile; 

            // 3. Tiến hành copy file từ máy tính vào thư mục "uploads"
            Path duongDanLuuFile = Paths.get(THU_MUC_LUU_TRU + tenMoi);
            Files.write(duongDanLuuFile, file.getBytes());

            // 4. Trả về đường link web cho frontend sử dụng
           // Dùng công cụ của Spring Boot để tự động sinh link
            String duongDanDayDu = org.springframework.web.servlet.support.ServletUriComponentsBuilder
                    .fromCurrentContextPath() // Tự động lấy tên miền hiện tại 
                    .path("/uploads/")  // Nối thêm thư mục kho
                    .path(tenMoi)  // Nối tên file ảnh
                    .toUriString(); // Xuất ra thành chuỗi văn bản

            return duongDanDayDu;

        } catch (IOException e) {
            return "Lỗi: Không thể tải ảnh lên!";
        }
    }
}
