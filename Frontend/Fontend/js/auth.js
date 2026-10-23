const API_URL = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';

// =====================================
// 1. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU
// =====================================
function kichHoatMatKhau(idIcon, idInput) {
    const icon = document.getElementById(idIcon);
    const input = document.getElementById(idInput);
    if (icon && input) {
        icon.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
}
// Kích hoạt cho Đăng Nhập
kichHoatMatKhau('toggleMatKhauDN', 'dnMatKhau');
// Kích hoạt cho Đăng Ký
kichHoatMatKhau('toggleMatKhauDK1', 'dkMatKhau');
kichHoatMatKhau('toggleMatKhauDK2', 'dkXacNhanMatKhau');

// =====================================
// 2. XỬ LÝ ĐĂNG NHẬP
// =====================================
const btnDangNhap = document.getElementById('btnThucHienDangNhap');
if (btnDangNhap) {
    btnDangNhap.addEventListener('click', () => {
        const tenTaiKhoan = document.getElementById('dnTenTaiKhoan').value;
        const matKhau = document.getElementById('dnMatKhau').value;
        const thongBao = document.getElementById('thongBaoDangNhap');

        if (!tenTaiKhoan || !matKhau) {
            thongBao.style.color = "red";
            thongBao.innerText = "Vui lòng nhập đủ thông tin!";
            return;
        }

        const cfToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!cfToken) {
            thongBao.style.color = "red";
            thongBao.innerText = "Vui lòng xác thực bạn không phải là robot!";
            return;
        }

        thongBao.style.color = "#f39c12";
        thongBao.innerText = "Đang kiểm tra thông tin...";

        fetch(`${API_URL}/v1/nguoi-dung/dang-nhap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: tenTaiKhoan, matKhau: matKhau, tokenCloudflare: cfToken })
        })
        .then(res => res.text())
        .then(data => {
            if (data.includes("Đăng nhập thành công")) {
                const token = data.split('\n')[1]; // Lấy token từ Backend
                localStorage.setItem('zero_token', token);
                localStorage.setItem('zero_user', tenTaiKhoan);
                
                thongBao.style.color = "#2ecc71";
                thongBao.innerText = "Đăng nhập thành công! Đang vào trang chủ...";
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                thongBao.style.color = "red";
                thongBao.innerText = data; 
            }
        })
        .catch(err => {
            thongBao.style.color = "red";
            thongBao.innerText = "Lỗi kết nối máy chủ!";
        });
    });
}

// =====================================
// 3. XỬ LÝ ĐĂNG NHẬP BẰNG GOOGLE
// =====================================
function xuLyGoogleLogin(response) {
    const googleToken = response.credential;
    // Lấy ảnh đại diện
    try {
        const payload = JSON.parse(atob(googleToken.split('.')[1]));
        localStorage.setItem('zero_avatar', payload.picture); // Lưu ảnh vào bộ nhớ
    } catch (e) {
        console.log("Không lấy được ảnh Google");
    }
    const thongBao = document.getElementById('thongBaoDangNhap') || document.getElementById('thongBaoDangKy');
    
    if(thongBao) {
        thongBao.style.color = "#f39c12";
        thongBao.innerText = "Đang xác thực với Google...";
    }

    // Gửi token của Google xuống Spring Boot
    fetch(`${API_URL}/v1/nguoi-dung/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenGoogle: googleToken })
    })
    .then(res => res.json()) // ĐÃ SỬA: Chuyển sang đọc dữ liệu dạng JSON
    .then(data => {
        if (data.thongBao && data.thongBao.includes("Đăng nhập thành công")) {
            localStorage.setItem('zero_token', data.token); // Lấy token từ Backend
            localStorage.setItem('zero_user', data.tenUser); // ĐÃ SỬA: Lấy tên thật từ Backend thay vì chữ "Google User"
            if (data.avatar) localStorage.setItem('zero_avatar', data.avatar); 
            
            if(thongBao) {
                thongBao.style.color = "#2ecc71";
                thongBao.innerText = "Đăng nhập Google thành công! Đang vào trang chủ...";
            }
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            if(thongBao) {
                thongBao.style.color = "red";
                thongBao.innerText = data.thongBao || data; 
            }
        }
    })
    .catch(err => {
        if(thongBao) {
            thongBao.style.color = "red";
            thongBao.innerText = "Lỗi kết nối máy chủ!";
        }
    });
}

// Khởi tạo nút Google khi trang load xong
window.onload = function () {
    const nutGoogle = document.getElementById("nutGoogleLogin");
    if (nutGoogle) {
        google.accounts.id.initialize({
            // Đã điền sẵn mã Client ID của bạn
            client_id: "1097530700738-cq32kb7siib64t53s97vhg4ohgoevfut.apps.googleusercontent.com",
            callback: xuLyGoogleLogin
        });
        
        // Vẽ nút Google (Giao diện tối)
        google.accounts.id.renderButton(
            nutGoogle,
            { theme: "filled_black", size: "large", shape: "rectangular", width: "100%" }
        );
    }
};

// =====================================
// 4. XỬ LÝ ĐĂNG KÝ
// =====================================
const btnDangKy = document.getElementById('btnThucHienDangKy');
if (btnDangKy) {
    btnDangKy.addEventListener('click', () => {
        const tenTaiKhoan = document.getElementById('dkTenTaiKhoan').value;
        const matKhau = document.getElementById('dkMatKhau').value;
        const xacNhanMatKhau = document.getElementById('dkXacNhanMatKhau').value;
        const thongBao = document.getElementById('thongBaoDangKy');

        if (!tenTaiKhoan || !matKhau || !xacNhanMatKhau) {
            thongBao.style.color = "red";
            thongBao.innerText = "Vui lòng nhập đủ thông tin!";
            return;
        }
        if (matKhau.length < 6) {
            thongBao.style.color = "red";
            thongBao.innerText = "Mật khẩu phải từ 6 ký tự trở lên!";
            return;
        }
        if (matKhau !== xacNhanMatKhau) {
            thongBao.style.color = "red";
            thongBao.innerText = "Mật khẩu xác nhận không trùng khớp!";
            return;
        }

        // Bắt mã xác thực từ Cloudflare cho Đăng Ký
        const cfToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!cfToken) {
            thongBao.style.color = "red";
            thongBao.innerText = "Vui lòng xác thực bạn không phải là robot!";
            return;
        }

        thongBao.style.color = "#f39c12";
        thongBao.innerText = "Đang tạo tài khoản...";

        fetch(`${API_URL}/v1/nguoi-dung/dang-ky`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenDangNhap: tenTaiKhoan, matKhau: matKhau, tokenCloudflare: cfToken })
        })
        .then(async res => {
            const textData = await res.text();
            try {
                const jsonData = JSON.parse(textData);
                if (jsonData.id) {
                    thongBao.style.color = "#2ecc71";
                    thongBao.innerText = "Tạo tài khoản thành công! Tự chuyển sang Đăng nhập...";
                    setTimeout(() => window.location.href = 'dang-nhap.html', 1500);
                }
            } catch (e) {
                thongBao.style.color = "red";
                thongBao.innerText = textData;
            }
        })
        .catch(err => {
            thongBao.style.color = "red";
            thongBao.innerText = "Lỗi kết nối máy chủ!";
        });
    });
}