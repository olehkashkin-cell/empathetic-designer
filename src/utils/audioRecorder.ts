export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceTimeout: number | null = null;
  private isSpeechDetected = false;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onVolumeChange?: (volume: number) => void;

  constructor(options?: {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onVolumeChange?: (volume: number) => void;
  }) {
    this.onSpeechStart = options?.onSpeechStart;
    this.onSpeechEnd = options?.onSpeechEnd;
    this.onVolumeChange = options?.onVolumeChange;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      // Setup audio analysis for VAD
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.startVAD();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private startVAD() {
    const SPEECH_THRESHOLD = 15; // Minimum volume to detect speech (lowered for better detection)
    const SILENCE_DURATION = 800; // ms of silence to consider speech ended (reduced for faster response)
    const MIN_SPEECH_DURATION = 300; // Minimum speech duration before considering it valid (reduced)

    let speechStartTime = 0;
    const bufferLength = this.analyser!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const float = (dataArray[i] - 128) / 128;
        sum += float * float;
      }
      const volume = Math.sqrt(sum / dataArray.length) * 100;
      
      this.onVolumeChange?.(volume);

      if (volume > SPEECH_THRESHOLD) {
        if (!this.isSpeechDetected) {
          speechStartTime = Date.now();
          this.isSpeechDetected = true;
          this.onSpeechStart?.();
          console.log('Speech detected, volume:', volume);
        }

        // Clear silence timeout when speech is detected
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }
      } else if (this.isSpeechDetected) {
        // Speech was detected, now we have silence
        if (!this.silenceTimeout) {
          this.silenceTimeout = window.setTimeout(() => {
            const speechDuration = Date.now() - speechStartTime;
            if (speechDuration >= MIN_SPEECH_DURATION) {
              console.log('Speech ended after', speechDuration, 'ms');
              this.isSpeechDetected = false;
              this.onSpeechEnd?.();
            }
            this.silenceTimeout = null;
          }, SILENCE_DURATION);
        }
      }

      if (this.mediaRecorder?.state === 'recording') {
        requestAnimationFrame(checkAudio);
      }
    };

    checkAudio();
  }

  async stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      // Clear any pending timeout
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const base64 = await this.blobToBase64(audioBlob);
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        if (this.audioContext) {
          await this.audioContext.close();
          this.audioContext = null;
        }
        
        this.analyser = null;
        this.isSpeechDetected = false;
        
        resolve(base64);
      };

      this.mediaRecorder.stop();
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
