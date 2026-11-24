const BASE_API = 'http://localhost:8080';
const token = localStorage.getItem('admin_token'); 

// Nếu chưa đăng nhập thì chuyển về trang Login
if (!token) { window.location.href = 'login.html'; }

function xuLyHetHanToken(res) {
    if (res.status === 401 || res.status === 403) {
        thongBaoNhanh("Phiên đăng nhập hết hạn hoặc không có quyền Admin! Vui lòng đăng nhập lại.", 'error');
        localStorage.removeItem('admin_token');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return true;
    }
    return false;
}

// 1. TẢI DANH SÁCH THỂ LOẠI
function taiDanhSachTheLoai() {
    const tbody = document.getElementById('bangDanhSachTheLoai');
    
    fetch(`${BASE_API}/v1/the-loai`)
    .then(res => res.json())
    .then(danhSach => {
        tbody.innerHTML = '';
        if (danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Chưa có thể loại nào.</td></tr>';
            return;
        }

        // Đảo ngược mảng để thể loại mới thêm hiện lên đầu
        danhSach.reverse().forEach(tl => {
            const tenAnToan = tl.tenTheLoai.replace(/'/g, "\\'");
            tbody.innerHTML += `
                <tr>
                    <td><strong>${tl.id}</strong></td>
                    <td><span style="font-size: 16px; color: #3498db; font-weight: 500;">${tl.tenTheLoai}</span></td>
                    <td style="text-align: center;">
                        <button class="btn-sua" onclick="suaTheLoai(${tl.id}, '${tenAnToan}')"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn-xoa" onclick="xoaTheLoai(${tl.id})"><i class="fas fa-trash"></i> Xóa</button>
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Lỗi tải dữ liệu!</td></tr>';
    });
}

// 2. MỞ / ĐÓNG CỬA SỔ MODAL
window.moModalTheLoai = function() {
    document.getElementById('modalTitleTL').innerText = 'Thêm Thể loại Mới';
    document.getElementById('adTheLoaiId').value = '';
    document.getElementById('adTenTheLoai').value = '';
    document.getElementById('modalTheLoai').classList.add('show');
}

window.dongModalTheLoai = function() {
    document.getElementById('modalTheLoai').classList.remove('show');
}

window.suaTheLoai = function(id, tenHienTai) {
    document.getElementById('modalTitleTL').innerText = 'Cập nhật Thể loại';
    document.getElementById('adTheLoaiId').value = id;
    document.getElementById('adTenTheLoai').value = tenHienTai;
    document.getElementById('modalTheLoai').classList.add('show');
}

// 3. THÊM MỚI HOẶC SỬA THỂ LOẠI LƯU VÀO DATABASE
window.luuTheLoai = function() {
    const id = document.getElementById('adTheLoaiId').value;
    const tenTL = document.getElementById('adTenTheLoai').value.trim();

    if (!tenTL) {
        thongBaoNhanh("Vui lòng nhập tên thể loại!", 'error');
        return;
    }

    const dataGui = { tenTheLoai: tenTL };
    let urlAPI = `${BASE_API}/v1/the-loai`;
    let phuongThuc = 'POST'; // Mặc định là Thêm mới

    if (id) {
        urlAPI = `${BASE_API}/v1/the-loai/${id}`;
        phuongThuc = 'PUT'; // Nếu có ID thì là Cập nhật (Sửa)
    }

    fetch(urlAPI, {
        method: phuongThuc,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dataGui)
    })
    .then(res => {
        if (xuLyHetHanToken(res)) return null;
        if (!res.ok) throw new Error("Lỗi lưu thể loại (Mã lỗi: " + res.status + ")");
        return res.json();
    })
    .then(data => {
        if (!data) return;
        thongBaoNhanh("Lưu thể loại thành công!", 'success');
        dongModalTheLoai();
        taiDanhSachTheLoai(); // Tải lại bảng ngay lập tức
    })
    .catch(err => thongBaoNhanh(err.message || "Lỗi hệ thống khi lưu thể loại!", 'error'));
}

// 4. XÓA THỂ LOẠI
window.xoaTheLoai = function(id) {
    hopThoaiXacNhan("Xác nhận xóa vĩnh viễn thể loại này? Cảnh báo: Các bộ truyện đang chứa thể loại này có thể bị ảnh hưởng!", () => {
        
        // Đoạn code bên trong này chỉ chạy khi người dùng bấm "Đồng ý Xóa"
        fetch(`${BASE_API}/v1/the-loai/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (xuLyHetHanToken(res)) return null;
            if (!res.ok) throw new Error("Xóa thể loại thất bại!");
            return res.text();
        })
        .then(msg => {
            if (!msg) return;
            thongBaoNhanh(msg, 'success'); 
            taiDanhSachTheLoai();
        })
        .catch(err => thongBaoNhanh(err.message || "Lỗi khi xóa thể loại!", 'error'));
        
    });
}

// 5. CÁC HÀM CƠ BẢN CỦA ADMIN
window.dangXuatAdmin = function() { 
    localStorage.removeItem('admin_token'); 
    window.location.href = 'login.html'; 
}

window.chuyenSangWebDocGia = function() {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
        localStorage.setItem('zero_token', adminToken);
        localStorage.setItem('zero_user', 'ADMIN HỆ THỐNG'); 
    }
    window.open('../Fontend/index.html', '_blank');
};

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    taiDanhSachTheLoai();
});