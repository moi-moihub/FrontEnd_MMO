const btmClearMail = document.getElementById("btmClearMail");
const btmDownloadMail = document.getElementById("btmDownloadMail");
const btmClearReadMail = document.getElementById("btmClearReadMail");
const gmailContainer = document.getElementById("gmailContainer");
const readMailContainer = document.getElementById("readMailContainer");

function Log(log, label = document.getElementById("lbstatus")) {
    if (label) {
        const gmt7Time = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Bangkok",
            hour12: false, // 24-hour format
        });
        label.innerHTML = `[${gmt7Time}] - <strong>${log}</strong>`;
    }
}

async function CrearMailData() {
    gmailContainer.innerHTML = "";
}

async function ShowbtnMailData() {
    btmClearMail.hidden = false;
    btmDownloadMail.hidden = false;
}

async function CrearReadMailData() {
    // Clear any existing content
    readMailContainer.innerHTML = "";
}

async function CheckKey() {

    let apiKey = document.getElementById("apikey").innerText;
    let urlCheck = `/api/ApiUsers/CheckKey?key=${apiKey}`;

    try {
        const response = await fetch(urlCheck, { method: "GET" });

        const result = await response.text(); // Await the text content of the response
        Log(result);
        return;

    } catch (error) {
        Log("Error: " + error.message);
        console.error("Error details:", error);
    }

}

async function CheckHistory() {

    let apiKey = document.getElementById("apikey").innerText;
    let urlCheck = `/api/ApiUsers/CheckHistory?key=${apiKey}`;

    CrearMailData();

    try {
        const response = await fetch(urlCheck, { method: "GET" });

        if (!response.ok) {
            const result = await response.text(); // Await the text content of the response
            Log(result);
            return;
        }

        ShowbtnMailData();

        const result = await response.json();

        result.forEach((entry) => {
            const [email, service, recovery] = entry.split("|");

            if (service.includes("OTP-")) {
                AppendOTP(entry, false);
            }
            else {
                AppendMail(entry);
            }
        });



    } catch (error) {
        Log("Error: " + error.message);
        console.error("Error details:", error);
    }

}

async function BuyGmail() {

    let apiKey = document.getElementById("apikey").innerText;
    const service = document.getElementById("service").value;
    const amount = document.getElementById("gmailCount").value;

    let encodedApiKey = encodeURIComponent(apiKey); // Encode the API key

    let urlbuy = `/api/BuyGmail/BuyProduct?apikey=${encodedApiKey}&quantity=${amount}&product_id=${service}`;

    if (encodedApiKey === "" || service === "") {
        Log("Hãy Điền API Key Trước.");
        return;
    }

    Log("Đang mua mail!");

    try {
        const response = await fetch(urlbuy, { method: "GET" });

        if (!response.ok) {
            const errorText = await response.text(); // Await the text content of the response
            Log("Error: " + errorText);
            return;
        }

        const result = await response.json();

        if (result.success !== true) {
            Log("Error: " + result.message);
            return;
        }

        Log("Order successfully created. Transaction ID: " + result.trans_id);

        let xoamail = document.getElementById("cbxoamailcu");
        if (xoamail.checked) {
            CrearMailData();
        }

        ShowbtnMailData();

        result.data.accounts.forEach((entry) => {
            if (service.includes("OTP-")) {
                AppendOTP(entry);
            }
            else {
                AppendMail(entry);
            }

        });
    } catch (error) {
        Log("Error: " + error.message);
        console.error("Error details:", error);
    }



}

//async function DocHomThu(button) {
//    Log(`Đang đọc hòm thư....${button.value}`);
//    button.innerText = "Đang Đọc Hòm Thư....";

//    let apiKey = document.getElementById("apikey").innerText;
//    let encodedApiKey = encodeURIComponent(apiKey); // Encode the API key

//    // Get the checkbox value
//    const htmlToggle = document.getElementById('htmlToggle');
//    const includeHtml = htmlToggle.checked ? 'true' : 'false';

//    // Add html parameter to URL
//    let url = `/api/ApiUsers/ReadMail?email=${button.value}&apikey=${encodedApiKey}&html=${includeHtml}`;


//    if (encodedApiKey === "") {
//        Log("Hãy Điền API Key Trước.");
//        return;
//    }

//    // Clear any existing content
//    const readMailContainer = document.getElementById("readMailContainer");
//    readMailContainer.innerHTML = "";

//    try {
//        const response = await fetch(url, { method: "GET" });

//        if (!response.ok) {
//            const errorText = await response.text(); // Await the text content of the response
//            Log("Error: " + errorText);
//            button.innerText = `Error: ${errorText}`;
//            button.className = "btn btn-danger btn-sm";
//            return;
//        }

//        const result = await response.json();

//        if (result.success !== "true") {
//            Log("Error: " + response.text);
//            button.innerText = `Error: ${response.text}`;
//            button.className = "btn btn-danger btn-sm";
//            return;
//        }
//        Log(`Đọc hòm thư thành công! - ${button.value}`);
//        button.innerText = `Đọc Hòm Thư thành công`;
//        button.className = "btn btn-success btn-sm";

//        btmClearReadMail.hidden = false;


//        // Render each email
//        result.listEmails.forEach((email, index) => {
//            const emailDiv = document.createElement("div");
//            emailDiv.className = "email-item mb-3 p-2 border rounded";
//            emailDiv.innerHTML = `
//                    <strong>Email #${index + 1}</strong><br>
//                    <strong>Sender:</strong> ${email.sender}<br>
//                    <strong>Subject:</strong> ${email.subject}<br>
//                    <strong>Received Time:</strong> ${new Date(email.receivedTime).toLocaleString()}<br>
//                    <textarea class="form-control mt-2" rows="5" readonly>${email.body}</textarea>
//                `;

//            // Append the email div to the container
//            readMailContainer.appendChild(emailDiv);
//        });

//        btmClearReadMail.scrollIntoView({ behavior: "smooth", block: "center" });


//    } catch (error) {
//        Log("Error: " + error.message);
//        console.error("Error details:", error);
//    }

//}

function AppendMail(entry) {
    let email, password, recovery;

    // If entry is a string → split it
    if (typeof entry === 'string') {
        const parts = entry.split('|');
        email = parts[0] || '';
        password = parts[1] || '';
        recovery = parts[2] || '';
    }
    // If entry is an object → destructure it
    else if (Array.isArray(entry)) {
        entry.forEach(entry2 => {
            AppendMail(entry2);
        });
        return;
    }
    else if (typeof entry === 'object' && entry !== null) {
        email = entry.email || '';
        password = entry.password || '';
        recovery = entry.recovery || '';
    } 
    else {
        console.warn("Invalid data format:", entry);
        return;
    }

    const mailCard = document.createElement("div");
    mailCard.className = "card mb-3 mail-card";

    mailCard.innerHTML = `
         <div class="card-body py-2 px-3 d-flex align-items-center gap-3 flex-wrap bg-light border rounded shadow-sm">
             <!-- Email Field -->
             <div class="d-flex align-items-center bg-white px-2 py-1 rounded border">
                 <span class="text-primary"><i class="bi bi-envelope-fill me-2"></i> 
                 <span class="copy-text fw-semibold" data-copy="${email}" title="Click to copy">${email}</span></span>
             </div>
         
             <!-- Password Field -->
             <div class="d-flex align-items-center bg-white px-2 py-1 rounded border">
                 <span class="text-success"><i class="bi bi-key-fill me-2"></i> 
                 <span class="copy-text fw-semibold" data-copy="${password}" title="Click to copy">${password}</span></span>
             </div>

             <!-- Recovery Field -->
             <div class="d-flex align-items-center bg-white px-2 py-1 rounded border">
                 <span class="text-warning"><i class="bi bi-shield-lock-fill me-2"></i> 
                 <span class="copy-text fw-semibold" data-copy="${recovery}" title="Click to copy">${recovery}</span></span>
             </div>
         
             <!-- Read Mail Button -->
             <div class="ms-auto d-flex gap-2">
                 <button class="btn btn-sm btn-primary read-mail-btn d-flex align-items-center" value="${email}">
                     <i class="bi bi-envelope-open me-2"></i>Đọc hòm thư
                 </button>
             </div>
         </div>
    `;

    // Add click-to-copy functionality
    mailCard.querySelectorAll(".copy-text").forEach(el => {
        el.style.cursor = "pointer";
        el.addEventListener("click", function () {
            navigator.clipboard.writeText(this.dataset.copy);
            this.classList.add("text-success", "fw-bold");
            setTimeout(() => {
                this.classList.remove("text-success", "fw-bold");
            }, 1000);
            ShowToast(`Đã copy: ${this.dataset.copy}`);
        });
    });

    // Fix: Properly pass email to DocHomThu function
    const readMailBtn = mailCard.querySelector(".read-mail-btn");
    readMailBtn.addEventListener("click", () => {
        DocHomThu(readMailBtn); // Pass the email directly
    });

    gmailContainer.insertBefore(mailCard, gmailContainer.firstChild);
}

// Modified DocHomThu function to accept email directly
async function DocHomThu(button) {
    Log(`Đang đọc hòm thư....${button.value}`);
    button.innerHTML = '<i class="bi bi-hourglass"></i> Đang Đọc Hòm Thư...';
    button.disabled = true;

    let apiKey = document.getElementById("apikey").innerText;
    let encodedApiKey = encodeURIComponent(apiKey);

    // Get the checkbox value
    const htmlToggle = document.getElementById('htmlToggle');
    const includeHtml = htmlToggle.checked ? 'true' : 'false';

    // Add html parameter to URL
    let url = `/api/ApiUsers/ReadMail?email=${button.value}&apikey=${encodedApiKey}&getHtml=${includeHtml}`;

    if (encodedApiKey === "") {
        Log("Hãy Điền API Key Trước.");
        ShowToast("Vui lòng nhập API Key trước", "error");
        return;
    }

    const readMailContainer = document.getElementById("readMailContainer");
    readMailContainer.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Đang tải hòm thư...</p></div>';

    try {
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
            const errorText = await response.text();
            Log("Error: " + errorText);
            button.innerHTML = `<i class="bi bi-x-circle"></i> Lỗi: ${errorText}`;
            button.className = "btn btn-danger btn-sm";
            readMailContainer.innerHTML = `<div class="alert alert-danger">${errorText}</div>`;
            button.disabled = false;
            return;
        }

        const result = await response.json();

        if (result.success !== "true") {
            Log("Error: " + result.message);
            button.innerHTML = `<i class="bi bi-x-circle"></i> Lỗi: +${result.message}`;
            button.className = "btn btn-danger btn-sm";
            readMailContainer.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
            button.disabled = false;
            return;
        }

        Log(`Đọc hòm thư thành công! - ${button.value}`);
        button.innerHTML = '<i class="bi bi-check-circle"></i> Thành công';
        button.className = "btn btn-success btn-sm";
        button.disabled = false;

        // Clear and render emails
        readMailContainer.innerHTML = '';
        
        if (!result.listEmails || result.listEmails.length === 0) {
            readMailContainer.innerHTML = '<div class="alert alert-info">Không có email nào trong hòm thư</div>';
            return;
        }

        // Create email cards
        result.listEmails.forEach((email, index) => {
            //const emailCard = document.createElement("div");
            //emailCard.className = "card mb-3 email-card";
            //emailCard.innerHTML = `
            //    <div class="card-header bg-light d-flex justify-content-between align-items-center">
            //        <div>
            //            <strong class="me-2">Email #${index + 1}</strong>
            //            <span class="badge bg-primary">${new Date(email.receivedTime).toLocaleString()}</span>
            //        </div>
            //        <button class="btn btn-sm btn-outline-secondary copy-sender-btn" data-sender="${email.sender}">
            //            <i class="bi bi-clipboard"></i> Copy Người gửi
            //        </button>
            //    </div>
            //    <div class="card-body">
            //        <div class="mb-2">
            //            <span class="fw-bold">Người gửi:</span>
            //            <span class="ms-2">${email.sender}</span>
            //        </div>
            //        <div class="mb-3">
            //            <span class="fw-bold">Tiêu đề:</span>
            //            <span class="ms-2">${email.subject}</span>
            //        </div>
            //        <div class="email-body-container" style="max-height: 200px; overflow-y: auto;">
            //            <pre class="bg-light p-2 rounded">${email.body}</pre>
            //        </div>
            //    </div>
            //`;

            const emailCard = document.createElement("div");
            emailCard.className = "card mb-3 email-card";
            emailCard.innerHTML = `
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="me-2">Email #${index + 1}</strong>
                        <span class="badge bg-primary">${new Date(email.receivedTime).toLocaleString()}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary copy-sender-btn" data-sender="${email.sender}">
                        <i class="bi bi-clipboard"></i> Copy Người gửi
                    </button>
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <span class="fw-bold">Người gửi:</span>
                        <span class="ms-2">${email.sender}</span>
                    </div>
                    <div class="mb-3">
                        <span class="fw-bold">Tiêu đề:</span>
                        <span class="ms-2">${email.subject}</span>
                    </div>
                    <div class="email-body-container" style="max-height: 300px; overflow-y: auto;">
                        <iframe class="w-100 border rounded" style="height: 200px;" sandbox="allow-same-origin" srcdoc="${escapeHtmlForIframe(email.body)}"></iframe>
                    </div>
                </div>
            `;

            // Add copy functionality
            emailCard.querySelector(".copy-sender-btn").addEventListener("click", (e) => {
                navigator.clipboard.writeText(e.currentTarget.dataset.sender);
                ShowToast("Đã copy địa chỉ người gửi");
            });

            readMailContainer.appendChild(emailCard);

            setTimeout(() => {
                const iframe = emailCard.querySelector("iframe");
                if (iframe) {
                    iframe.onload = () => {
                        const links = iframe.contentDocument.querySelectorAll("a");
                        links.forEach(link => {
                            link.addEventListener("click", e => {
                                e.preventDefault(); // Không cho mở link
                                const href = link.href;
                                navigator.clipboard.writeText(href).then(() => {
                                    ShowToast("Đã copy link: " + href.substring(0, 20) + "...");
                                }).catch(err => {
                                    ShowToast("Copy failed:", err.substring(0, 20) + "...");
                                });
                            });
                        });
                    };
                }
            }, 100);
        });

        document.getElementById("btmClearReadMail").hidden = false;
        readMailContainer.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error("Error details:", error);
        Log("Error: " + error.message);
        button.innerHTML = `<i class="bi bi-x-circle"></i> Lỗi: +${error.message}`;
        button.className = "btn btn-danger btn-sm";
        readMailContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function escapeHtmlForIframe(html) {
    return html
        .replace(/<\/script>/gi, "<\\/script>")  // tránh script injection
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadGmailHistoryAll() {
    try {
        // Show loading
        const response = await fetch(`/api/OrdersHistory/gmail/all-emails?apikey=${apiKey}`);
        const data = await response.json();

        // Render the email list to table
        AppendMail(data || []);

    } catch (error) {
        console.error('Error loading full Gmail list:', error);
    }
}


function downloadGmailData() {
    // Get the container with all gmail-item divs
    const gmailContainer = document.querySelector('#gmailContainer');
    if (!gmailContainer) {
        console.warn("Gmail container not found!");
        return;
    }

    // Collect data from each gmail-item
    let emailData = [];
    const gmailItems = gmailContainer.querySelectorAll('.gmail-item');

    gmailItems.forEach(item => {
        const inputs = item.querySelectorAll('.gmail-data');
        if (inputs.length >= 3) {
            const email = inputs[0]?.value || 'N/A';
            const pass = inputs[1]?.value || 'N/A';
            const recovery = inputs[2]?.value || 'N/A';

            emailData.push(`${email}|${pass}|${recovery}`);
        } else {
            console.warn("Incomplete data found in one gmail-item.");
        }
    });

    // Convert data to a single string with newline separators
    const fileContent = emailData.join('\n');

    // Create a Blob for the data
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gmail_data.txt';
    document.body.appendChild(a);

    // Trigger the download and clean up
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}

function ShowToast(text, type = "success") {
    let bgColor = "#157347"; // Mặc định: success (xanh lá)

    if (type === "error") {
        bgColor = "#dc3545"; // Đỏ
    } else if (type === "warning") {
        bgColor = "#ffc107"; // Vàng
    } else if (type === "info") {
        bgColor = "#0dcaf0"; // Xanh da trời
    }

    Toastify({
        text: text,
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: bgColor,
        stopOnFocus: true
    }).showToast();
}


