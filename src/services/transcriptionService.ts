// Voice-to-text transcription service
// Supports Google Cloud Speech-to-Text, OpenAI Whisper, or AssemblyAI

export type TranscriptionProvider = 'google' | 'openai' | 'assemblyai';

type TranscriptionConfig = {
  provider: TranscriptionProvider;
  apiKey: string;
  language?: string;
};

type TranscriptionResult = {
  text: string;
  confidence?: number;
  success: boolean;
  error?: string;
};

class TranscriptionService {
  private config: TranscriptionConfig;

  constructor(config: TranscriptionConfig) {
    this.config = config;
    if (!config.apiKey) {
      throw new Error(
        `Transcription API key not set. Set ${config.provider.toUpperCase()}_API_KEY environment variable.`
      );
    }
  }

  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    try {
      switch (this.config.provider) {
        case 'google':
          return await this.transcribeWithGoogle(audioUri);
        case 'openai':
          return await this.transcribeWithOpenAI(audioUri);
        case 'assemblyai':
          return await this.transcribeWithAssemblyAI(audioUri);
        default:
          throw new Error(`Unknown provider: ${this.config.provider}`);
      }
    } catch (error) {
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async transcribeWithGoogle(audioUri: string): Promise<TranscriptionResult> {
    const audioBase64 = await this.fileToBase64(audioUri);

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            languageCode: this.config.language || 'en-US',
            model: 'default',
          },
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Speech-to-Text error: ${response.statusText}`);
    }

    const data = await response.json();
    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = data.results?.[0]?.alternatives?.[0]?.confidence || 0;

    return {
      text: transcript,
      confidence,
      success: !!transcript,
    };
  }

  private async transcribeWithOpenAI(audioUri: string): Promise<TranscriptionResult> {
    const formData = new FormData();
    const audioBlob = await this.uriToBlob(audioUri);

    formData.append('file', audioBlob, 'audio.m4a');
    formData.append('model', 'whisper-1');
    formData.append('language', this.config.language || 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI Whisper error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.text || '',
      success: !!data.text,
    };
  }

  private async transcribeWithAssemblyAI(audioUri: string): Promise<TranscriptionResult> {
    // Step 1: Upload audio file
    const audioBlob = await this.uriToBlob(audioUri);
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        Authorization: this.config.apiKey,
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload error: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    const uploadUrl = uploadData.upload_url;

    // Step 2: Submit transcription request
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        Authorization: this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: uploadUrl,
        language_code: this.config.language || 'en',
      }),
    });

    if (!submitResponse.ok) {
      throw new Error(`AssemblyAI submit error: ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const transcriptId = submitData.id;

    // Step 3: Poll for completion
    return await this.pollAssemblyAI(transcriptId);
  }

  private async pollAssemblyAI(transcriptId: string): Promise<TranscriptionResult> {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          Authorization: this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`AssemblyAI poll error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          text: data.text || '',
          confidence: data.confidence,
          success: !!data.text,
        };
      }

      if (data.status === 'error') {
        throw new Error(`AssemblyAI transcription error: ${data.error}`);
      }

      // Wait 1 second before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('AssemblyAI transcription timeout');
  }

  private async fileToBase64(uri: string): Promise<string> {
    const { FileSystem } = await import('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  }

  private async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
  }
}

let transcriptionService: TranscriptionService | null = null;

export function initializeTranscription(config: TranscriptionConfig): void {
  transcriptionService = new TranscriptionService(config);
}

export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  if (!transcriptionService) {
    throw new Error(
      'Transcription service not initialized. Call initializeTranscription() first.'
    );
  }
  return transcriptionService.transcribeAudio(audioUri);
}
