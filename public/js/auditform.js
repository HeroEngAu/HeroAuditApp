//Get project info from local storage
const client = localStorage.getItem("client");
const projectName = localStorage.getItem("project");
const projectId = localStorage.getItem("projectId");
if (client && projectName && projectId) {
    document.getElementById("projectInfo").textContent = `Client: ${client} | Project: ${projectName} | Project ID: ${projectId}`;
} else {
    document.getElementById("projectInfo").textContent = "Project info not found.";
    }
//END --- Get project info from local storage

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

function saveTestDescription() {
    const description = document.getElementById("testDescription").value;

    // Verify the values are correct before send to the backend
    const client = localStorage.getItem("client");
    const projectName = localStorage.getItem("project");
    const projectId = localStorage.getItem("projectId");
    const equipment = localStorage.getItem("equipment");
    const testName = localStorage.getItem("testName");

    console.log('Sending data to server:', { client, projectName, projectId,  equipment, testName, description });

    const data = {
        client: client,
        projectName: projectName,
        projectId: projectId,
        equipment: equipment,
        testName: testName,
        description: description
    };

    fetch('/saveDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            alert("Description saved successfully.");
            localStorage.setItem("description", data.description);
        } else {
            alert(`Failed to save: ${response.message}`);
        }
    })
    .catch(error => {
        console.error("Error saving description:", error);
        alert("Server error.");
    });
}
function saveAuditForm() {
    // Collect form data
    const client = localStorage.getItem("client");
    const project = localStorage.getItem("project");
    const projectId = localStorage.getItem("projectId");
    const equipment = document.getElementById("equipment").value;
    const testName = document.getElementById("testName").value;
    const documentNumber = localStorage.getItem("docNumber") || "";

    const table = document.getElementById("auditFormTable");
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.trim());
    const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
        Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim())
    );

    const data = {
        client,
        project,
        projectId,
        equipment,
        testName,
        documentNumber,
        table: {
            headers,
            rows
        }
    };

    fetch("/saveAuditForm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => alert(response.message))
    .catch(error => console.error("Error saving table:", error));
}

document.getElementById("saveTable").addEventListener("click", saveAuditForm);

fetch("/loadAuditForm")
.then(response => response.json())
.then(data => {
    console.log("JSON Data Loaded:", data);
})
.catch(error => console.error("Error loading data:", error));

window.onload = function() {
    // Retrieve the data passed from localStorage
    const equipment = localStorage.getItem('equipment');
    const testName = localStorage.getItem('testName');
    const testDescription = localStorage.getItem('testDescription');

    // Pre-fill the fields with data
    if (equipment && testName) {
        document.getElementById('equipment').value = equipment;
        document.getElementById('testName').value = testName;
        document.getElementById('testDescription').value = testDescription || '';
    }

    // If a description exists, fill the description field. If it's empty, leave it blank.
    if (testDescription) {
        document.getElementById('testDescription').value = testDescription;
    } else {
        document.getElementById('testDescription').value = ''; // Allow user to fill it in
    }
}

//Clean up local storage
document.getElementById('returnButton').addEventListener('click', function (e) {
    e.preventDefault(); // prevents automatic redirection

    localStorage.removeItem('equipment');
    localStorage.removeItem('testName');
    localStorage.removeItem('testDescription');
    localStorage.removeItem('description');
    localStorage.removeItem('client');
    localStorage.removeItem('project');
    localStorage.removeItem('projectId');
    localStorage.removeItem('projectInfo');
    localStorage.removeItem('clientDropdown');
    localStorage.removeItem('projectDropdown');
    localStorage.removeItem('projectDropdownId');
    
    window.location.href = '/newform.html';
});
