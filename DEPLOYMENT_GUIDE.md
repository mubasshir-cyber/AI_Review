# 🚀 Tap Review AI — VPS Deployment & Project Architecture Guide

## 📌 Project Overview (Gist of the Project)

**Tap Review AI** is an enterprise-grade Google Review Growth & Reputation Management Platform designed for multi-branch businesses and white-label digital agencies.

### Key Capabilities & Portals
1. **Customer Feedback Portal (`/?portal=customer&branchId=...`)**:
   - High-converting QR/NFC target page for end customers.
   - **Smart Review Filtering**: Directs 4-5★ ratings to Google Maps, while routing 1-3★ reviews to private management feedback forms to protect public reputation.
   - **Gemini AI Review Generator**: Assists customers in writing detailed, positive Google reviews with custom highlights (e.g., service quality, ambiance, speed).

2. **Business Owner Portal (`/?portal=business`)**:
   - **Advanced QR & Standee Studio**: Custom logo center badges, Google rating badges, table-tent card templates, high-res PNG download, and printable A4 PDF generator.
   - **AI Review Auto-Replier**: Generates empathetic, brand-aligned public review responses using Google Gemini AI (`@google/genai`).
   - **Google Review Highlights Studio**: Customize customer sentiment tags and review prompts per branch.
   - **Analytics & Feedback Dashboard**: Track rating distributions, Google click counts, and private customer feedback messages.

3. **Agency Admin Portal (`/?portal=agency`)**:
   - **Multi-Tenant White-Labeling**: Manage client business accounts, custom domain branding, and agency subscription plans.
   - **System Administration**: Multi-branch overview, team access, and system-wide performance metrics.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Express.js (Node.js CJS Bundle), TSX, JSONWebToken (JWT), Bcrypt.js.
- **Database**: PostgreSQL (`pg` pooled client with automatic schema migrations).
- **AI Integration**: `@google/genai` (Google Gemini 2.5 Flash / Flash Lite).
- **Build System**: Vite (SPA Client) + Esbuild (Single-file Node.js CJS server output `dist/server.cjs`).

---

## 🖥️ Complete VPS Setup & Git Deployment Guide

This guide walks you through deploying **Tap Review AI** on an Ubuntu/Debian Linux VPS (e.g. DigitalOcean, Hetzner, AWS EC2, Linode, Vultr) using **Node.js, PostgreSQL, PM2, Nginx, and Git**.

---

### Phase 1: VPS Server Initial Preparation

1. **Connect to your VPS via SSH**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Update System Packages & Install Core Tools**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git build-essential nginx ufw
   ```

3. **Install Node.js (v20 LTS or v22 LTS)**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Verify Node & NPM versions
   node -v
   npm -v
   ```

4. **Install PM2 Process Manager globally**:
   ```bash
   sudo npm install -g pm2
   ```

---

### Phase 2: PostgreSQL Database Setup

*Option A: Local PostgreSQL on the VPS*
```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user & create database + user
sudo -u postgres psql -c "CREATE DATABASE tap_review_ai;"
sudo -u postgres psql -c "CREATE USER tapai_user WITH PASSWORD 'YourStrongSecurePassword123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tap_review_ai TO tapai_user;"
```

*Option B: Remote / Managed Database (e.g. Render, Supabase, Neon)*
- Note down your connection string: `postgresql://user:password@host:5432/dbname?sslmode=require`

---

### Phase 3: Project Cloning & Configuration

1. **Create application directory**:
   ```bash
   sudo mkdir -p /var/www/tap-review-ai
   sudo chown -R $USER:$USER /var/www/tap-review-ai
   cd /var/www/tap-review-ai
   ```

2. **Clone your Git Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Create Production Environment File (`.env`)**:
   ```bash
   nano .env
   ```

   Paste and fill in your actual production values:
   ```env
   # Node Server Port & Host
   PORT=3000
   NODE_ENV=production

   # Database Connection
   DATABASE_URL="postgresql://tapai_user:YourStrongSecurePassword123!@localhost:5432/tap_review_ai"

   # Security JWT Secret Key
   JWT_SECRET="generate_a_random_long_secret_key_here_2026"

   # Google Gemini AI API Key
   GEMINI_API_KEY="AIzaSyYourActualGeminiApiKey"
   ```

5. **Run Database Migrations & Initial Seed**:
   ```bash
   npm run migration:run
   ```

---

### Phase 4: Application Build & Process Management

1. **Build the Application (Vite Frontend + Esbuild Backend)**:
   ```bash
   npm run build
   ```
   *This compiles static web assets into `dist/` and bundles server code into `dist/server.cjs`.*

2. **Start Application with PM2**:
   ```bash
   pm2 start dist/server.cjs --name "tap-review-ai"
   
   # Save PM2 process list so it restarts automatically on server reboot
   pm2 save
   pm2 startup
   ```
   *(Follow the command provided by `pm2 startup` to enable systemd auto-start).*

3. **Check Application Status**:
   ```bash
   pm2 status
   pm2 logs tap-review-ai
   ```

---

### Phase 5: Nginx Reverse Proxy & SSL Certificate (HTTPS)

1. **Configure Firewall (UFW)**:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Create Nginx Site Configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/tap-review-ai
   ```

   Paste the following configuration (Replace `yourdomain.com` with your actual domain name):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       client_max_body_size 10M;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Nginx Configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tap-review-ai /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Install Free Let's Encrypt SSL (HTTPS)**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

### Phase 6: Automated Git Deployment Workflow

When you push code updates to your Git repository, update the production server easily with these steps or a deployment script:

1. **Create `deploy.sh` in project root**:
   ```bash
   nano deploy.sh
   ```

   Paste:
   ```bash
   #!/bin/bash
   echo "🚀 Starting Deployment..."
   
   # Pull latest code
   git pull origin main

   # Install any new dependencies
   npm install --production=false

   # Run database migrations
   npm run migration:run

   # Build frontend & backend
   npm run build

   # Restart PM2 process smoothly
   pm2 reload tap-review-ai

   echo "✅ Deployment completed successfully!"
   ```

2. **Make script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **To Deploy Updates in Future**:
   ```bash
   ./deploy.sh
   ```

---

## 🔍 Useful PM2 Commands

- Check status: `pm2 status`
- View live logs: `pm2 logs tap-review-ai`
- Restart app: `pm2 restart tap-review-ai`
- Stop app: `pm2 stop tap-review-ai`
- Monitor memory & CPU: `pm2 monit`
