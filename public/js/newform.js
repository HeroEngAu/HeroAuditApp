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
//End of display date

//Function to get the equipment and test names from the database and put them in the dropdowns
fetch('/equipments')
.then(res => res.json())
.then(data => populateDropdown('equipment', data, 'Custom Equipment'));

fetch('/test-names')
    .then(res => res.json())
    .then(data => populateDropdown('testName', data, 'Custom Test Name'));

function populateDropdown(dropdownId, items, customLabel) {
    const dropdown = document.getElementById(dropdownId);
    //Clear the dropdown and add the default option
    dropdown.innerHTML = `<option value="">Select ${dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1)}</option>`;
    //Insert the items received from the server
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
    //Add the custom option
    const customOption = document.createElement("option");
    customOption.value = "Custom";
    customOption.textContent = customLabel;
    dropdown.appendChild(customOption);
}

let timesiteData = [];// Array to store the timesite data
// Fetch the timesite data from the server
fetch("/timesite")
    .then(response => response.json())
    .then(data => {
        timesiteData = data;
        populateClients();
    });
// Function to populate the client dropdown
function populateClients() {
    const clientDropdown = document.getElementById("clientDropdown");// Get the client dropdown
    const uniqueClients = [...new Set(timesiteData.map(item => item.Client))]; //Unique clients - when a client is repeated, it will be counted only once
    
    uniqueClients.forEach(client => {
        const option = document.createElement("option");
        option.value = client;
        option.textContent = client;
        clientDropdown.appendChild(option);
    });
    // Add an event listener to the client dropdown
    clientDropdown.addEventListener("change", handleClientChange);
}
// Function to handle the client dropdown change - when a client is selected, the projects dropdown will be populated with the projects of the selected client
function handleClientChange() {
    const client = this.value;
    const projectDropdown = document.getElementById("projectDropdown");
    const projectIdDropdown = document.getElementById("projectIdDropdown");

    //Reset project and projectID dropdowns
    projectDropdown.innerHTML = '<option value="">Select Project</option>';
    projectDropdown.disabled = true;
    projectIdDropdown.innerHTML = '<option value="">Select Project ID</option>';
    projectIdDropdown.disabled = true;

    if (client === "") return;
    //Filter the timesite data to get the projects of the selected client
    const filteredProjects = timesiteData
        .filter(item => item.Client === client)
        .map(item => item.Project);
    //Get the unique projects
    const uniqueProjects = [...new Set(filteredProjects)];

    uniqueProjects.forEach(project => {
        const option = document.createElement("option");
        option.value = project;
        option.textContent = project;
        projectDropdown.appendChild(option);
    });
    
    projectDropdown.disabled = false;
    projectDropdown.addEventListener("change", handleProjectChange);
}
// Function to handle the project dropdown change - when a project is selected, the projectID dropdown will be populated with the projectIDs of the selected project
function handleProjectChange() {
    const client = document.getElementById("clientDropdown").value;
    const project = this.value;
    const projectIdDropdown = document.getElementById("projectIdDropdown");

    // Reset ProjectID dropdown
    projectIdDropdown.innerHTML = '<option value="">Select Project ID</option>';
    projectIdDropdown.disabled = true;

    if (project === "") return;

    const filteredProjectIds = timesiteData
        .filter(item => item.Client === client && item.Project === project)
        .map(item => item.ProjectID);

    const uniqueProjectIds = [...new Set(filteredProjectIds)];

    uniqueProjectIds.forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id;
        projectIdDropdown.appendChild(option);
    });

    projectIdDropdown.disabled = false;
}

// Show input field for custom entry when "Custom" is selected in dropdown
document.getElementById('equipment').addEventListener('change', function() {
    if (this.value === 'Custom') {
        document.getElementById('customEquipment').style.display = 'block';
    } else {
        document.getElementById('customEquipment').style.display = 'none';
    }
});

document.getElementById('testName').addEventListener('change', function() {
    if (this.value === 'Custom') {
        document.getElementById('customTestName').style.display = 'block';
    } else {
        document.getElementById('customTestName').style.display = 'none';
    }
});

//Function to create the new form and send data to the backend. It sends all the information that comes from the dropdowns and the custom fields
function createForm() {
    const docNumber = document.getElementById('DocNumber').value;
    localStorage.setItem('docNumber', docNumber); 
    const client = document.getElementById('clientDropdown').value;
    const project = document.getElementById('projectDropdown').value;
    const projectId = document.getElementById('projectIdDropdown').value;
    let equipment = document.getElementById('equipment').value;
    let testName = document.getElementById('testName').value;
    let DocNumber = document.getElementById('DocNumber').value;

    //Use custom input if "Custom" is selected
    if (equipment === 'Custom') equipment = document.getElementById('customEquipment').value;
    if (testName === 'Custom') testName = document.getElementById('customTestName').value;

    const formData = {
        client,
        project,
        projectId,
        equipment,
        testName,
        DocNumber
    };
    // Send the form data to the server
    fetch('/create-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Form created successfully!");
            localStorage.setItem("equipment", equipment);
            localStorage.setItem("testName", testName);
            localStorage.setItem("client", client);
            localStorage.setItem("project", project);
            localStorage.setItem("projectId", projectId);
            localStorage.setItem("docNumber", docNumber);
            window.location.href = "/auditform.html"; // Redirect to the audit form page
            
            // Optionally, clear the form or redirect
        } else {
            alert("This form already exists.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error");
    });
}
// Add an event listener to the fill the auditform.html with the information of equip. and testname ---- NOT WORKING YET!!!

function editform() {
    const client = document.getElementById("clientDropdown").value;
    const projectName = document.getElementById("projectDropdown").value;
    const projectId = document.getElementById("projectIdDropdown").value;
    let equipment = document.getElementById('equipment').value;
    let testName = document.getElementById('testName').value;

    // Validate that all required fields are filled
    if (!client || !projectName || !projectId || !equipment || !testName) {
        alert("Please fill in all required fields.");
        return;
    }
    
    const requestData = {
        client,
        projectName,
        projectId,
        equipment,
        testName
    };

    fetch('/getTestDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            localStorage.setItem("client", client);
            localStorage.setItem("project", projectName);
            localStorage.setItem("projectId", projectId);
            localStorage.setItem("testDescription", response.description  || ""); // Save it to localStorage
            localStorage.setItem("equipment", equipment);
            localStorage.setItem("testName", testName);
            window.location.href = "/auditform.html"; // Redirect to form
            console.log("data:", response);
            console.log("Description:", response.description);
        } else {
            alert(response.message || "No matching record found.");
        }
    })
    .catch(err => {
        console.error("Error fetching description:", err);
        alert("Error connecting to server.");
    });
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
    
    window.location.href = '/mainpage.html';
});
