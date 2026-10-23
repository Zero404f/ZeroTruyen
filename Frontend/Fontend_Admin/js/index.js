const BASE_API = 'http://localhost:8080';
const token = localStorage.getItem('admin_token'); 

let tatCaTheLoaiGoc = []; 
let theLoaiDaChon = [];   
let danhSachTruyenGoc = [];
let trangHienTai = 1;
const SO_TRUYEN_MOT_TRANG = 20; 

if (!token) { window.location.href = 'login.html'; }

function taiTheLoaiAdmin() {
    fetch(`${BASE_API}/v1/the-loai`).then(res => res.json()).then(data => {
        tatCaTheLoaiGoc = data; 
        const select = document.getElementById('adTheLoaiSelect');
        select.innerHTML = '<option value="">-- Chọn thể loại --</option>';
        data.forEach(tl => select.innerHTML += `<option value="${tl.id}">${tl.tenTheLoai}</option>`);
    });
}

function taiDanhSachTruyen() {
    fetch(`${BASE_API}/v1/truyen`).then(res => res.json()).then(data => {
        danhSachTruyenGoc = data.content || data;
        hienThiDanhSachTruyen();
    });
}

function hienThiDanhSachTruyen() {
    let list = [...danhSachTruyenGoc];
    list.sort((a, b) => new Date(b.thoiGianCapNhat || 0) - new Date(a.thoiGianCapNhat || 0));

    const tongSoTrang = Math.ceil(list.length / SO_TRUYEN_MOT_TRANG);
    if(trangHienTai > tongSoTrang && tongSoTrang > 0) trangHienTai = tongSoTrang;
    if(trangHienTai < 1) trangHienTai = 1;

    const batDau = (trangHienTai - 1) * SO_TRUYEN_MOT_TRANG;
    const listHienThi = list.slice(batDau, batDau + SO_TRUYEN_MOT_TRANG);

    const tbody = document.getElementById('bangDanhSachTruyen');
    tbody.innerHTML = '';
    
    // Sửa colspan thành 6
    if(listHienThi.length === 0) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có truyện nào!</td></tr>';

    listHienThi.forEach(truyen => {
        const linkAnh = truyen.anhBia ? `${BASE_API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/50x70?text=No+Img';
        tbody.innerHTML += `
            <tr>
                <td>${truyen.id}</td>
                <td><img src="${linkAnh}" alt="Bìa"></td>
                <td><span class="ten-truyen-link" onclick="xemChiTietTruyen(${truyen.id})"><strong>${truyen.tenTruyen}</strong></span></td>
                <td>${truyen.tacGia || 'Trống'}</td>
                <td>${truyen.luotXem || 0}</td> <!-- THÊM DÒNG HIỂN THỊ LƯỢT XEM -->
                <td><span style="color: ${truyen.trangThai === 'Đang ra' ? 'green' : 'red'}; font-weight:bold;">${truyen.trangThai}</span></td>
            </tr>
        `;
    });
    veThanhPhanTrang(tongSoTrang);
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

// --- TÍNH NĂNG XEM BẢNG TÓM TẮT & 3 NÚT THAO TÁC ---
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
            if(confirm("Xác nhận xóa vĩnh viễn bộ truyện này?")) {
                fetch(`${BASE_API}/v1/truyen/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.text()).then(msg => { alert(msg); dongModalChiTiet(); taiDanhSachTruyen(); });
            }
        };
        document.getElementById('modalChiTietTruyen').classList.add('show');
    });
}
window.dongModalChiTiet = function() { document.getElementById('modalChiTietTruyen').classList.remove('show'); }

// --- XỬ LÝ SỬA TRUYỆN ---
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

// Xử lý Thể loại Tag
window.chonTheLoai = function(selectObj) {
    const idTL = parseInt(selectObj.value);
    if(!idTL) return;
    if(!theLoaiDaChon.some(tl => tl.id === idTL)) {
        const tlGoc = tatCaTheLoaiGoc.find(tl => tl.id === idTL);
        if(tlGoc) { theLoaiDaChon.push(tlGoc); veDanhSachTag(); }
    }
    selectObj.value = ""; 
}
window.xoaTag = function(idTL) { theLoaiDaChon = theLoaiDaChon.filter(tl => tl.id !== idTL); veDanhSachTag(); }
function veDanhSachTag() {
    const khung = document.getElementById('khungChuaTag');
    khung.innerHTML = '';
    if (theLoaiDaChon.length === 0) { khung.innerHTML = '<span style="color:#aaa; font-size:13px;">Chưa chọn thể loại nào</span>'; return; }
    theLoaiDaChon.forEach(tl => khung.innerHTML += `<div class="tag-item">${tl.tenTheLoai} <i class="fas fa-times" onclick="xoaTag(${tl.id})"></i></div>`);
}

// Upload và Đăng/Sửa truyện
window.uploadAnhBia = function(event) {
    const file = event.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("file", file);
    document.getElementById('adAnhBiaPreview').src = 'https://via.placeholder.com/200x280?text=Dang+tai...';
    fetch(`${BASE_API}/v1/file/tai-len`, { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => res.text()).then(linkTraVe => {
        if(linkTraVe.includes("Lỗi")) { document.getElementById('adAnhBiaPreview').src = 'https://via.placeholder.com/200x280?text=Loi'; } 
        else { document.getElementById('adAnhBiaLuuTru').value = linkTraVe.split('/').pop(); document.getElementById('adAnhBiaPreview').src = linkTraVe; }
    });
}

window.moModalTruyen = function() {
    theLoaiDaChon = []; veDanhSachTag();
    document.getElementById('modalTitle').innerText = 'Đăng Truyện Mới';
    document.getElementById('adTruyenId').value = ''; 
    document.getElementById('adTenTruyen').value = ''; document.getElementById('adTacGia').value = '';
    document.getElementById('adMoTa').value = ''; document.getElementById('adTrangThai').value = 'Đang ra';
    document.getElementById('adAnhBiaLuuTru').value = ''; document.getElementById('adAnhBiaPreview').src = 'https://via.placeholder.com/200x280?text=Chon+Anh';
    document.getElementById('modalTruyen').classList.add('show');
}
window.dongModalTruyen = function() { document.getElementById('modalTruyen').classList.remove('show'); }

window.luuTruyen = function() {
    const idTruyen = document.getElementById('adTruyenId').value; 
    const ten = document.getElementById('adTenTruyen').value.trim();
    if(!ten) { alert("Chưa nhập tên truyện!"); return; }
    const dataGui = {
        tenTruyen: ten, tacGia: document.getElementById('adTacGia').value.trim(), 
        trangThai: document.getElementById('adTrangThai').value, moTaTruyen: document.getElementById('adMoTa').value.trim(), 
        anhBia: document.getElementById('adAnhBiaLuuTru').value, danhSachTheLoai: theLoaiDaChon.map(tl => ({ id: tl.id }))
    };

    let urlAPI = `${BASE_API}/v1/truyen`;
    let phuongThuc = 'POST';
    if (idTruyen) {
        urlAPI = `${BASE_API}/v1/truyen/${idTruyen}`; 
        phuongThuc = 'PUT'; 
    }

    fetch(urlAPI, {
        method: phuongThuc, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(dataGui)
    }).then(res => res.json()).then(data => { alert("Thành công!"); dongModalTruyen(); taiDanhSachTruyen(); });
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