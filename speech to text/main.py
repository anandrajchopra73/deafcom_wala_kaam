import speech_recognition as sr  # type: ignore
import time
import sys
import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
from datetime import datetime

def real_time_speech_to_text():
    """
    Continuous real-time speech-to-text converter.
    Listens to microphone input and converts speech to text in real-time.
    """
    # Initialize recognizer
    recognizer = sr.Recognizer()
    
    # Get the microphone
    microphone = sr.Microphone()
    
    print("Initializing speech recognition system...")
    print("Adjusting for ambient noise... Please wait.")
    
    # Adjust for ambient noise
    with microphone as source:
        recognizer.adjust_for_ambient_noise(source, duration=2)
    
    print("\n" + "="*60)
    print("Real-Time Speech-to-Text System")
    print("="*60)
    print("\nListening... Speak into your microphone.")
    print("Press Ctrl+C to stop.\n")
    print("="*60 + "\n")
    
    try:
        while True:
            try:
                with microphone as source:
                    # Listen for speech with timeout
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                print("Processing speech...", end=" ")
                
                # Recognize speech using Google Speech Recognition
                text = recognizer.recognize_google(audio)
                
                # Display the recognized text
                print("\r" + " "*50 + "\r", end="")  # Clear the "Processing" message
                print(f"[{time.strftime('%H:%M:%S')}] You said: {text}")
                print("-"*60)
                
            except sr.WaitTimeoutError:
                # No speech detected within timeout
                pass
            
            except sr.UnknownValueError:
                # Speech was unintelligible
                print("\r" + " "*50 + "\r", end="")
                print("[Could not understand audio - please speak clearly]")
                print("-"*60)
            
            except sr.RequestError as e:
                # API was unreachable or unresponsive
                print(f"\nError: Could not request results from speech recognition service: {e}")
                print("Please check your internet connection.")
                break
            
            except Exception as e:
                print(f"\nUnexpected error: {e}")
                continue
    
    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print("Speech recognition stopped by user.")
        print("="*60)
        sys.exit(0)

def test_microphone():
    """
    Test if microphone is available and working.
    """
    try:
        print("Testing microphone...")
        mic_list = sr.Microphone.list_microphone_names()
        print(f"\nFound {len(mic_list)} microphone(s):")
        for i, mic_name in enumerate(mic_list):
            print(f"  {i}: {mic_name}")
        return True
    except Exception as e:
        print(f"Error testing microphone: {e}")
        return False

class SpeechToTextGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Real-Time Speech to Text Converter")
        self.root.geometry("800x600")
        self.root.minsize(700, 500)
        
        # Configure style
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Variables
        self.is_listening = False
        self.recognizer = sr.Recognizer()
        self.microphone = None
        self.listen_thread = None
        
        # Setup UI
        self.setup_ui()
        
        # Initialize microphone on startup
        self.root.after(100, self.initialize_microphone)
    
    def setup_ui(self):
        """Setup the user interface"""
        # Configure colors
        bg_color = "#f0f0f0"
        header_bg = "#2c3e50"
        button_bg = "#3498db"
        stop_button_bg = "#e74c3c"
        text_bg = "#ffffff"
        
        self.root.configure(bg=bg_color)
        
        # Header Frame
        header_frame = tk.Frame(self.root, bg=header_bg, height=80)
        header_frame.pack(fill=tk.X, side=tk.TOP)
        header_frame.pack_propagate(False)
        
        # Title
        title_label = tk.Label(
            header_frame,
            text="🎤 Real-Time Speech to Text",
            font=("Helvetica", 24, "bold"),
            bg=header_bg,
            fg="white"
        )
        title_label.pack(pady=20)
        
        # Control Frame
        control_frame = tk.Frame(self.root, bg=bg_color, height=100)
        control_frame.pack(fill=tk.X, pady=20)
        control_frame.pack_propagate(False)
        
        # Status Label
        self.status_label = tk.Label(
            control_frame,
            text="Status: Not Started",
            font=("Helvetica", 12),
            bg=bg_color,
            fg="#34495e"
        )
        self.status_label.pack(pady=5)
        
        # Button Frame
        button_frame = tk.Frame(control_frame, bg=bg_color)
        button_frame.pack(pady=10)
        
        # Start Button
        self.start_button = tk.Button(
            button_frame,
            text="▶ Start Listening",
            font=("Helvetica", 14, "bold"),
            bg="#27ae60",
            fg="white",
            activebackground="#229954",
            activeforeground="white",
            relief=tk.FLAT,
            padx=30,
            pady=10,
            cursor="hand2",
            command=self.start_listening
        )
        self.start_button.pack(side=tk.LEFT, padx=10)
        
        # Stop Button
        self.stop_button = tk.Button(
            button_frame,
            text="⬛ Stop Listening",
            font=("Helvetica", 14, "bold"),
            bg=stop_button_bg,
            fg="white",
            activebackground="#c0392b",
            activeforeground="white",
            relief=tk.FLAT,
            padx=30,
            pady=10,
            cursor="hand2",
            state=tk.DISABLED,
            command=self.stop_listening
        )
        self.stop_button.pack(side=tk.LEFT, padx=10)
        
        # Clear Button
        self.clear_button = tk.Button(
            button_frame,
            text="🗑 Clear",
            font=("Helvetica", 14, "bold"),
            bg="#95a5a6",
            fg="white",
            activebackground="#7f8c8d",
            activeforeground="white",
            relief=tk.FLAT,
            padx=30,
            pady=10,
            cursor="hand2",
            command=self.clear_text
        )
        self.clear_button.pack(side=tk.LEFT, padx=10)
        
        # Text Display Frame
        text_frame = tk.Frame(self.root, bg=bg_color)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))
        
        # Label for text area
        text_label = tk.Label(
            text_frame,
            text="Recognized Speech:",
            font=("Helvetica", 12, "bold"),
            bg=bg_color,
            fg="#2c3e50",
            anchor="w"
        )
        text_label.pack(fill=tk.X, pady=(0, 5))
        
        # Scrolled Text Widget
        self.text_display = scrolledtext.ScrolledText(
            text_frame,
            font=("Helvetica", 11),
            bg=text_bg,
            fg="#2c3e50",
            wrap=tk.WORD,
            relief=tk.SOLID,
            borderwidth=1,
            padx=10,
            pady=10
        )
        self.text_display.pack(fill=tk.BOTH, expand=True)
        self.text_display.config(state=tk.DISABLED)
        
        # Footer Frame
        footer_frame = tk.Frame(self.root, bg="#ecf0f1", height=30)
        footer_frame.pack(fill=tk.X, side=tk.BOTTOM)
        footer_frame.pack_propagate(False)
        
        # Microphone Status
        self.mic_status_label = tk.Label(
            footer_frame,
            text="Microphone: Checking...",
            font=("Helvetica", 9),
            bg="#ecf0f1",
            fg="#7f8c8d"
        )
        self.mic_status_label.pack(pady=5)
    
    def initialize_microphone(self):
        """Initialize and test microphone"""
        try:
            self.microphone = sr.Microphone()
            mic_list = sr.Microphone.list_microphone_names()
            self.update_status(f"Microphone: Ready ({len(mic_list)} device(s) found)")
            self.mic_status_label.config(text=f"🎤 Microphone Ready | {len(mic_list)} device(s) found", fg="#27ae60")
        except Exception as e:
            self.update_status(f"Microphone Error: {str(e)}")
            self.mic_status_label.config(text=f"❌ Microphone Error: {str(e)}", fg="#e74c3c")
            self.start_button.config(state=tk.DISABLED)
    
    def start_listening(self):
        """Start the speech recognition in a separate thread"""
        if not self.is_listening and self.microphone:
            self.is_listening = True
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            self.update_status("Status: Listening... Speak now!")
            
            # Start listening thread
            self.listen_thread = threading.Thread(target=self.listen_loop, daemon=True)
            self.listen_thread.start()
    
    def stop_listening(self):
        """Stop the speech recognition"""
        self.is_listening = False
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.update_status("Status: Stopped")
    
    def listen_loop(self):
        """Main listening loop that runs in a separate thread"""
        # Adjust for ambient noise
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
        except Exception as e:
            self.append_text(f"\n[Error adjusting for noise: {e}]\n", "error")
            self.stop_listening()
            return
        
        while self.is_listening:
            try:
                with self.microphone as source:
                    # Update status
                    self.root.after(0, lambda: self.update_status("Status: Listening..."))
                    
                    # Listen for speech
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    
                    # Update status to processing
                    self.root.after(0, lambda: self.update_status("Status: Processing..."))
                    
                    # Recognize speech
                    text = self.recognizer.recognize_google(audio)
                    
                    # Display recognized text
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    self.root.after(0, lambda t=text, ts=timestamp: self.append_text(f"[{ts}] {t}\n"))
                    
            except sr.WaitTimeoutError:
                # No speech detected, continue
                continue
            
            except sr.UnknownValueError:
                # Speech was unintelligible
                self.root.after(0, lambda: self.append_text("[Could not understand audio]\n", "warning"))
            
            except sr.RequestError as e:
                # API error
                self.root.after(0, lambda e=e: self.append_text(f"\n[API Error: {e}]\n", "error"))
                self.root.after(0, self.stop_listening)
                break
            
            except Exception as e:
                # Other errors
                if self.is_listening:  # Only show error if still supposed to be listening
                    self.root.after(0, lambda e=e: self.append_text(f"\n[Error: {e}]\n", "error"))
        
        # Update status when loop ends
        self.root.after(0, lambda: self.update_status("Status: Stopped"))
    
    def append_text(self, text, tag="normal"):
        """Append text to the display"""
        self.text_display.config(state=tk.NORMAL)
        
        if tag == "error":
            self.text_display.insert(tk.END, text)
            # Color the last inserted text red
            start_pos = self.text_display.index("end-1c linestart")
            end_pos = self.text_display.index("end-1c")
            self.text_display.tag_add("error", start_pos, end_pos)
            self.text_display.tag_config("error", foreground="#e74c3c")
        elif tag == "warning":
            self.text_display.insert(tk.END, text)
            start_pos = self.text_display.index("end-1c linestart")
            end_pos = self.text_display.index("end-1c")
            self.text_display.tag_add("warning", start_pos, end_pos)
            self.text_display.tag_config("warning", foreground="#f39c12")
        else:
            self.text_display.insert(tk.END, text)
        
        self.text_display.config(state=tk.DISABLED)
        self.text_display.see(tk.END)
    
    def update_status(self, status):
        """Update the status label"""
        self.status_label.config(text=status)
    
    def clear_text(self):
        """Clear the text display"""
        self.text_display.config(state=tk.NORMAL)
        self.text_display.delete(1.0, tk.END)
        self.text_display.config(state=tk.DISABLED)
    
    def on_closing(self):
        """Handle window closing"""
        self.is_listening = False
        if self.listen_thread and self.listen_thread.is_alive():
            self.listen_thread.join(timeout=1)
        self.root.destroy()

def run_gui():
    """Launch the GUI version"""
    root = tk.Tk()
    app = SpeechToTextGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

def run_cli():
    """Launch the CLI version"""
    print("\nWelcome to Real-Time Speech-to-Text Converter\n")
    
    # Test microphone availability
    if test_microphone():
        print("\n" + "="*60)
        input("Press Enter to start speech recognition...")
        print("="*60 + "\n")
        
        # Start real-time speech recognition
        real_time_speech_to_text()
    else:
        print("\nMicrophone test failed. Please check your microphone connection.")
        sys.exit(1)

if __name__ == "__main__":
    # Check if user wants GUI or CLI
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        run_cli()
    else:
        # Default to GUI
        run_gui()