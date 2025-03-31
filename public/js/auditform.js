//Get USER info from local storage
const name = localStorage.getItem("name");
const role = localStorage.getItem("role");    
if (name && role) {
document.getElementById("userInfo").textContent = `User: ${name} | Role: ${role}`;
} else {
document.getElementById("userInfo").textContent = "User info not found.";
}  
//END --- Get USER info from local storage

// Function to display the current date
function displayDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Format the date
    document.getElementById('currentDate').textContent = formattedDate; // Display the date in the footer-left
}
displayDate();
//End of display date

// Get all buttons and table elements
const addRowBtn = document.getElementById("addRowBtn");
const addColumnBtn = document.getElementById("addColumnBtn");
const removeRowBtn = document.getElementById("removeRowBtn");
const removeColumnBtn = document.getElementById("removeColumnBtn");
const auditFormTable = document.getElementById("auditFormTable");

// Add Row
addRowBtn.addEventListener("click", () => {
    const tableBody = auditFormTable.querySelector("tbody");
    const newRow = document.createElement("tr");

    // Create new cells for the row
    for (let i = 0; i < auditFormTable.querySelector("thead").rows[0].cells.length; i++) {
        const newCell = document.createElement("td");
        newCell.contentEditable = "true";
        newRow.appendChild(newCell);
    }
   /* const removeCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-row");
    removeButton.addEventListener("click", () => newRow.remove());
    removeCell.appendChild(removeButton);
    newRow.appendChild(removeCell);*/
    tableBody.appendChild(newRow);
});

// Add Column
addColumnBtn.addEventListener("click", () => {
    const tableHead = auditFormTable.querySelector("thead tr");
    const newColumnHeader = document.createElement("th");
    newColumnHeader.contentEditable = "true";
    newColumnHeader.textContent = "New Column";
    tableHead.appendChild(newColumnHeader);

    const tableBody = auditFormTable.querySelector("tbody");
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
        const newCell = document.createElement("td");
        newCell.contentEditable = "true";
        row.appendChild(newCell);
    });
});

// Remove Row
removeRowBtn.addEventListener("click", () => {
    const tableBody = auditFormTable.querySelector("tbody");
    const rows = tableBody.querySelectorAll("tr");
    if (rows.length > 0) {
        rows[rows.length - 1].remove();
    }
});

// Remove Column
removeColumnBtn.addEventListener("click", () => {
    const tableHead = auditFormTable.querySelector("thead tr");
    const columns = tableHead.querySelectorAll("th");
    if (columns.length > 0) {
        columns[columns.length - 1].remove();

        const tableBody = auditFormTable.querySelector("tbody");
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(row => {
            row.removeChild(row.lastElementChild);
        });
    }
});

// Function to get the query parameter (client) from the URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to populate the Project dropdown
function populateProjects(clientName) {
    const projectDropdown = document.getElementById("projectDropdown");

    fetch(`/projects?client=${encodeURIComponent(clientName)}`)  // Fetch the projects based on the client name
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                projectDropdown.innerHTML = '<option value="">Select Project</option>';

                const projects = data[0]?.projects || [];
                projects.forEach(project => {
                    const option = document.createElement("option");
                    option.value = project.projectName; // Assuming projectName is the field name in your DB
                    option.textContent = project.projectName;
                    projectDropdown.appendChild(option);
                });
            } else {
                console.error("No projects found for client:", clientName);
            }
        })
        .catch(error => {
            console.error("Error fetching project data:", error);
        });
}

// On page load, get the client from the URL and populate the dropdown
document.addEventListener("DOMContentLoaded", function() {
    const clientName = getQueryParam("client");  // Get the client name from the URL
    if (clientName) {
        populateProjects(clientName);  // Populate the dropdown with the client-specific projects
    } else {
        console.error("Client name is missing in the URL");
    }
});

// Function to populate the Project ID dropdown
async function populateProjectIDs() {
    const urlParams = new URLSearchParams(window.location.search);
    const client = urlParams.get("client");
    const projectDropdown = document.getElementById("projectIDDropdown");

    if (!projectDropdown) {
        console.error("Dropdown element with ID 'projectIDDropdown' not found.");
        return;
    }

    if (!client) {
        console.error("No client selected.");
        return;
    }

    try {
        const response = await fetch(`/projectIDs?client=${encodeURIComponent(client)}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("No project IDs found.");
            projectDropdown.innerHTML = '<option value="">No Projects Available</option>';
            return;
        }

        projectDropdown.innerHTML = '<option value="">Select Project ID</option>'; // Reset dropdown

        data.forEach(item => {
            if (item.projectID) {
                const option = document.createElement("option");
                option.value = item.projectID;
                option.textContent = `${item.projectName} (${item.projectID})`;
                projectDropdown.appendChild(option);
            }
        });

        console.log("Populated Project ID Dropdown:", projectDropdown.innerHTML);

    } catch (error) {
        console.error("Error fetching project IDs:", error);
    }
}
        
document.addEventListener("DOMContentLoaded", populateProjectIDs);

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const client = urlParams.get("client");
    const clientInput = document.getElementById("client");

    if (client) {
        clientInput.value = client; // Set the client name
    } else {
        console.warn("No client found in the URL.");
    }
});
