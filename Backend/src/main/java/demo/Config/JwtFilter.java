package demo.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Security;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenUtil jwtTokenUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain )
         throws ServletException, IOException{
        
        String header = request.getHeader("Authorization");
        String token = null;
        String tenDangNhap = null;
        String quyen = null;

        //Kiểm tra xem thẻ có chuẩn không (Bắt đầu bằng chữ "Bearer ")
        if(header != null && header.startsWith("Bearer ")){
            token = header.substring(7); //Cắt bỏ chữ Bearer lấy phần mã Token

            //Kiểm tra thẻ  
            if(jwtTokenUtil.kiemTraTheHopLe(token)){
                tenDangNhap = jwtTokenUtil.docTenDangNhapTuThe(token);
                quyen = jwtTokenUtil.docQuyenTuThe(token);
            }
        }
        if(tenDangNhap != null && SecurityContextHolder.getContext().getAuthentication() == null){
            List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
            if(quyen != null){
                authorities.add(new SimpleGrantedAuthority(quyen));
            }

            UsernamePasswordAuthenticationToken theHanhKhach = 
            new UsernamePasswordAuthenticationToken(tenDangNhap,null, authorities);
            SecurityContextHolder.getContext().setAuthentication(theHanhKhach);

        }
        filterChain.doFilter(request,response);
    }
}
