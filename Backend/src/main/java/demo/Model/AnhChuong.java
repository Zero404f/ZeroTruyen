package demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chuong_danh_sach_anh") // Trỏ đúng tên bảng trong MySQL
@Data
@NoArgsConstructor
@AllArgsConstructor

public class AnhChuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_anh")
    private Long idAnh;

    @Column(name = "danh_sach_anh")
    private String urlAnh;

    @ManyToOne
    @JoinColumn(name = "chuong_id")
    @JsonIgnore
    private Chuong chuong;
}
