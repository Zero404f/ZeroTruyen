// LẤY ID TRUYỆN VÀ ID CHƯƠNG TỪ URL
const urlParams = new URLSearchParams(window.location.search);
const truyenId = urlParams.get('truyenId');
const chuongId = urlParams.get('chuongId');

// Đảm bảo biến BASE_API luôn tồn tại
const API_URL = typeof BASE_API !== 'undefined' ? BASE_API : 'http://localhost:8080';

// Khai báo biến tạm để chứa dữ liệu lưu lịch sử
let duLieuTruyen = null;
let duLieuChuong = null;

// Hàm kiểm tra và lưu lịch sử đọc truyện
function luuLichSuDoc() {
    if (duLieuTruyen && duLieuChuong) {
        let lichSu = JSON.parse(localStorage.getItem('lichSuDocTruyen')) || [];
        
        // Xóa bản ghi cũ của bộ truyện này (nếu có) để không bị trùng lặp
        lichSu = lichSu.filter(item => item.truyenId != duLieuTruyen.id);
        
        // Nhét bản ghi mới lên vị trí đầu tiên (Mới đọc nhất)
        lichSu.unshift({
            truyenId: duLieuTruyen.id,
            tenTruyen: duLieuTruyen.tenTruyen,
            anhBia: duLieuTruyen.anhBia,
            chuongId: duLieuChuong.id,
            tenChuong: duLieuChuong.tenChuong,
            thoiGian: new Date().getTime()
        });
        
        // Giới hạn bộ nhớ: Chỉ lưu tối đa 50 truyện gần nhất
        if(lichSu.length > 50) lichSu.pop();
        
        localStorage.setItem('lichSuDocTruyen', JSON.stringify(lichSu));
        luuLichSuDamMay(duLieuTruyen.id, duLieuChuong.id);
    }
}

if (!truyenId || !chuongId) {
    const khung = document.getElementById('khungChuaAnh');
    if (khung) khung.innerHTML = '<h2 style="color:red; text-align:center;">Lỗi: Không tìm thấy ID truyện hoặc chương!</h2>';
} else {
    // ==========================================
    // 1. LẤY TÊN TRUYỆN ĐỂ HIỂN THỊ LÊN TRÊN CÙNG & SEO
    // ==========================================
    fetch(`${API_URL}/v1/truyen/${truyenId}`)
        .then(res => res.json())
        .then(truyen => {
            const tenTruyenDoc = document.getElementById('tenTruyenDoc');
            const seoTenTruyen = document.getElementById('seoTenTruyen');
            if (truyen) {
                if (tenTruyenDoc) tenTruyenDoc.innerText = truyen.tenTruyen || "Đang cập nhật tên truyện...";
                if (seoTenTruyen) seoTenTruyen.innerText = truyen.tenTruyen || "";
                
                // Hứng dữ liệu và kích hoạt lưu lịch sử
                duLieuTruyen = truyen;
                luuLichSuDoc();
            }
        })
        .catch(err => console.error("Lỗi tải tên truyện:", err));

    // ==========================================
    // 2. GỌI API LẤY CHI TIẾT CHƯƠNG (VẼ ẢNH)
    // ==========================================
    fetch(`${API_URL}/v1/chuong/${chuongId}`)
        .then(res => res.json())
        .then(chuong => {
            const khungAnh = document.getElementById('khungChuaAnh');
            if (!khungAnh) return;

            if (!chuong) {
                khungAnh.innerHTML = '<h3 style="color:red; text-align:center;">Chương này không tồn tại hoặc đã bị xóa!</h3>';
                return;
            }

            // Gắn tên chương
            const tenChuongDoc = document.getElementById('tenChuongDoc');
            const seoTenChuong = document.getElementById('seoTenChuong');
            if (tenChuongDoc) tenChuongDoc.innerText = chuong.tenChuong || "Đang cập nhật tên chương...";
            if (seoTenChuong) seoTenChuong.innerText = chuong.tenChuong || "";
            
            // Vẽ ảnh
            if (!chuong.danhSachAnh || chuong.danhSachAnh.length === 0) {
                khungAnh.innerHTML = '<h3 style="color:#888; text-align:center; padding: 50px;">Chương này đang cập nhật ảnh...</h3>';
                return;
            }

            let htmlAnh = '';
            chuong.danhSachAnh.forEach(anh => {
                let tenAnh = anh.urlAnh; 
                let linkAnh = tenAnh.startsWith('http') ? tenAnh : `${API_URL}/uploads/${tenAnh}`;
                htmlAnh += `<img src="${linkAnh}" alt="Trang truyện" style="max-width: 100%; display: block; margin: 0 auto;">`;
            });
            khungAnh.innerHTML = htmlAnh;

            // Hứng dữ liệu và kích hoạt lưu lịch sử
            duLieuChuong = chuong;
            luuLichSuDoc();

            // =========================================================
            // GỌI API ẨN ĐỂ TĂNG LƯỢT XEM CHO CHƯƠNG VÀ TRUYỆN
            // =========================================================
            fetch(`${API_URL}/v1/tuong-tac/tang-view/${chuongId}`, { 
                method: 'POST' 
            }).catch(err => console.log("Lỗi tăng lượt xem:", err));

        })
        .catch(err => {
            console.error("Lỗi tải chương:", err);
            const khungAnh = document.getElementById('khungChuaAnh');
            if (khungAnh) khungAnh.innerHTML = '<p style="color:red; text-align:center;">Lỗi kết nối đến máy chủ!</p>';
        });

    // ==========================================
    // 3. ĐÁNH THỨC THANH CHUYỂN CHƯƠNG VÀ NÚT BẤM
    // ==========================================
    fetch(`${API_URL}/v1/truyen/${truyenId}/chuong`)
        .then(res => res.json())
        .then(danhSachChuong => {
            const chonChuongTren = document.getElementById('chonChuong');
            const chonChuongDuoi = document.getElementById('chonChuongDuoi');
            
            if (!danhSachChuong || danhSachChuong.length === 0) return;

            if (chonChuongTren) chonChuongTren.innerHTML = '';
            if (chonChuongDuoi) chonChuongDuoi.innerHTML = '';

            danhSachChuong.forEach(c => {
                const isSelected = c.id == chuongId ? 'selected' : '';
                const optionHTML = `<option value="${c.id}" ${isSelected}>${c.tenChuong}</option>`;
                if (chonChuongTren) chonChuongTren.innerHTML += optionHTML;
                if (chonChuongDuoi) chonChuongDuoi.innerHTML += optionHTML;
            });

            const xuLyChuyenChuong = (event) => {
                const idChuongMoi = event.target.value;
                window.location.href = `doc-truyen.html?truyenId=${truyenId}&chuongId=${idChuongMoi}`;
            };
            
            if (chonChuongTren) chonChuongTren.addEventListener('change', xuLyChuyenChuong);
            if (chonChuongDuoi) chonChuongDuoi.addEventListener('change', xuLyChuyenChuong);

            const viTriHienTai = danhSachChuong.findIndex(c => c.id == chuongId);
            const btnTruoc = document.getElementById('btnChuongTruoc');
            const btnSau = document.getElementById('btnChuongSau');
            const btnTruocDuoi = document.getElementById('btnChuongTruocDuoi');
            const btnSauDuoi = document.getElementById('btnChuongSauDuoi');

            // Nút Trước
            if (viTriHienTai > 0) { 
                const idChuongTruoc = danhSachChuong[viTriHienTai - 1].id;
                const linkTruoc = `doc-truyen.html?truyenId=${truyenId}&chuongId=${idChuongTruoc}`;
                if(btnTruoc) btnTruoc.onclick = () => window.location.href = linkTruoc;
                if(btnTruocDuoi) btnTruocDuoi.onclick = () => window.location.href = linkTruoc;
            } else {
                if(btnTruoc) { btnTruoc.style.opacity = '0.5'; btnTruoc.style.cursor = 'not-allowed'; }
                if(btnTruocDuoi) { btnTruocDuoi.style.opacity = '0.5'; btnTruocDuoi.style.cursor = 'not-allowed'; }
            }

            // Nút Sau
            if (viTriHienTai < danhSachChuong.length - 1) { 
                const idChuongSau = danhSachChuong[viTriHienTai + 1].id;
                const linkSau = `doc-truyen.html?truyenId=${truyenId}&chuongId=${idChuongSau}`;
                if(btnSau) btnSau.onclick = () => window.location.href = linkSau;
                if(btnSauDuoi) btnSauDuoi.onclick = () => window.location.href = linkSau;
            } else {
                if(btnSau) { btnSau.style.opacity = '0.5'; btnSau.style.cursor = 'not-allowed'; }
                if(btnSauDuoi) { btnSauDuoi.style.opacity = '0.5'; btnSauDuoi.style.cursor = 'not-allowed'; }
            }
        })
        .catch(err => console.error("Lỗi tải danh sách chương:", err));
}
// ==========================================
// 4. LƯU LỊCH SỬ LÊN ĐÁM MÂY (DATABASE)
// ==========================================
function luuLichSuDamMay(idTruyen, idChuong) {
    const token = localStorage.getItem("zero_token");
    
    // Nếu không có token (khách vãng lai), chỉ dùng LocalStorage, không gọi API này
    if (!token) return; 

    // Đóng gói dữ liệu dạng Form để gửi qua @RequestParam
    const formData = new FormData();
    formData.append("truyenId", idTruyen);
    formData.append("chuongId", idChuong);

    fetch(`${API_URL}/v1/nguoi-dung/luu-lich-su`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // Đưa thẻ thông hành để Backend nhận diện
        },
        body: formData
    })
    .then(res => res.text())
    .then(thongBao => console.log("Trạng thái đồng bộ:", thongBao))
    .catch(err => console.error("Lỗi đồng bộ lịch sử:", err));
}

// ==========================================
// 5. TÍNH NĂNG BÌNH LUẬN TRONG CHƯƠNG
// ==========================================
const tokenUser = localStorage.getItem('zero_token');
const avatarUser = localStorage.getItem('zero_avatar');
const khuVucViet = document.getElementById('khuVucVietBinhLuan');

// A. Vẽ khung nhập liệu
if(khuVucViet) {
    if(tokenUser) {
        let avatarImg = avatarUser ? avatarUser : 'https://via.placeholder.com/50';
        khuVucViet.innerHTML = `
            <img src="${avatarImg}" alt="Avatar" class="avatar-binh-luan">
            <div class="khung-nhap-lieu">
                <textarea id="noiDungBinhLuan" placeholder="Bạn nghĩ gì về chương này?"></textarea>
                <button onclick="guiBinhLuanChuong()" class="btn-gui-binh-luan">Gửi bình luận</button>
            </div>
        `;
    } else {
        khuVucViet.innerHTML = `
            <div style="text-align:center; width:100%; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <p style="margin-bottom: 10px; color:#555;">Bạn cần đăng nhập để tham gia thảo luận!</p>
                <a href="dang-nhap.html" style="padding: 8px 15px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; display:inline-block; font-weight:bold;">Đăng nhập ngay</a>
            </div>
        `;
    }
}

// B. Hàm Tải danh sách bình luận (Của riêng chương này)
window.taiBinhLuanChuong = function() {
    if(!chuongId) return;

    fetch(`${API_URL}/v1/chuong/${chuongId}/binh-luan`)
        .then(res => res.json())
        .then(danhSach => {
            const khungBinhLuan = document.getElementById('danhSachBinhLuan');
            if(!khungBinhLuan) return;

            document.getElementById('tongSoBinhLuan').innerText = danhSach.length;

            if(danhSach.length === 0) {
                khungBinhLuan.innerHTML = '<p style="text-align:center; color:#888;">Chưa có bình luận nào cho chương này. Hãy là người đầu tiên!</p>';
                return;
            }

            let html = '';
            danhSach.forEach(bl => {
                let avt = (bl.nguoiDung && bl.nguoiDung.anhDaiDien) ? bl.nguoiDung.anhDaiDien : 'https://via.placeholder.com/50';
                let ten = (bl.nguoiDung && bl.nguoiDung.tenTaiKhoan) ? bl.nguoiDung.tenTaiKhoan : 'Người dùng ẩn danh';
                
                let thoiGianHienThi = "Vừa xong";
                if(bl.thoiGian) {
                    let date = new Date(bl.thoiGian);
                    thoiGianHienThi = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} - ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
                }

                const currentUser = localStorage.getItem('zero_user');
                let menuThaoTac = '';
                if (currentUser === ten) {
                    menuThaoTac = `
                        <div class="menu-binh-luan-container">
                            <button class="btn-3-cham" onclick="moMenuBinhLuanChuong(${bl.id}, event)">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div id="menu-chuong-bl-${bl.id}" class="dropdown-binh-luan">
                                <button onclick="moKhungSuaBinhLuanChuong(${bl.id})"><i class="fas fa-edit"></i> Sửa</button>
                                <button class="nut-xoa" onclick="hienThiModalXoaBinhLuanChuong(${bl.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
                            </div>
                        </div>
                    `;
                }

                html += `
                    <div class="item-binh-luan">
                        <img src="${avt}" alt="Avatar" class="avatar-binh-luan">
                        <div class="chi-tiet-binh-luan">
                            <div class="ten-nguoi-binh-luan" style="width: 100%;">
                                ${ten} <span class="thoi-gian-binh-luan">${thoiGianHienThi}</span>
                                ${menuThaoTac}
                            </div>
                            <div class="noi-dung-binh-luan" id="noi-dung-chuong-bl-${bl.id}">${bl.noiDung}</div>
                        </div>
                    </div>
                `;
            });
            khungBinhLuan.innerHTML = html;
        })
        .catch(err => console.error("Lỗi tải bình luận chương:", err));
};

// C. Hàm Gửi bình luận
window.guiBinhLuanChuong = function() {
    const oNhap = document.getElementById('noiDungBinhLuan');
    if(!oNhap) return;
    
    const noiDung = oNhap.value.trim();
    if(!noiDung) { alert("Vui lòng nhập nội dung bình luận!"); return; }

    fetch(`${API_URL}/v1/binh-luan?chuongId=${chuongId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUser}` },
        body: JSON.stringify({ noiDung: noiDung })
    })
    .then(res => res.text())
    .then(data => {
        if(data.includes("Lỗi")) alert(data);
        else { oNhap.value = ''; taiBinhLuanChuong(); }
    }).catch(err => alert("Lỗi kết nối máy chủ!"));
};

// D. Đóng mở menu 3 chấm
window.moMenuBinhLuanChuong = function(id, event) {
    event.stopPropagation(); 
    document.querySelectorAll('.dropdown-binh-luan.show').forEach(menu => {
        if (menu.id !== `menu-chuong-bl-${id}`) menu.classList.remove('show');
    });
    const menuTarget = document.getElementById(`menu-chuong-bl-${id}`);
    if(menuTarget) menuTarget.classList.toggle('show');
};
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-binh-luan.show').forEach(m => m.classList.remove('show'));
});

// E. SỬA BÌNH LUẬN TRỰC TIẾP TRÊN GIAO DIỆN
window.moKhungSuaBinhLuanChuong = function(id) {
    const divNoiDung = document.getElementById(`noi-dung-chuong-bl-${id}`);
    if (divNoiDung.querySelector('textarea')) return;

    const noiDungGoc = divNoiDung.innerText;
    const noiDungEncoded = encodeURIComponent(noiDungGoc);

    divNoiDung.innerHTML = `
        <textarea id="input-sua-chuong-bl-${id}" class="textarea-sua-bl">${noiDungGoc}</textarea>
        <div class="hanh-dong-sua-bl">
            <button class="btn-huy-sua" onclick="huySuaBinhLuanChuong(${id}, '${noiDungEncoded}')">Hủy</button>
            <button class="btn-luu-sua" onclick="luuSuaBinhLuanChuong(${id})">Lưu</button>
        </div>
    `;
};

window.huySuaBinhLuanChuong = function(id, noiDungEncoded) {
    document.getElementById(`noi-dung-chuong-bl-${id}`).innerText = decodeURIComponent(noiDungEncoded);
};

window.luuSuaBinhLuanChuong = function(id) {
    const noiDungMoi = document.getElementById(`input-sua-chuong-bl-${id}`).value.trim();
    if (!noiDungMoi) { alert("Nội dung không được để trống!"); return; }

    fetch(`${API_URL}/v1/binh-luan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUser}` },
        body: JSON.stringify({ noiDung: noiDungMoi })
    })
    .then(res => res.text())
    .then(data => {
        if(data.includes("Lỗi")) alert(data);
        else taiBinhLuanChuong(); 
    });
};

// F. XÓA BÌNH LUẬN (CỬA SỔ MODAL)
window.hienThiModalXoaBinhLuanChuong = function(id) {
    let modal = document.getElementById('modalXoaBinhLuan');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalXoaBinhLuan';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <i class="fas fa-trash-alt modal-icon"></i>
                <h3>Xác nhận xóa</h3>
                <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
                <div class="modal-buttons">
                    <button class="btn-modal-huy" onclick="dongModalXoaBinhLuanChuong()">Hủy</button>
                    <button class="btn-modal-xac-nhan" id="btnXacNhanXoaChuongBL">Xóa</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('show');
    document.getElementById('btnXacNhanXoaChuongBL').onclick = function() {
        thucHienXoaBinhLuanChuong(id);
    };
};

window.dongModalXoaBinhLuanChuong = function() {
    document.getElementById('modalXoaBinhLuan').classList.remove('show');
};

window.thucHienXoaBinhLuanChuong = function(id) {
    fetch(`${API_URL}/v1/binh-luan/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenUser}` } })
    .then(res => res.text())
    .then(data => { 
        dongModalXoaBinhLuanChuong();
        if(data.includes("Lỗi")) alert(data); 
        else taiBinhLuanChuong(); 
    });
};

taiBinhLuanChuong();
