# MySQL Migration Guide

This guide explains how to run the Sequelize migrations with MySQL after migrating from PostgreSQL.

## Prerequisites

1. Make sure you have MySQL installed and running
2. Update your `.env` file with MySQL connection details:

```
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql
```

## Running Migrations

To run all migrations:

```bash
npx sequelize-cli db:migrate
```

To undo the last migration:

```bash
npx sequelize-cli db:migrate:undo
```

To undo all migrations:

```bash
npx sequelize-cli db:migrate:undo:all
```

## Migration Files

The following migration files have been updated to be compatible with MySQL:

1. `20240502000000-remove-category-from-properties.js`
   - Removed PostgreSQL-specific ENUM type operations
   - Updated SQL queries to use backticks for identifiers

2. `20240601000000-create-document-request-table.js`
   - Removed PostgreSQL-specific ENUM type drop operations

## MySQL vs PostgreSQL Differences

1. **ENUM Types**:
   - PostgreSQL: Requires explicit creation and dropping of ENUM types
   - MySQL: ENUM types are handled automatically with column creation/deletion

2. **Identifiers**:
   - PostgreSQL: Uses double quotes (`"column_name"`)
   - MySQL: Uses backticks (`` `column_name` ``)

3. **Boolean Values**:
   - PostgreSQL: Uses `true`/`false`
   - MySQL: Uses `1`/`0`

4. **Case Sensitivity**:
   - PostgreSQL: Case-sensitive by default
   - MySQL: Case-insensitive by default on Windows, case-sensitive on Unix/Linux

## Troubleshooting

If you encounter any issues with the migrations:

1. Check the MySQL error logs
2. Verify your database connection settings
3. Make sure your MySQL user has sufficient privileges
4. For specific migration errors, check the migration file mentioned in the error message

For more information, refer to the [Sequelize documentation](https://sequelize.org/master/manual/migrations.html).
