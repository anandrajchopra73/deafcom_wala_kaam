# Testing Guide

## Step 1: Load Extension

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Toggle ON "Developer mode" (top right corner)
4. Click "Load unpacked" button
5. Navigate to: `/home/moonknight/Documents/minor/meet-translator-extension`
6. Click "Select Folder"
7. Extension should appear in the list

## Step 2: Test on Google Meet

### Option A: Join Real Meeting
1. Go to https://meet.google.com
2. Click "New meeting" → "Start an instant meeting"
3. Allow camera/microphone
4. Look for translator panel on right side

### Option B: Join Test Meeting
1. Go to https://meet.google.com/new
2. Copy the meeting link
3. Open in new tab to join
4. Panel appears automatically

## Step 3: Test Features

### Test Speech-to-Text (Works Immediately)
1. Click "🎤 Speech to Text" button
2. Status changes to "ON"
3. Speak into microphone: "Hello this is a test"
4. Text appears in "Speech Recognition" section
5. Also appears in "Full Transcript" below

### Test Sign Language (Shows Message)
1. Click "👋 Sign Language" button
2. Status changes to "ON"
3. Shows message about backend
4. Video frames are being captured

### Test Save Transcript
1. Speak some text
2. Click "💾 Save Transcript" button
3. File downloads: `meet-transcript-[timestamp].txt`
4. Open file to verify content

## Step 4: Check Extension Popup

1. Click extension icon in Chrome toolbar
2. Popup shows:
   - Extension Status: Active
   - Google Meet: Connected (if on Meet)
3. Try "View Saved Transcripts" button

## Troubleshooting

### Panel Not Appearing?
- Refresh the Meet page
- Check console (F12) for errors
- Reload extension at chrome://extensions/

### Speech Not Working?
- Allow microphone permission
- Check Chrome settings → Privacy → Microphone
- Try speaking louder/clearer

### 404 Errors?
- Ignore if backend not running
- Sign language needs: `python backend-server.py`

## Quick Test (No Meeting Needed)

Open test page:
```bash
cd /home/moonknight/Documents/minor/meet-translator-extension
python3 -m http.server 8000
```

Then open: http://localhost:8000/test.html
Panel should appear after 2 seconds.
