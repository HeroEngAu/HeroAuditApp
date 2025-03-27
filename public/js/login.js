//Function to display date
function displayDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    document.getElementById('currentDate').textContent = formattedDate;
}
displayDate();
//End of function to display date

//Function to login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Make a POST request to the server
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Name:", data.name);
            console.log("Role:", data.role);
            // Save name and role in localStorage
            localStorage.setItem("name", data.name);
            localStorage.setItem("role", data.role);
            alert(data.message);
            window.location.href = "/mainpage.html"; // Redirect to main page after successful login
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error");
    });
}