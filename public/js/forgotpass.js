//Function to display date
function displayDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Format the date
    document.getElementById('currentDate').textContent = formattedDate; // Display the date in the footer-left
}
displayDate();
//End of function to display date
//Function to send password reset email
async function forgotPassword() {
    const email = document.getElementById("email").value;
    // Validate the email
    if (!email) {
        alert("Please enter your email.");
        return;
    }
    // Make a POST request to the server
    try {
        const response = await fetch("/forgotPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            alert("Password reset email sent successfully!");
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error("Error sending email:", err);
        alert("An error occurred. Please try again later.");
    }
}