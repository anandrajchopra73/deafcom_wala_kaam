# Firefox Extension Notes

## Known Limitations

### 1. Speech Recognition
Firefox does **NOT** support the Web Speech API (SpeechRecognition).
- Chrome/Edge: ✅ Full support
- Firefox: ❌ No support
- **Solution**: Use Chrome for speech-to-text feature

### 2. Backend Connection
Make sure backend server allows CORS:
```bash
cd ../meet-translator-extension
python backend-server.py
```

### 3. Installation
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json`
4. **Important**: Reload after every browser restart (temporary add-on)

### 4. Permissions
The extension needs:
- Access to meet.google.com
- Access to localhost:5000 (backend)
- Storage and tabs permissions

## What Works in Firefox
✅ Sign language recognition (if backend running)
✅ Live translation overlay
✅ Conversation dialog
✅ Save transcripts
❌ Speech-to-text (Firefox limitation)

## Troubleshooting

### Backend not connecting:
1. Check backend is running: `curl http://localhost:5000/health`
2. Check browser console for CORS errors
3. Reload extension after starting backend

### Panel not showing:
1. Wait 3-5 seconds after joining Meet
2. Check browser console for errors
3. Reload the Meet page

### Sign language not detecting:
1. Ensure camera is on in Meet
2. Check backend logs for errors
3. Verify model is loaded in backend
