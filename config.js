/*
  JARVIS AI 3.5 - app configuration
  Edit the values below to change the app's behavior.
  Do NOT put API keys or passwords in this file. This file is public on GitHub Pages.
*/
window.JARVIS_CONFIG = {
  app: {
    name: "JARVIS AI",
    version: "3.5",
    defaultLanguage: "en",          // "en" or "ta"
    defaultTheme: "dark",           // "dark" or "light"
  },

  voice: {
    enabled: true,                  // allow the microphone button
    speakReplies: true,             // read replies aloud by default
    wakeWord: "Hey JARVIS",         // reserved for the Android app
    recognitionLang: { en: "en-IN", ta: "ta-IN" },
    speechLang: { en: "en-IN", ta: "ta-IN" },
  },

  zoom: {
    min: 0.6,                       // smallest sphere size
    max: 2.4,                       // largest sphere size
    wheelStep: 0.08,                // zoom change per scroll tick
  },

  // AI provider. Leave endpoint empty to use the built-in demo replies.
  // When you connect a backend, call it from the server, not from this file.
  ai: {
    provider: "demo",               // "demo", or a name you define in your backend
    endpoint: "",                   // e.g. "https://your-backend.example.com/api/chat"
    maxHistory: 20,                 // messages kept in the conversation
  },

  // Apps shown in the "Reveal one by one" panel (preview only).
  demoApps: [
    { name: "YouTube",  color: "#ff6b5a" },
    { name: "WhatsApp", color: "#5ef2b6" },
    { name: "Chrome",   color: "#ffb347" },
    { name: "Maps",     color: "#ffe2a0" },
    { name: "Camera",   color: "#ff7a1a" },
    { name: "Gallery",  color: "#ffd27a" },
    { name: "Settings", color: "#b8967a" },
    { name: "Calendar", color: "#ffb347" },
    { name: "Clock",    color: "#ff7a1a" },
    { name: "Files",    color: "#ffe2a0" },
  ],

  revealDelayMs: 260,               // delay between apps in the reveal animation
};
