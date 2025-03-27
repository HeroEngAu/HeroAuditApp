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
})
.catch(err => console.error("Error fetching clients:", err));

    // Event listener for client change
    document.getElementById('client').addEventListener('change', function () {
               
         const client = this.value;
        console.log("Client enviado:", client);
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
          })
          .catch(err => console.error("Error fetching projects:", err));
      } else {
        // Reset dropdowns if no client is selected
        populateDropdown('project', []);
        populateDropdown('projectId', []);
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
      } else {
        populateDropdown('projectId', []); // Clear project IDs if no project is selected
      }
    });
  };
  
  // Function to populate dropdown
  function populateDropdown(id, items) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option value="">Select</option>';  // Clear previous options
  
    // Check if items are available
    if (Array.isArray(items) && items.length > 0) {
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.text = item;
        dropdown.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.value = "";
      option.text = "No data available";
      dropdown.appendChild(option);
      //console.error(`No items to populate for ${id}`);
    }
  }
  
  // Function to load project log data based on selections
  function loadProjectLog() {
    const client = document.getElementById('client').value;
    const project = document.getElementById('project').value;
    const projectId = document.getElementById('projectId').value;
  
    if (client && project && projectId) {
      fetch('/getProjectLog', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ client, project, projectId })
      })
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector('#projectLogTable tbody');
        tbody.innerHTML = '';  // Clear previous table data
        data.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.equipment}</td>
            <td>${row.tag}</td>
            <td>${row.testName}</td>
            <td>${row.startDate || ''}</td>
            <td>${row.finishDate || ''}</td>
            <td>${row.status || ''}</td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(err => console.error("Error fetching project log:", err));
    } else {
      alert('Please select client, project, and project ID');
    }
  }
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
