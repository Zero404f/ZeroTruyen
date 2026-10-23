const API_URL_TL = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';

// TẢI DANH SÁCH THỂ LOẠI TỪ MÁY CHỦ
function taiDanhSachTheLoai() {
    fetch(`${API_URL_TL}/v1/the-loai`)
        .then(res => res.json())
        .then(danhSach => {
            const khungTheLoai = document.getElementById('danhSachTheLoai');
            if (!danhSach || danhSach.length === 0) {
                khungTheLoai.innerHTML = '<p>Chưa có thể loại nào.</p>';
                return;
            }

            let html = `<button class="btn-the-loai" onclick="chuyenTrangTheLoai('tat-ca', 'Tất cả truyện')">Tất cả</button>`;
            
            danhSach.forEach(tl => {
                html += `<button class="btn-the-loai" onclick="chuyenTrangTheLoai(${tl.id}, '${tl.tenTheLoai}')">${tl.tenTheLoai}</button>`;
            });
            
            khungTheLoai.innerHTML = html;
        })
        .catch(err => console.error("Lỗi tải thể loại:", err));
}

// CHUYỂN HƯỚNG SANG TRANG MỚI KHI BẤM NÚT
window.chuyenTrangTheLoai = function(idTheLoai, tenTheLoai) {
    // Chuyển sang trang truyen-theo-the-loai.html và mang theo ID
    window.location.href = `truyen-theo-the-loai.html?id=${idTheLoai}&ten=${encodeURIComponent(tenTheLoai)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    taiDanhSachTheLoai();
});