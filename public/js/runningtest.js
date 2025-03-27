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

// Extract query parameters
const params = new URLSearchParams(window.location.search);
const client = params.get("client");
const project = params.get("project");
const projectId = params.get("projectId");
const equipment = params.get("equipment");
const testName = params.get("testName");
const docNumber = params.get("docNumber");
const equipmentTag = params.get("equipmentTag");
const idwebapp = params.get("idwebapp");
console.log("idwebapp:", idwebapp); // Check if idwebapp is correct
console.log("equipmentTag:", equipmentTag); // Check if equipmentTag is correct

document.getElementById("formInfo").innerHTML = `
    <p><strong>Client:</strong> ${client}</p>
    <p><strong>Project:</strong> ${project}</p>
    <p><strong>Project ID:</strong> ${projectId}</p>
    <p><strong>Equipment:</strong> ${equipment}</p>
    <p><strong>Test Name:</strong> ${testName}</p>
    <p><strong>Document Number:</strong> ${docNumber}</p>
    <p><strong>Equipment TAG:</strong> ${equipmentTag}</p>
`;

fetch("/loadAuditForm")
    .then(response => response.json())
    .then(data => {
        if (
            data.client === client &&
            data.project === project &&
            data.projectId === projectId &&
            data.equipment === equipment &&
            data.testName === testName
        ) {
            const tableHeaders = document.getElementById("tableHeaders");
            const tableBody = document.getElementById("tableBody");

            tableHeaders.innerHTML = "";
            tableBody.innerHTML = "";

            // Add headers
            data.table.headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                tableHeaders.appendChild(th);
            });

            // Add rows
            data.table.rows.forEach(row => {
                const tr = document.createElement("tr");
                row.forEach(cell => {
                    const td = document.createElement("td");
                    td.textContent = cell;
                    td.contentEditable = "true"; // Allow editing test results
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            document.getElementById("testFormTable").innerHTML =
                "<p>Test form not found.</p>";
        }
    })
    .catch(error => console.error("Error loading test form:", error));

document.getElementById("saveTestReportBtn").addEventListener("click", function () {
    // Get the test finished status from the checkbox
    const testFinished = document.getElementById("testFinished").checked;
    // Make sure we have the necessary data before proceeding
    if (!idwebapp || !equipmentTag) {
        alert("Missing test data. Cannot save report.");
        return;
    }

    // Prepare the data to send to the server
    const testData = {
        idwebapp,
        equipmentTag,
        status: testFinished ? 'Finished' : 'In Progress' // Set status based on checkbox
    };

    // Send the data to the server to update the status
    fetch('/updateTestStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Test status updated successfully!");
        } else {
            alert(data.message || "Error updating test status.");
        }
    })
    .catch(err => {
        console.error("Error updating test status:", err);
        alert("An error occurred while saving the test report.");
    });
});

// Function to submit results
/*document.getElementById("submitResults").addEventListener("click", function () {
    const rows = Array.from(document.querySelectorAll("#tableBody tr")).map(tr =>
        Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim())
    );

    const updatedData = {
        client,
        project,
        projectId,
        equipment,
        testName,
        documentNumber: docNumber,
        table: {
            headers: Array.from(document.querySelectorAll("#tableHeaders th")).map(th => th.innerText.trim()),
            rows
        }
    };

    fetch("/saveAuditForm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(response => alert(response.message))
    .catch(error => console.error("Error saving test results:", error));
});*/

/*document.getElementById("generatePDF").addEventListener("click", async function () {
    console.log("📢 Generate PDF button clicked");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Load the template image
    const img = new Image();
    img.src = "/images/audit_template.png"; // Ensure this path is correct!
    console.log("🖼️ Loading template image...");

    img.onload = async function () {
        console.log("✅ Template image loaded!");

        // Add template background
        doc.addImage(img, "PNG", 0, 0, 210, 297);

        // Fetch form data from localStorage
        const client = localStorage.getItem("client") || "N/A";
        const project = localStorage.getItem("project") || "N/A";
        const projectId = localStorage.getItem("projectId") || "N/A";
        const equipment = localStorage.getItem("equipment") || "N/A";
        const tag = localStorage.getItem("equipmentTag") || "N/A";
        const testName = localStorage.getItem("testName") || "N/A";
        const documentNumber = localStorage.getItem("docNumber") || "N/A";
        const operatorName = localStorage.getItem("name") || "N/A";
        const auditDescription = document.getElementById("testDescription")?.value || "N/A";

        console.log("📌 Data extracted:", { client, project, projectId, equipment, tag, testName, documentNumber, operatorName, auditDescription });

        // Insert text into the PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Client: ${client}`, 20, 40);
        doc.text(`Project: ${project}`, 20, 50);
        doc.text(`Project ID: ${projectId}`, 20, 60);
        doc.text(`Equipment: ${equipment}`, 20, 70);
        doc.text(`Equipment TAG: ${tag}`, 20, 80);
        doc.text(`Test Name: ${testName}`, 20, 90);
        doc.text(`Document Number: ${documentNumber}`, 20, 100);
        doc.text(`Operator: ${operatorName}`, 20, 110);
        doc.text(`Audit Description:`, 20, 120);
        doc.text(auditDescription, 20, 125, { maxWidth: 170 });

        // Fetch the table data from JSON
        console.log("📥 Fetching table data...");
        fetch("/loadAuditForm")
            .then(response => response.json())
            .then(data => {
                if (!data.table || !data.table.headers || !data.table.rows) {
                    console.error("❌ No table data found!");
                    return;
                }
                console.log("✅ Table data loaded!", data.table);

                // Create a table in the PDF
                let yPosition = 140; // Start position for the table
                doc.setFontSize(10);

                // Add table headers
                doc.setFont("helvetica", "bold");
                doc.text(data.table.headers.join(" | "), 15, yPosition);
                yPosition += 5;

                // Add table rows
                doc.setFont("helvetica", "normal");
                data.table.rows.forEach(row => {
                    doc.text(row.join(" | "), 15, yPosition);
                    yPosition += 5;
                });

                // Save the PDF
                console.log("💾 Saving PDF...");
                doc.save("Audit_Report.pdf");
                console.log("✅ PDF saved!");
            })
            .catch(err => console.error("❌ Error fetching table:", err));
    };

    img.onerror = function () {
        console.error("❌ Failed to load template image. Check the path:", img.src);
    };
});
*/