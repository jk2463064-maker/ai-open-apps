# ai-open-apps

A starter mobile AI chat application built with Expo and React Native.

## Quick start

```bash
npm install
npm start
```

Then open the app with Expo Go, or run `npm run android` / `npm run ios`.

## Google Speech-to-Text backend

A backend service is included to run Google Cloud Speech-to-Text for uploaded audio.

### Setup

1. Create a Google Cloud project.
2. Enable the Cloud Speech-to-Text API.
3. Create a service account and download its JSON credentials.
4. Set the credentials path in your environment:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
```

5. Copy `backend/.env.example` to `backend/.env` and set the desired language code.
6. Start the backend:

```bash
cd backend
npm install
npm run dev
```

### Endpoint

- POST `/api/transcribe`
- Upload a file using a multipart form field named `audio`
- Example:

```bash
curl -X POST http://localhost:4000/api/transcribe \
  -F "audio=@sample.wav" \
  -F "languageCode=en-US"
```

### Notes

Use WAV or FLAC files for the most reliable transcription. The app can record audio and forward it to this backend for processing.
