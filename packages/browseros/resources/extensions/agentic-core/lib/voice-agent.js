// Voice Agent - WebSpeech API Integration
export class VoiceAgent {
    constructor() {
        this.isListening = false;
        this.recognition = null;

        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
    }

    startListening(onResult, onError) {
        if (!this.recognition) {
            onError('Voice recognition not supported');
            return;
        }

        this.isListening = true;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            this.isListening = false;
        };

        this.recognition.onerror = (event) => {
            onError(event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.start();
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}
