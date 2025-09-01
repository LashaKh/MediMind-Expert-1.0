/**
 * Audio Processing Utilities for MediScribe
 * Handles audio file chunking, validation, and format conversion for Georgian transcription
 */

interface AudioChunk {
  blob: Blob;
  startTime: number;
  endTime: number;
  index: number;
}

interface AudioFileInfo {
  duration: number;
  sampleRate: number;
  channels: number;
  fileSize: number;
  format: string;
}

export class AudioProcessor {
  private static readonly SUPPORTED_FORMATS = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/m4a',
    'audio/mp4',
    'audio/webm',
    'audio/ogg',
    'audio/x-m4a'
  ];

  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly CHUNK_DURATION = 23; // seconds (safe under Enagramm's 25s limit)
  private static readonly MIN_CHUNK_DURATION = 1; // seconds (minimum viable chunk)

  /**
   * Validate audio file format and size
   */
  static validateAudioFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB limit`
      };
    }

    // Check file type
    const isValidFormat = this.SUPPORTED_FORMATS.some(format => 
      file.type.toLowerCase().includes(format.split('/')[1]) || 
      file.name.toLowerCase().endsWith(`.${format.split('/')[1]}`)
    );

    if (!isValidFormat) {
      return {
        valid: false,
        error: `Unsupported format. Supported: MP3, WAV, M4A, WebM, OGG`
      };
    }

    return { valid: true };
  }

  /**
   * Get audio file information using Web Audio API
   */
  static async getAudioFileInfo(file: File): Promise<AudioFileInfo> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          resolve({
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            channels: audioBuffer.numberOfChannels,
            fileSize: file.size,
            format: file.type || 'unknown'
          });
        } catch (error) {
          reject(new Error(`Failed to decode audio file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        } finally {
          // Clean up audio context
          if (audioContext.state !== 'closed') {
            await audioContext.close();
          }
        }
      };

      fileReader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  /**
   * Split audio file into chunks using Web Audio API
   */
  static async splitAudioIntoChunks(file: File, progressCallback?: (progress: number) => void): Promise<AudioChunk[]> {
    const audioInfo = await this.getAudioFileInfo(file);
    const totalDuration = audioInfo.duration;
    
    // Calculate number of chunks needed
    const numChunks = Math.ceil(totalDuration / this.CHUNK_DURATION);
    const chunks: AudioChunk[] = [];

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    try {
      const fileReader = new FileReader();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
        fileReader.onerror = () => reject(new Error('Failed to read file'));
        fileReader.readAsArrayBuffer(file);
      });

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      for (let i = 0; i < numChunks; i++) {
        const startTime = i * this.CHUNK_DURATION;
        const endTime = Math.min(startTime + this.CHUNK_DURATION, totalDuration);
        const chunkDuration = endTime - startTime;

        // Skip chunks that are too short (less than 1 second)
        if (chunkDuration < this.MIN_CHUNK_DURATION) {
          continue;
        }

        const startSample = Math.floor(startTime * audioBuffer.sampleRate);
        const endSample = Math.floor(endTime * audioBuffer.sampleRate);
        const chunkLength = endSample - startSample;

        // Create new audio buffer for the chunk
        const chunkBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          chunkLength,
          audioBuffer.sampleRate
        );

        // Copy audio data for each channel
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const chunkChannelData = chunkBuffer.getChannelData(channel);
          
          for (let sample = 0; sample < chunkLength; sample++) {
            chunkChannelData[sample] = channelData[startSample + sample];
          }
        }

        // Convert audio buffer to blob
        const chunkBlob = await this.audioBufferToBlob(chunkBuffer);
        
        chunks.push({
          blob: chunkBlob,
          startTime,
          endTime,
          index: i
        });

        // Update progress
        if (progressCallback) {
          progressCallback((i + 1) / numChunks * 100);
        }
      }

      return chunks;
    } finally {
      // Clean up audio context
      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }
    }
  }

  /**
   * Convert AudioBuffer to Blob
   */
  private static async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      offlineContext.startRendering().then((renderedBuffer) => {
        const wav = this.audioBufferToWav(renderedBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        resolve(blob);
      });
    });
  }

  /**
   * Convert AudioBuffer to WAV format
   */
  private static audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
    let pos = 0;

    // WAV header
    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
      pos += str.length;
    };

    const writeUint32 = (value: number) => {
      view.setUint32(pos, value, true);
      pos += 4;
    };

    const writeUint16 = (value: number) => {
      view.setUint16(pos, value, true);
      pos += 2;
    };

    // RIFF chunk descriptor
    writeString('RIFF');
    writeUint32(bufferSize - 8);
    writeString('WAVE');

    // FMT sub-chunk
    writeString('fmt ');
    writeUint32(16); // Subchunk1Size
    writeUint16(1); // AudioFormat (PCM)
    writeUint16(numberOfChannels);
    writeUint32(sampleRate);
    writeUint32(byteRate);
    writeUint16(blockAlign);
    writeUint16(bitsPerSample);

    // Data sub-chunk
    writeString('data');
    writeUint32(dataSize);

    // Write audio data
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const intSample = Math.floor(sample * (bitsPerSample === 16 ? 0x7FFF : 0x7FFFFFFF));
        view.setInt16(pos, intSample, true);
        pos += 2;
      }
    }

    return buffer;
  }

  /**
   * Convert blob to base64 for API transmission
   */
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part (remove data:audio/wav;base64, prefix)
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to convert blob to base64'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Estimate processing time based on file duration and chunks
   */
  static estimateProcessingTime(duration: number): { chunks: number; estimatedSeconds: number } {
    const chunks = Math.ceil(duration / this.CHUNK_DURATION);
    // Estimate ~3-5 seconds processing time per chunk (including API latency)
    const estimatedSeconds = chunks * 4;
    
    return { chunks, estimatedSeconds };
  }
}