const { Client } = require('pg');

async function createDatabaseConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db'
  });
  
  await client.connect();
  return client;
}

async function createTestTable(client) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test_messages (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await client.query(createTableQuery);
  console.log('Test table created successfully');
}

async function insertTestData(client) {
  const insertQuery = `
    INSERT INTO test_messages (message) VALUES 
    ('Hello from PostgreSQL!'),
    ('CI/CD test is working'),
    ('Database connection successful')
    ON CONFLICT DO NOTHING
  `;
  
  await client.query(insertQuery);
  console.log('Test data inserted successfully');
}

async function getTestMessages(client) {
  const selectQuery = 'SELECT id, message, created_at FROM test_messages ORDER BY id';
  const result = await client.query(selectQuery);
  return result.rows;
}

module.exports = {
  createDatabaseConnection,
  createTestTable,
  insertTestData,
  getTestMessages
};
