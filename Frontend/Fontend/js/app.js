// =========================================================
// CẤU HÌNH ĐỊA CHỈ MÁY CHỦ BACKEND (Sửa ở đây khi đưa lên Internet)
// =========================================================
// Hiện tại chạy dưới máy tính (Local):
const BASE_API = 'http://localhost:8080'; 

// SAU NÀY ĐƯA LÊN MẠNG, bạn chỉ cần comment dòng trên lại và mở dòng dưới ra:
// const BASE_API = 'https://dia-chi-backend-cua-ban.com';

// HÀM TỰ ĐỘNG VẼ SAO DỰA TRÊN ĐIỂM SỐ
function taoGiaoDienSao(diem) {
    let saoHtml = '';
    let diemXet = diem ? parseFloat(diem) : 0;
    
    for (let i = 1; i <= 5; i++) {
        if (diemXet >= i) {
            saoHtml += '<i class="fas fa-star"></i>'; // Sao đặc
        } else if (diemXet >= i - 0.5) {
            saoHtml += '<i class="fas fa-star-half-alt"></i>'; // Sao khuyết
        } else {
            saoHtml += '<i class="far fa-star"></i>'; // Sao rỗng
        }
    }
    return saoHtml;
}

// =========================================================
// 1. CHỨC NĂNG: ẨN/HIỆN THANH ĐIỀU HƯỚNG KHI CUỘN TRANG
// =========================================================
let viTriCuonCu = 0;
const thanhDieuHuong = document.getElementById("thanh-dieu-huong");

// Kiểm tra xem có thẻ thanh-dieu-huong không rồi mới chạy để tránh lỗi
if (thanhDieuHuong) {
    window.addEventListener("scroll", function() {
        let viTriCuonHienTai = window.pageYOffset || document.documentElement.scrollTop;

        if (viTriCuonHienTai > viTriCuonCu) {
            // Cuộn xuống -> Ẩn thanh menu
            thanhDieuHuong.style.transform = "translateY(-100%)";
        } else {
            // Cuộn lên -> Hiện thanh menu
            thanhDieuHuong.style.transform = "translateY(0)";
        }
        
        viTriCuonCu = viTriCuonHienTai <= 0 ? 0 : viTriCuonHienTai;
    });
}

// =========================================================
// 2. CHỨC NĂNG: GỌI API & PHÂN TRANG (TRUYỆN MỚI & TRUYỆN HAY)
// =========================================================
fetch(`${BASE_API}/v1/truyen`)
    .then(response => response.json())
    .then(data => {
        const tatCaTruyen = data.content || data; 
        if (tatCaTruyen.length === 0) return;

        // --- MẢNG 1: TRUYỆN MỚI CẬP NHẬT ---
        const danhSachTruyenMoi = [...tatCaTruyen].sort((a, b) => new Date(b.thoiGianCapNhat || 0) - new Date(a.thoiGianCapNhat || 0));
        
        // --- MẢNG 2: TRUYỆN HAY (Xếp hạng theo Điểm Sao và Lượt đánh giá) ---
        const danhSachTruyenHay = [...tatCaTruyen].sort((a, b) => {
            const diemA = a.diemTrungBinh || 0; const diemB = b.diemTrungBinh || 0;
            if (diemB !== diemA) return diemB - diemA; // Ưu tiên số sao
            return (b.luotDanhGia || 0) - (a.luotDanhGia || 0); // Nếu bằng sao thì so lượt đánh giá
        });

        // ========================================
        // KHU VỰC A: XỬ LÝ SIDEBAR TRUYỆN HAY (Load More)
        // ========================================
        let trangHay = 1;
        const SO_TRUYEN_HAY_1_LAN = 5;
        const khungTruyenHay = document.getElementById('khungTruyenHay');
        const btnXemThemHay = document.getElementById('btnXemThemTruyenHay');

        function renderTruyenHay(append = false) {
            if (!khungTruyenHay) return;
            const batDau = (trangHay - 1) * SO_TRUYEN_HAY_1_LAN;
            const ketThuc = batDau + SO_TRUYEN_HAY_1_LAN;
            const dsHienThi = danhSachTruyenHay.slice(batDau, ketThuc);

            let html = '';
            dsHienThi.forEach(truyen => {
                const linkAnh = truyen.anhBia ? `${BASE_API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/70x95';
                const diem = truyen.diemTrungBinh ? truyen.diemTrungBinh.toFixed(1) : "0";
                html += `
                    <a href="chi-tiet.html?id=${truyen.id}" class="item-truyen-hay">
                        <img src="${linkAnh}" alt="${truyen.tenTruyen}">
                        <div class="info-truyen-hay">
                            <h4>${truyen.tenTruyen}</h4>
                            <div class="sao"><i class="fas fa-star"></i> ${diem} <span style="color:#888; font-weight:normal; font-size:11px;">(${truyen.luotDanhGia || 0})</span></div>
                            <div style="font-size:12px; color:#888; margin-top:5px;"><i class="fas fa-eye"></i> ${truyen.luotXem || 0} view</div>
                        </div>
                    </a>
                `;
            });

            if (append) khungTruyenHay.innerHTML += html;
            else khungTruyenHay.innerHTML = html;

            // Ẩn nút nếu đã load hết
            if (ketThuc >= danhSachTruyenHay.length && btnXemThemHay) btnXemThemHay.style.display = 'none';
        }
        
        // Khởi chạy Sidebar
        if (khungTruyenHay) {
            renderTruyenHay(false);
            if (btnXemThemHay) {
                btnXemThemHay.addEventListener('click', () => { trangHay++; renderTruyenHay(true); });
            }
        }

        // ========================================
        // KHU VỰC B: XỬ LÝ MAIN TRUYỆN MỚI (Load More + Nút Số)
        // ========================================
        let trangMoi = 1;
        const SO_TRUYEN_MOI_1_TRANG = 12; // Chia hết cho 3,4 cột trên lưới Grid
        const khungTruyenMoi = document.getElementById('khungChuaTruyen');
        const btnXemThemMoi = document.getElementById('btnXemThemTruyenMoi');
        const thanhPhanTrang = document.getElementById('thanhPhanTrangMoi');
        const tongSoTrangMoi = Math.ceil(danhSachTruyenMoi.length / SO_TRUYEN_MOI_1_TRANG);

        function renderTruyenMoi(trang, append = false) {
            if (!khungTruyenMoi) return;
            const batDau = (trang - 1) * SO_TRUYEN_MOI_1_TRANG;
            const ketThuc = batDau + SO_TRUYEN_MOI_1_TRANG;
            const dsHienThi = danhSachTruyenMoi.slice(batDau, ketThuc);

            let html = '';
            dsHienThi.forEach(truyen => {
                const linkAnh = truyen.anhBia ? `${BASE_API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/220x280?text=No+Img';
                const soChuong = truyen.tongSoChuong || 0;
                const diem = truyen.diemTrungBinh || 0;
                const diemHienThi = diem === 0 ? "0" : diem.toFixed(1);

                html += `
                    <a href="chi-tiet.html?id=${truyen.id}" style="text-decoration: none; color: inherit;">
                        <div class="card">
                            <img src="${linkAnh}" alt="${truyen.tenTruyen}" style="width:100%; border-radius:5px;">
                            <h3>${truyen.tenTruyen}</h3>
                            <p class="thong-tin-chuong">Chương ${soChuong}</p>
                            <div class="danh-gia-sao">
                                ${typeof taoGiaoDienSao === 'function' ? taoGiaoDienSao(diem) : ''}
                                <span>${diemHienThi}</span>
                            </div>
                            <p>Tác giả: <b>${truyen.tacGia || 'Đang cập nhật'}</b></p>
                            <span class="badge">${truyen.trangThai || 'Đang ra'}</span>
                        </div>
                    </a>
                `;
            });

            if (append) khungTruyenMoi.innerHTML += html; // Nút xem thêm: Nối tiếp vào dưới
            else khungTruyenMoi.innerHTML = html; // Phân trang số: Ghi đè

            // Quản lý trạng thái nút Xem thêm
            if (ketThuc >= danhSachTruyenMoi.length && btnXemThemMoi) btnXemThemMoi.style.display = 'none';
            else if (btnXemThemMoi) btnXemThemMoi.style.display = 'inline-block';

            veThanhPhanTrang(trang);
        }

        function veThanhPhanTrang(trangHienHanh) {
            if (!thanhPhanTrang || tongSoTrangMoi <= 1) return;
            let html = '';
            for (let i = 1; i <= tongSoTrangMoi; i++) {
                const activeClass = i === trangHienHanh ? 'active' : '';
                html += `<button class="${activeClass}" onclick="chuyenTrangTruyenMoi(${i})">${i}</button>`;
            }
            thanhPhanTrang.innerHTML = html;
        }

        // Sự kiện: Bấm NÚT SỐ
        window.chuyenTrangTruyenMoi = function(trang) {
            trangMoi = trang;
            renderTruyenMoi(trangMoi, false); // Ghi đè mới hoàn toàn
            khungTruyenMoi.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Cuộn lên đầu
        };

        // Khởi chạy Main Truyện Mới
        if (khungTruyenMoi) {
            renderTruyenMoi(1, false);
            // Sự kiện: Bấm NÚT XEM THÊM
            if (btnXemThemMoi) {
                btnXemThemMoi.addEventListener('click', () => {
                    trangMoi++;
                    renderTruyenMoi(trangMoi, true); // Nối tiếp truyện xuống dưới
                });
            }
        }

        // ========================================
        // KHU VỰC C: SIDEBAR TRUYỆN PHỔ BIẾN (RANKING TABS)
        // ========================================
        window.loadTruyenPhoBien = function(kieu, btnNode) {
            const khung = document.getElementById('khungTruyenPhoBien');
            if (!khung) return;

            // Đổi màu tab được bấm
            if (btnNode) {
                document.querySelectorAll('.tab-pb').forEach(btn => btn.classList.remove('active'));
                btnNode.classList.add('active');
            } else {
                // Mặc định nút Tuần sáng lên khi tải trang
                const nutTuan = document.querySelector('.tab-pb');
                if(nutTuan) nutTuan.classList.add('active');
            }

            // Copy mảng gốc để xào nấu
            let dsSort = [...tatCaTruyen];

            // Xử lý sắp xếp theo Tab
            if (kieu === 'tat-ca') {
                // Tất cả: Sắp xếp theo cột Lượt xem (chuẩn xác nhất)
                dsSort.sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0));
            } else if (kieu === 'thang') {
                // Tháng: Tạm mô phỏng bằng (Lượt xem + Lượt đánh giá)
                dsSort.sort((a, b) => ((b.luotXem || 0) + (b.luotDanhGia || 0)) - ((a.luotXem || 0) + (a.luotDanhGia || 0)));
            } else {
                // Tuần: Tạm mô phỏng bằng (Lượt xem * random nhẹ) để danh sách thay đổi nhìn cho thật
                dsSort.sort((a, b) => ((b.luotXem || 0) * (1 + Math.random()*0.2)) - ((a.luotXem || 0) * (1 + Math.random()*0.2)));
            }

            // Chỉ lấy Top 5 truyện
            const top5 = dsSort.slice(0, 5);
            
            let html = '';
            top5.forEach((truyen, index) => {
                const linkAnh = truyen.anhBia ? `${BASE_API}/uploads/anh_bia/${truyen.anhBia}` : 'https://via.placeholder.com/60x85';
                const diem = truyen.diemTrungBinh ? truyen.diemTrungBinh.toFixed(2) : "0"; // Giống ảnh mẫu dùng 2 số thập phân
                
                // Trích xuất thể loại và điểm xuyết màu đỏ giống ảnh mẫu
                let chuoiTheLoai = 'Chưa cập nhật';
                if (truyen.danhSachTheLoai && truyen.danhSachTheLoai.length > 0) {
                    chuoiTheLoai = truyen.danhSachTheLoai.map((tl, i) => {
                        // Tô đỏ ngẫu nhiên thể loại thứ 2 hoặc 3 để giống thiết kế
                        if (i === 1 || i === 2) return `<span>${tl.tenTheLoai}</span>`;
                        return tl.tenTheLoai;
                    }).join(' , ');
                }

                html += `
                    <a href="chi-tiet.html?id=${truyen.id}" class="item-pho-bien">
                        <div class="rank-box">${index + 1}</div>
                        <img src="${linkAnh}" alt="${truyen.tenTruyen}">
                        <div class="info-pho-bien">
                            <h4>${truyen.tenTruyen}</h4>
                            <div class="genres">Thể loại: ${chuoiTheLoai}</div>
                            <div class="sao">
                                ${typeof taoGiaoDienSao === 'function' ? taoGiaoDienSao(diem) : ''} 
                                <span style="color:#888; margin-left:3px;">${diem}</span>
                            </div>
                        </div>
                    </a>
                `;
            });
            khung.innerHTML = html;
        };

        // Kích hoạt gọi dữ liệu lần đầu tiên (Tab Tuần)
        loadTruyenPhoBien('tuan');
    })
    
    .catch(error => {
        console.error('Lỗi:', error);
        const khungChua = document.getElementById('khungChuaTruyen');
        if(khungChua) khungChua.innerHTML = '<p style="color:red; font-weight:bold; width:100%; text-align:center;">Lỗi kết nối Backend!</p>';
    });

// =========================================================
// 3. CHỨC NĂNG: CHUYỂN ĐỔI GIAO DIỆN TỐI/SÁNG
// =========================================================
const nutGiaoDien = document.getElementById('nut-giao-dien');
const iconGiaoDien = nutGiaoDien ? nutGiaoDien.querySelector('i') : null;

if (nutGiaoDien) {
    // Kiểm tra xem lần trước người dùng đã chọn chế độ tối chưa
    const cheDoDaLuu = localStorage.getItem('giaoDien');
    if (cheDoDaLuu === 'dark') {
        document.body.classList.add('dark-mode');
        iconGiaoDien.classList.replace('fa-moon', 'fa-sun'); // Đổi thành mặt trời
    }

    // Xử lý khi người dùng bấm nút
    nutGiaoDien.addEventListener('click', function() {
        // Tự động bật/tắt class 'dark-mode' trong thẻ body
        document.body.classList.toggle('dark-mode');
        
        // Kiểm tra trạng thái hiện tại để đổi icon và lưu vào bộ nhớ
        if (document.body.classList.contains('dark-mode')) {
            iconGiaoDien.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('giaoDien', 'dark'); // Lưu cờ 'dark' vào trình duyệt
        } else {
            iconGiaoDien.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('giaoDien', 'light'); // Lưu cờ 'light' vào trình duyệt
        }
    });
}

// =====================================
// CÁC HÀM CỬA SỔ ĐĂNG XUẤT (DÙNG CHUNG TOÀN WEB)
// =====================================
window.moCuaSoDangXuat = function() {
    let modal = document.getElementById('modalDangXuatToanCuc');
    // Nếu chưa có cửa sổ trong HTML thì dùng JS tự tạo ra
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalDangXuatToanCuc';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <i class="fas fa-sign-out-alt modal-icon"></i>
                <h3>Xác nhận đăng xuất</h3>
                <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?</p>
                <div class="modal-buttons">
                    <button class="btn-modal-huy" onclick="dongCuaSoDangXuat()">Hủy</button>
                    <button class="btn-modal-xac-nhan" onclick="xacNhanDangXuatToanCuc()">Đăng xuất</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('show');
    // Ẩn menu thả xuống đi cho gọn
    const menuTaiKhoan = document.getElementById("menuTaiKhoan");
    if (menuTaiKhoan) {
        menuTaiKhoan.classList.remove("show");
    }
};

window.dongCuaSoDangXuat = function() {
    document.getElementById('modalDangXuatToanCuc').classList.remove('show');
};

window.xacNhanDangXuatToanCuc = function() {
    localStorage.removeItem("zero_token");
    localStorage.removeItem("zero_user");
    localStorage.removeItem("zero_avatar");
    window.location.href = 'index.html';
};

// =====================================
// KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (HEADER)
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("zero_token");
    const user = localStorage.getItem("zero_user");
    const avatar = localStorage.getItem("zero_avatar");

    const btnDangKi = document.getElementById("dang-ki");
    const btnDangNhap = document.getElementById("dang-nhap");

    if (token && user) {
        // Ẩn nút Đăng ký
        if (btnDangKi) btnDangKi.style.display = "none";
        
        if (btnDangNhap) {
            // Tạo hình ảnh Avatar
            let htmlAvatar = "";
            if (avatar) {
                htmlAvatar = `<img src="${avatar}" alt="Avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #f39c12; cursor: pointer;">`;
            } else {
                // Avatar mặc định nếu ko có ảnh
                htmlAvatar = `<i class="fas fa-user-circle" style="font-size: 32px; color: #f39c12; cursor: pointer;"></i>`;
            }

            // Tạo Menu Dropdown
            const htmlDropdown = `
                <div class="menu-tai-khoan" id="menuTaiKhoan">
                    <a href="cai-dat-tai-khoan.html"><i class="fas fa-cog"></i> Cài đặt tài khoản</a>
                    <a id="thucHienDangXuat" class="nut-dang-xuat"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                </div>
            `;

            // Biến nút "Đăng nhập" thành Khu vực Tài Khoản
            btnDangNhap.outerHTML = `
                <div class="khu-vuc-tai-khoan" id="khuVucTaiKhoan">
                    ${htmlAvatar}
                    ${htmlDropdown}
                </div>
            `;

            // Tính năng Bấm để Mở/Đóng Menu
            const khuVucTaiKhoan = document.getElementById("khuVucTaiKhoan");
            const menuTaiKhoan = document.getElementById("menuTaiKhoan");
            const thucHienDangXuat = document.getElementById("thucHienDangXuat");

            // Bấm vào ảnh -> Mở menu
            khuVucTaiKhoan.addEventListener("click", function(e) {
                e.stopPropagation(); // Chặn sự kiện lan ra ngoài
                menuTaiKhoan.classList.toggle("show");
            });

            // Bấm ra ngoài màn hình -> Tự động đóng menu
            document.addEventListener("click", function(e) {
                if (!khuVucTaiKhoan.contains(e.target)) {
                    menuTaiKhoan.classList.remove("show");
                }
            });

            // Bấm vào chữ "Đăng xuất" trên menu thả xuống -> Gọi cửa sổ
            if (thucHienDangXuat) {
                thucHienDangXuat.addEventListener("click", function(e) {
                    e.preventDefault();
                    window.moCuaSoDangXuat();
                });
            }
        }
    }
});

// =========================================================
// CHỨC NĂNG: NÚT CUỘN LÊN ĐẦU / XUỐNG CUỐI TRANG
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Tự động tạo khối HTML chứa 2 nút gài vào web
    const cuonTrangDiv = document.createElement('div');
    cuonTrangDiv.className = 'cuon-trang-container';
    cuonTrangDiv.innerHTML = `
        <button id="btnLenDauTrang" class="btn-cuon-trang" title="Lên đầu trang">
            <i class="fas fa-chevron-up"></i>
        </button>
        <button id="btnXuongCuoiTrang" class="btn-cuon-trang" title="Xuống cuối trang">
            <i class="fas fa-chevron-down"></i>
        </button>
    `;
    document.body.appendChild(cuonTrangDiv);

    // 2. Lấy element của 2 nút vừa tạo
    const btnLenDau = document.getElementById('btnLenDauTrang');
    const btnXuongCuoi = document.getElementById('btnXuongCuoiTrang');

    // 3. Bắt sự kiện: Cuộn quá 300px thì mới hiện nút "Lên đầu"
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btnLenDau.style.display = 'flex';
        } else {
            btnLenDau.style.display = 'none';
        }
    });

    // 4. Lệnh trượt mượt mà khi bấm nút
    btnLenDau.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnXuongCuoi.addEventListener('click', () => {
        // Lấy tổng chiều cao của toàn bộ trang web để cuộn xuống tận cùng
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
});