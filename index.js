const sql = require("mssql/msnodesqlv8");

const config = {
    server: "HEROSQL1",
    database: "Test",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
};

sql.connect(config, function (err) {
    if (err) {
        console.error("Connection error:", err);
        return;
    }
    const request = new sql.Request();
    request.query("SELECT * FROM Login", function (err, recordset) {
        if (err) {
            console.error("Query error:", err);
        } else {
            console.log("Query result:", recordset);
        }
    });
});
