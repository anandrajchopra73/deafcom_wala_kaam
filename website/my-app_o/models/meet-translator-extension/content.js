// Content script for Google Meet integration

class MeetTranslator {
  constructor() {
    this.isActive = false;
    this.signLanguageActive = false;
    this.speechToTextActive = false;
    this.transcript = [];
    this.panel = null;
    this.videoStream = null;
    this.audioContext = null;
    this.recognition = null;
  }

  init() {
    this.injectPanel();
    this.setupSpeechRecognition();
    this.observeMeetUI();
  }

  injectPanel() {
    const panel = document.createElement('div');
    panel.id = 'meet-translator-panel';
    panel.innerHTML = `
      <div class="translator-header">
        <h3>🎤👋 Translator</h3>
        <button id="close-panel">×</button>
      </div>
      <div class="translator-controls">
        <button id="toggle-sign" class="control-btn">
          <span class="icon">👋</span>
          <span class="label">Sign</span>
          <span class="status">OFF</span>
        </button>
        <button id="toggle-speech" class="control-btn">
          <span class="icon">🎤</span>
          <span class="label">Speech</span>
          <span class="status">OFF</span>
        </button>
        <button id="save-transcript" class="control-btn">
          <span class="icon">💾</span>
          <span class="label">Save</span>
        </button>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;

    // Create real-time overlay
    const overlay = document.createElement('div');
    overlay.id = 'translation-overlay';
    overlay.innerHTML = `
      <div id="sign-live" class="live-text"></div>
      <div id="speech-live" class="live-text"></div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Create dialog box
    const dialog = document.createElement('div');
    dialog.id = 'translation-dialog';
    dialog.innerHTML = `
      <div class="dialog-header">
        <span>💬 Conversation</span>
        <button id="toggle-dialog">−</button>
      </div>
      <div id="dialog-content" class="dialog-content"></div>
    `;
    document.body.appendChild(dialog);
    this.dialog = dialog;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const closeBtn = document.getElementById('close-panel');
    const signBtn = document.getElementById('toggle-sign');
    const speechBtn = document.getElementById('toggle-speech');
    const saveBtn = document.getElementById('save-transcript');
    const dialogBtn = document.getElementById('toggle-dialog');

    if (closeBtn) closeBtn.addEventListener('click', () => this.panel.style.display = 'none');
    if (signBtn) signBtn.addEventListener('click', () => this.toggleSignLanguage());
    if (speechBtn) speechBtn.addEventListener('click', () => this.toggleSpeechToText());
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveTranscript());
    if (dialogBtn) dialogBtn.addEventListener('click', () => this.toggleDialog());
  }

  toggleDialog() {
    const dialog = document.getElementById('translation-dialog');
    const btn = document.getElementById('toggle-dialog');
    const content = document.getElementById('dialog-content');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      btn.textContent = '−';
    } else {
      content.style.display = 'none';
      btn.textContent = '+';
    }
  }

  observeMeetUI() {
    const checkInterval = setInterval(() => {
      if (!document.getElementById('meet-translator-panel') && document.body) {
        this.injectPanel();
      }
    }, 2000);
  }

  toggleSignLanguage() {
    this.signLanguageActive = !this.signLanguageActive;
    const btn = document.getElementById('toggle-sign');
    const status = btn?.querySelector('.status');
    const liveOutput = document.getElementById('sign-live');

    if (!btn || !status) return;

    if (this.signLanguageActive) {
      status.textContent = 'ON';
      btn.classList.add('active');
      this.startSignLanguageRecognition();
    } else {
      status.textContent = 'OFF';
      btn.classList.remove('active');
      this.stopSignLanguageRecognition();
      if (liveOutput) liveOutput.style.display = 'none';
    }
  }

  async startSignLanguageRecognition() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      this.signLanguageInterval = setInterval(() => {
        if (!this.signLanguageActive) return;
        
        const videoElements = document.querySelectorAll('video');
        const video = Array.from(videoElements).find(v => v.srcObject && v.videoWidth > 0);
        
        if (!video) {
          const liveOutput = document.getElementById('sign-live');
          if (liveOutput) {
            liveOutput.textContent = '⚠️ No video detected';
            liveOutput.style.display = 'block';
          }
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        this.processSignLanguageFrame(canvas);
      }, 300);

    } catch (error) {
      console.error('Sign language error:', error);
      const liveOutput = document.getElementById('sign-live');
      if (liveOutput) {
        liveOutput.textContent = '⚠️ Error: ' + error.message;
        liveOutput.style.display = 'block';
      }
    }
  }

  async processSignLanguageFrame(canvas) {
    try {
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('http://localhost:5000/sign-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: frameData })
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const result = await response.json();
      const liveOutput = document.getElementById('sign-live');
      
      console.log('Backend response:', result);
      
      if (result.gesture && result.confidence > 0.5) {
        liveOutput.textContent = `👋 ${result.gesture} (${(result.confidence * 100).toFixed(0)}%)`;
        liveOutput.style.display = 'block';
        this.addToTranscript('Sign', result.gesture);
      } else if (result.hands_detected) {
        liveOutput.textContent = `👋 Hand detected - Building sequence (${result.buffer_size}/30)`;
        liveOutput.style.display = 'block';
      } else {
        liveOutput.textContent = '👋 Show hand to camera';
        liveOutput.style.display = 'block';
      }
    } catch (error) {
      console.error('Sign language processing error:', error);
      const liveOutput = document.getElementById('sign-live');
      liveOutput.textContent = '⚠️ Backend error: ' + error.message;
      liveOutput.style.display = 'block';
    }
  }

  stopSignLanguageRecognition() {
    if (this.signLanguageInterval) {
      clearInterval(this.signLanguageInterval);
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            this.addToTranscript('Speech', transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        const liveOutput = document.getElementById('speech-live');
        if (liveOutput) {
          liveOutput.textContent = `🎤 ${finalTranscript || interimTranscript || ''}`;
          liveOutput.style.display = (finalTranscript || interimTranscript) ? 'block' : 'none';
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          return;
        }
        const liveOutput = document.getElementById('speech-live');
        if (liveOutput && this.speechToTextActive) {
          liveOutput.textContent = `⚠️ Mic error: ${event.error}`;
          liveOutput.style.display = 'block';
        }
      };

      this.recognition.onend = () => {
        if (this.speechToTextActive) {
          try {
            this.recognition.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }
      };
    }
  }

  toggleSpeechToText() {
    this.speechToTextActive = !this.speechToTextActive;
    const btn = document.getElementById('toggle-speech');
    const status = btn?.querySelector('.status');
    const liveOutput = document.getElementById('speech-live');

    if (!btn || !status) return;

    if (this.speechToTextActive) {
      status.textContent = 'ON';
      btn.classList.add('active');
      if (this.recognition) {
        try {
          this.recognition.start();
          if (liveOutput) {
            liveOutput.textContent = '🎤 Listening...';
            liveOutput.style.display = 'block';
          }
        } catch (e) {
          console.error('Failed to start recognition:', e);
          if (liveOutput) {
            liveOutput.textContent = '⚠️ Microphone access denied';
            liveOutput.style.display = 'block';
          }
        }
      } else {
        if (liveOutput) {
          liveOutput.textContent = '⚠️ Speech recognition not supported';
          liveOutput.style.display = 'block';
        }
      }
    } else {
      status.textContent = 'OFF';
      btn.classList.remove('active');
      if (this.recognition) {
        this.recognition.stop();
      }
      if (liveOutput) liveOutput.style.display = 'none';
    }
  }

  addToTranscript(type, text) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { type, text, timestamp };
    this.transcript.push(entry);

    // Add to dialog
    const dialogContent = document.getElementById('dialog-content');
    if (dialogContent) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `dialog-message ${type.toLowerCase()}`;
      msgDiv.innerHTML = `
        <span class="msg-time">${timestamp}</span>
        <span class="msg-type">${type}:</span>
        <span class="msg-text">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
      `;
      dialogContent.appendChild(msgDiv);
      dialogContent.scrollTop = dialogContent.scrollHeight;
    }
  }

  saveTranscript() {
    const transcriptText = this.transcript
      .map(entry => `[${entry.timestamp}] ${entry.type}: ${entry.text}`)
      .join('\n');

    chrome.runtime.sendMessage({
      action: 'saveTranscript',
      data: transcriptText
    });

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meet-transcript-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

let translator;

function initTranslator() {
  if (!translator && document.body) {
    translator = new MeetTranslator();
    translator.init();
    console.log('✅ Meet Translator initialized');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initTranslator, 2000));
} else {
  setTimeout(initTranslator, 2000);
}

window.addEventListener('load', () => setTimeout(initTranslator, 3000));
