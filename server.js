const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql'); // Use mssql library

const app = express();
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
    user: 'vmuser',
    password: '[hero123]',
    server: 'HEROSQL1',
    database: 'Test',
    options: {
        encrypt: false, // Set to true if using Azure
        trustServerCertificate: true, // Required for self-signed certificates
    },
};

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Query the database
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM users WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            res.json({ success: true, message: 'Login successful.' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
