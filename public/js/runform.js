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
    localStorage.setItem('startDate', formattedDate);
}
displayDate();
//End of display date

// Populate the equipment tag dropdown
fetch('/equipmentTags')
    .then(res => res.json())
    .then(data => {
        console.log('Equipment Tags:', data);  // Check what data is returned from the server
        populateDropdown('equipmentTag', data, 'Custom Equipment Tag');
    })
    .catch(err => {
        console.error("Error fetching equipment tags:", err);
    });

window.onload = () => {
    // Fetch clients when the page loads
    fetch('/getClientProjectData')
    .then(res => res.json())
    .then(data => {
        if (data.clients) {
            populateDropdown('client', data.clients);
        } else {
            console.error('No clients found');
        }
        // Reset project and projectId dropdowns
        populateDropdown('project', []);
        populateDropdown('projectId', []);
        // Reset equipment and test name dropdowns
        populateDropdown('equipment', []);
        populateDropdown('testName', []);
        populateDropdown('docNumber', []); 
    })
    .catch(err => console.error("Error fetching clients:", err));

    // Event listener for client change
    document.getElementById('client').addEventListener('change', function () {
        const client = this.value;
        console.log("🔍 Client enviado:", client);
        if (client) {
            fetch(`/getProjects?client=${encodeURIComponent(client)}`)
            .then(res => res.json())
            .then(data => {
                if (data.projects) {
                    populateDropdown('project', data.projects);
                } else {
                    console.error('No projects found');
                }
                populateDropdown('projectId', []); // Clear project IDs when client changes
                // Clear equipment and test name when client changes
                populateDropdown('equipment', []);
                populateDropdown('testName', []);
                populateDropdown('docNumber', []);
            })
            .catch(err => console.error("Error fetching projects:", err));
        } else {
            // Reset dropdowns if no client is selected
            populateDropdown('project', []);
            populateDropdown('projectId', []);
            // Clear equipment and test name if no client is selected
            populateDropdown('equipment', []);
            populateDropdown('testName', []);
            populateDropdown('docNumber', []);
        }
    });

    // Event listener for project change
    document.getElementById('project').addEventListener('change', function () {
        const client = document.getElementById('client').value;
        const project = this.value;
        if (client && project) {
            fetch(`/getProjectIds?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}`)
            .then(res => res.json())
            .then(data => {
                if (data.projectIds) {
                    populateDropdown('projectId', data.projectIds);
                } else {
                    console.error('No project IDs found');
                }
            })
            .catch(err => console.error("Error fetching project IDs:", err));

            // Fetch equipment and test names when project is selected
            fetch(`/getEquipment?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}`)
            .then(res => res.json())
            .then(data => {
                if (data.equipment) {
                    populateDropdown('equipment', data.equipment);
                } else {
                    console.error('No equipment found');
                }
            })
            .catch(err => console.error("Error fetching equipment:", err));

            fetch(`/getTestNames?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}`)
            .then(res => res.json())
            .then(data => {
                if (data.testNames) {
                    populateDropdown('testName', data.testNames);
                } else {
                    console.error('No test names found');
                }
            })
            .catch(err => console.error("Error fetching test names:", err));

            // Fetch DocNumbers
            fetch(`/getDocNumbers?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}`)
            .then(res => res.json())
            .then(data => {
                if (data.docNumbers) {
                    populateDropdown('docNumber', data.docNumbers);
                } else {
                    console.error('No DocNumbers found');
                }
            })
            .catch(err => console.error("Error fetching DocNumbers:", err));
        } else {
            populateDropdown('projectId', []); // Clear project IDs if no project is selected
            // Clear equipment and test name if no project is selected
            populateDropdown('equipment', []);
            populateDropdown('testName', []);
            populateDropdown('docNumber', []);
        }
    });
};

// Function to populate the dropdown
function populateDropdown(dropdownId, items, customLabel) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<option value="">Select ${dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1)}</option>`; // Clear previous options

    // Check if items are available and is an array
    if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    } else {
        // No items found, show "No data available"
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No data available";
        dropdown.appendChild(option);
    }

    // Add the "Custom" option
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = customLabel;
    dropdown.appendChild(customOption);
}


// Listen for change event on the equipment tag dropdown
document.getElementById("equipmentTag").addEventListener("change", function() {
    const customInput = document.getElementById("customEquipmentTag");

    // Show the custom input field if "Custom" is selected
    if (this.value === "custom") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
    }
});

document.getElementById("runTestBtn").addEventListener("click", function () {
    const client = document.getElementById("client").value;
    const project = document.getElementById("project").value;
    const projectId = document.getElementById("projectId").value;
    const equipment = document.getElementById("equipment").value;
    const testName = document.getElementById("testName").value;
    const docNumber = document.getElementById("docNumber").value;
    let equipmentTag = document.getElementById("equipmentTag").value;
    
    //Use custom input if "Custom" is selected
    if (equipmentTag === 'custom') equipmentTag = document.getElementById('customEquipmentTag').value;

    // Check if all required fields are filled out
    if (client && project && projectId && equipment && testName && docNumber && equipmentTag) {
        const testData = {
            client,
            project,
            projectId,
            equipment,
            testName,
            docNumber,
            equipmentTag,
        };

        // Send the data to the server to update the record
        fetch('/updateTestData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Test data updated successfully!");
                const idwebapp = data.idwebapp;
                // Create a query string with the form data for redirection
                const queryString = `?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}&projectId=${encodeURIComponent(projectId)}&equipment=${encodeURIComponent(equipment)}&testName=${encodeURIComponent(testName)}&docNumber=${encodeURIComponent(docNumber)}&equipmentTag=${encodeURIComponent(equipmentTag)}&idwebapp=${encodeURIComponent(idwebapp)}`;
                
                // Redirect to the runningtest.html page with the query string
                window.location.href = `runningtest.html${queryString}`;
            } else {
                alert(data.message || "Error updating test data.");
            }
        })
        .catch(err => {
            console.error("Error updating test data:", err);
            alert("An error occurred while updating test data.");
        });
    } else {
        alert("Please fill in all fields.");
    }
});

document.getElementById("runTestBtn").addEventListener("click", function () {
    const client = document.getElementById("client").value;
    const project = document.getElementById("project").value;
    const projectId = document.getElementById("projectId").value;
    const equipment = document.getElementById("equipment").value;
    const testName = document.getElementById("testName").value;
    const docNumber = document.getElementById("docNumber").value;
    let equipmentTag = document.getElementById("equipmentTag").value;
    
    //Use custom input if "Custom" is selected
    if (equipmentTag === 'custom') equipmentTag = document.getElementById('customEquipmentTag').value;

    // Check if all required fields are filled out
    if (client && project && projectId && equipment && testName && docNumber && equipmentTag) {
        const testData = {
            client,
            project,
            projectId,
            equipment,
            testName,
            docNumber,
            equipmentTag,
        };

        // Send the data to the server to update the record
        fetch('/updateTestData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Test data updated successfully!");
                const idwebapp = data.idwebapp;
                // Create a query string with the form data for redirection
                const queryString = `?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}&projectId=${encodeURIComponent(projectId)}&equipment=${encodeURIComponent(equipment)}&testName=${encodeURIComponent(testName)}&docNumber=${encodeURIComponent(docNumber)}&equipmentTag=${encodeURIComponent(equipmentTag)}&idwebapp=${encodeURIComponent(idwebapp)}`;
                
                // Redirect to the runningtest.html page with the query string
                window.location.href = `runningtest.html${queryString}`;
            } else {
                alert(data.message || "Error updating test data.");
            }
        })
        .catch(err => {
            console.error("Error updating test data:", err);
            alert("An error occurred while updating test data.");
        });
    } else {
        alert("Please fill in all fields.");
    }
});





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