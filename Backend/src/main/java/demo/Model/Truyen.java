package demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.CascadeType;
import java.time.LocalDateTime;
import java.util.List;

@Entity // Đánh dấu đây là một bảng trong Database
@NoArgsConstructor  // Bắt buộc phải có khi dùng Database
@AllArgsConstructor // Bắt buộc phải có khi dùng Database
@Data
@Builder
public class Truyen {

    @Id // Đánh dấu ID là khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Cho phép ID tự động tăng (1, 2, 3...)
    private Long id;
    private String tenTruyen;
    private String tacGia;
    private String anhBia;
    private String trangThai;

    @Column(columnDefinition = "TEXT") // Cho phép lưu mô tả dài vượt quá 255 ký tự
    private String moTaTruyen;

    @Builder.Default
    private Double diemTrungBinh = 0.0; 
    @Builder.Default
    private Integer luotDanhGia = 0;
    @Builder.Default
    private Integer luotXem = 0;
    @Builder.Default
    private Integer tongSoChuong = 0;
    @Builder.Default
    private LocalDateTime thoiGianCapNhat = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "truyen_the_loai", //Tên bảng phụ
        joinColumns = @JoinColumn(name = "truyen_id"), //Cột nối của bảng Truyen
        inverseJoinColumns = @JoinColumn(name = "the_loai_id") //Cột nối với TheLoai
    )
    private List<TheLoai> danhSachTheLoai;

    // Khai báo liên kết 1 Truyện -> Nhiều Chương
    @OneToMany(mappedBy = "truyen", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore 
    private List<Chuong> danhSachChuong;

    // Tự động dọn dẹp dữ liệu liên quan khi xóa Truyện (tránh lỗi khóa ngoại)
    @OneToMany(mappedBy = "truyen", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<BinhLuan> danhSachBinhLuan;

    @OneToMany(mappedBy = "truyen", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DanhGia> danhSachDanhGia;

    @OneToMany(mappedBy = "truyen", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<LichSuDoc> danhSachLichSuDoc;

    @OneToMany(mappedBy = "truyen", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TheoDoiTruyen> danhSachTheoDoi;
}