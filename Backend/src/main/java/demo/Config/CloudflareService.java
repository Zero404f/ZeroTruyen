package demo.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@Service
public class CloudflareService {

    // Lấy Secret Key từ file application.properties
    @Value("${cloudflare.turnstile.secret}")
    private String secretKey;

    public boolean xacThucToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        String url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        RestTemplate restTemplate = new RestTemplate();

        // Đóng gói dữ liệu để gửi lên Cloudflare
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", secretKey);
        map.add("response", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            // Gửi request và nhận kết quả
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> body = response.getBody();
            
            // Nếu Cloudflare trả về success = true -> Là người thật
            return body != null && (Boolean) body.get("success");
        } catch (Exception e) {
            return false;
        }
    }
}