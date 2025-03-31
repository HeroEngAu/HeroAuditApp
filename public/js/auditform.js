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

async function populateProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const client = urlParams.get("client");
        if (!client) {
            console.error("No client selected.");
            return;
        }
        const projectDropdown = document.getElementById("projectDropdown");
        const projectIDDropdown = document.getElementById("projectIDDropdown");
        if (!projectDropdown || !projectIDDropdown) {
            console.error("Dropdown elements not found.");
            return;
        }

    try {
        const response = await fetch(`/projects?client=${encodeURIComponent(client)}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("No project IDs found.");
            projectDropdown.innerHTML = '<option value="">No Projects Available</option>';
            return;
        }
            projectDropdown.innerHTML = '<option value="">Select Project</option>';
            projectIDDropdown.innerHTML = '<option value="">Select Project ID</option>';

        const projectMap = new Map();
        data.forEach(project => {
            projectMap.set(project.projectName, project.projectID);
            
            // Populate Project Name dropdown
            const projectOption = document.createElement("option");
            projectOption.value = project.projectName;
            projectOption.textContent = project.projectName;
            projectDropdown.appendChild(projectOption);
        });

        // Update Project ID dropdown when Project Name is selected
        projectDropdown.addEventListener("change", function () {
            const selectedProject = projectDropdown.value;
            projectIDDropdown.innerHTML = '<option value="">Select Project ID</option>'; // Reset

            if (projectMap.has(selectedProject)) {
                const projectIDOption = document.createElement("option");
                projectIDOption.value = projectMap.get(selectedProject);
                projectIDOption.textContent = projectMap.get(selectedProject);
                projectIDDropdown.appendChild(projectIDOption);
            }
        });
        } catch (error) {
            console.error("Error fetching project IDs:", error);
        }
};

document.addEventListener("DOMContentLoaded", populateProject);

//Load the client name as the page open
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

document.getElementById("saveButton").addEventListener("click", () => {
    const client = document.getElementById("client").value;
    const projectName = document.getElementById("projectDropdown").value;
    const projectID = document.getElementById("projectIDDropdown").value;
    const equipment = document.getElementById("equipment").value;
    const testName = document.getElementById("testName").value;
    const documentNumber = document.getElementById("documentNumber").value;

    if (!client || !projectName || !projectID || !equipment || !testName || !documentNumber) {
        alert("Please fill all fields before saving.");
        return;
    }
    //console.log('Data:', client, projectName, projectID, equipment, testName, documentNumber);
    fetch("/saveFormData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, projectName, projectID, equipment, testName, documentNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Form data saved successfully!");
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Error saving form data:", error));
});

document.getElementById("returnButton").addEventListener("click", function() {

    window.location.href = `/newform.html`;
});
