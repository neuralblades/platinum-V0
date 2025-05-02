# Deploying to Hostinger with MySQL

This guide will help you deploy your Real Estate application to Hostinger using MySQL as the database.

## Prerequisites

- A Hostinger account with a hosting plan that supports Node.js
- Access to Hostinger's control panel (hPanel)
- Your application code ready for deployment

## Step 1: Set Up MySQL Database on Hostinger

1. **Log in to your Hostinger account**
2. **Navigate to the hPanel**
3. **Go to "Databases" > "MySQL Databases"**
4. **Create a new database**:
   - Enter a database name (e.g., `real_estate_db`)
   - Create a new user with a strong password
   - Assign the user to the database with all privileges
5. **Note your database credentials**:
   - Database name
   - Username
   - Password
   - Host (usually localhost or a specific domain provided by Hostinger)
   - Port (usually 3306)

## Step 2: Upload Your Application to Hostinger

### Option 1: Using File Manager

1. **Go to "Files" > "File Manager" in hPanel**
2. **Navigate to the public_html directory or create a subdirectory for your application**
3. **Upload your application files**:
   - You can upload a ZIP file and extract it
   - Or upload files individually

### Option 2: Using FTP

1. **Go to "Files" > "FTP Accounts" in hPanel**
2. **Create an FTP account if you don't have one**
3. **Use an FTP client (like FileZilla) to upload your files**:
   - Host: Your FTP hostname (provided by Hostinger)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (default FTP port)
4. **Connect and upload your files to the appropriate directory**

## Step 3: Configure Environment Variables

1. **Create or edit the `.env` file in your backend directory**:
   ```
   PORT=3000
   DB_USERNAME=your_hostinger_mysql_username
   DB_PASSWORD=your_hostinger_mysql_password
   DB_NAME=your_hostinger_database_name
   DB_HOST=localhost
   DB_PORT=3306
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Update frontend environment variables**:
   - Edit the `.env.local` file in your frontend directory
   - Update the API URL to point to your Hostinger domain:
   ```
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## Step 4: Set Up Node.js on Hostinger

1. **Go to "Website" > "Node.js" in hPanel**
2. **Create a new Node.js application**:
   - Select the directory where your backend code is located
   - Set the Node.js version (choose the version compatible with your app)
   - Set the startup file (usually `src/server.js` or as defined in your package.json)
   - Set the application URL (e.g., your domain or subdomain)
   - Configure any additional environment variables if needed

3. **Install dependencies and start the application**:
   - SSH into your Hostinger server or use the Terminal in hPanel
   - Navigate to your backend directory
   - Run the following commands:
   ```bash
   npm install
   npm run build # If you have a build step
   npm start
   ```

## Step 5: Initialize and Set Up the Database

1. **SSH into your Hostinger server or use the Terminal in hPanel**
2. **Navigate to your backend directory**
3. **Run the database initialization and setup scripts**:
   ```bash
   npm run init-db
   npm run setup-db
   ```

## Step 6: Configure Domain and SSL

1. **Go to "Domains" in hPanel**
2. **Set up your domain if you haven't already**
3. **Enable SSL for your domain**:
   - Go to "SSL/TLS" in hPanel
   - Install an SSL certificate for your domain

## Step 7: Set Up Reverse Proxy (Optional)

If you're running your Node.js application on a specific port and want to make it accessible via your domain without specifying the port:

1. **Create or edit the `.htaccess` file in your public_html directory**:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
   </IfModule>
   ```

2. **This will proxy requests to `/api/*` to your Node.js application running on port 3000**

## Step 8: Deploy Frontend (Next.js)

1. **Build your Next.js application locally**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload the built files to Hostinger**:
   - Upload the `.next`, `public`, and `node_modules` directories
   - Upload `package.json` and `next.config.js`

3. **Configure Next.js to run on Hostinger**:
   - Go to "Website" > "Node.js" in hPanel
   - Create a new Node.js application for your frontend
   - Set the startup file to `node_modules/next/dist/bin/next start`

## Troubleshooting

### Database Connection Issues

- **Check your database credentials** in the `.env` file
- **Verify that your MySQL user has the correct permissions**
- **Try connecting to the database using a MySQL client** to confirm access

### Application Not Starting

- **Check the Node.js logs** in hPanel
- **Verify that all dependencies are installed correctly**
- **Make sure your start script in package.json is correct**

### Frontend Not Connecting to Backend

- **Check that your API URL is correct** in the frontend environment variables
- **Verify that your backend API is accessible** from the specified URL
- **Check for CORS issues** and ensure your backend allows requests from your frontend domain

## Additional Resources

- [Hostinger Node.js Hosting Documentation](https://support.hostinger.com/en/articles/4455931-how-to-set-up-node-js-app)
- [MySQL Database Management in Hostinger](https://support.hostinger.com/en/articles/1583558-how-to-create-a-mysql-database)
- [Setting Up Custom Domains in Hostinger](https://support.hostinger.com/en/articles/1583436-how-to-point-domain-to-hostinger-nameservers)
