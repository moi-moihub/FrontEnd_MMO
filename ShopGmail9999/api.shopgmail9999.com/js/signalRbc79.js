function WriteStatus(text) {
    // Get the current date and time
    const now = new Date();

    // Calculate GMT+7 time
    const offset = 7 * 60; // GMT+7 offset in minutes
    const gmt7Time = new Date(now.getTime() + offset * 60 * 1000);

    // Format the date and time (e.g., YYYY-MM-DD HH:MM:SS)
    const year = gmt7Time.getUTCFullYear();
    const month = String(gmt7Time.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(gmt7Time.getUTCDate()).padStart(2, '0');
    const hours = String(gmt7Time.getUTCHours()).padStart(2, '0');
    const minutes = String(gmt7Time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(gmt7Time.getUTCSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    //// Set the status message with the current date and time
    //const statusMessageElement = document.getElementById('statusMessage');
    //statusMessageElement.innerText = formattedDate + ": " + text;

    //// Add the blink class to trigger the animation
    //statusMessageElement.classList.add('blink');

    //// Remove the blink class after the animation completes (500ms)
    //setTimeout(() => {
    //    statusMessageElement.classList.remove('blink');
    //}, 500); // Match the duration of the animation (0.5s)
}


// Initialize SignalR connection with automatic reconnect
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/orderhub") // Your SignalR hub URL
    .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals: immediately, then 2 seconds, 10 seconds, 30 seconds
    .build();


// Start the connection and handle reconnecting scenarios
async function startSignalRConnection() {
    try {
        await connection.start();
        console.log("SignalR connection established.");
        // Optionally show a message to the user
        WriteStatus("Connected to the server.");
    } catch (err) {
        console.error("SignalR connection failed:", err);
        WriteStatus("Failed to connect to the server. Retrying...");
        setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    }
}

// Reconnect handling
connection.onreconnecting((error) => {
    console.log("Reconnecting...", error);
    WriteStatus("Reconnecting to the server...");
});

// Reconnection successful
connection.onreconnected((connectionId) => {
    console.log("Reconnected with connection ID:", connectionId);
    WriteStatus("Reconnected to the server.");
    // You may want to refresh the order data after reconnection
    $('#otpOrdersTable').DataTable().ajax.reload(); // Reload the DataTable to fetch fresh data
});

// Handle when the connection is closed and not retrying anymore
connection.onclose(async (error) => {
    WriteStatus("SignalR connection closed:", error);
    WriteStatus("Disconnected from the server. Reconnecting...");
    await startSignalRConnection(); // Restart the connection
});

// Start the connection when the page loads
startSignalRConnection();


// Listen for new orders
connection.on("ReceiveOrder", function (orderDetails) {
    // console.log("New order received: ", orderDetails);

    var orderId = orderDetails.split(":")[1].trim(); // Split the message and get the second part (order ID)
   // WriteStatus("New order received: " + orderId);
    // fetchOrderDetails(orderId);
});

// Listen for order updates
connection.on("ReceiveOrderUpdate", function (updatedOrder) {
    //console.log("Order update received: ", updatedOrder);

    var orderId = updatedOrder.split(":")[1].trim(); // Split the message and get the second part (order ID)
   // WriteStatus("Update received: " + orderId);

    // fetchOrderDetails(orderId);
});
