
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const app = express();
const port = 3000;


const config = {
    server: "HEROSQL1",
    database: "Test",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
};
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
    res.send("Login API is running.");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    sql.connect(config, function (err) {
        if (err) {
            console.error("Connection error:", err);
            return res.status(500).send("DB connection failed");
        }

        const request = new sql.Request();
        const query = `SELECT * FROM Login WHERE username = '${username}' AND password = '${password}'`;

        request.query(query, function (err, result) {
            if (err) {
                console.error("Query error:", err);
                return res.status(500).send("Query failed");
            }

            if (result.recordset.length > 0) {
                res.status(200).send({ success: true });
            } else {
                res.status(401).send({ success: false });
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});