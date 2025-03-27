const sql = require("mssql/msnodesqlv8");

const config = {
    server: "HEROSQL1",
    database: "Test",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
};

sql.connect(config).then(pool => {
    return pool.request().query("SELECT * FROM username");
}).then(result => {
    console.log(result.recordset);
}).catch(err => {
    console.error(err);
});
