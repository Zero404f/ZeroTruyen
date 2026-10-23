document.addEventListener("DOMContentLoaded", () => {
    const API = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';
    
    // 1. Lấy ID và Tên thể loại từ URL (Thanh địa chỉ)
    const urlParams = new URLSearchParams(window.location.search);
    const theLoaiId = urlParams.get('id');
    const tenTheLoai = urlParams.get('ten');

    const khungTruyen = document.getElementById('khungChuaTruyen');
    const tieuDe = document.getElementById('tieuDeTrangMoi');

    if(!theLoaiId) {
        tieuDe.innerText = "LỖI: KHÔNG TÌM THẤY THỂ LOẠI";
        return;
    }

    // 2. In tên thể loại ra tiêu đề
    tieuDe.innerText = `THỂ LOẠI: ${tenTheLoai}`;
    khungTruyen.innerHTML = '<p style="text-align: center; width: 100%;">Đang tải truyện...</p>';

    // 3. Phân loại URL gọi API Backend
    let urlGoi = `${API}/v1/truyen`; 
    if (theLoaiId !== 'tat-ca') {
        urlGoi = `${API}/v1/truyen/the-loai/${theLoaiId}`; 
    }

    // 4. Gọi API lấy truyện
    fetch(urlGoi)
        .then(res => res.json())
        .then(data => {
            const danhSachTruyen = data.content || data;
            if (!danhSachTruyen || danhSachTruyen.length === 0) {
                khungTruyen.innerHTML = '<p style="text-align: center; width: 100%; color: #888;">Chưa có truyện nào thuộc thể loại này.</p>';
                return;
            }

            let html = '';
            danhSachTruyen.forEach(truyen => {
                const linkAnh = truyen.anhBia ? `${API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=Chua+co+anh';
                
                // Lấy số chương từ Backend gửi xuống
                const soChuong = truyen.tongSoChuong || 0;
                
                // Xử lý điểm đánh giá 
                const diem = truyen.diemTrungBinh || 0;
                const luot = truyen.luotDanhGia || 0;
                const diemHienThi = diem === 0 ? "0" : diem.toFixed(1);

                html += `
                    <a href="chi-tiet.html?id=${truyen.id}" style="text-decoration: none; color: inherit;">
                        <div class="card">
                            <img src="${linkAnh}" alt="${truyen.tenTruyen}" style="width:100%; border-radius:5px;">
                            <h3>${truyen.tenTruyen}</h3>
                            
                            <!-- HIỂN THỊ CHƯƠNG VÀ SAO ĐÁNH GIÁ -->
                            <p class="thong-tin-chuong">Chương ${soChuong}</p>
                            <div class="danh-gia-sao">
                                ${typeof taoGiaoDienSao === 'function' ? taoGiaoDienSao(diem) : ''}
                                <span>${diemHienThi}</span>
                                <span style="font-size: 12px; color: #888; font-weight: normal; margin-left: 3px;">(${luot})</span>
                            </div>

                            <p>Tác giả: <b>${truyen.tacGia || 'Đang cập nhật'}</b></p>
                            <span class="badge">${truyen.trangThai || 'Đang ra'}</span>
                        </div>
                    </a>
                `;
            });
            khungTruyen.innerHTML = html;
        })
        .catch(err => {
            console.error('Lỗi tải truyện:', err);
            khungTruyen.innerHTML = '<p style="color:red; text-align:center; width: 100%;">Lỗi kết nối Backend!</p>';
        });
});