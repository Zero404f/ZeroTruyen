document.addEventListener("DOMContentLoaded", () => {
    // 1. Tự động chèn HTML của thông báo góc màn hình
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 2. Tự động chèn HTML của Hộp thoại Xác nhận
    if (!document.getElementById('custom-confirm-overlay')) {
        const confirmHTML = `
            <div id="custom-confirm-overlay">
                <div class="custom-confirm-box">
                    <h3><i class="fas fa-exclamation-circle" style="color:#f39c12;"></i> Yêu cầu xác nhận</h3>
                    <p id="custom-confirm-msg">Bạn có chắc chắn muốn thực hiện hành động này không?</p>
                    <div class="custom-confirm-actions">
                        <button class="btn-confirm-cancel" id="btn-confirm-cancel">Hủy bỏ</button>
                        <button class="btn-confirm-ok" id="btn-confirm-ok">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmHTML);
    }
});

// HÀM 1: GỌI THÔNG BÁO NHANH GÓC MÀN HÌNH
// Cách dùng: thongBaoNhanh("Thành công!", "success") hoặc thongBaoNhanh("Lỗi!", "error")
window.thongBaoNhanh = function(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fas fa-check-circle" style="color:#2ecc71; font-size: 20px;"></i>' 
        : '<i class="fas fa-times-circle" style="color:#e74c3c; font-size: 20px;"></i>';
    
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);
    
    // Tự động biến mất sau 3 giây
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HÀM 2: GỌI CỬA SỔ XÁC NHẬN
// Cách dùng: hopThoaiXacNhan("Câu hỏi?", function() { // Code khi bấm OK })
window.hopThoaiXacNhan = function(msg, hamKhiBamDongY) {
    const overlay = document.getElementById('custom-confirm-overlay');
    const msgEl = document.getElementById('custom-confirm-msg');
    const btnOk = document.getElementById('btn-confirm-ok');
    const btnCancel = document.getElementById('btn-confirm-cancel');

    msgEl.innerText = msg;
    overlay.style.display = 'flex';

    // Xóa bộ nhớ sự kiện cũ của nút (quan trọng để không bị chạy nhầm lệnh cũ)
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    const newBtnCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

    // Xử lý khi bấm nút Hủy
    newBtnCancel.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    // Xử lý khi bấm nút Đồng ý
    newBtnOk.addEventListener('click', () => {
        overlay.style.display = 'none';
        hamKhiBamDongY(); // Chạy hàm được truyền vào
    });
}