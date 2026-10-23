const API_URL = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';
const khungLichSu = document.getElementById('khungChuaLichSu');

// Hàm xuất danh sách lịch sử ra giao diện
function hienThiLichSu() {
    if (!khungLichSu) return;

    // Lấy dữ liệu từ bộ nhớ của trình duyệt
    let lichSu = JSON.parse(localStorage.getItem('lichSuDocTruyen')) || [];
    
    // Nếu rỗng
    if (lichSu.length === 0) {
        khungLichSu.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #888;">
                <i class="fas fa-history" style="font-size: 50px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>Bạn chưa đọc bộ truyện nào!</h3>
                <a href="index.html" style="color: #e74c3c; text-decoration: none; font-weight: bold;">Về trang chủ đọc truyện ngay</a>
            </div>
        `;
        return;
    }

    let html = '';
    lichSu.forEach(item => {
        // Kiểm tra xem là link ngoài hay file trên Backend
        let linkAnh = item.anhBia;
        if (linkAnh && !linkAnh.startsWith('http')) {
            linkAnh = `${API_URL}/uploads/anh_bia/${item.anhBia}`;
        } else if (!linkAnh) {
            linkAnh = 'https://via.placeholder.com/220x280?text=Chua+co+anh';
        }

        // Tái sử dụng thẻ class="card" từ index.css
        html += `
            <div class="ls-item">
                <a href="doc-truyen.html?truyenId=${item.truyenId}&chuongId=${item.chuongId}">
                    <img src="${linkAnh}" alt="${item.tenTruyen}">
                </a>
                <div class="ls-item-info">
                    <a href="doc-truyen.html?truyenId=${item.truyenId}&chuongId=${item.chuongId}" class="ls-title">
                        ${item.tenTruyen}
                    </a>
                    <p class="ls-chapter">Đọc tiếp <strong>${item.tenChuong}</strong></p>
                    
                    <!-- Nút Xóa có icon thùng rác -->
                    <button class="ls-btn-delete" onclick="xoaMotTruyen(${item.truyenId})">
                        <i class="fas fa-trash-alt"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    });
    
    khungLichSu.innerHTML = html;
}

// Hàm Xóa 1 Truyện
window.xoaMotTruyen = function(truyenId) {
    let lichSu = JSON.parse(localStorage.getItem('lichSuDocTruyen')) || [];
    // Lọc bỏ truyện bị xóa
    lichSu = lichSu.filter(item => item.truyenId != truyenId);
    // Cập nhật lại bộ nhớ
    localStorage.setItem('lichSuDocTruyen', JSON.stringify(lichSu));
    // Vẽ lại màn hình
    hienThiLichSu();
};

// Hàm Xóa Toàn Bộ
window.xoaToanBoLichSu = function() {
    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc truyện?")) {
        localStorage.removeItem('lichSuDocTruyen');
        hienThiLichSu();
    }
};

// Khởi chạy khi mở trang
hienThiLichSu();

// ==========================================
// XỬ LÝ CHUYỂN TAB THIẾT BỊ & TÀI KHOẢN
// ==========================================
const tabThietBi = document.getElementById('tabThietBi');
const tabTaiKhoan = document.getElementById('tabTaiKhoan');
const khungThietBi = document.getElementById('khungThietBi');
const khungTaiKhoan = document.getElementById('khungTaiKhoan');

if (tabThietBi && tabTaiKhoan) {
    // Khi bấm vào tab Thiết Bị
    tabThietBi.addEventListener('click', () => {
        // Đổi màu nút
        tabThietBi.classList.add('active');
        tabTaiKhoan.classList.remove('active');
        // Bật/tắt khung nội dung
        khungThietBi.style.display = 'block';
        khungTaiKhoan.style.display = 'none';
    });

    // Khi bấm vào tab Tài Khoản
    tabTaiKhoan.addEventListener('click', () => {
        tabTaiKhoan.classList.add('active');
        tabThietBi.classList.remove('active');
        khungTaiKhoan.style.display = 'block';
        khungThietBi.style.display = 'none';
    });
}

// ==========================================
// TẢI LỊCH SỬ TỪ ĐÁM MÂY (DATABASE) CHO TAB TÀI KHOẢN
// ==========================================
function taiLichSuTaiKhoan() {
    const khungTaiKhoan = document.getElementById('khungTaiKhoan');
    const token = localStorage.getItem("zero_token");

    // Nếu chưa đăng nhập, giữ nguyên giao diện hộp cảnh báo cũ
    if (!token || !khungTaiKhoan) return;

    // Nếu đã đăng nhập, hiển thị dòng trạng thái tải
    khungTaiKhoan.innerHTML = '<p style="text-align: center; color: #f39c12;">Đang đồng bộ dữ liệu từ đám mây...</p>';

    fetch(`${API_URL}/v1/nguoi-dung/lich-su`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Token không hợp lệ hoặc hết hạn");
        return res.json();
    })
    .then(danhSach => {
        if (!danhSach || danhSach.length === 0) {
            khungTaiKhoan.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #888;">
                    <i class="fas fa-cloud" style="font-size: 50px; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>Tài khoản của bạn chưa lưu lịch sử đọc nào.</h3>
                </div>`;
            return;
        }

        // Bắt đầu vẽ danh sách giống hệt tab Thiết bị
        let html = '<div class="ls-danh-sach">';
        danhSach.forEach(item => {
            // Spring Boot trả về Object 'truyen' và 'chuong' lồng bên trong 'item'
            let truyen = item.truyen;
            let chuong = item.chuong;
            
            let linkAnh = truyen.anhBia ? `${API_URL}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=Chua+co+anh';
            
            html += `
                <div class="ls-item">
                    <a href="doc-truyen.html?truyenId=${truyen.id}&chuongId=${chuong.id}">
                        <img src="${linkAnh}" alt="${truyen.tenTruyen}">
                    </a>
                    <div class="ls-item-info">
                        <a href="doc-truyen.html?truyenId=${truyen.id}&chuongId=${chuong.id}" class="ls-title">
                            ${truyen.tenTruyen}
                        </a>
                        <p class="ls-chapter">Đọc tiếp <strong>${chuong.tenChuong}</strong></p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        // Đổ toàn bộ HTML vào khung
        khungTaiKhoan.innerHTML = html;
    })
    .catch(err => {
        console.error("Lỗi lấy lịch sử đám mây:", err);
        khungTaiKhoan.innerHTML = '<p style="color:red; text-align:center;">Lỗi tải dữ liệu đồng bộ!</p>';
    });
}

// Gọi hàm ngay khi tải file
taiLichSuTaiKhoan();