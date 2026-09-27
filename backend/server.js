const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { SpeechClient } = require('@google-cloud/speech');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

const speechClient = new SpeechClient();

function getEncoding(mimetype = '', originalname = '') {
  const fileType = mimetype.toLowerCase();
  const extension = originalname.split('.').pop()?.toLowerCase();

  if (fileType.includes('wav') || extension === 'wav') return 'LINEAR16';
  if (fileType.includes('flac') || extension === 'flac') return 'FLAC';
  if (fileType.includes('ogg') || extension === 'ogg') return 'OGG_OPUS';
  if (fileType.includes('webm') || extension === 'webm') return 'WEBM_OPUS';
  if (fileType.includes('mp3') || extension === 'mp3') return 'MP3';
  if (fileType.includes('mpeg') || extension === 'mpeg') return 'MP3';
  if (fileType.includes('m4a') || extension === 'm4a') return 'MP3';

  return 'LINEAR16';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'google-speech-backend' });
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'No audio file uploaded. Use form-data field named "audio".',
      });
    }

    const audioBuffer = req.file.buffer;
    const encoding = getEncoding(req.file.mimetype, req.file.originalname);
    const languageCode = req.body.languageCode || process.env.GOOGLE_SPEECH_LANGUAGE_CODE || 'en-US';
    const sampleRateHertz = Number(req.body.sampleRateHertz || 16000);

    const [response] = await speechClient.recognize({
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
        enableAutomaticPunctuation: true,
      },
    });

    const transcript = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim();

    if (!transcript) {
      return res.status(422).json({
        ok: false,
        message: 'No speech was detected in the uploaded file.',
      });
    }

    return res.json({
      ok: true,
      transcript,
      languageCode,
      encoding,
      sampleRateHertz,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to transcribe audio with Google Speech-to-Text.',
      error: error?.message || 'Unknown error',
    });
  }
});

app.listen(port, () => {
  console.log(`Google Speech backend listening on http://localhost:${port}`);
});
