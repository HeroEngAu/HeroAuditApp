const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 3000;
const mongoURL = "mongodb://localhost:27017"; 


app.use(express.json());
app.use(cors());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Initialize MongoDB client once
let client;
MongoClient.connect(mongoURL)
  .then((mongoClient) => {
    client = mongoClient;
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Login API endpoint
app.post("/login", async (req, res) => {
    const db = client.db("Login");

    const { username, password } = req.body; //Get the username and password from the request body
    console.log("username:", username);
    console.log("password:", password);
    try {
        const user = await db.collection("Login").findOne({ User: username, Password: password });

        if (user) {
          res.json({
            success: true,
            message: "Login successful!",
            name: user.Name,
            role: user.Role, // Return the user's name and role
          });
        } else {
          res.status(401).json({ success: false, message: "Invalid username or password" });
        }
      } catch (error) {
        console.error("Query error:", error);
        res.status(500).json({ success: false, message: "Database query error" });
      }
});

app.post("/forgotPassword", async (req, res) => {
    const db = client.db("Login");

    const { email } = req.body;
    // Check if the email is provided
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    
    try {
        const newPassword = Math.floor(1000000 + Math.random() * 9000000).toString(); // Generate a random 7-digit number as the new password

        const result = await db.collection("Login").updateOne(
            {Email: email},
            {$set: {Password: newPassword}}
        );
        //console.log('Result:', result);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Email not found in the database." });
        }

        console.log(`Password updated for email: ${email}`);
        res.status(200).json({
            message: "Password updated successfully.",
        });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "An error occurred while updating the password." });
    }
});

//Get the client and project names from the "TIMESITE" table (DB) to be used in the dropdown
app.get("/clients", async (req, res) => {
    const db = client.db("Clients");
    try {
        // Fetch the clients with only the Client field
        const clients = await db.collection("clients").find({}, { projection: { Client: 1, _id: 0 } }).toArray();
        
        res.json(clients);  // Send the formatted data as a JSON response
        //console.log('Formatted ClientsData:', clients);  // Log the formatted data
    } catch (error) {
        console.error("Query error:", error);
        res.status(500).send("Query error");
    }
});

app.get("/projects", async (req, res) => {
    const db = client.db("Clients");
    try {
        const clientName = decodeURIComponent(req.query.client);

        if (!clientName) {
            return res.status(400).json({ error: "Client parameter is required" });
        }

        // Query for the projects of a specific client
        const timesiteData = await db.collection("clients").find(
            { "Client": clientName },
            { projection: { "projects.projectName": 1, _id: 0 } }
        ).toArray();

        res.json(timesiteData);
    } catch (error) {
        console.error("Query error:", error);
        res.status(500).send("Query error");
    }
});

app.get("/projectIDs", async (req, res) => {
    const db = client.db("Clients");
    try {
        const clientName = decodeURIComponent(req.query.client);
        if (!clientName) {
            return res.status(400).json({ error: "Client parameter is required" });
        }

        const clientData = await db.collection("clients").findOne(
            { "Client": clientName },
            { projection: { "projects.projectName": 1, "projects.projectID": 1, _id: 0 } }
        );

        console.log("Raw Client Data:", clientData);

        if (!clientData || !clientData.projects) {
            return res.status(404).json({ error: "No projects found for this client" });
        }

        const projectIDs = clientData.projects.map(project => ({
            projectName: project.projectName,
            projectID: project.projectID // Fixing the key name
        }));

        console.log("Formatted Project IDs:", projectIDs);
        res.json(projectIDs);
    } catch (error) {
        console.error("Query error:", error);
        res.status(500).send("Query error");
    }
});



app.post("/create-form", async (req, res) => {
    const { client, project, projectId, equipment, testName, DocNumber } = req.body;

    //Check if all required fields are provided
    if (!client || !project || !projectId || !equipment || !testName || !DocNumber) {
        return res.status(400).json({ success: false, message: "All fields are mandatory." });
    }

    try {
        await sql.connect(config);

        //Check if there's an existing form with the same data
        const checkExisting = await sql.query`
            SELECT * FROM webapp
            WHERE client = ${client}
              AND project = ${project}
              AND projectid = ${projectId}
              AND equipment = ${equipment}
              AND testname = ${testName}
              AND docnumber = ${DocNumber}
        `;

        if (checkExisting.recordset.length > 0) {
            return res.status(409).json({ success: false, message: "This form already exists." });
        }

        // Insert new form data into the database
        await sql.query`
            INSERT INTO webapp (client, project, projectid, equipment, testname, docnumber)
            VALUES (${client}, ${project}, ${projectId}, ${equipment}, ${testName}, ${DocNumber})
        `;

        res.json({ success: true, message: "The new form has been successfully created!" });

    } catch (err) {
        console.error("Erro ao criar formulário:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/*app.post('/getTestDescription', async (req, res) => {
    const { client, projectName, projectId, equipment, testName } = req.body;

    try {
        const pool = await sql.connect(config);

        const result = await pool.request()
            .input('client', sql.VarChar, client)
            .input('project', sql.VarChar, projectName)
            .input('projectId', sql.VarChar, projectId)
            .input('equipment', sql.VarChar, equipment)
            .input('testName', sql.VarChar, testName)
            .query(`
                SELECT description 
                FROM Webapp 
                WHERE client = @client AND project = @project AND projectId = @projectId 
                  AND equipment = @equipment AND testName = @testName
            `);

        if (result.recordset.length > 0) {
            const description = result.recordset[0].description ?? ""; // se for NULL, envia string vazia
            res.json({ success: true, description });
        } else {
            // Registro existe no sistema (pelo que você já selecionou), mas sem descrição
            res.json({ success: false, message: "No matching record found for the provided data." });
        }

    } catch (err) {
        console.error("DB error:", err.message);
        res.json({ success: false, message: "DB error" });
    }
});*/


//Get the equipments from the database to be userd in the dropdown
app.get('/equipments', (req, res) => {
    const request = new sql.Request();
    request.query("SELECT DISTINCT Equipment FROM Webapp WHERE Equipment IS NOT NULL", function (err, result) {
        if (err) {
            console.error("Query error:", err);
            res.status(500).send("Query error");
        } else {
            const equipmentList = result.recordset.map(row => row.Equipment);
            res.json(equipmentList);
        }
    });
});


app.get('/equipmentTags', (req, res) => {
    sql.connect(config, function (err) {
        if (err) {
            console.error("DB connection error:", err);
            res.status(500).send("DB connection failed");
            return;
        }
        const request = new sql.Request();
        request.query("SELECT DISTINCT EquipmentTag FROM auditrun WHERE EquipmentTag IS NOT NULL", function (err, result) {
            if (err) {
                console.error("Query error:", err);
                res.status(500).send("Query error");
            } else {
                const equipmentTags = result.recordset.map(row => row.EquipmentTag);
                console.log("Fetched Equipment Tags:", equipmentTags); // Log the result
                res.json(equipmentTags);
            }
        });
    });
});


//Get the test names from the database to be userd in the dropdown
app.get('/test-names', (req, res) => {
    sql.connect(config, function (err) {
        if (err) {
            console.error("DB connection error:", err);
            res.status(500).send("DB connection failed");
            return;
        }
        const request = new sql.Request();
        request.query("SELECT DISTINCT TestName FROM Webapp WHERE TestName IS NOT NULL", function (err, result) {
            if (err) {
                console.error("Query error:", err);
                res.status(500).send("Query error");
            } else {
                const testNameList = result.recordset.map(row => row.TestName);
                res.json(testNameList);
            }
        });
    });
});

//Save description to the database
app.post("/saveDescription", async (req, res) => {
    const { client, projectName, projectId, testName, equipment, description } = req.body;
    console.log('Received data:', { client, projectName, projectId, equipment, testName, description });
    try {
        await sql.connect(config);

        const result = await sql.query`
            UPDATE webapp
            SET description = ${description}
            WHERE client = ${client} 
                AND project = ${projectName}
                AND projectid = ${projectId}
                AND equipment = ${equipment} 
                AND testname = ${testName}                
        `;

        console.log('Update result:', result);

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: "Description successfully updated." });
        } else {
            console.log('No rows were affected. Ensure the matching data exists.');
            res.status(404).json({ success: false, message: "No rows were effected." });
        }
    } catch (err) {
        console.error("Error updating description:", err);
        res.status(500).json({ success: false, error: "Error updating description" });
    }
});

app.post('/getProjectLog', async (req, res) => {
    const { client, project, projectId } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('client', sql.VarChar, client)
        .input('project', sql.VarChar, project)
        .input('projectId', sql.VarChar, projectId)
        .query(`
          SELECT equipment, testName 
          FROM Webapp
          WHERE client = @client AND project = @project AND projectId = @projectId
        `);
  
      res.json(result.recordset);
    } catch (err) {
      console.error("Error fetching project log:", err);
      res.status(500).json({ message: 'Error fetching project log' });
    }
});

app.get('/getClientProjectData', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
        SELECT DISTINCT client FROM Webapp
      `);
  
      const clients = result.recordset.map(row => row.client);
      //console.log("Clients found:", clients);
      res.json({ clients });
    } catch (err) {
      console.error("Erro ao buscar clients:", err);
      res.status(500).json({ error: 'Erro ao buscar clients' });
    }
  });

  
app.get('/getProjects', async (req, res) => {
    const client = req.query.client;
    //console.log("Received in /getProjects:", client);
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('client', sql.VarChar, client)
        .query("SELECT DISTINCT project FROM webapp WHERE client = @client");
  
      const projects = result.recordset.map(row => row.project?.trim()).filter(p => p);
      //console.log("Project found:", projects);
  
      res.json({ projects });
    } catch (err) {
      console.error("Erro DB /getProjects:", err);
      res.status(500).json({ success: false, message: "DB error" });
    }
});
  
app.get('/getProjectIds', async (req, res) => {
    const { client, project } = req.query;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('client', sql.VarChar, client)
        .input('project', sql.VarChar, project)
        .query('SELECT DISTINCT projectId FROM Webapp WHERE client = @client AND project = @project');
  
      const projectIds = result.recordset.map(row => row.projectId);
      res.json({ projectIds });
    } catch (err) {
      console.error("Error fetching project IDs:", err);
      res.status(500).json({ message: 'Error fetching project IDs' });
    }
});
app.get('/getEquipment', async (req, res) => {
    const { client, project } = req.query;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('client', sql.VarChar, client)
            .input('project', sql.VarChar, project)
            .query('SELECT DISTINCT equipment FROM Webapp WHERE client = @client AND project = @project');

        const equipment = result.recordset.map(row => row.equipment);
        res.json({ equipment });
    } catch (err) {
        console.error("Error fetching equipment:", err);
        res.status(500).json({ message: 'Error fetching equipment' });
    }
});
app.get('/getTestNames', async (req, res) => {
    const { client, project } = req.query;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('client', sql.VarChar, client)
            .input('project', sql.VarChar, project)
            .query('SELECT DISTINCT testName FROM Webapp WHERE client = @client AND project = @project');

        const testNames = result.recordset.map(row => row.testName);
        res.json({ testNames });
    } catch (err) {
        console.error("Error fetching test names:", err);
        res.status(500).json({ message: 'Error fetching test names' });
    }
});

const fs = require("fs");
const { time } = require("console");

app.post("/saveAuditForm", (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, "auditFormData.json");

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Error saving audit form:", err);
            return res.status(500).json({ message: "Error saving audit form" });
        }
        res.json({ message: "Audit form saved successfully!" });
    });
});

app.get("/loadAuditForm", (req, res) => {
    const filePath = path.join(__dirname, "auditFormData.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error loading audit form:", err);
            return res.status(500).json({ message: "Error loading audit form" });
        }

        res.json(JSON.parse(data));
    });
});

app.post('/updateTestData', async (req, res) => {
    const { client, project, projectId, equipment, testName, docNumber, equipmentTag } = req.body;

    if (!client || !project || !projectId || !equipment || !testName || !docNumber || !equipmentTag) {
        return res.status(400).json({ success: false, message: "All fields are mandatory." });
    }

    try {
        await sql.connect(config);

        // Get the Webapp ID
        const webappQuery = await sql.query`
            SELECT IDWEBAPP FROM webapp
            WHERE client = ${client} 
            AND project = ${project} 
            AND projectId = ${projectId}
            AND equipment = ${equipment} 
            AND testName = ${testName}
            AND docNumber = ${docNumber}
        `;

        if (webappQuery.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Record not found in webapp." });
        }

        const webappID = webappQuery.recordset[0].IDWEBAPP;
    
        // Check if the combination already exists
        const duplicateCheck = await sql.query`
            SELECT 1 FROM auditrun WHERE idwebapp = ${webappID} AND equipmentTag = ${equipmentTag}
        `;

        if (duplicateCheck.recordset.length > 0) {
            return res.status(409).json({ success: false, message: "This equipmentTag is already assigned to this webappID." });
        }

        // Insert new record
        await sql.query`
            INSERT INTO auditrun (idwebapp, equipmentTag, startDate)
            VALUES (${webappID}, ${equipmentTag}, GETDATE())
        `;

        res.json({ success: true, message: "Test data inserted successfully.", idwebapp: webappID });

    } catch (err) {
        console.error("Error inserting test data:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

app.get('/getDocNumbers', async (req, res) => {
    const { client, project } = req.query;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('client', sql.VarChar, client)
            .input('project', sql.VarChar, project)
            .query('SELECT DISTINCT docNumber FROM Webapp WHERE client = @client AND project = @project');

        const docNumbers = result.recordset.map(row => row.docNumber);
        res.json({ docNumbers });
    } catch (err) {
        console.error("Error fetching DocNumbers:", err);
        res.status(500).json({ message: 'Error fetching DocNumbers' });
    }
});

// Endpoint to update the test status to finished
app.post('/updateTestStatus', async (req, res) => {
    const { idwebapp, equipmentTag, status } = req.body;

    if (!idwebapp || !equipmentTag || !status) {
        return res.status(400).json({ success: false, message: "Missing required data." });
    }

    try {
        await sql.connect(config);

        // Update the status in the auditrun table
        await sql.query`
            UPDATE auditrun
            SET status = ${status}, finishDate = GETDATE()
            WHERE idwebapp = ${idwebapp} AND equipmentTag = ${equipmentTag}
        `;

        res.json({ success: true, message: "Test status updated successfully." });

    } catch (err) {
        console.error("Error updating test status:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Endpoint to check test status
app.get('/getTestStatus', async (req, res) => {
    const { idwebapp, equipmentTag } = req.query;

    if (!idwebapp || !equipmentTag) {
        return res.status(400).json({ success: false, message: "Missing parameters." });
    }

    try {
        await sql.connect(config);

        // Query the database to check the test status
        const result = await sql.query`
            SELECT status FROM auditrun 
            WHERE idwebapp = ${idwebapp} AND equipmentTag = ${equipmentTag}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Test not found." });
        }

        // Return the test status (either "finished" or "in progress")
        const status = result.recordset[0].status;
        res.json({ success: true, status });
    } catch (err) {
        console.error("Error fetching test status:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});