const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

async function initDb() {
  try {
    // Create a Sequelize instance without database name
    const sequelize = new Sequelize(
      null,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        logging: console.log,
      }
    );

    // Connect to MySQL
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    // Create database if it doesn't exist
    try {
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
      console.log(`Database ${config.database} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Database ${config.database} already exists`);
      } else {
        throw error;
      }
    }

    // Close connection
    await sequelize.close();
    console.log('MySQL database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.log('\nMake sure MySQL is running and accessible with the provided credentials.');
    console.log('You can install MySQL from: https://dev.mysql.com/downloads/');
    console.log('\nOr use your Hostinger MySQL database with the credentials provided in your hosting panel.');
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  initDb();
}

module.exports = initDb;
