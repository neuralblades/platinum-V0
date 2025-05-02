# MySQL Setup Guide

This guide will help you set up MySQL for the Real Estate Website project, especially for hosting on Hostinger.

## Option 1: Install MySQL Locally

### Windows

1. **Download MySQL**:
   - Go to [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Download the MySQL Installer for Windows
   - Choose the latest version

2. **Install MySQL**:
   - Run the installer
   - Choose "Developer Default" or "Custom" installation
   - Follow the installation wizard
   - Set a root password (remember this password!)
   - Configure MySQL as a Windows Service (recommended)

3. **Verify Installation**:
   - Open MySQL Workbench (installed with MySQL)
   - Connect to the server using the password you set
   - You should see the MySQL server in the connections panel

### macOS

1. **Using Homebrew**:
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. **Or download from the website**:
   - Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Download the DMG Archive
   - Follow the installation instructions

3. **Verify Installation**:
   ```bash
   mysql --version
   mysql -u root -p
   ```

### Linux (Ubuntu/Debian)

1. **Install MySQL**:
   ```bash
   sudo apt update
   sudo apt install mysql-server
   ```

2. **Secure the installation**:
   ```bash
   sudo mysql_secure_installation
   ```

3. **Start MySQL**:
   ```bash
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

4. **Verify Installation**:
   ```bash
   mysql --version
   sudo mysql -u root -p
   ```

## Option 2: Use Hostinger MySQL Database

If you're hosting your site on Hostinger, you can use their MySQL database service:

1. **Log in to your Hostinger account**
2. **Go to the hPanel**
3. **Navigate to "Databases" > "MySQL Databases"**
4. **Create a new database**:
   - Enter a database name
   - Create a new user or select an existing one
   - Set a strong password
   - Assign the user to the database with all privileges

5. **Note your database credentials**:
   - Database name
   - Username
   - Password
   - Host (usually localhost or a specific IP/domain provided by Hostinger)
   - Port (usually 3306)

## Setting Up the Database for the Project

After installing MySQL locally or setting up a Hostinger database:

1. **Update the `.env` file** with your MySQL credentials:
   ```
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_HOST=your_host
   DB_PORT=3306
   ```

2. **Initialize the database**:
   ```bash
   npm run init-db
   ```

3. **Set up the database with sample data**:
   ```bash
   npm run setup-db
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. **Check if MySQL is running**:
   - Windows: Open Services and check if MySQL service is running
   - macOS/Linux: `ps aux | grep mysql`

2. **Verify credentials**:
   - Make sure the username and password in `.env` are correct
   - Try connecting with the mysql client: `mysql -u your_username -p`

3. **Check host settings**:
   - For local development, use `127.0.0.1` or `localhost`
   - For Hostinger, use the host provided in your hosting panel

4. **Check firewall settings**:
   - Make sure port 3306 is open if connecting remotely

### Permission Issues

If you encounter permission issues:

1. **Create a new user** (if needed):
   ```sql
   CREATE USER 'your_username'@'%' IDENTIFIED BY 'your_password';
   ```

2. **Grant privileges**:
   ```sql
   GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'%';
   FLUSH PRIVILEGES;
   ```

## MySQL GUI Tools

For easier database management, you can use these GUI tools:

- **MySQL Workbench**: Official MySQL GUI tool
- **DBeaver**: Free universal database tool
- **HeidiSQL**: Lightweight Windows client
- **TablePlus**: Modern, native tool (free version available)
- **Sequel Pro/Sequel Ace**: Simple MySQL client for macOS

## Hostinger-Specific Notes

When deploying to Hostinger:

1. **Use the MySQL credentials provided in your Hostinger panel**
2. **Update your production environment variables accordingly**
3. **Make sure your application's database connection settings match Hostinger's requirements**
4. **If using SSL, configure the dialectOptions in your database.js file**
