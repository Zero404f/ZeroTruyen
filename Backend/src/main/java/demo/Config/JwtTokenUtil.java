package demo.Config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenUtil {
    //Chìa khóa an toàn để đóng dấu (Spring sẽ tự tạo 1 khóa siêu khó đoán)
    private static final String CHUOI_KHOA_BIMAT = "DayLaMotChiaKhoaBiMatSieuDaiVaAnToanChoWebsiteZeroTruyen2026!!!";
    private static final java.security.Key CHIA_KHOA_AN_TOAN = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
        io.jsonwebtoken.io.Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(CHUOI_KHOA_BIMAT.getBytes())
        )
    );
    //Tạo thời hạn cho thẻ (thời gian tính bằng mili giây) 
    private static final long THOI_GIAN_HET_HAN = 24 * 60 * 60 * 1000;

    // Hàm tạo Token
    public String taoThongHanh(String tenDangNhap, String quyen){
        return Jwts.builder()
            .setSubject(tenDangNhap)  // Ghi tên người dùng lên thẻ
            .claim("quyen", quyen)    //Đóng dấu chức vụ lên thẻ
            .setIssuedAt(new Date())  // Ngày giờ cấp thẻ
            .setExpiration(new Date(System.currentTimeMillis()+ THOI_GIAN_HET_HAN)) // Ngày giờ hết hạn
            .signWith(CHIA_KHOA_AN_TOAN)  // Đóng dấu đỏ bảo mật
            .compact();  // Ép lại thành 1 chuỗi ký tự
    }
    public String docQuyenTuThe(String token){
        return Jwts.parserBuilder()
                .setSigningKey(CHIA_KHOA_AN_TOAN)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("quyen", String.class);
    }

    public boolean kiemTraTheHopLe(String token){
        try {
            Jwts.parserBuilder().setSigningKey(CHIA_KHOA_AN_TOAN).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String docTenDangNhapTuThe(String token){
        return Jwts.parserBuilder()
            .setSigningKey(CHIA_KHOA_AN_TOAN)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
