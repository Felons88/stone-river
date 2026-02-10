# Google Voice SMS Setup Guide

## 🚀 Real SMS Sending Setup

### 1. Install Python (if not installed)
```bash
# Download from: https://python.org
# Or use chocolatey: choco install python
```

### 2. Install Google Voice Python Library
```bash
pip install googlevoice
```

### 3. Start the SMS Server
```bash
# Install Node.js dependencies
npm install express dotenv

# Copy environment variables
cp .env .env.server

# Start the server
node server.js
```

### 4. Test Real SMS Sending
1. Open your admin panel: http://localhost:8081/admin/panel
2. Click "Clients" tab
3. Click SMS on any client
4. Type "appointment reminder"
5. Generate AI message
6. Click "Send SMS"
7. **Real SMS will be sent via Google Voice!** 📱

## 🔧 How It Works

### Frontend (React App)
- ✅ AI generates professional SMS with real data
- ✅ Sends request to backend API
- ✅ Shows success/error messages

### Backend (Node.js Server)
- ✅ Receives SMS requests from frontend
- ✅ Executes Python script with Google Voice credentials
- ✅ Returns success/failure status

### Python Script
- ✅ Uses `googlevoice` library
- ✅ Authenticates with your Google Voice account
- ✅ Sends real SMS to client phone numbers
- ✅ Returns detailed results

## 📱 Google Voice Credentials Used

From your `.env` file:
```
VITE_GOOGLE_VOICE_EMAIL=jameshewitt312@gmail.com
VITE_GOOGLE_VOICE_PASSWORD=tgua zvwz ydif wivj
VITE_GOOGLE_VOICE_NUMBER=+13202040286
```

## 🎯 What You'll See

**Success:**
```
📱 Sending SMS to: 6126854696
📱 Message: Hey james hewitt, 👋 StoneRiver Junk Removal appointment reminder! 🚛 Today at 2 PM. ✅ Confirm or reschedule at (612) 685-4696 with questions! 🙏
🔐 Logging into Google Voice...
📤 Sending SMS...
✅ SMS sent successfully!
```

**Client Receives:**
```
Hey james hewitt, 👋 StoneRiver Junk Removal appointment reminder! 🚛 Today at 2 PM. ✅ Confirm or reschedule at (612) 685-4696 with questions! 🙏
```

## 🔥 Ready to Use!

Once the server is running, your SMS system will send **real text messages** to clients using your Google Voice account. No more simulations - actual SMS delivery! 🚀

## 🛠️ Troubleshooting

**If you get "Backend server not running":**
- Make sure `node server.js` is running in a separate terminal
- Check that port 3001 is available
- Verify Python and googlevoice are installed

**If SMS fails to send:**
- Check Google Voice credentials in .env
- Ensure Google Voice account is active
- Verify phone number format (include country code)

**Your StoneRiver admin panel now sends REAL SMS messages!** 📱✨
