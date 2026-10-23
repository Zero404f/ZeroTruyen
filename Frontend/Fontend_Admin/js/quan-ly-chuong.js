const BASE_API = 'http://localhost:8080';
const token = localStorage.getItem('admin_token');

const urlParams = new URLSearchParams(window.location.search);
const currentTruyenId = urlParams.get('truyenId');
if (!currentTruyenId) { alert("Vui lòng chọn truyện!"); window.location.href = 'quan-ly-nang-cao.html'; }

let mangAnhChuongLuuTru = []; 

function taiThongTinTruyen() {
    fetch(`${BASE_API}/v1/truyen/${currentTruyenId}`).then(res => res.json())
    .then(truyen => { document.getElementById('tenTruyenHienTai').innerText = truyen.tenTruyen; });
}

window.taiDanhSachChuong = function() {
    const tbody = document.getElementById('bangDanhSachChuong');
    fetch(`${BASE_API}/v1/truyen/${currentTruyenId}/chuong`).then(res => res.json()).then(danhSachChuong => {
        tbody.innerHTML = '';
        if (danhSachChuong.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Truyện này chưa có chương nào.</td></tr>'; return; }
        danhSachChuong.forEach(chuong => {
            tbody.innerHTML += `
                <tr>
                    <td>${chuong.id}</td>
                    <td><strong>${chuong.tenChuong}</strong></td>
                    <td>${chuong.ngayDang || 'Đang cập nhật'}</td>
                    <td>${chuong.luotXem || 0}</td>
                    <td>
                        <button class="btn-sua" onclick="moModalSuaChuong(${chuong.id})"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn-xoa" onclick="xoaChuong(${chuong.id})"><i class="fas fa-trash"></i> Xóa</button>
                    </td>
                </tr>
            `;
        });
    });
}

function veDanhSachAnhPreview() {
    const previewDiv = document.getElementById('previewAnhChuong');
    previewDiv.innerHTML = '';
    if(mangAnhChuongLuuTru.length === 0) { previewDiv.innerHTML = '<p style="color:#888; margin:auto;">Chưa có ảnh nào.</p>'; return; }

    mangAnhChuongLuuTru.forEach(tenAnh => {
        let linkDayDu = tenAnh.startsWith('http') ? tenAnh : `${BASE_API}/uploads/${tenAnh}`;
        let tenHienThi = tenAnh.split('/').pop(); 
        previewDiv.innerHTML += `
            <div class="preview-item">
                <img src="${linkDayDu}" data-url="${tenAnh}">
                <span class="ten-anh" title="${tenHienThi}">${tenHienThi}</span>
                <div class="btn-xoa-anh-preview" onclick="xoaMotAnhChoDinh('${tenAnh}')"><i class="fas fa-times"></i></div>
            </div>`;
    });

    new Sortable(previewDiv, {
        animation: 150, ghostClass: 'sortable-ghost',
        onEnd: function () {
            const mangMoi = [];
            document.querySelectorAll('.preview-item img').forEach(img => mangMoi.push(img.getAttribute('data-url')));
            mangAnhChuongLuuTru = mangMoi; 
        }
    });
}

window.xoaMotAnhChoDinh = function(tenAnhCanXoa) { mangAnhChuongLuuTru = mangAnhChuongLuuTru.filter(a => a !== tenAnhCanXoa); veDanhSachAnhPreview(); }

window.moModalChuong = function() {
    document.getElementById('modalTitleChuong').innerText = "Đăng Chương Mới";
    document.getElementById('adChuongId').value = ''; document.getElementById('adTenChuong').value = '';
    document.getElementById('adInputNhieuAnh').value = ''; mangAnhChuongLuuTru = []; veDanhSachAnhPreview();
    document.getElementById('modalChuong').classList.add('show');
}

window.moModalSuaChuong = function(chuongId) {
    fetch(`${BASE_API}/v1/chuong/${chuongId}`).then(res => res.json()).then(chuong => {
        document.getElementById('modalTitleChuong').innerText = "Cập nhật Chương";
        document.getElementById('adChuongId').value = chuong.id;
        document.getElementById('adTenChuong').value = chuong.tenChuong;
        document.getElementById('adInputNhieuAnh').value = '';
        mangAnhChuongLuuTru = chuong.danhSachAnh ? chuong.danhSachAnh.map(a => a.urlAnh) : [];
        veDanhSachAnhPreview(); document.getElementById('modalChuong').classList.add('show');
    });
}
window.dongModalChuong = function() { document.getElementById('modalChuong').classList.remove('show'); }

window.uploadNhieuAnh = async function(event) {
    const files = event.target.files; if(files.length === 0) return;
    document.getElementById('previewAnhChuong').innerHTML = '<p style="color:#f39c12; margin:auto; font-weight:bold;">Đang tải lên...</p>';
    for(let i = 0; i < files.length; i++) {
        const formData = new FormData(); formData.append("file", files[i]);
        try {
            const res = await fetch(`${BASE_API}/v1/file/tai-len`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            const linkTraVe = await res.text();
            if(!linkTraVe.includes("Lỗi")) mangAnhChuongLuuTru.push(linkTraVe.split('/').pop());
        } catch(e) {}
    }
    document.getElementById('adInputNhieuAnh').value = ''; veDanhSachAnhPreview(); 
}

window.luuChuong = function() {
    const chuongId = document.getElementById('adChuongId').value;
    const tenChuong = document.getElementById('adTenChuong').value.trim();
    if(!tenChuong) { alert("Chưa nhập tên chương!"); return; }
    
    const dataGui = { tenChuong: tenChuong, truyen: { id: currentTruyenId }, danhSachAnh: mangAnhChuongLuuTru.map(tenAnh => ({ urlAnh: tenAnh })) };
    fetch(chuongId ? `${BASE_API}/v1/chuong/${chuongId}` : `${BASE_API}/v1/chuong`, {
        method: chuongId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(dataGui)
    }).then(res => res.json()).then(() => { alert("Thành công!"); dongModalChuong(); taiDanhSachChuong(); });
}

window.xoaChuong = function(chuongId) {
    if(confirm("Xóa vĩnh viễn chương này?")) {
        fetch(`${BASE_API}/v1/chuong/${chuongId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.text()).then(msg => { alert(msg); taiDanhSachChuong(); });
    }
}
window.dangXuatAdmin = function() { localStorage.removeItem('admin_token'); window.location.href = 'login.html'; }
document.addEventListener('DOMContentLoaded', () => { taiThongTinTruyen(); taiDanhSachChuong(); });
