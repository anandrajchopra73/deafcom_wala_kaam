#!/usr/bin/env python3
"""Flask backend server for Chrome extension integration"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import base64
import numpy as np
import cv2
import speech_recognition as sr
import io
import wave

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'sign_langauge'))

app = Flask(__name__)
CORS(app)

recognizer = None
speech_recognizer = None

def init_recognizer():
    global recognizer
    try:
        print("Initializing sign language recognizer...")
        from core.gesture_recognizer import GestureRecognizer
        recognizer = GestureRecognizer(language='isl')
        print("Recognizer ready!")
        return True
    except Exception as e:
        print(f"Failed to initialize recognizer: {e}")
        return False

def init_speech_recognizer():
    global speech_recognizer
    try:
        print("Initializing speech recognizer...")
        speech_recognizer = sr.Recognizer()
        print("Speech recognizer ready!")
        return True
    except Exception as e:
        print(f"Failed to initialize speech recognizer: {e}")
        return False

@app.route('/sign-language', methods=['POST'])
def process_sign_language():
    global recognizer
    try:
        if recognizer is None:
            return jsonify({'error': 'Model not loaded', 'gesture': None, 'confidence': 0.0, 'buffer_size': 0, 'hands_detected': False}), 503
        
        data = request.json
        image_data = data.get('frame')
        
        if not image_data:
            return jsonify({'error': 'No frame provided'}), 400
        
        img_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        gesture, confidence, _ = recognizer.process_frame(frame)
        
        if gesture:
            print(f"Detected: {gesture} ({confidence:.2f})")
        
        return jsonify({
            'gesture': gesture if gesture else None,
            'confidence': float(confidence) if confidence else 0.0,
            'buffer_size': len(recognizer.feature_buffer),
            'hands_detected': len(recognizer.feature_buffer) > 0
        })
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/speech-to-text', methods=['POST'])
def process_speech():
    global speech_recognizer
    try:
        if speech_recognizer is None:
            return jsonify({'error': 'Speech recognizer not loaded', 'text': None}), 503
        
        data = request.json
        audio_data = data.get('audio')
        
        if not audio_data:
            return jsonify({'error': 'No audio provided'}), 400
        
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_data.split(',')[1])
        
        # Create audio data object
        audio_file = sr.AudioData(audio_bytes, 16000, 2)
        
        try:
            # Recognize speech using Google Speech Recognition
            text = speech_recognizer.recognize_google(audio_file)
            print(f"Speech recognized: {text}")
            
            return jsonify({
                'text': text,
                'confidence': 0.9,
                'status': 'success'
            })
        except sr.UnknownValueError:
            return jsonify({
                'text': None,
                'confidence': 0.0,
                'status': 'no_speech'
            })
        except sr.RequestError as e:
            return jsonify({
                'error': f'Speech recognition service error: {e}',
                'text': None
            }), 500
            
    except Exception as e:
        print(f"Speech processing error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'sign_language_loaded': recognizer is not None and recognizer.model is not None,
        'speech_recognizer_loaded': speech_recognizer is not None
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Sign Language Backend Server")
    print("="*50)
    print("Server: http://localhost:5000")
    
    sign_loaded = init_recognizer()
    speech_loaded = init_speech_recognizer()
    
    print(f"Sign Language Model loaded: {sign_loaded}")
    print(f"Speech Recognizer loaded: {speech_loaded}")
    
    if not sign_loaded:
        print("Sign language recognition disabled")
    if not speech_loaded:
        print("Speech recognition disabled")
    
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
