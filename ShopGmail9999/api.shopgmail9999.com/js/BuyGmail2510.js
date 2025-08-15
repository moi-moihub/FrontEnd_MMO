let selectedProduct = {};

$(document).ready(function () {
    $('.buy-btn').click(function () {
        const productId = $(this).data('id');
        const productName = $(this).closest('.product-item').find('.product-name').text().trim();
        const productPriceText = $(this).closest('.product-item').find('.product-price').text().replace('đ', '').trim();
        const price = parseFloat(productPriceText.replace('$', '').replace(',', ''));

        selectedProduct = {
            id: productId,
            name: productName,
            price: price
        };

        $('#modalProductName').text(productName);
        $('#modalProductPrice').text(price.toLocaleString('vi-VN'));
        $('#quantityInput').val(1);
        updateTotal();

        const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
        buyModal.show();
    });

    $('#quantityInput').on('input', updateTotal);

    function updateTotal() {
        const qty = parseInt($('#quantityInput').val()) || 0;
        const total = qty * selectedProduct.price;
        $('#totalAmount').text(total.toLocaleString('vi-VN') + 'đ');
    }

    $('#confirmBuyBtn').click(function () {
        const qty = parseInt($('#quantityInput').val()) || 1;
        const total = qty * selectedProduct.price;

        // Show loading state
        $(this).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Processing...').prop('disabled', true);

        // Get API key from storage (you need to implement how you store the API key)
        const apiKey = document.getElementById("apikey").innerText;

        if (!apiKey) {
            ShowToast('Vui lòng đăng nhập trước...', 'error');
            $('#buyModal').modal('hide');
            $('#confirmBuyBtn').html('Xác nhận mua').prop('disabled', false);
            return;
        }

        // Make API call
        $.ajax({
            url: '/api/BuyGmail/BuyProduct',
            type: 'GET',
            data: {
                apikey: apiKey,
                quantity: qty,
                product_id: selectedProduct.id
            },
            success: function (response) {
                $('#buyModal').modal('hide');

                if (response.success) {
                    // In your success callback from the API
                    if (response.success) {
                        // Format the accounts for display
                        const accountsText = response.data.accounts.join('\n');
                        const accountCount = response.data.accounts.length;

                        // Update modal content
                        $('#purchasedQuantity').text(accountCount);
                        $('#accountCount').text(accountCount);
                        $('#emailAccountsTextarea').val(accountsText);

                        // Store transaction data for download
                        $('#downloadOrderBtn').data('transaction', {
                            id: response.data.trans_id,
                            accounts: response.data.accounts,
                            product: selectedProduct.name,
                            quantity: accountCount,
                            total: response.data.total
                        });

                        // Show modal
                        $('#buyModal').modal('hide');
                        $('#successModal').modal('show');
                    }

                } else {
                    Toastify({
                        text: response.text || "Purchase failed",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "center",
                        backgroundColor: "#EA4335",
                        icon: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/exclamation-triangle.svg"
                    }).showToast();
                }
            },
            error: function (xhr) {
                let errorMsg = "An error occurred";
                try {
                    const message = xhr.responseText;
                    errorMsg = message || errorMsg;
                } catch (e) { }

                Toastify({
                    text: errorMsg,
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "#EA4335",
                    icon: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/exclamation-triangle.svg"
                }).showToast();
            },
            complete: function () {
                $('#confirmBuyBtn').html('Xác nhận mua').prop('disabled', false);
            }
        });
    });

    // Copy accounts button handler
    $('#copyAccountsBtn').click(function () {
        const textarea = document.getElementById('emailAccountsTextarea');
        textarea.select();
        document.execCommand('copy');

        Toastify({
            text: "Đã sao chép tài khoản vào clipboard!",
            duration: 2000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#34A853",
            icon: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/clipboard-check.svg"
        }).showToast();
    });

    // Download button handler
    $('#downloadOrderBtn').click(function () {
        const transaction = $(this).data('transaction');
        if (!transaction) return;

        // Create download content
        const content = [
            ...transaction.accounts
        ].join('\n');

        // Create download link
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gmail-accounts-${transaction.id.substring(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Update order history in the table (example implementation)
    function updateOrderHistory(orderData) {
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        const newRow = `
                <tr>
                    <td>#${orderData.trans_id.substring(0, 8).toUpperCase()}</td>
                    <td>${selectedProduct.name}</td>
                    <td>${formattedDate}</td>
                    <td>${orderData.quantity}</td>
                    <td>${orderData.total.toLocaleString('vi-VN')}đ</td>
                    <td><span class="status-badge status-completed">Completed</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-order-btn" data-trans-id="${orderData.trans_id}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;

        // Prepend to the table (or append if you prefer)
        $('.history-table tbody').prepend(newRow);
    }

    // Download order button handler
    $('#downloadOrderBtn').click(function () {
        const transId = $(this).data('trans-id');
        if (!transId) return;

        // Make API call to download order details
        window.open(`/api/order/download?trans_id=${transId}`, '_blank');
    });

    // View order button handler (for dynamically added rows)
    $(document).on('click', '.view-order-btn', function () {
        const transId = $(this).data('trans-id');
        // Implement view order details functionality
        alert(`Viewing order details for transaction: ${transId}`);
    });
});
