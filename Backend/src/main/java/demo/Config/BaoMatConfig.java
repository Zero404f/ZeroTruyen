package demo.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// THƯ VIỆN ĐỂ LÀM TÍNH NĂNG CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class BaoMatConfig {

    @Autowired
    private JwtFilter jwtFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    
    // CẤU HÌNH TRẠM HẢI QUAN (CORS)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. Cho phép tất cả các tên miền (Frontend) được gọi vào API của bạn
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        
        // 2. Cho phép tất cả các hành động (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("*"));
        
        // 3. Cho phép gửi tất cả các loại Header (để gửi được thẻ Bearer Token)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 4. Khai báo nguồn áp dụng cấu hình
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho mọi API (/**)
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        // Bật cấu hình CORS
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
            // Cho phép thả tự do Đăng ký, Đăng nhập
            .requestMatchers("/v1/nguoi-dung/dang-ky", "/v1/nguoi-dung/dang-nhap", "/v1/nguoi-dung/google-login").permitAll()
            
            // Cho phép ai cũng được xem ảnh
            .requestMatchers("/uploads/**").permitAll() 
            
            // CHỈ CHO PHÉP XEM (GET) truyện và chương là không cần thẻ
            .requestMatchers(HttpMethod.GET, "/v1/truyen", "/v1/truyen/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/chuong/**", "/v1/truyen/*/chuong").permitAll() 
            .requestMatchers(HttpMethod.GET, "/v1/the-loai", "/v1/the-loai/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/tuong-tac/danh-gia/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/v1/tuong-tac/tang-view/**").permitAll()
            
            // Khu vực bên trong: BẮT BUỘC PHẢI XUẤT TRÌNH THẺ
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}