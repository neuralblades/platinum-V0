/**
 * Script to check database connection
 *
 * Usage: node src/scripts/check-db-connection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Get database config from environment variables
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER || process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT || 'mysql';

console.log('Checking database connection...');
console.log(`Database: ${dbName}`);
console.log(`Host: ${dbHost}`);
console.log(`User: ${dbUser}`);
console.log(`Dialect: ${dbDialect}`);

// Create Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: console.log,
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Get list of tables
    const [results] = await sequelize.query('SHOW TABLES');
    console.log('\nDatabase tables:');
    results.forEach((result, index) => {
      const tableName = result[`Tables_in_${dbName}`];
      console.log(`${index + 1}. ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Run the function
testConnection();
