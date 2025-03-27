import pyodbc

# Database connection
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=HEROSQL1;'
    'DATABASE=Test;'
    'UID=vmuser;'
    'PWD=[hero123]'
)

cursor = conn.cursor()

# Example query
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
