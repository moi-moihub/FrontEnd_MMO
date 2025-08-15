function adjustMarginTop() {
    var navbar = document.querySelector('.navbar');
    var content = document.querySelector('.container');
    if (navbar && content) {
        content.style.marginTop = navbar.offsetHeight + 'px';
    }
}

window.onload = adjustMarginTop;
window.onresize = adjustMarginTop;



let currentBalance = 0;
const MIN_DEPOSIT_AMOUNT = 20000;

async function updateUserInfo() {
    try {
        const response = await fetch('/api/ApiUsers/GetUserInfo');
        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        const newBalance = data.money;

        // Lấy số dư cũ từ sessionStorage (nếu có)
        const storedBalance = parseFloat(sessionStorage.getItem('lastBalance')) || 0;

        // Cập nhật hiển thị
        document.getElementById("balanceAmount").textContent = "Số dư: " + newBalance.toLocaleString() + " VND";

        // Chỉ kiểm tra nạp tiền nếu đã có giá trị balance trước đó (tránh thông báo khi mới load trang)
        if (currentBalance > 0 && newBalance > currentBalance + MIN_DEPOSIT_AMOUNT) {
            showDepositSuccess(newBalance - currentBalance);
        }

        // Kiểm tra nếu có thay đổi từ phiên trước (khi F5 trang)
        if (storedBalance > 0 && newBalance > storedBalance + MIN_DEPOSIT_AMOUNT) {
            showDepositSuccess(newBalance - storedBalance);
        }

        // Cập nhật số dư hiện tại và lưu vào sessionStorage
        currentBalance = newBalance;
        sessionStorage.setItem('lastBalance', newBalance.toString());

    } catch (error) {
        console.error("Error updating user info:", error);
    }
}

function showDepositSuccess(amount) {
    // Kiểm tra xem thông báo đã tồn tại chưa để tránh hiển thị trùng
    if (document.getElementById('depositSuccessNotification')) return;

    const notification = document.createElement('div');
    notification.id = 'depositSuccessNotification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.backgroundColor = '#28a745';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.style.zIndex = '10000';
    notification.style.animation = 'slideIn 0.5s forwards';
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="bi bi-check-circle-fill" style="font-size: 1.5rem; margin-right: 10px;"></i>
            <div>
                <h5 style="margin: 0 0 5px 0;">Nạp tiền thành công!</h5>
                <p style="margin: 0;">Số tiền: +${amount.toLocaleString()} VND</p>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Thêm CSS cho animation
if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function () {
    // Lấy số dư từ sessionStorage khi tải trang
    const storedBalance = sessionStorage.getItem('lastBalance');
    if (storedBalance) {
        currentBalance = parseFloat(storedBalance);
    }

    // Gọi lần đầu tiên
    updateUserInfo();

    // Cập nhật định kỳ
    setInterval(updateUserInfo, 10000);
});