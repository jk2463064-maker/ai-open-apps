export type TranscriptionResult = {
  text: string;
  confidence?: number;
  success: boolean;
  error?: string;
  languageCode?: string;
};

const DEFAULT_BACKEND_URL = 'http://localhost:4000/api/transcribe';

export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  const backendUrl =
    process.env.EXPO_PUBLIC_TRANSCRIPTION_BACKEND_URL || DEFAULT_BACKEND_URL;

  try {
    const audioResponse = await fetch(audioUri);
    const audioBlob = await audioResponse.blob();

    const formData = new FormData();
    const filename = audioUri.split('/').pop() || 'audio.wav';

    formData.append('audio', audioBlob, filename);
    formData.append(
      'languageCode',
      process.env.EXPO_PUBLIC_TRANSCRIPTION_LANGUAGE || 'en-US'
    );

    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to transcribe audio with backend');
    }

    const transcript = data.transcript || '';

    return {
      text: transcript,
      confidence: data.confidence,
      success: !!transcript,
      languageCode: data.languageCode,
    };
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transcription error',
    };
  }
}
