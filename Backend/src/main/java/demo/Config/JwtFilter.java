package demo.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenUtil jwtTokenUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = null;
        String tenDangNhap = null;
        String quyen = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            if (jwtTokenUtil.kiemTraTheHopLe(token)) {
                tenDangNhap = jwtTokenUtil.docTenDangNhapTuThe(token);
                quyen = jwtTokenUtil.docQuyenTuThe(token);
            } else {
                System.out.println(">>> [JWT] Token không hợp lệ hoặc đã hết hạn! URL: " + request.getRequestURI());
            }
        } else if (!request.getMethod().equals("GET")) {
            System.out.println(">>> [JWT] Thiếu Header Authorization ở request: " + request.getMethod() + " " + request.getRequestURI());
        }

        if (tenDangNhap != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
            if (quyen != null) {
                // In ra để kiểm tra chính xác quyền đang lưu là ADMIN hay ROLE_ADMIN
                System.out.println(">>> [JWT] User: " + tenDangNhap + " | Quyen: " + quyen);
                authorities.add(new SimpleGrantedAuthority(quyen));
                // Nếu quyền chưa có tiền tố ROLE_, thêm luôn bản có ROLE_ để dùng được cả hasRole() lẫn hasAuthority()
                if (!quyen.startsWith("ROLE_")) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + quyen));
                }
            }

            UsernamePasswordAuthenticationToken theHanhKhach =
                    new UsernamePasswordAuthenticationToken(tenDangNhap, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(theHanhKhach);
        }

        filterChain.doFilter(request, response);
    }
}
