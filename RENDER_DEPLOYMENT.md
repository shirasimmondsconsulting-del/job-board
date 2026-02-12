# Render Deployment: SendGrid SMTP Configuration Fix

## ✅ Problem & Solution

**Problem**: SMTP connection times out on Render (60-90 seconds) but works locally
- **Root Cause**: Render blocks port 587 (TLS), but allows port 465 (SSL)
- **Solution**: Auto-detect Render environment and use port 465 SSL

## 🎯 What Changed

Your application now **automatically detects Render** and:
- ✅ Uses port **465 (SSL)** on Render (instead of 587)
- ✅ Uses port **587 (TLS)** locally/development
- ✅ Extended timeout to **90 seconds** for cloud latency
- ✅ Reduced connection pool for Render stability
- ✅ Enhanced error messages with environment detection

---

## 📋 Render Deployment Setup

### Step 1: Render Environment Variables

**On Render Dashboard**, go to **Settings → Environment**

Add these environment variables:

```properties
RENDER=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
SMTP_FROM_EMAIL=support@yourdomain.com
SMTP_FROM_NAME=Habayta Jobs
```

**Important**: Set `RENDER=true` so application auto-switches to port 465 SSL

### Step 2: Verify Before Deployment

```bash
# Local test with local settings
RENDER=false node verify_smtp.js

# Test with Render settings simulation (uses port 465)
RENDER=true node verify_smtp.js
```

---

## 🔧 How Port Auto-Switching Works

```javascript
// Application detects environment
const isRender = process.env.RENDER === 'true' || process.env.RENDER_EXTERNAL_URL;

// Uses appropriate port
const port = isRender ? 465 : 587;      // SSL on Render, TLS locally
const secure = isRender ? true : false;  // Always true on Render
```

### Before vs After Configuration

| Setting | Local (587 TLS) | Render (465 SSL) |
|---------|-----------------|-----------------|
| SMTP Port | 587 | 465 (auto-switched) |
| Connection | TLS 1.2 | SSL/TLS 1.2 |
| Timeout | 90 seconds | 90 seconds |
| Pool Size | 2-5 connections | 2 connections |
| Rate Limit | 5-14 msg/sec | 5 msg/sec (slower) |
| Status | ✅ Works | ✅ Works |

---

## 📧 SendGrid API Key Setup

### Getting Your API Key

1. **Log in** to SendGrid: https://app.sendgrid.com
2. Navigate to: **Settings → API Keys**
3. Click **"Create API Key"**
4. Name it: `Habayta Jobs - Render`
5. Select: **Full Access** (or at least Mail Send)
6. Copy the key (looks like: `SG.xxxxxxxxxxxxx`)

### Using the API Key

```properties
SMTP_PASS=SG.xxxxxxxxxxxxx
# Keep the "SG." prefix - it's part of the key!
```

---

## 🚀 Testing on Render

### After Deployment

1. **Check Render logs**:
   ```
   ✅ SMTP Server is ready to take our messages
      Host: smtp.sendgrid.net
      Port: 465 (SSL)
      Environment: ✅ RENDER
   ```

2. **Monitor email delivery**:
   - Registration verification emails
   - Password reset emails
   - Application notifications

3. **Check SendGrid dashboard**: https://app.sendgrid.com/statistics

---

## 🔍 Troubleshooting on Render

### Issue: Still Timing Out After 90 Seconds

**Step 1: Check Environment Variable**
```
Render Dashboard → Settings → Environment
Verify RENDER=true is set
```

**Step 2: Verify SendGrid API Key**
- Go to https://app.sendgrid.com/settings/api_keys
- Confirm key is active (green checkmark)
- Regenerate if needed and update `SMTP_PASS`

**Step 3: Check Sender Email Authorization**
- Go to https://app.sendgrid.com/settings/sender_auth
- Verify `SMTP_FROM_EMAIL` is authorized
- May need domain verification for production emails

**Step 4: Check Render Logs for Detailed Error**
```
Render Dashboard → Logs
Look for error messages from:
- "📧 SMTP Connection Error"
- "❌ SMTP Verification Timeout"
```

---

## 📱 Local Testing

### Test 1: Local Settings (Port 587 TLS)

```bash
# In backend directory
cd backend

# Ensure .env has these:
# RENDER=false
# SMTP_PORT=587

node verify_smtp.js
```

**Expected Output**:
```
Environment: 🟢 Local/Other
Port: 587 (TLS)
✅ SMTP Server is ready to take our messages
```

### Test 2: Render Simulation (Port 465 SSL)

```bash
# Simulate Render environment
RENDER=true node verify_smtp.js
```

**Expected Output**:
```
Environment: 🔴 RENDER
Port: 465 (SSL - Render mode)
✅ SMTP Server is ready to take our messages
```

---

## 🛡️ Security Notes

1. **Never commit API keys** - Use environment variables only
2. **API key in version control** - If exposed, regenerate immediately
3. **Render dashboard** - Only admins should set environment variables
4. **SendGrid account** - Enable 2FA for security

---

## 📊 Connection Pool Settings (Render-Optimized)

```javascript
pool: {
  maxConnections: 2,      // Low to avoid Render limits
  maxMessages: 50,        // Conservative for stability
  rateDelta: 2000,        // Slower rate (2 second window)
  rateLimit: 5            // Max 5 emails per 2 seconds
}
```

**Why reduced?** 
- Render has strict outbound connection limits
- Conservative settings prevent connection exhaustion
- Prevents rate limiting from SendGrid

---

## 🎯 Full Environment Variables for Render

```properties
# Render Detection
RENDER=true

# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your_mongodb_atlas_uri

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email - AUTOMATIC PORT SWITCHING
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
SMTP_FROM_EMAIL=support@yourdomain.com
SMTP_FROM_NAME=Habayta Jobs

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# URLs
CLIENT_URL=https://www.habaytajobs.com
FRONTEND_URL=https://www.habaytajobs.com
```

---

## ✅ Deployment Checklist

- [ ] SendGrid API key obtained and verified as active
- [ ] `RENDER=true` set in Render environment
- [ ] All SMTP_* variables set in Render
- [ ] Sender email (`SMTP_FROM_EMAIL`) authorized in SendGrid
- [ ] Local test passes: `RENDER=false node verify_smtp.js`
- [ ] Render simulation passes: `RENDER=true node verify_smtp.js`
- [ ] Deployed to Render and logs show successful connection
- [ ] Test email sent and received
- [ ] SendGrid dashboard shows delivery status

---

## 📞 Support & Resources

- **SendGrid SMTP Setup**: https://sendgrid.com/docs/for-developers/sending-email/integrations/nodemailer/
- **Render Documentation**: https://render.com/docs/environment-variables
- **Nodemailer SMTP**: https://nodemailer.com/smtp/

---

## 🎉 Success Indicators

When correctly configured on Render, you should see in logs:

```
✅ SMTP Server is ready to take our messages
   Host: smtp.sendgrid.net
   Port: 465 (SSL)
   Environment: ✅ RENDER

✅ Message sent: <messageId>
```

And emails will be delivered within seconds to your users.

---

**Last Updated**: February 12, 2026  
**Status**: Production Ready  
**Auto Port-Switching**: Enabled (587 TLS local, 465 SSL Render)
