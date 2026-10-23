package demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;



@Entity // Đánh dấu đây là một bảng trong Database
@NoArgsConstructor  // Bắt buộc phải có khi dùng Database
@AllArgsConstructor // Bắt buộc phải có khi dùng Database
@Data
@Builder
public class Chuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tenChuong;
    @OneToMany(mappedBy = "chuong", cascade = CascadeType.ALL)
    private List<AnhChuong> danhSachAnh;

    @Builder.Default
    private Integer luotXem = 0;

    @Builder.Default 
    private LocalDate ngayDang = LocalDate.now();
    // Tạo mối quan hệ: Nhiều Chương sẽ nối với 1 Truyện
    @ManyToOne
    @JoinColumn(name = "truyen_id") //Tạo cột lưu id của bảng Truyen
    @JsonIgnore 
    private Truyen truyen;
}