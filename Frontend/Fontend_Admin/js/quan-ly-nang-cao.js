const BASE_API = 'http://localhost:8080';
const token = localStorage.getItem('admin_token'); 

let tatCaTheLoaiGoc = []; 
let theLoaiDaChon = [];   
let danhSachTruyenGoc = [];
let trangHienTai = 1;
const SO_TRUYEN_MOT_TRANG = 20; 

// Biến lưu trữ cho bộ lọc
let tuKhoaTimKiem = '';
let theLoaiTimKiem = '';
let trangThaiTimKiem = '';
let sapXepTimKiem = 'newest';
let soChuongTimKiem = '';

if (!token) { window.location.href = 'login.html'; }

function taiTheLoaiAdmin() {
    fetch(`${BASE_API}/v1/the-loai`).then(res => res.json()).then(data => {
        tatCaTheLoaiGoc = data; 
        const selectSua = document.getElementById('adTheLoaiSelect');
        const selectLoc = document.getElementById('locTheLoai');
        
        selectSua.innerHTML = '<option value="">-- Chọn thể loại --</option>';
        selectLoc.innerHTML = '<option value="">Thể loại Tất cả</option>';
        
        data.forEach(tl => {
            selectSua.innerHTML += `<option value="${tl.id}">${tl.tenTheLoai}</option>`;
            selectLoc.innerHTML += `<option value="${tl.id}">${tl.tenTheLoai}</option>`;
        });
    });
}

function taiDanhSachTruyen() {
    fetch(`${BASE_API}/v1/truyen?page=0&size=1000`).then(res => res.json()).then(data => {
        danhSachTruyenGoc = data.content || data;
        hienThiDanhSachTruyen();
    });
}

function hienThiDanhSachTruyen() {
    let list = [...danhSachTruyenGoc];

    // 1. Lọc theo Từ khóa (ID, Tên truyện)
    if (tuKhoaTimKiem) {
        const tk = tuKhoaTimKiem.toLowerCase();
        list = list.filter(t => t.id.toString() === tk || t.tenTruyen.toLowerCase().includes(tk));
    }

    // 2. Lọc theo Thể loại
    if (theLoaiTimKiem) {
        const idTL = parseInt(theLoaiTimKiem);
        list = list.filter(t => t.danhSachTheLoai && t.danhSachTheLoai.some(tl => tl.id === idTL));
    }

    // 3. Lọc theo Trạng thái
    if (trangThaiTimKiem) {
        list = list.filter(t => t.trangThai === trangThaiTimKiem);
    }

    // 4. Lọc theo Số lượng chương
    if (soChuongTimKiem !== '') {
        list = list.filter(t => {
            const soChuong = t.soChuong || (t.danhSachChuong ? t.danhSachChuong.length : 0);
            if (soChuongTimKiem === '0') return soChuong === 0;
            if (soChuongTimKiem === '1-50') return soChuong >= 1 && soChuong <= 50;
            if (soChuongTimKiem === '51-100') return soChuong >= 51 && soChuong <= 100;
            if (soChuongTimKiem === '>100') return soChuong > 100;
            return true;
        });
    }

    // 5. Sắp xếp
    if (sapXepTimKiem === 'id_desc') {
        list.sort((a, b) => b.id - a.id);
    } else if (sapXepTimKiem === 'id_asc') {
        list.sort((a, b) => a.id - b.id);
    } else if (sapXepTimKiem === 'time_desc') {
        // SẮP XẾP THEO THỜI GIAN MỚI NHẤT DỰA VÀO CỘT THỜI GIAN
        list.sort((a, b) => new Date(b.thoiGianCapNhat || 0) - new Date(a.thoiGianCapNhat || 0)); 
    } else if (sapXepTimKiem === 'time_asc') {
        // SẮP XẾP THEO THỜI GIAN CŨ NHẤT
        list.sort((a, b) => new Date(a.thoiGianCapNhat || 0) - new Date(b.thoiGianCapNhat || 0));
    } else if (sapXepTimKiem === 'views_desc') {
        list.sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0));
    } else if (sapXepTimKiem === 'views_asc') {
        list.sort((a, b) => (a.luotXem || 0) - (b.luotXem || 0));
    }

    const tongSoTrang = Math.ceil(list.length / SO_TRUYEN_MOT_TRANG);
    if(trangHienTai > tongSoTrang && tongSoTrang > 0) trangHienTai = tongSoTrang;
    if(trangHienTai < 1) trangHienTai = 1;

    const batDau = (trangHienTai - 1) * SO_TRUYEN_MOT_TRANG;
    const listHienThi = list.slice(batDau, batDau + SO_TRUYEN_MOT_TRANG);

    const tbody = document.getElementById('bangDanhSachTruyen');
    tbody.innerHTML = '';
    if(listHienThi.length === 0) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không tìm thấy truyện phù hợp!</td></tr>';

    listHienThi.forEach(truyen => {
        const linkAnh = truyen.anhBia ? (truyen.anhBia.startsWith('http') ? truyen.anhBia : `${BASE_API}/uploads/anh_bia/${truyen.anhBia}`) : 'https://via.placeholder.com/50x70?text=No+Img';
        tbody.innerHTML += `
            <tr>
                <td>${truyen.id}</td>
                <td><img src="${linkAnh}" alt="Bìa"></td>
                <td><span class="ten-truyen-link" onclick="xemChiTietTruyen(${truyen.id})"><strong>${truyen.tenTruyen}</strong></span></td>
                <td>${truyen.tacGia || 'Trống'}</td>
                <td>${truyen.luotXem || 0}</td> <!-- Hiển thị lượt xem -->
                <td><span style="color: ${truyen.trangThai === 'Đang ra' ? 'green' : 'red'}; font-weight:bold;">${truyen.trangThai}</span></td>
            </tr>
        `;
    });
    veThanhPhanTrang(tongSoTrang);
}

// Hàm ghi nhận khi bấm nút Lọc
window.timKiemTruyen = function() { 
    tuKhoaTimKiem = document.getElementById('oTimKiem').value.trim(); 
    theLoaiTimKiem = document.getElementById('locTheLoai').value;
    trangThaiTimKiem = document.getElementById('locTrangThai').value;
    sapXepTimKiem = document.getElementById('locSapXep').value;
    soChuongTimKiem = document.getElementById('locSoChuong').value;
    trangHienTai = 1; 
    hienThiDanhSachTruyen(); 
}

function veThanhPhanTrang(tongSoTrang) {
    const divPhanTrang = document.getElementById('thanhPhanTrang');
    divPhanTrang.innerHTML = '';
    if(tongSoTrang <= 1) return;
    for (let i = 1; i <= tongSoTrang; i++) {
        const activeStyle = i === trangHienTai ? 'background: #3498db; color: white; border: none;' : 'background: #fff; color: #333; border: 1px solid #ddd;';
        divPhanTrang.innerHTML += `<button onclick="chuyenTrang(${i})" style="padding: 6px 12px; border-radius: 4px; cursor: pointer; ${activeStyle}">${i}</button>`;
    }
}
window.chuyenTrang = function(trangMoi) { trangHienTai = trangMoi; hienThiDanhSachTruyen(); }

window.xemChiTietTruyen = function(id) {
    fetch(`${BASE_API}/v1/truyen/${id}`).then(res => res.json()).then(truyen => {
        document.getElementById('ctTenTruyen').innerText = truyen.tenTruyen;
        document.getElementById('ctTacGia').innerText = truyen.tacGia || 'Đang cập nhật';
        document.getElementById('ctTrangThai').innerText = truyen.trangThai || 'Đang ra';
        document.getElementById('ctLuotXem').innerText = truyen.luotXem || 0;
        document.getElementById('ctDanhGia').innerText = truyen.diemTrungBinh ? truyen.diemTrungBinh.toFixed(1) : 0;
        document.getElementById('ctMoTa').innerText = truyen.moTaTruyen || 'Chưa có mô tả...';

        const linkAnh = truyen.anhBia ? (truyen.anhBia.startsWith('http') ? truyen.anhBia : `${BASE_API}/uploads/anh_bia/${truyen.anhBia}`) : 'https://via.placeholder.com/200x280?text=No+Img';
        document.getElementById('ctAnhBia').src = linkAnh;

        const khungTag = document.getElementById('ctTheLoai');
        khungTag.innerHTML = '';
        if(truyen.danhSachTheLoai && truyen.danhSachTheLoai.length > 0) {
            truyen.danhSachTheLoai.forEach(tl => khungTag.innerHTML += `<div class="tag-item" style="padding: 3px 10px; font-size:12px;">${tl.tenTheLoai}</div>`);
        } else { khungTag.innerHTML = '<span style="color:#aaa; font-size:12px;">Chưa có</span>'; }

        document.getElementById('btnChuyenSuaThongTin').onclick = function() { dongModalChiTiet(); moModalSuaTruyen(id); };
        document.getElementById('btnChuyenQuanLyChuong').onclick = function() { window.location.href = `quan-ly-chuong.html?truyenId=${id}`; };
        document.getElementById('btnXoaTruyenModal').onclick = function() {
            hopThoaiXacNhan("Xác nhận xóa vĩnh viễn toàn bộ dữ liệu của bộ truyện này?", () => {
                fetch(`${BASE_API}/v1/truyen/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.text())
                .then(msg => { 
                    thongBaoNhanh(msg, 'success'); 
                    dongModalChiTiet(); 
                    taiDanhSachTruyen(); 
                });
            });
        };
        document.getElementById('modalChiTietTruyen').classList.add('show');
    });
}
window.dongModalChiTiet = function() { document.getElementById('modalChiTietTruyen').classList.remove('show'); }

// Đóng form (dùng chung cho cả Thêm và Sửa)
window.dongModalTruyen = function() { document.getElementById('modalTruyen').classList.remove('show'); }

// Mở form SỬA TRUYỆN (vẫn giữ logic cũ để tải dữ liệu)
window.moModalSuaTruyen = function(id) {
    fetch(`${BASE_API}/v1/truyen/${id}`).then(res => res.json()).then(truyen => {
        document.getElementById('modalTitle').innerText = 'Cập nhật Truyện';
        document.getElementById('adTruyenId').value = truyen.id; 
        document.getElementById('adTenTruyen').value = truyen.tenTruyen;
        document.getElementById('adTacGia').value = truyen.tacGia || '';
        document.getElementById('adTrangThai').value = truyen.trangThai || 'Đang ra';
        document.getElementById('adMoTa').value = truyen.moTaTruyen || '';
        if(truyen.anhBia) {
            document.getElementById('adAnhBiaLuuTru').value = truyen.anhBia;
            document.getElementById('adAnhBiaPreview').src = truyen.anhBia.startsWith('http') ? truyen.anhBia : `${BASE_API}/uploads/anh_bia/${truyen.anhBia}`;
        }
        theLoaiDaChon = truyen.danhSachTheLoai ? [...truyen.danhSachTheLoai] : []; veDanhSachTag();
        document.getElementById('modalTruyen').classList.add('show');
    });
}

// Mở form trống để ĐĂNG TRUYỆN MỚI
window.moModalTruyen = function() {
    theLoaiDaChon = []; veDanhSachTag();
    document.getElementById('modalTitle').innerText = 'Đăng Truyện Mới';
    document.getElementById('adTruyenId').value = ''; 
    document.getElementById('adTenTruyen').value = ''; 
    document.getElementById('adTacGia').value = '';
    document.getElementById('adMoTa').value = ''; 
    document.getElementById('adTrangThai').value = 'Đang ra';
    document.getElementById('adAnhBiaLuuTru').value = ''; 
    document.getElementById('adAnhBiaPreview').src = 'https://via.placeholder.com/200x280?text=Chon+Anh';
    document.getElementById('modalTruyen').classList.add('show');
}

// LƯU TRUYỆN (Dùng chung "2 trong 1" cho cả Thêm Mới và Cập Nhật)
window.luuTruyen = function() {
    const idTruyen = document.getElementById('adTruyenId').value; 
    const ten = document.getElementById('adTenTruyen').value.trim();
    
    if(!ten) { 
        thongBaoNhanh("Chưa nhập tên truyện!", 'error'); 
        return; 
    }
    
    const dataGui = {
        tenTruyen: ten, 
        tacGia: document.getElementById('adTacGia').value.trim(), 
        trangThai: document.getElementById('adTrangThai').value, 
        moTaTruyen: document.getElementById('adMoTa').value.trim(), 
        anhBia: document.getElementById('adAnhBiaLuuTru').value, 
        danhSachTheLoai: theLoaiDaChon.map(tl => ({ id: tl.id }))
    };

    let urlAPI = `${BASE_API}/v1/truyen`;
    let phuongThuc = 'POST'; // Mặc định là Thêm mới
    let cauThongBao = "Đăng truyện mới thành công!";

    // Nếu thẻ ẩn adTruyenId có chứa số ID, tức là đang Cập nhật (Sửa)
    if (idTruyen) {
        urlAPI = `${BASE_API}/v1/truyen/${idTruyen}`; 
        phuongThuc = 'PUT'; 
        cauThongBao = "Cập nhật truyện thành công!";
    }

    fetch(urlAPI, {
        method: phuongThuc, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(dataGui)
    }).then(res => res.json()).then(data => { 
        thongBaoNhanh(cauThongBao, 'success'); 
        dongModalTruyen(); 
        taiDanhSachTruyen(); 
    }).catch(err => thongBaoNhanh("Lỗi khi lưu truyện!", 'error'));
}

window.chonTheLoai = function(selectObj) {
    const idTL = parseInt(selectObj.value); if(!idTL) return;
    if(!theLoaiDaChon.some(tl => tl.id === idTL)) {
        const tlGoc = tatCaTheLoaiGoc.find(tl => tl.id === idTL);
        if(tlGoc) { theLoaiDaChon.push(tlGoc); veDanhSachTag(); }
    }
    selectObj.value = ""; 
}

window.xoaTag = function(idTL) { theLoaiDaChon = theLoaiDaChon.filter(tl => tl.id !== idTL); veDanhSachTag(); }

function veDanhSachTag() {
    const khung = document.getElementById('khungChuaTag'); khung.innerHTML = '';
    if (theLoaiDaChon.length === 0) { khung.innerHTML = '<span style="color:#aaa; font-size:13px;">Chưa chọn thể loại nào</span>'; return; }
    theLoaiDaChon.forEach(tl => khung.innerHTML += `<div class="tag-item">${tl.tenTheLoai} <i class="fas fa-times" onclick="xoaTag(${tl.id})"></i></div>`);
}

window.uploadAnhBia = function(event) {
    const file = event.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("file", file);
    fetch(`${BASE_API}/v1/file/tai-len`, { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => res.text()).then(linkTraVe => {
        if(!linkTraVe.includes("Lỗi")) { document.getElementById('adAnhBiaLuuTru').value = linkTraVe.split('/').pop(); document.getElementById('adAnhBiaPreview').src = linkTraVe; }
    });
}

window.dangXuatAdmin = function() { localStorage.removeItem('admin_token'); window.location.href = 'login.html'; }
document.addEventListener('DOMContentLoaded', () => { taiTheLoaiAdmin(); taiDanhSachTruyen(); });

// Hàm chuyển sang Web Độc giả với quyền Admin
window.chuyenSangWebDocGia = function() {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
        localStorage.setItem('zero_token', adminToken);
        localStorage.setItem('zero_user', 'ADMIN HỆ THỐNG'); 
    }
    window.open('../Fontend/index.html', '_blank');
};