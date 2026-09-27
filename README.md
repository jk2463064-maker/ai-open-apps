# ai-open-apps

A starter mobile AI chat application built with Expo and React Native.

## Quick start

```bash
npm install
npm start
```

Then open the app with Expo Go, or run `npm run android` / `npm run ios`.

## Project structure

```text
.
├── App.tsx
├── app.json
├── package.json
├── src
│   ├── components
│   │   └── MessageBubble.tsx
│   ├── screens
│   │   └── ChatScreen.tsx
│   └── types
│       └── chat.ts
└── tsconfig.json
```

The chat currently uses a local mock response. Replace `getAssistantReply` in `src/screens/ChatScreen.tsx` with a call to your AI backend when ready. Keep provider keys on the server, never in the mobile app.
