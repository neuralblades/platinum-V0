/**
 * Script to run database migrations
 *
 * Usage: node src/scripts/run-migrations.js
 */

const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
require('dotenv').config();

// Get database config from environment variables
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT || 'mysql';

// Create Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: console.log,
});

// Create Umzug instance for migrations
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.js'),
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context.queryInterface, context.Sequelize),
        down: async () => migration.down(context.queryInterface, context.Sequelize),
      };
    },
  },
  context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Run migrations
async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    const migrations = await umzug.up();

    if (migrations.length === 0) {
      console.log('No migrations were executed, database schema is already up to date');
    } else {
      console.log(`Executed ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`- ${migration.name}`);
      });
    }

    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the function
runMigrations();
