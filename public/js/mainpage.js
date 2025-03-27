//Function to display date
function displayDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Format the date
    document.getElementById('currentDate').textContent = formattedDate; // Display the date in the footer-left
}
displayDate();
//End of function to display date

//Get the user info from the local storage
const name = localStorage.getItem("name");
const role = localStorage.getItem("role");
//Save name and role into UserInfo
if (name && role) {
    document.getElementById("userInfo").textContent = `User: ${name} | Role: ${role}`;
} else {
    document.getElementById("userInfo").textContent = "User info not found.";
}