# Meet Translator Chrome Extension

Chrome extension for real-time sign language and speech-to-text translation in Google Meet.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `meet-translator-extension` folder
5. Join a Google Meet call
6. The translator panel appears automatically

## Features

- **Sign Language Recognition**: Captures video frames for sign language detection
- **Speech-to-Text**: Real-time audio transcription using Web Speech API
- **Transcript Saving**: Download full conversation transcripts
- **Auto-activation**: Detects Google Meet and activates automatically

## Usage

1. Join Google Meet
2. Click toggle buttons to enable features
3. View real-time translations
4. Save transcript when done

## Backend Integration

To connect with Python scripts:

1. Run Flask server (see `backend-server.py`)
2. Extension sends video frames to `http://localhost:5000/sign-language`
3. Extension sends audio to `http://localhost:5000/speech-to-text`

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main translator logic
- `background.js` - Service worker
- `popup.html/js` - Extension popup
- `styles.css` - UI styling
