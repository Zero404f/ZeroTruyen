const API_URL_TK = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';

// 1. HÀM TỰ ĐỘNG VẼ SAO DỰA TRÊN ĐIỂM SỐ
function taoGiaoDienSao(diem) {
    let saoHtml = '';
    let diemXet = diem ? parseFloat(diem) : 0;
    
    for (let i = 1; i <= 5; i++) {
        if (diemXet >= i) {
            saoHtml += '<i class="fas fa-star"></i>'; // Sao đặc (Màu vàng)
        } else if (diemXet >= i - 0.5) {
            saoHtml += '<i class="fas fa-star-half-alt"></i>'; // Sao khuyết một nửa
        } else {
            saoHtml += '<i class="far fa-star"></i>'; // Sao rỗng (chưa đạt)
        }
    }
    return saoHtml;
}

// 2. TẢI DANH SÁCH THỂ LOẠI ĐỔ VÀO THẺ SELECT MẶC ĐỊNH
document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API_URL_TK}/v1/the-loai`)
        .then(res => res.json())
        .then(danhSach => {
            const selectTheLoai = document.getElementById('locTheLoai');
            danhSach.forEach(tl => {
                const option = document.createElement('option');
                option.value = tl.id;
                option.innerText = tl.tenTheLoai;
                selectTheLoai.appendChild(option);
            });
        })
        .catch(err => console.error("Lỗi tải danh sách thể loại:", err));
});

// 2. THỰC HIỆN GỌI API KHI BẤM NÚT LỌC TRUYỆN
window.thucHienTimKiemNangCao = function() {
    const tuKhoa = document.getElementById('locTuKhoa').value.trim();
    const theLoaiId = document.getElementById('locTheLoai').value;
    const trangThai = document.getElementById('locTrangThai').value;
    
    // Lấy thêm dữ liệu từ 2 trường mới tạo
    const sapXep = document.getElementById('locSapXep').value;
    const soChuong = document.getElementById('locSoChuong').value;
    
    const khungKetQua = document.getElementById('khungKetQua');
    khungKetQua.innerHTML = '<p style="text-align: center; width: 100%;">Đang tìm kiếm...</p>';

    let urlQuery = [];
    if (tuKhoa) urlQuery.push(`tuKhoa=${encodeURIComponent(tuKhoa)}`);
    if (theLoaiId) urlQuery.push(`theLoaiId=${theLoaiId}`);
    if (trangThai) urlQuery.push(`trangThai=${encodeURIComponent(trangThai)}`);
    
    // Đẩy tham số mới lên URL gửi xuống Backend
    if (sapXep) urlQuery.push(`sapXep=${encodeURIComponent(sapXep)}`);
    if (soChuong) urlQuery.push(`soChuong=${encodeURIComponent(soChuong)}`);

    const finalUrl = `${API_URL_TK}/v1/truyen/tim-kiem-nang-cao?${urlQuery.join('&')}`;

    fetch(finalUrl)
        .then(res => res.json())
        .then(data => {
            const danhSachTruyen = data.content || data; // Hỗ trợ cả mảng List và đối tượng Page của Spring Boot

            if (!danhSachTruyen || danhSachTruyen.length === 0) {
                khungKetQua.innerHTML = '<p style="text-align: center; width: 100%; color: #e74c3c;">Không tìm thấy truyện nào phù hợp với điều kiện lọc!</p>';
                return;
            }

            let html = '';
            danhSachTruyen.forEach(truyen => {
                const linkAnh = truyen.anhBia ? `${API_URL_TK}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=Chua+co+anh';
                
                const soChuong = truyen.tongSoChuong || 0;
                
                // Lấy điểm từ Backend, nếu chưa ai đánh giá thì mặc định là 0
                const diem = truyen.diemTrungBinh || 0;
                const luot = truyen.luotDanhGia || 0;
                const diemHienThi = diem === 0 ? "0" : diem.toFixed(1); // Ép về định dạng 1 chữ số thập phân (VD: 4.5)

                html += `
                    <a href="chi-tiet.html?id=${truyen.id}" style="text-decoration: none; color: inherit;">
                        <div class="card">
                            <img src="${linkAnh}" alt="${truyen.tenTruyen}" style="width:100%; border-radius:5px;">
                            <h3>${truyen.tenTruyen}</h3>
                            
                            <p class="thong-tin-chuong">Chương ${soChuong}</p>
                            
                            <!-- GIAO DIỆN SAO ĐỘNG (Tự vẽ sao + Hiện chỉ số + Số lượt) -->
                            <div class="danh-gia-sao">
                                ${taoGiaoDienSao(diem)}
                                <span>${diemHienThi}</span>
                                <span style="font-size: 12px; color: #888; font-weight: normal; margin-left: 3px;">(${luot})</span>
                            </div>

                            <p>Tác giả: <b>${truyen.tacGia || 'Đang cập nhật'}</b></p>
                            <span class="badge">${truyen.trangThai || 'Đang ra'}</span>
                        </div>
                    </a>
                `;
            });
            khungKetQua.innerHTML = html;
        })
        .catch(err => {
            console.error('Lỗi tìm kiếm:', err);
            khungKetQua.innerHTML = '<p style="color:red; text-align:center; width: 100%;">Lỗi kết nối Backend!</p>';
        });
}