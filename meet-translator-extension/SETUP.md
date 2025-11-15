# Setup Guide

## Quick Start

### 1. Install Extension
```bash
# Open Chrome
chrome://extensions/

# Enable Developer Mode
# Click "Load unpacked"
# Select: /home/moonknight/Documents/minor/meet-translator-extension
```

### 2. Start Backend (Optional - for sign language)
```bash
cd /home/moonknight/Documents/minor/meet-translator-extension
pip install -r requirements.txt
python backend-server.py
```

### 3. Use in Google Meet
- Join any Google Meet call
- Panel appears automatically on right side
- Toggle features ON/OFF
- Save transcript when done

## Features

**Speech-to-Text**: Works immediately (uses browser API)
**Sign Language**: Requires backend server running

## Notes

- Speech recognition works offline in Chrome
- Sign language needs Python backend + trained model
- Transcripts auto-save to downloads folder
