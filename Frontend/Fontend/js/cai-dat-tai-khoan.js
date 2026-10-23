const API_URL_CD = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';
const tokenCD = localStorage.getItem('zero_token');

if (!tokenCD) {
    alert("Vui lòng đăng nhập để truy cập Cài đặt!");
    window.location.href = 'dang-nhap.html';
}

// Hàm chuyển đổi qua lại giữa các Tab trên Sidebar
window.chuyenTab = function(tenTab, element) {
    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Bỏ active tất cả các nút menu sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Hiển thị tab được chọn
    if (tenTab === 'thong-tin') {
        document.getElementById('tabContent-thong-tin').style.display = 'block';
    } else if (tenTab === 'mat-khau') {
        document.getElementById('tabContent-mat-khau').style.display = 'block';
    }

    // Gắn class active cho nút tương ứng
    if (element) {
        element.classList.add('active');
    }
};

// Hàm Đăng xuất tài khoản từ trang cài đặt
window.dangXuatTaiKhoan = function() {
    if (typeof window.moCuaSoDangXuat === 'function') {
        window.moCuaSoDangXuat();
    } else {
        if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
            localStorage.removeItem("zero_token");
            localStorage.removeItem("zero_user");
            localStorage.removeItem("zero_avatar");
            window.location.href = 'index.html';
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. TẢI THÔNG TIN CÁ NHÂN LÚC MỞ TRANG
    fetch(`${API_URL_CD}/v1/nguoi-dung/thong-tin`, {
        headers: { 'Authorization': `Bearer ${tokenCD}` }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('cdTen').value = data.tenTaiKhoan || '';
        document.getElementById('cdEmail').value = data.email || '';
        
        // --- CẬP NHẬT XỬ LÝ AVATAR TẠI ĐÂY ---
        const imgElement = document.getElementById('anhDaiDienHienThi');
        let tenHienThi = data.tenTaiKhoan ? data.tenTaiKhoan : 'User';

        if (data.anhDaiDien) {
            let linkAvt = data.anhDaiDien.startsWith('http') ? data.anhDaiDien : `${API_URL_CD}/uploads/${data.anhDaiDien}`;
            imgElement.src = linkAvt;
            document.getElementById('linkAnhAn').value = data.anhDaiDien;
        } else {
            // Nếu chưa có ảnh, tự tạo avatar xịn màu cam với chữ cái đầu của tên
            imgElement.src = `https://ui-avatars.com/api/?name=${tenHienThi}&background=f39c12&color=fff`;
        }

        // BẮT LỖI: Nếu đường dẫn ảnh bị hỏng (file bị xóa mất), tự động quay về avatar tên
        imgElement.onerror = function() {
            this.onerror = null;
            this.src = `https://ui-avatars.com/api/?name=${tenHienThi}&background=f39c12&color=fff`;
        };
        // --------------------------------------

        // KIỂM TRA TÀI KHOẢN GOOGLE: Khóa Email và Ẩn hẳn mục Đổi mật khẩu
        if (data.laGoogle === true) {
            // 1. Khóa và hiện thông báo ở ô Email
            document.getElementById('cdEmail').disabled = true;
            document.getElementById('ghiChuGoogle').style.display = 'block';
            
            // 2. Ẩn menu "Đổi mật khẩu" trên thanh Sidebar bên phải
            const menuDoiMK = document.getElementById('menuDoiMatKhau');
            if (menuDoiMK) menuDoiMK.style.display = 'none';

            // 3. Khóa chết các ô nhập liệu bên trong khu vực đổi mật khẩu
            document.getElementById('mkCu').disabled = true;
            document.getElementById('mkMoi').disabled = true;
            document.getElementById('mkMoiXacNhan').disabled = true;
            
            // 4. Xóa luôn nút bấm "Cập nhật mật khẩu"
            const tabMatKhau = document.getElementById('tabContent-mat-khau');
            if (tabMatKhau) {
                const nutLuuMatKhau = tabMatKhau.querySelector('.btn-luu');
                if (nutLuuMatKhau) nutLuuMatKhau.remove(); // Xóa hẳn nút bấm khỏi HTML
                
                // Chèn thêm một dòng thông báo đỏ au vào để báo cho người cố tình dùng F12 biết
                const tbGoogle = document.createElement('p');
                tbGoogle.style.color = '#e74c3c';
                tbGoogle.style.fontWeight = 'bold';
                tbGoogle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Tài khoản Google không hỗ trợ đổi mật khẩu!';
                tabMatKhau.appendChild(tbGoogle);
            }
        }
    })
    .catch(err => console.error("Lỗi tải thông tin:", err));

    // 2. XỬ LÝ KHI NGƯỜI DÙNG CHỌN ẢNH MỚI
    document.getElementById('inputAnh').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        fetch(`${API_URL_CD}/v1/file/tai-len`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(linkTraVe => {
            if (linkTraVe.includes("Lỗi")) {
                alert(linkTraVe);
            } else {
                document.getElementById('anhDaiDienHienThi').src = linkTraVe;
                document.getElementById('linkAnhAn').value = linkTraVe;
            }
        })
        .catch(err => alert("Lỗi tải ảnh lên máy chủ!"));
    });
});

// 3. HÀM LƯU THÔNG TIN HỒ SƠ
window.luuThongTin = function() {
    const ten = document.getElementById('cdTen').value.trim();
    const email = document.getElementById('cdEmail').value.trim();
    const anh = document.getElementById('linkAnhAn').value;

    if (!ten) { alert("Tên hiển thị không được để trống!"); return; }

    fetch(`${API_URL_CD}/v1/nguoi-dung/cap-nhat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCD}` },
        body: JSON.stringify({ tenTaiKhoan: ten, email: email, anhDaiDien: anh })
    })
    .then(res => res.text())
    .then(thongBao => {
        alert(thongBao);
        if (thongBao.includes("thành công")) {
            localStorage.setItem('zero_user', ten);
            if (anh) localStorage.setItem('zero_avatar', anh);
            window.location.reload(); 
        }
    });
};

// 4. HÀM LƯU ĐỔI MẬT KHẨU
window.luuMatKhau = function() {
    const mkCu = document.getElementById('mkCu').value;
    const mkMoi = document.getElementById('mkMoi').value;
    const mkMoiXacNhan = document.getElementById('mkMoiXacNhan').value;

    if (!mkCu || !mkMoi || !mkMoiXacNhan) { alert("Vui lòng điền đủ thông tin mật khẩu!"); return; }
    if (mkMoi.length < 6) { alert("Mật khẩu mới phải từ 6 ký tự!"); return; }
    if (mkMoi !== mkMoiXacNhan) { alert("Xác nhận mật khẩu không khớp!"); return; }

    fetch(`${API_URL_CD}/v1/nguoi-dung/doi-mat-khau`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCD}` },
        body: JSON.stringify({ matKhauCu: mkCu, matKhauMoi: mkMoi })
    })
    .then(res => res.text())
    .then(thongBao => {
        alert(thongBao);
        if (thongBao.includes("thành công")) {
            document.getElementById('mkCu').value = '';
            document.getElementById('mkMoi').value = '';
            document.getElementById('mkMoiXacNhan').value = '';
        }
    });
};