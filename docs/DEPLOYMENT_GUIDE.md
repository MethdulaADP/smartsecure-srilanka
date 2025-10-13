# SmartSecure Sri Lanka - Deployment Guide
**Date:** October 13, 2025  
**Status:** Production Deployment Options

---

## Table of Contents
1. [Quick Deployment (Railway - Recommended)](#option-1-railway-recommended)
2. [Free Deployment (Render + Vercel)](#option-2-render--vercel-free)
3. [AWS Deployment](#option-3-aws-ec2)
4. [DigitalOcean Deployment](#option-4-digitalocean)
5. [Local Network Deployment](#option-5-local-network)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🚀 OPTION 1: Railway (Recommended - Easiest)

**Cost:** $5/month (500 hours free trial)  
**Difficulty:** ⭐ Easy  
**Time:** 10-15 minutes

### Step 1: Prepare for Railway

Create `railway.json` in project root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && python final_working_server.py",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Create `Procfile` in project root:
```
web: cd backend && python final_working_server.py
```

### Step 2: Update Backend for Production

Update `backend/final_working_server.py` - change the last line from:
```python
app.run(debug=True, host='0.0.0.0', port=5004)
```

To:
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    app.run(debug=False, host='0.0.0.0', port=port)
```

### Step 3: Deploy to Railway

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select:** smartsecure-srilanka repository
5. **Configure:**
   - Root Directory: `/`
   - Start Command: `cd backend && python final_working_server.py`
6. **Add Environment Variables:**
   ```
   JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
   FLASK_ENV=production
   ```
7. **Deploy!** Railway will auto-deploy

### Step 4: Deploy Frontend to Vercel

1. **Go to:** https://vercel.com
2. **Import** smartsecure-srilanka repository
3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
5. **Deploy!**

### Step 5: Update Frontend API URL

Update `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004';
```

**✅ Done! Your app is live at:** `https://your-app.vercel.app`

---

## 🆓 OPTION 2: Render + Vercel (100% Free)

**Cost:** FREE  
**Difficulty:** ⭐⭐ Moderate  
**Time:** 20 minutes

### Step 1: Create `render.yaml`

Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: smartsecure-backend
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && python final_working_server.py"
    envVars:
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: FLASK_ENV
        value: production
      - key: PORT
        value: 10000
```

### Step 2: Deploy Backend to Render

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **New Web Service** → Connect smartsecure-srilanka
4. **Configure:**
   - Name: smartsecure-backend
   - Environment: Python 3
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python final_working_server.py`
5. **Environment Variables:**
   ```
   JWT_SECRET_KEY=your-secret-key-here
   FLASK_ENV=production
   ```
6. **Deploy!** (takes 3-5 minutes)

### Step 3: Deploy Frontend to Vercel

Same as Railway Option (see above) - but use Render backend URL

**⚠️ Free Tier Limitations:**
- Spins down after 15 minutes of inactivity
- First request may take 30+ seconds to wake up
- 750 hours/month free

---

## ☁️ OPTION 3: AWS EC2 (Most Professional)

**Cost:** ~$10-20/month (Free tier available)  
**Difficulty:** ⭐⭐⭐⭐ Advanced  
**Time:** 45-60 minutes

### Step 1: Launch EC2 Instance

1. **Go to:** AWS Console → EC2
2. **Launch Instance:**
   - AMI: Ubuntu Server 22.04 LTS
   - Type: t2.micro (free tier)
   - Security Group: Allow ports 22, 80, 443, 5004, 5173
3. **Download** key pair (.pem file)

### Step 2: Connect to Server

```powershell
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3 python3-pip -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y
```

### Step 4: Clone and Setup

```bash
# Clone repository
git clone https://github.com/MethdulaADP/smartsecure-srilanka.git
cd smartsecure-srilanka

# Setup Backend
cd backend
pip3 install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
npm run build
```

### Step 5: Setup Nginx

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/smartsecure
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/smartsecure-srilanka/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/smartsecure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start backend
cd ~/smartsecure-srilanka/backend
pm2 start final_working_server.py --name smartsecure-backend --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 7: Setup SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

**✅ Access at:** `http://your-ec2-ip` or `https://your-domain.com`

---

## 🌊 OPTION 4: DigitalOcean Droplet

**Cost:** $6/month  
**Difficulty:** ⭐⭐⭐ Moderate  
**Time:** 30-40 minutes

Very similar to AWS EC2 setup, but with simpler interface:

1. **Create Droplet:**
   - Ubuntu 22.04
   - Basic Plan: $6/month
   - Region: Choose closest to Sri Lanka (Singapore)

2. **Follow AWS EC2 Steps 2-7** (same commands work)

3. **DigitalOcean Benefits:**
   - Simpler pricing
   - Better documentation
   - Easier firewall setup
   - Free bandwidth

---

## 🏠 OPTION 5: Local Network Deployment

**Cost:** FREE  
**Difficulty:** ⭐⭐ Easy  
**Time:** 15 minutes

Perfect for office/campus deployment!

### Step 1: Update CORS Settings

Update `backend/final_working_server.py`:
```python
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://192.168.*.*:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Step 2: Update Flask Host

```python
app.run(debug=False, host='0.0.0.0', port=5004)
```

### Step 3: Update Frontend API URL

In `frontend/src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_LOCAL_IP:5004';
```

### Step 4: Start Servers

```powershell
# Terminal 1 - Backend
cd backend
python final_working_server.py

# Terminal 2 - Frontend
cd frontend
npm run dev -- --host
```

### Step 5: Access from Other Devices

Find your local IP:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Access from any device on same network:**
- Frontend: `http://192.168.1.100:5173`
- Backend: `http://192.168.1.100:5004`

---

## 📋 Post-Deployment Checklist

### Security
- [ ] Change JWT_SECRET_KEY to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Update CORS whitelist to production domain
- [ ] Change default admin password
- [ ] Set `debug=False` in Flask
- [ ] Enable firewall rules
- [ ] Setup regular backups

### Configuration
- [ ] Update API_URL in frontend to production backend
- [ ] Set proper environment variables
- [ ] Configure database path
- [ ] Test file upload/download
- [ ] Test authentication flow
- [ ] Test AI threat scanning

### Monitoring
- [ ] Setup error logging
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Setup email alerts
- [ ] Monitor disk space
- [ ] Monitor CPU/memory usage

### Documentation
- [ ] Document deployment process
- [ ] Create admin guide
- [ ] Update README with live URL
- [ ] Create backup/restore procedures

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python3 --version  # Should be 3.9+

# Check dependencies
pip3 install -r requirements.txt

# Check port availability
netstat -tulpn | grep 5004
```

### Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### CORS Errors
- Ensure backend CORS includes your frontend URL
- Check browser console for exact error
- Verify API_URL is correct in frontend

### Database Issues
```bash
# Check database file exists
ls -la backend/smartsecure.db

# Check permissions
chmod 644 backend/smartsecure.db
```

---

## 🎯 Recommended Option for Your Supervisor Meeting

**For Demo (Tuesday, Oct 15):**
- Use **OPTION 5: Local Network** - Most reliable, no internet needed
- Access from: `http://localhost:5173` (on your laptop)

**For Long-term / Portfolio:**
- Use **OPTION 1: Railway + Vercel** - Easiest, professional URLs
- Share link: `https://smartsecure-srilanka.vercel.app`

**For Production / Real Business:**
- Use **OPTION 3: AWS EC2** - Most control, professional setup

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- AWS Free Tier: https://aws.amazon.com/free

---

**Good luck with deployment! 🚀**
**Your project is ready for the world!**
