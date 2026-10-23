const BASE_API = 'http://localhost:8080';

window.loginAdmin = function() {
    const ten = document.getElementById('adTen').value;
    const pass = document.getElementById('adPass').value;
    const msg = document.getElementById('thongBao');
    const cfToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

    if (!ten || !pass) { msg.innerText = "Vui lòng điền đủ thông tin!"; return; }
    if (!cfToken) { msg.innerText = "Vui lòng xác thực bảo vệ Cloudflare!"; return; }

    msg.style.color = "#f39c12";
    msg.innerText = "Đang kiểm tra phân quyền...";

    fetch(`${BASE_API}/v1/nguoi-dung/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: ten, matKhau: pass, tokenCloudflare: cfToken })
    })
    .then(res => res.text())
    .then(data => {
        if (data.includes("Đăng nhập thành công")) {
            const token = data.split('\n')[1]; 
            
            // Giải mã Token lấy ra Quyền Hạn
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.quyen === 'ROLE_ADMIN') {
                // CHỈ LƯU ADMIN TOKEN - Tách biệt hoàn toàn khỏi Web Độc giả
                localStorage.setItem('admin_token', token);
                msg.style.color = "#2ecc71";
                msg.innerText = "Xin chào Quản trị viên! Đang vào hệ thống...";
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                msg.style.color = "#ff4757";
                msg.innerText = "LỖI: Bạn không phải Quản trị viên!";
            }
        } else {
            msg.style.color = "#ff4757";
            msg.innerText = data;
        }
    })
    .catch(err => { msg.innerText = "Lỗi kết nối đến máy chủ!"; });
}