// Lấy ID truyện từ URL
const urlParams = new URLSearchParams(window.location.search);
const truyenId = urlParams.get('id');

function dinhDangLuotXem(so) {
    if (!so || so === 0) return 0;
    if (so >= 1000000) return (so / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (so >= 1000) return (so / 1000).toFixed(1).replace('.0', '') + 'K';
    return so;
}

if (!truyenId) {
    document.body.innerHTML = '<h2 style="text-align:center; color:red; margin-top:150px;">Lỗi: Không tìm thấy truyện!</h2>';
} else {
    // =========================================================
    // 1. GỌI API LẤY THÔNG TIN TRUYỆN
    // =========================================================
    fetch(`${BASE_API}/v1/truyen/${truyenId}`)
        .then(res => res.json())
        .then(truyen => {
            const linkAnh = truyen.anhBia ? `${BASE_API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=Chua+co+anh';
            const diem = truyen.diemTrungBinh || 0;
            const luot = truyen.luotDanhGia || 0;
            const diemHienThi = diem === 0 ? "0" : diem.toFixed(1);
            const soChuong = truyen.tongSoChuong || 0;
            const tongView = dinhDangLuotXem(truyen.luotXem || 0);
            
            document.getElementById('khungThongTinTruyen').innerHTML = `
                <div class="anh-bia-chi-tiet">
                    <img src="${linkAnh}" alt="${truyen.tenTruyen}">
                </div>
                <div class="thong-tin-chu-dao">
                    <h1>${truyen.tenTruyen}</h1>
                    
                    <div style="display: flex; align-items: center; gap: 15px; margin: 15px 0;">
                        <!-- Số sao hiển thị -->
                        <div style="color: #f39c12; font-size: 18px;">
                            ${typeof taoGiaoDienSao === 'function' ? taoGiaoDienSao(diem) : ''}
                            <span style="font-weight: bold; margin-left: 5px;">${diemHienThi}</span>
                        </div>
                        
                        <!-- Lượt đánh giá (Bấm để xem) -->
                        <span style="color: #888; font-size: 14px; cursor: pointer; text-decoration: underline;" onclick="moModalXemDanhGia()">
                            (${luot} đánh giá)
                        </span>
                        
                        <span style="color: #ccc;">|</span>
                        <span style="font-weight: bold; font-size: 15px; color: #555;">${soChuong} Chương</span>
                        <span style="color: #ccc;">|</span>
                        <span style="font-size: 14px; color: #888;"><i class="fas fa-eye"></i> ${tongView} Lượt xem</span>
                    </div>

                    <p>Tác giả: <b>${truyen.tacGia || 'Đang cập nhật'}</b></p>
                    <p>Trạng thái: <b>${truyen.trangThai || 'Đang ra'}</b></p>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="btnTheoDoi" class="btn-theo-doi" onclick="thaoTacTheoDoi()">
                            <i class="far fa-heart"></i> <span>Theo dõi</span>
                        </button>
                        <!-- Nút Đánh giá -->
                        <button class="btn-theo-doi" style="background: #27ae60; border-color: #27ae60;" onclick="moModalDanhGia()">
                            <i class="fas fa-star"></i> <span>Đánh giá</span>
                        </button>
                    </div>

                    <p style="text-align: justify; margin-top: 20px; line-height: 1.6;">
                        <i>${truyen.moTaTruyen || 'Truyện chưa có mô tả...'}</i>
                    </p>
                </div>
            `;
        })
        .catch(err => {
            console.error("Lỗi API Thông tin:", err);
            document.getElementById('khungThongTinTruyen').innerHTML = '<p style="color:red;">Lỗi tải thông tin truyện!</p>';
        });

    // =========================================================
    // 2. GỌI API LẤY DANH SÁCH CHƯƠNG (CÓ TÌM KIẾM & SẮP XẾP)
    // =========================================================
    fetch(`${BASE_API}/v1/truyen/${truyenId}/chuong`)
        .then(res => res.json())
        .then(danhSachChuong => {
            const khungChuong = document.getElementById('khungDanhSachChuong');
            
            if (danhSachChuong.length === 0) {
                khungChuong.innerHTML = '<p style="color: #888;">Truyện này chưa có chương nào.</p>';
                return;
            }

            const chuongDau = danhSachChuong[0];
            const chuongMoi = danhSachChuong[danhSachChuong.length - 1];

            // VẼ BỘ KHUNG BÊN NGOÀI TRƯỚC
            khungChuong.innerHTML = `
                <div class="ds-chuong-container">
                    <div class="ds-chuong-buttons">
                        <a href="doc-truyen.html?truyenId=${truyenId}&chuongId=${chuongDau.id}" class="btn-chuong">
                            <div class="btn-chuong-sub">Chương đầu</div>
                            <div class="btn-chuong-main">${chuongDau.tenChuong}</div>
                        </a>
                        <a href="doc-truyen.html?truyenId=${truyenId}&chuongId=${chuongMoi.id}" class="btn-chuong">
                            <div class="btn-chuong-sub">Chương mới</div>
                            <div class="btn-chuong-main">${chuongMoi.tenChuong}</div>
                        </a>
                    </div>
                    
                    <div class="ds-chuong-tools">
                        <span id="nutSapXep"><i class="fas fa-arrow-down-z-a"></i> Mới nhất</span>
                        <input type="text" id="oTimKiem" class="ds-chuong-search" placeholder="Tìm chương tại đây">
                    </div>
                    
                    <div class="ds-chuong-list" id="danhSachCacChuong">
                        <!-- Danh sách chương sẽ được chèn tự động vào đây -->
                    </div>
                </div>
            `;

            // LẤY CÁC NÚT VÀ KHUNG VỪA TẠO
            const vungChuaChuong = document.getElementById('danhSachCacChuong');
            const nutSapXep = document.getElementById('nutSapXep');
            const oTimKiem = document.getElementById('oTimKiem');
            
            // Trạng thái mặc định ban đầu
            let kieuSapXep = 'moi-nhat'; 

            // TẠO HÀM VẼ DANH SÁCH CHƯƠNG ĐỂ GỌI ĐI GỌI LẠI
            function hienThiDanhSach(tuKhoa) {
                // Copy mảng gốc để không làm hỏng dữ liệu
                let dsHienThi = [...danhSachChuong]; 

                // A. Xử lý chức năng Tìm kiếm
                if (tuKhoa) {
                    tuKhoa = tuKhoa.toLowerCase();
                    // Chỉ giữ lại những chương có tên chứa từ khóa
                    dsHienThi = dsHienThi.filter(c => c.tenChuong.toLowerCase().includes(tuKhoa));
                }

                // B. Xử lý chức năng Sắp xếp
                if (kieuSapXep === 'moi-nhat') {
                    dsHienThi.reverse(); // Lộn ngược mảng để mới nhất lên đầu
                    nutSapXep.innerHTML = '<i class="fas fa-arrow-down-z-a"></i> Mới nhất';
                } else {
                    // Để nguyên mảng gốc (cũ nhất lên đầu)
                    nutSapXep.innerHTML = '<i class="fas fa-arrow-down-a-z"></i> Cũ nhất';
                }

                // C. Tạo HTML và gắn vào màn hình
                let htmlChuong = '';
                dsHienThi.forEach(chuong => {
                    let ngayHienThi = "Đang cập nhật";
                    if (chuong.ngayDang) {
                        const mangNgay = chuong.ngayDang.split('-'); 
                        ngayHienThi = `${mangNgay[2]}/${mangNgay[1]}/${mangNgay[0]}`;
                    }

                    const luotXemHienThi = dinhDangLuotXem(chuong.luotXem !== null ? chuong.luotXem : 0);

                    htmlChuong += `
                        <a href="doc-truyen.html?truyenId=${truyenId}&chuongId=${chuong.id}" class="chuong-item">
                            <div class="chuong-info-left">
                                <strong>${chuong.tenChuong}</strong>
                                <span>${ngayHienThi}</span>
                            </div>
                            <div class="chuong-info-right">
                                <span>${luotXemHienThi} lượt xem</span>
                                <i class="fas fa-download" title="Tải xuống"></i>
                            </div>
                        </a>
                    `;
                });
                
                // Nếu tìm không thấy thì báo lỗi
                if(dsHienThi.length === 0) {
                    htmlChuong = '<p style="text-align:center; padding: 20px; color:#888;">Không tìm thấy chương nào phù hợp!</p>';
                }
                
                vungChuaChuong.innerHTML = htmlChuong;
            }

            // Gọi hàm lần đầu tiên để vẽ ra màn hình
            hienThiDanhSach('');

            // LẮNG NGHE SỰ KIỆN KHI NGƯỜI DÙNG TƯƠNG TÁC
            
            // Khi bấm vào chữ "Mới nhất / Cũ nhất"
            nutSapXep.addEventListener('click', function() {
                if (kieuSapXep === 'moi-nhat') {
                    kieuSapXep = 'cu-nhat';
                } else {
                    kieuSapXep = 'moi-nhat';
                }
                // Vẽ lại danh sách nhưng vẫn giữ nguyên từ khóa đang tìm kiếm
                hienThiDanhSach(oTimKiem.value); 
            });

            // Khi gõ chữ vào ô tìm kiếm
            oTimKiem.addEventListener('input', function(e) {
                // Lấy chữ vừa gõ và gọi hàm vẽ lại danh sách
                hienThiDanhSach(e.target.value);
            });
        })
        .catch(err => {
            console.error("Lỗi API Chương:", err);
            document.getElementById('khungDanhSachChuong').innerHTML = '<p style="color:red;">Lỗi tải danh sách chương!</p>';
        });
}

    // =========================================================
    // 3. TÍNH NĂNG BÌNH LUẬN TRUYỆN
    // =========================================================
    const token = localStorage.getItem('zero_token');
    const avatarUser = localStorage.getItem('zero_avatar');
    const khuVucViet = document.getElementById('khuVucVietBinhLuan');
    
    // A. Vẽ khung nhập liệu tùy theo trạng thái đăng nhập
    if(token) {
        let avatarImg = avatarUser ? avatarUser : 'https://via.placeholder.com/50';
        khuVucViet.innerHTML = `
            <img src="${avatarImg}" alt="Avatar" class="avatar-binh-luan">
            <div class="khung-nhap-lieu">
                <textarea id="noiDungBinhLuan" placeholder="Bạn nghĩ gì về bộ truyện này?"></textarea>
                <button onclick="guiBinhLuan()" class="btn-gui-binh-luan">Gửi bình luận</button>
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

    // B. Hàm Tải danh sách bình luận từ máy chủ
    window.taiBinhLuan = function() {
        fetch(`${BASE_API}/v1/truyen/${truyenId}/binh-luan`)
            .then(res => res.json())
            .then(danhSach => {
                const khungBinhLuan = document.getElementById('danhSachBinhLuan');
                document.getElementById('tongSoBinhLuan').innerText = danhSach.length;

                if(danhSach.length === 0) {
                    khungBinhLuan.innerHTML = '<p style="text-align:center; color:#888;">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
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

                    let tagChuong = '';
                    if(bl.chuong) {
                        tagChuong = `<span class="tag-chuong">[${bl.chuong.tenChuong}]</span>`;
                    }

                    // TẠO MENU 3 CHẤM (CHỈ HIỆN KHI ĐÚNG CHỦ TÀI KHOẢN)
                    const currentUser = localStorage.getItem('zero_user');
                    let menuThaoTac = '';
                    if (currentUser === ten) {
                        menuThaoTac = `
                            <div class="menu-binh-luan-container">
                                <button class="btn-3-cham" onclick="toggleMenuBinhLuan(${bl.id}, event)">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div id="menu-bl-${bl.id}" class="dropdown-binh-luan">
                                    <button onclick="moKhungSuaBinhLuan(${bl.id})"><i class="fas fa-edit"></i> Sửa</button>
                                    <button class="nut-xoa" onclick="hienThiModalXoaBinhLuan(${bl.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
                                </div>
                            </div>
                        `;
                    }

                    html += `
                        <div class="item-binh-luan">
                            <img src="${avt}" alt="Avatar" class="avatar-binh-luan">
                            <div class="chi-tiet-binh-luan">
                                <div class="ten-nguoi-binh-luan" style="width: 100%;">
                                    ${ten} ${tagChuong} <span class="thoi-gian-binh-luan">${thoiGianHienThi}</span>
                                    ${menuThaoTac}
                                </div>
                                <div class="noi-dung-binh-luan" id="noi-dung-bl-${bl.id}">${bl.noiDung}</div>
                            </div>
                        </div>
                    `;
                });
                khungBinhLuan.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải bình luận:", err));
    };

    // C. Hàm Gửi bình luận lên máy chủ
    window.guiBinhLuan = function() {
        const oNhap = document.getElementById('noiDungBinhLuan');
        const noiDung = oNhap.value.trim();
        if(!noiDung) { alert("Vui lòng nhập nội dung bình luận!"); return; }

        fetch(`${BASE_API}/v1/binh-luan?truyenId=${truyenId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ noiDung: noiDung })
        })
        .then(res => res.text())
        .then(data => {
            if(data.includes("Lỗi")) alert(data);
            else { oNhap.value = ''; taiBinhLuan(); }
        }).catch(err => alert("Lỗi kết nối máy chủ!"));
    };

    // D. Đóng mở menu 3 chấm
    window.toggleMenuBinhLuan = function(id, event) {
        event.stopPropagation(); 
        document.querySelectorAll('.dropdown-binh-luan.show').forEach(menu => {
            if (menu.id !== `menu-bl-${id}`) menu.classList.remove('show');
        });
        document.getElementById(`menu-bl-${id}`).classList.toggle('show');
    };
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-binh-luan.show').forEach(m => m.classList.remove('show'));
    });

    // E. SỬA BÌNH LUẬN TRỰC TIẾP TRÊN GIAO DIỆN
    window.moKhungSuaBinhLuan = function(id) {
        const divNoiDung = document.getElementById(`noi-dung-bl-${id}`);
        if (divNoiDung.querySelector('textarea')) return; // Chặn mở nhiều khung

        const noiDungGoc = divNoiDung.innerText;
        const noiDungEncoded = encodeURIComponent(noiDungGoc);

        divNoiDung.innerHTML = `
            <textarea id="input-sua-bl-${id}" class="textarea-sua-bl">${noiDungGoc}</textarea>
            <div class="hanh-dong-sua-bl">
                <button class="btn-huy-sua" onclick="huySuaBinhLuan(${id}, '${noiDungEncoded}')">Hủy</button>
                <button class="btn-luu-sua" onclick="luuSuaBinhLuan(${id})">Lưu</button>
            </div>
        `;
    };

    window.huySuaBinhLuan = function(id, noiDungEncoded) {
        document.getElementById(`noi-dung-bl-${id}`).innerText = decodeURIComponent(noiDungEncoded);
    };

    window.luuSuaBinhLuan = function(id) {
        const noiDungMoi = document.getElementById(`input-sua-bl-${id}`).value.trim();
        if (!noiDungMoi) { alert("Nội dung không được để trống!"); return; }

        fetch(`${BASE_API}/v1/binh-luan/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ noiDung: noiDungMoi })
        })
        .then(res => res.text())
        .then(data => {
            if(data.includes("Lỗi")) alert(data);
            else taiBinhLuan(); 
        });
    };

    // F. XÓA BÌNH LUẬN (HIỆN CỬA SỔ MODAL)
    window.hienThiModalXoaBinhLuan = function(id) {
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
                        <button class="btn-modal-huy" onclick="dongModalXoaBinhLuan()">Hủy</button>
                        <button class="btn-modal-xac-nhan" id="btnXacNhanXoaBL">Xóa</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.add('show');
        document.getElementById('btnXacNhanXoaBL').onclick = function() {
            thucHienXoaBinhLuan(id);
        };
    };

    window.dongModalXoaBinhLuan = function() {
        document.getElementById('modalXoaBinhLuan').classList.remove('show');
    };

    window.thucHienXoaBinhLuan = function(id) {
        fetch(`${BASE_API}/v1/binh-luan/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.text())
        .then(data => { 
            dongModalXoaBinhLuan();
            if(data.includes("Lỗi")) alert(data); 
            else taiBinhLuan(); 
        });
    };

    // Gọi lần đầu để tải danh sách
    taiBinhLuan();

    // =========================================================
    // 4. TÍNH NĂNG THEO DÕI TRUYỆN
    // =========================================================
    
    // Hàm kiểm tra xem lúc mở trang đã theo dõi chưa (để tô đỏ nút)
    function kiemTraTrangThaiTheoDoi() {
        const tokenUser = localStorage.getItem('zero_token');
        if (!tokenUser || !truyenId) return; // Khách vãng lai thì bỏ qua

        fetch(`${BASE_API}/v1/theo-doi/kiem-tra/${truyenId}`, {
            headers: { 'Authorization': `Bearer ${tokenUser}` }
        })
        .then(res => res.json())
        .then(daTheoDoi => {
            const btn = document.getElementById('btnTheoDoi');
            if (btn && daTheoDoi === true) {
                btn.classList.add('da-theo-doi');
                btn.innerHTML = `<i class="fas fa-heart"></i> <span>Đã theo dõi</span>`;
            }
        })
        .catch(err => console.log("Lỗi kiểm tra theo dõi:", err));
    }

    // Hàm bấm nút để Theo dõi / Hủy theo dõi
    window.thaoTacTheoDoi = function() {
        const tokenUser = localStorage.getItem('zero_token');
        if (!tokenUser) {
            alert("Vui lòng đăng nhập để theo dõi truyện!");
            window.location.href = 'dang-nhap.html';
            return;
        }

        fetch(`${BASE_API}/v1/theo-doi/${truyenId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenUser}` }
        })
        .then(res => res.text())
        .then(thongBao => {
            const btn = document.getElementById('btnTheoDoi');
            if (thongBao.includes("Đã thêm")) {
                btn.classList.add('da-theo-doi');
                btn.innerHTML = `<i class="fas fa-heart"></i> <span>Đã theo dõi</span>`;
            } else if (thongBao.includes("Đã hủy")) {
                btn.classList.remove('da-theo-doi');
                btn.innerHTML = `<i class="far fa-heart"></i> <span>Theo dõi</span>`;
            }
        })
        .catch(err => alert("Lỗi kết nối đến máy chủ!"));
    };

    // Gọi hàm kiểm tra ngay khi mở trang
    kiemTraTrangThaiTheoDoi();

// =========================================================
// CHỨC NĂNG: MODAL ĐÁNH GIÁ SAO VÀ VIẾT BÌNH LUẬN
// =========================================================
let diemDanhGiaHienTai = 5; // Mặc định 5 sao
let idDanhGiaCuaToi = null; // BIẾN MỚI ĐỂ LƯU ID ĐÁNH GIÁ CŨ (NẾU CÓ)

window.moModalDanhGia = async function() {
    const token = localStorage.getItem('zero_token');
    if (!token) {
        alert("Bạn cần đăng nhập để đánh giá truyện!");
        window.location.href = 'dang-nhap.html';
        return;
    }

    let daĐanhGia = false;
    let noiDungCu = '';
    diemDanhGiaHienTai = 5;

    // Gọi API xem đã đánh giá chưa trước khi vẽ form
    try {
        const res = await fetch(`${BASE_API}/v1/tuong-tac/danh-gia/${truyenId}/cua-toi`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const dataText = await res.text();
            if (dataText) { 
                const dg = JSON.parse(dataText);
                daĐanhGia = true;
                idDanhGiaCuaToi = dg.id;
                diemDanhGiaHienTai = dg.diem;
                noiDungCu = dg.noiDung || '';
            }
        }
    } catch (e) { console.log("Lỗi lấy đánh giá cũ", e); }

    let modal = document.getElementById('modalDanhGiaTruyen');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalDanhGiaTruyen';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    let tieuDe = daĐanhGia ? 'Chỉnh sửa đánh giá' : 'Đánh giá truyện';
    let chuNutLuu = daĐanhGia ? 'Cập nhật' : 'Gửi đánh giá';
    let nutXoa = daĐanhGia ? `<button class="btn-modal-xac-nhan" style="background:#e74c3c; margin-right:auto;" onclick="xoaDanhGiaCuaToi()">Xóa đánh giá</button>` : '';

    modal.innerHTML = `
        <div class="modal-box">
            <i class="fas fa-star modal-icon" style="color:#f39c12"></i>
            <h3>${tieuDe}</h3>
            <div class="sao-tuong-tac" id="saoDanhGiaModal" style="font-size: 30px; margin: 15px 0;">
                ${taoHtmlSaoDanhGia(diemDanhGiaHienTai)}
            </div>
            <div class="khung-nhap-danh-gia">
                <textarea id="noiDungDanhGiaModal" placeholder="Chia sẻ cảm nghĩ của bạn về truyện này (Có thể để trống)...">${noiDungCu}</textarea>
            </div>
            <div class="modal-buttons" style="margin-top: 20px; display:flex; gap:10px;">
                ${nutXoa}
                <button class="btn-modal-huy" onclick="dongModalDanhGia()">Hủy</button>
                <button class="btn-modal-xac-nhan" style="background:#f39c12" onclick="guiDanhGiaTruyen()">${chuNutLuu}</button>
            </div>
        </div>
    `;
    modal.classList.add('show');
};

function taoHtmlSaoDanhGia(diem) {
    let html = '';
    for(let i=1; i<=5; i++) {
        let mauSao = i <= diem ? '#f39c12' : '#555';
        html += `<i class="fas fa-star" style="color:${mauSao}; cursor: pointer; transition: 0.2s; margin-right: 5px;" 
                    onclick="chonSaoModal(${i})"></i>`;
    }
    return html;
}

window.chonSaoModal = function(diemClick) {
    diemDanhGiaHienTai = diemClick; // Lưu lại số điểm vừa bấm
    
    // Đổi màu trực tiếp các ngôi sao theo số điểm vừa bấm
    const cacSao = document.querySelectorAll('#saoDanhGiaModal .fas.fa-star');
    if(!cacSao) return;
    cacSao.forEach((sao, index) => {
        if (index < diemDanhGiaHienTai) {
            sao.style.color = '#f39c12'; // Sáng màu cam
        } else {
            sao.style.color = '#555';    // Tắt thành màu xám
        }
    });
};

window.dongModalDanhGia = function() {
    document.getElementById('modalDanhGiaTruyen').classList.remove('show');
};

window.guiDanhGiaTruyen = function() {
    const noiDung = document.getElementById('noiDungDanhGiaModal').value.trim();
    const token = localStorage.getItem('zero_token');

    fetch(`${BASE_API}/v1/tuong-tac/danh-gia/${truyenId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ diem: diemDanhGiaHienTai, noiDung: noiDung })
    })
    .then(async res => {
        // Phân tách rõ ràng luồng thành công và luồng lỗi
        const text = await res.text();
        if (res.ok) {
            alert(text); // Sẽ hiện "Đánh giá thành công!"
            dongModalDanhGia();
            window.location.reload(); 
        } else {
            alert(text || "Lỗi xử lý đánh giá từ máy chủ."); 
        }
    })
    .catch(err => {
        console.error("Lỗi:", err);
        alert("Lỗi kết nối đến máy chủ Backend!");
    });
};

// Hàm mới: Hỗ trợ Xóa Đánh giá từ trong Modal
window.xoaDanhGiaCuaToi = function() {
    if(!idDanhGiaCuaToi) return;
    if(confirm("Bạn có chắc chắn muốn xóa bài đánh giá này không? Mọi lịch sử đánh giá sẽ bị mất.")) {
        const token = localStorage.getItem('zero_token');
        fetch(`${BASE_API}/v1/tuong-tac/danh-gia/${idDanhGiaCuaToi}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(async res => {
            const text = await res.text();
            alert(text);
            if(res.ok) window.location.reload();
        })
        .catch(err => alert("Lỗi kết nối đến máy chủ!"));
    }
};

// =========================================================
// CHỨC NĂNG: XEM TẤT CẢ ĐÁNH GIÁ (CÓ LỌC SAO)
// =========================================================
let danhSachDanhGiaGoc = [];

window.moModalXemDanhGia = function() {
    let modal = document.getElementById('modalXemDanhGia');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalXemDanhGia';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box modal-ds-danh-gia">
                <h3>Đánh giá từ Độc giả</h3>
                
                <div class="bo-loc-sao" id="boLocSao">
                    <button class="btn-loc-sao active" onclick="locDanhGia(0, this)">Tất cả</button>
                    <button class="btn-loc-sao" onclick="locDanhGia(5, this)">5 Sao</button>
                    <button class="btn-loc-sao" onclick="locDanhGia(4, this)">4 Sao</button>
                    <button class="btn-loc-sao" onclick="locDanhGia(3, this)">3 Sao</button>
                    <button class="btn-loc-sao" onclick="locDanhGia(2, this)">2 Sao</button>
                    <button class="btn-loc-sao" onclick="locDanhGia(1, this)">1 Sao</button>
                </div>

                <div class="khung-cuon-danh-gia" id="khungChuaDanhGia">
                    <p style="text-align:center; color:#888; margin-top: 20px;">Đang tải...</p>
                </div>

                <button class="btn-modal-huy" style="width: 100%;" onclick="dongModalXemDanhGia()">Đóng</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('show');
    taiDanhGiaTuMayChu();
};

function taiDanhGiaTuMayChu() {
    fetch(`${BASE_API}/v1/tuong-tac/danh-gia/${truyenId}`)
        .then(res => {
            // Kiểm tra trước xem máy chủ có chặn không
            if (!res.ok) {
                throw new Error("Máy chủ từ chối kết nối (Mã lỗi: " + res.status + ")");
            }
            return res.json();
        })
        .then(ds => {
            danhSachDanhGiaGoc = ds.reverse(); // Mới nhất lên đầu
            hienThiDanhSachDanhGia(danhSachDanhGiaGoc);
        })
        .catch(err => {
            console.error("Lỗi tải đánh giá:", err);
            const khung = document.getElementById('khungChuaDanhGia');
            if(khung) {
                // Thông báo lỗi màu đỏ
                khung.innerHTML = `<p style="text-align:center; color:#e74c3c; margin-top: 20px;">Lỗi tải dữ liệu: ${err.message}. Vui lòng kiểm tra lại SecurityConfig ở Backend!</p>`;
            }
        });
}

window.locDanhGia = function(diem, btnNode) {
    // Đổi màu nút lọc
    document.querySelectorAll('#boLocSao .btn-loc-sao').forEach(b => b.classList.remove('active'));
    btnNode.classList.add('active');

    if(diem === 0) hienThiDanhSachDanhGia(danhSachDanhGiaGoc);
    else {
        const dsLoc = danhSachDanhGiaGoc.filter(dg => dg.diem === diem);
        hienThiDanhSachDanhGia(dsLoc);
    }
};

window.anHienNoiDungDai = function(btn) {
    const ndRutGon = btn.previousElementSibling.previousElementSibling;
    const ndDayDu = btn.previousElementSibling;
    
    if (ndDayDu.style.display === 'none') {
        ndRutGon.style.display = 'none';
        ndDayDu.style.display = 'inline';
        btn.innerText = ' Thu gọn';
    } else {
        ndRutGon.style.display = 'inline';
        ndDayDu.style.display = 'none';
        btn.innerText = ' Xem thêm';
    }
};

function hienThiDanhSachDanhGia(ds) {
    const khung = document.getElementById('khungChuaDanhGia');
    if(ds.length === 0) {
        khung.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20px;">Không có đánh giá nào phù hợp.</p>';
        return;
    }

    let html = '';
    ds.forEach(dg => {
        let ten = (dg.nguoiDung && dg.nguoiDung.tenTaiKhoan) ? dg.nguoiDung.tenTaiKhoan : 'Ẩn danh';
        let avt = (dg.nguoiDung && dg.nguoiDung.anhDaiDien) ? (dg.nguoiDung.anhDaiDien.startsWith('http') ? dg.nguoiDung.anhDaiDien : `${BASE_API}/uploads/${dg.nguoiDung.anhDaiDien}`) : 'https://via.placeholder.com/30';
        
        let ndGoc = dg.noiDung ? dg.noiDung : '<i>Đánh giá không có nội dung.</i>';
        let ndHienThi = ndGoc;
        
        if (ndGoc.length > 150 && !ndGoc.includes('<i>')) {
            let ndRutGon = ndGoc.substring(0, 150) + '...';
            ndHienThi = `
                <span class="nd-rut-gon">${ndRutGon}</span>
                <span class="nd-day-du" style="display:none; word-wrap: break-word;">${ndGoc}</span>
                <span class="btn-xem-them" style="color:#f39c12; cursor:pointer; font-size:13px; font-weight:bold; margin-left:5px;" onclick="anHienNoiDungDai(this)"> Xem thêm</span>
            `;
        }
        
        let thoiGianHienThi = "";
        if(dg.thoiGian) {
            let date = new Date(dg.thoiGian);
            thoiGianHienThi = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
        }

        html += `
            <div class="item-danh-gia">
                <div class="item-dg-header">
                    <div class="item-dg-user"><img src="${avt}"> ${ten}</div>
                    <div class="item-dg-sao">${taoGiaoDienSao(dg.diem)}</div>
                </div>
                <div class="item-dg-noidung">${ndHienThi}</div>
                <div class="item-dg-time" style="text-align: right; margin-top: 5px;">${thoiGianHienThi}</div>
            </div>
        `;
    });
    khung.innerHTML = html;
}

window.dongModalXemDanhGia = function() {
    document.getElementById('modalXemDanhGia').classList.remove('show');
};