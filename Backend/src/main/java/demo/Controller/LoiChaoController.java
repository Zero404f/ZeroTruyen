package demo.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import demo.Model.LoiChao;

import org.springframework.web.bind.annotation.RequestParam;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/v1")


public class LoiChaoController {
    //Tự động tăng ID 
    private final AtomicLong counterID = new AtomicLong();
    //Tự động tạo lời chào mẫu
    private static final String LoiChaoTemplate = "Xin chào,%s đến với web truyện ";

    @GetMapping("LoiChao")
    public LoiChao LoiChao(
        @RequestParam(value = "tenNguoiDung", defaultValue = "Bạn")String tenNguoiDung){
        //Ghép tên người dùng vào đúng vị trí chữ %s ở câu mẫu
        String content = String.format(LoiChaoTemplate,tenNguoiDung);
        
        return LoiChao.builder()
        .id(counterID.incrementAndGet())
        .content(content)
        .build();
    }


}