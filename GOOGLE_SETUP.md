# Google Cloud Service Account Setup for Speech-to-Text

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter a project name (e.g., "ai-open-apps")
5. Click **CREATE**
6. Wait for the project to be created, then select it from the dropdown

## Step 2: Enable the Speech-to-Text API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Cloud Speech-to-Text API"
3. Click on **Cloud Speech-to-Text API**
4. Click the **ENABLE** button
5. Wait for the API to be enabled

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **Service Account**
4. Fill in the details:
   - Service account name: `ai-open-apps-backend` (or your choice)
   - Service account ID: auto-filled based on name
   - Description: `Backend service for speech transcription`
5. Click **CREATE AND CONTINUE**

## Step 4: Grant Permissions

1. Under "Grant this service account access to project", click the **Select a role** dropdown
2. Search for and select **Cloud Speech Client** (or **Editor** for broader permissions)
3. Click **CONTINUE**
4. On the "Grant users access to this service account" screen, click **DONE**

## Step 5: Create and Download the Key

1. Go to **APIs & Services** > **Credentials**
2. Under **Service Accounts**, click the email of the service account you just created
3. Click the **KEYS** tab
4. Click **+ ADD KEY** > **Create new key**
5. Select **JSON** as the key type
6. Click **CREATE**
7. A JSON file will automatically download to your computer
   - Save this file as `gcloud-service-account.json` in the `backend/` directory

## Step 6: Add the Credentials to Your Backend

1. Move the downloaded JSON file to your project:
   ```bash
   cp ~/Downloads/[downloaded-file-name].json ./backend/gcloud-service-account.json
   ```

2. Add it to `.gitignore` to prevent accidentally committing it:
   ```bash
   echo "backend/gcloud-service-account.json" >> .gitignore
   ```

3. Update `backend/.env`:
   ```env
   PORT=4000
   GOOGLE_APPLICATION_CREDENTIALS=./gcloud-service-account.json
   GOOGLE_SPEECH_LANGUAGE_CODE=en-US
   ```

## Step 7: Install and Run the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Google Speech backend listening on http://localhost:4000
```

## Step 8: Test the Backend

1. Create a test audio file or use an existing one (WAV, FLAC, or MP3)
2. Test with curl:
   ```bash
   curl -X POST http://localhost:4000/api/transcribe \
     -F "audio=@path/to/audio.wav" \
     -F "languageCode=en-US"
   ```

3. You should get a response like:
   ```json
   {
     "ok": true,
     "transcript": "Hello world",
     "languageCode": "en-US",
     "encoding": "LINEAR16",
     "sampleRateHertz": 16000
   }
   ```

## Security Best Practices

- **Never commit the JSON key file** — add it to `.gitignore`
- **Use environment variables** — don't hardcode paths
- **Restrict IAM roles** — use "Cloud Speech Client" instead of "Editor"
- **Rotate keys periodically** — delete old keys from the Service Account page
- **Use a separate service account** for each environment (dev, staging, production)

## Troubleshooting

### "Permission denied" error
- Make sure the service account has the "Cloud Speech Client" role
- Check that `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### "API not enabled" error
- Go to **APIs & Services** > **Library** and search for "Speech"
- Make sure "Cloud Speech-to-Text API" is enabled

### Audio file not recognized
- Use WAV or FLAC format for best results
- Ensure the file is a valid audio format (not corrupted)

### Backend not responding
- Check that backend is running: `npm run dev` in the `backend/` folder
- Verify the port is correct (default: 4000)
- Check for errors in the terminal

## Next Steps

Once the backend is running, update the Expo app to send audio files to this endpoint instead of using local transcription.
