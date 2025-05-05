/**
 * Script to check database tables and their structure
 * 
 * Usage: node src/scripts/check-db-tables.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Get database config from environment variables
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER || process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT || 'mysql';

console.log('Checking database tables and structure...');
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

// Test the connection and check tables
async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Get list of tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\nDatabase tables:');
    tables.forEach((result, index) => {
      const tableName = result[`Tables_in_${dbName}`];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    // Check specific tables
    console.log('\nChecking blog_posts table structure:');
    const [blogPostsColumns] = await sequelize.query('DESCRIBE blog_posts');
    blogPostsColumns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
    });
    
    console.log('\nChecking properties table structure:');
    const [propertiesColumns] = await sequelize.query('DESCRIBE properties');
    propertiesColumns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
    });
    
    // Check for featured properties
    console.log('\nChecking for featured properties:');
    const [featuredProperties] = await sequelize.query('SELECT COUNT(*) as count FROM properties WHERE featured = true');
    console.log(`Found ${featuredProperties[0].count} featured properties`);
    
    // Check for featured blog posts
    console.log('\nChecking for featured blog posts:');
    const [featuredBlogPosts] = await sequelize.query('SELECT COUNT(*) as count FROM blog_posts WHERE status = "published" AND viewCount > 0');
    console.log(`Found ${featuredBlogPosts[0].count} potential featured blog posts (published with views > 0)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database tables:', error);
    process.exit(1);
  }
}

// Run the function
checkTables();
