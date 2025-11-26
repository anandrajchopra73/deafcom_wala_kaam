'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import UserAuth from "../components/UserAuth";

export default function Home() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);

  const startTranslation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsTranslating(true);
        processFrames();
      }
    } catch (err) {
      alert('Camera access denied');
    }
  };

  const stopTranslation = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsTranslating(false);
      setTranslation('');
    }
  };

  const processFrames = async () => {
    if (!isTranslating || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    try {
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      const response = await fetch('http://localhost:5000/sign-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: frameData })
      });
      const result = await response.json();
      if (result.gesture && result.confidence > 0.7) {
        setTranslation(result.gesture);
      }
    } catch (err) {
      setTranslation('Backend not running');
    }

    setTimeout(processFrames, 300);
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setSpeechText('Listening...');
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setSpeechText(finalTranscript);
      }
    };

    recognitionRef.current.onerror = () => {
      setSpeechText('Error occurred in recognition');
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isTranslating) processFrames();
  }, [isTranslating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aa1b1b] to-[#8a1515]">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Deafon Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-white">Deafcon</h1>
          </div>
          <a href="https://meet.google.com" target="_blank" className="bg-white text-[#aa1b1b] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
            Try on Meet
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Image src="/logo.jpeg" alt="Deafon" width={120} height={120} className="rounded-2xl mx-auto mb-8 shadow-2xl" />
          <h2 className="text-6xl font-bold text-white mb-6">Real-Time Translation for Google Meet</h2>
          <p className="text-2xl text-white/90 mb-8">Sign Language & Speech-to-Text for Chrome & Firefox</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#translator" className="bg-white text-[#aa1b1b] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition">
              Try Sign Language
            </a>
            <a href="#speech-recognition" className="bg-white text-[#aa1b1b] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition">
              Try Speech Recognition
            </a>
            <a href="#install" className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full text-lg font-semibold border-2 border-white/30 hover:bg-white/30 transition">
              Install Extension
            </a>
          </div>
        </div>

        <div id="translator" className="bg-white rounded-2xl p-8 mb-20 shadow-2xl">
          <h3 className="text-3xl font-bold text-[#aa1b1b] mb-6 text-center">Try Sign Language Translator</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-black rounded-xl overflow-hidden aspect-video mb-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4">
                {!isTranslating ? (
                  <button onClick={startTranslation} className="flex-1 bg-[#aa1b1b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8a1515] transition">
                    👋 Start Translation
                  </button>
                ) : (
                  <button onClick={stopTranslation} className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                    ⏹️ Stop
                  </button>
                )}
              </div>
            </div>
            <div>
              <div className="bg-gray-50 rounded-xl p-6 h-full">
                <h4 className="text-xl font-bold text-[#aa1b1b] mb-4">Translation Output:</h4>
                <div className="bg-white rounded-lg p-6 min-h-[200px] border-2 border-[#aa1b1b]/20">
                  {translation ? (
                    <p className="text-3xl font-bold text-[#aa1b1b]">{translation}</p>
                  ) : (
                    <p className="text-gray-400 italic">Start translation to see results...</p>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  ⚠️ Make sure backend server is running: <code className="bg-gray-200 px-2 py-1 rounded">python backend-server.py</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div id="speech-recognition" className="bg-white rounded-2xl p-8 mb-20 shadow-2xl">
          <h3 className="text-3xl font-bold text-[#aa1b1b] mb-6 text-center">Try Speech Recognition</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gradient-to-br from-[#aa1b1b]/10 to-[#8a1515]/10 rounded-xl p-8 text-center">
                <div className="text-8xl mb-4">{isListening ? '🎤' : '🔇'}</div>
                <p className="text-lg text-gray-600 mb-6">
                  {isListening ? 'Listening to your voice...' : 'Click to start speech recognition'}
                </p>
                <div className="flex gap-4 justify-center">
                  {!isListening ? (
                    <button onClick={startSpeechRecognition} className="bg-[#aa1b1b] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8a1515] transition">
                      🎤 Start Listening
                    </button>
                  ) : (
                    <button onClick={stopSpeechRecognition} className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                      ⏹️ Stop Listening
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 rounded-xl p-6 h-full">
                <h4 className="text-xl font-bold text-[#aa1b1b] mb-4">Speech to Text Output:</h4>
                <div className="bg-white rounded-lg p-6 min-h-[200px] border-2 border-[#aa1b1b]/20">
                  {speechText ? (
                    <p className="text-lg text-gray-800">{speechText}</p>
                  ) : (
                    <p className="text-gray-400 italic">Start speaking to see transcription...</p>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  💡 Uses Web Speech API - works best in Chrome/Edge browsers
                </p>
              </div>
            </div>
          </div>
        </div>

        <div id="user-auth" className="mb-20">
          <UserAuth />
        </div>

        <div id="content-upload" className="bg-white rounded-2xl p-8 mb-20 shadow-2xl">
          <h3 className="text-3xl font-bold text-[#aa1b1b] mb-6 text-center">Content Upload & Conversion Module</h3>
          <div className="bg-gradient-to-br from-[#aa1b1b]/10 to-[#8a1515]/10 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h4 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon - Major Feature</h4>
            <p className="text-lg text-gray-600 mb-6">
              Upload audio/video files and convert them to text with sign language interpretation. 
              This major module will support multiple file formats and provide batch processing capabilities.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-blue-500">🎵</span>
                <span>Audio file conversion</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-blue-500">🎬</span>
                <span>Video file processing</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-blue-500">📊</span>
                <span>Batch processing</span>
              </div>
            </div>
            <button className="mt-6 bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
              Under Development
            </button>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-2xl font-bold text-white mb-3">Sign Language Recognition</h3>
            <p className="text-white/90">Real-time ISL/ASL gesture recognition using AI. Captures video frames and translates sign language to text instantly.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-2xl font-bold text-white mb-3">Speech-to-Text</h3>
            <p className="text-white/90">Automatic speech recognition that converts spoken words to text in real-time during your meetings.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-white mb-3">User Authentication</h3>
            <p className="text-white/90">Secure login system with profile management, preferences, and personalized settings for each user.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-white mb-3">Live Conversation Dialog</h3>
            <p className="text-white/90">View full conversation history with timestamps. All translations appear on-screen during your meeting.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">💾</div>
            <h3 className="text-2xl font-bold text-white mb-3">Save Transcripts</h3>
            <p className="text-white/90">Download complete meeting transcripts with one click. Never miss important details from your conversations.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-2xl font-bold text-white mb-3">Content Upload & Conversion</h3>
            <p className="text-white/90">Upload audio/video files for batch processing and conversion to text with sign language interpretation.</p>
          </div>
        </div>

        <div id="install" className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Quick Installation</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🌐</div>
                <h4 className="text-2xl font-bold text-white">Chrome</h4>
              </div>
              <div className="space-y-3 text-white/90">
                <div className="flex gap-3">
                  <span className="font-bold text-white">1.</span>
                  <p>Go to <code className="bg-black/30 px-2 py-1 rounded text-sm">chrome://extensions/</code></p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">2.</span>
                  <p>Enable "Developer mode"</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">3.</span>
                  <p>Click "Load unpacked"</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">4.</span>
                  <p>Select <code className="bg-black/30 px-2 py-1 rounded text-sm">meet-translator-extension</code></p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🦊</div>
                <h4 className="text-2xl font-bold text-white">Firefox</h4>
              </div>
              <div className="space-y-3 text-white/90">
                <div className="flex gap-3">
                  <span className="font-bold text-white">1.</span>
                  <p>Go to <code className="bg-black/30 px-2 py-1 rounded text-sm">about:debugging</code></p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">2.</span>
                  <p>Click "This Firefox"</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">3.</span>
                  <p>Click "Load Temporary Add-on"</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-white">4.</span>
                  <p>Select <code className="bg-black/30 px-2 py-1 rounded text-sm">manifest.json</code> from <code className="bg-black/30 px-2 py-1 rounded text-sm">meet-translator-firefox</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/90">
          <p className="font-semibold text-lg mb-2">Deafon</p>
          <p>Built with ❤️ using MediaPipe, TensorFlow & Web Speech API</p>
        </div>
      </footer>
    </div>
  );
}
