# Meet Translator Extension - Firefox Version

Real-time sign language and speech-to-text translation for Google Meet on Firefox.

## Features
- 👋 Sign Language Recognition (ISL/ASL)
- 🎤 Speech-to-Text Translation
- 💬 Live Conversation Dialog
- 💾 Save Meeting Transcripts

## Installation

### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from this folder
4. Join Google Meet and start translating!

### Backend Setup
The extension requires a Python backend server for sign language recognition:

```bash
cd ../meet-translator-extension
pip install -r requirements.txt
python backend-server.py
```

## Usage
1. Join a Google Meet call
2. Click the extension icon to open the control panel
3. Toggle Sign Language or Speech-to-Text recognition
4. View translations in real-time
5. Save transcripts with one click

## Key Differences from Chrome Version
- Uses Manifest V2 (Firefox standard)
- Uses `browser` API instead of `chrome` API
- **⚠️ Speech-to-Text NOT supported** (Firefox doesn't support Web Speech API)
- Sign language recognition works if backend is running

## Requirements
- Firefox 60+
- Python 3.8+ (for backend)
- Webcam access
- **Note**: For speech-to-text, use Chrome extension instead

## ⚠️ Important Limitations
- **Speech Recognition**: Firefox does NOT support Web Speech API. Use Chrome for this feature.
- **Temporary Add-on**: Must reload extension after every Firefox restart

## Tech Stack
- MediaPipe for hand detection
- TensorFlow for gesture recognition
- Web Speech API for speech-to-text
- Firefox WebExtensions API
