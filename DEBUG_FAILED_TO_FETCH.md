# Debugging "Failed to fetch" Error

## Quick Fix Steps

### 1. **Update Your API URL**
The most common cause is that the API URL is still using the placeholder value.

**Edit `.env.local`:**
```bash
# Replace this placeholder with your actual sales API URL
NEXT_PUBLIC_SALES_API_URL=https://your-actual-sales-api-url.com
```

**Example:**
```bash
# If your sales API is at https://api.vondera.com
NEXT_PUBLIC_SALES_API_URL=https://api.vondera.com
```

### 2. **Restart Development Server**
After updating `.env.local`, restart the dev server:
```bash
npm run dev
```

### 3. **Test with Demo Credentials (TEST MODE)**
If your API URL is still using the placeholder value, the system will automatically enter TEST MODE.

**Use these demo credentials:**
- Email: `demo@vondera.app`
- Password: `demo123`

You'll see warnings in the console indicating TEST MODE is active.

### 4. **Check Browser Console**
Open browser dev tools (F12) and check the Console tab for detailed error logs:
- Look for configuration warnings
- Check the actual URL being called
- Look for CORS errors

### 5. **Test API Manually**
Test your login endpoint directly:

**Using curl:**
```bash
curl -X POST https://your-sales-api-url.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "mahmoud@vondera.app", "password": "12345678"}'
```

**Using browser fetch (in console):**
```javascript
fetch('https://your-sales-api-url.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'mahmoud@vondera.app',
    password: '12345678'
  })
}).then(r => r.json()).then(console.log)
```

## Common Issues & Solutions

### Issue 1: **CORS Error**
**Symptoms:** Console shows CORS policy error
**Solution:** Configure your API server to allow requests from your frontend domain

### Issue 2: **Network/DNS Error**  
**Symptoms:** "Failed to fetch" or "network error"
**Solution:** 
- Check if the API URL is correct and accessible
- Try accessing the URL directly in browser
- Check your internet connection

### Issue 3: **Wrong API URL**
**Symptoms:** 404 Not Found errors
**Solution:** Verify the complete API URL and endpoint path

### Issue 4: **Placeholder Values**
**Symptoms:** Warning about placeholder values in console
**Solution:** Update all placeholder values in `.env.local`

## Debug Console Output

When you try to login, you should see console logs like:
```
🔧 AuthService: Configuration check
📡 API Base URL: https://your-api-url.com
🔗 Login endpoint will be: https://your-api-url.com/auth/login
🔐 AuthService: Starting login flow...
🌐 AuthService: Making POST request to https://your-api-url.com/auth/login
📦 AuthService: Request body: {email: "...", password: "..."}
```

If you see placeholder URLs or warnings, that's the issue to fix first.
