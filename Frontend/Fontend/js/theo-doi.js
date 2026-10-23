const API_URL_TD = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';

document.addEventListener("DOMContentLoaded", () => {
    const khungChua = document.getElementById('khungTruyenTheoDoi');
    const token = localStorage.getItem('zero_token');

    // Nếu chưa đăng nhập thì hiện thông báo yêu cầu đăng nhập
    if (!token) {
        if(khungChua) {
            khungChua.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">
                    <i class="fas fa-bookmark" style="font-size: 50px; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>Bạn cần đăng nhập để xem truyện đang theo dõi!</h3>
                    <a href="dang-nhap.html" style="display:inline-block; margin-top:15px; padding: 10px 20px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Đăng nhập ngay</a>
                </div>
            `;
        }
        return;
    }

    // Nếu đã đăng nhập thì gọi API lấy danh sách truyện đang theo dõi
    fetch(`${API_URL_TD}/v1/theo-doi/danh-sach`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(danhSach => {
        if (!khungChua) return;

        // Nếu danh sách rỗng
        if (!danhSach || danhSach.length === 0) {
            khungChua.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Bạn chưa theo dõi bộ truyện nào.</p>';
            return;
        }

        // Vẽ danh sách truyện ra màn hình
        let html = '';
        danhSach.forEach(item => {
            let truyen = item.truyen;
            let linkAnh = truyen.anhBia ? `${API_URL_TD}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=Chua+co+anh';
            let soChuong = truyen.tongSoChuong || 0;

            html += `
                <a href="chi-tiet.html?id=${truyen.id}" style="text-decoration: none; color: inherit;">
                    <div class="card">
                        <img src="${linkAnh}" alt="${truyen.tenTruyen}" style="width:100%; border-radius:5px;">
                        <h3>${truyen.tenTruyen}</h3>
                        <p class="thong-tin-chuong">Chương ${soChuong}</p>
                        <span class="badge">${truyen.trangThai || 'Đang ra'}</span>
                    </div>
                </a>
            `;
        });
        khungChua.innerHTML = html;
    })
    .catch(err => {
        console.error("Lỗi tải danh sách theo dõi:", err);
        if(khungChua) {
            khungChua.innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1;">Lỗi kết nối máy chủ!</p>';
        }
    });
});