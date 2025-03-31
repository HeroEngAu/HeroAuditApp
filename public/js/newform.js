// Initialize the user info in the header
const name = localStorage.getItem("name");
const role = localStorage.getItem("role");    
if (name && role) {
document.getElementById("userInfo").textContent = `User: ${name} | Role: ${role}`;
} else {
document.getElementById("userInfo").textContent = "User info not found.";
}   
// End user info initialization

// Function to display the current date
function displayDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Format the date
    document.getElementById('currentDate').textContent = formattedDate; // Display the date in the footer-left
}
displayDate();

function populateClients() {
    const clientDropdown = document.getElementById("clientDropdown");

    // Fetch clients from the server
    fetch("/clients")
        .then(response => response.json())
        .then(data => {
            clientDropdown.innerHTML = '<option value="">Select Client</option>'; // Reset dropdown

            data.forEach(client => {
                const option = document.createElement("option");
                option.value = client.Client;  // Use client.Client, not the entire client object
                option.textContent = client.Client;  // Use client.Client for the text as well
                clientDropdown.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching clients:", error));
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", populateClients);

document.getElementById("createFormButton").addEventListener("click", function() {
    const client = document.getElementById("clientDropdown").value;

    if (!client) {
        alert("Please select a Client before proceeding.");
        return;
    }
    // Redirect to auditform.html with query parameters
    window.location.href = `/auditform.html?client=${encodeURIComponent(client)}`;
});
