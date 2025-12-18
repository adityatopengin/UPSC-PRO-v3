🏛️ UPSC-Pro PWA (Target 2026)
UPSC-Pro is a high-performance, production-ready Progressive Web Application (PWA) designed for UPSC Civil Services aspirants. It features a premium glassmorphism UI, drift-proof mock test engines, and comprehensive offline support.
🚀 Key Features
 * Installable PWA: Works as a native app on iOS and Android with a custom splash screen and home screen icon.
 * Offline Excellence: Powered by a Service Worker with a Stale-While-Revalidate strategy, allowing study even without an internet connection.
 * Drift-Proof Timer: Logic-synced with the system clock to ensure 100% accuracy during 2-hour mock sessions.
 * UPSC Precision Scoring: Automated marking for GS (+2.0/-0.666) and CSAT (+2.5/-0.833) papers.
 * Modern Design: "Fog Effect" design system with fluid glassmorphism, animated background mesh, and native dark mode detection.
 * Modular Architecture: "Division of Labour" code structure for high maintainability and performance.
📂 Directory Structure
upsc-pro/
├── index.html                # PWA entry point & app shell
├── manifest.json             # Web App Manifest (Installability)
├── service-worker.js         # Offline engine (Caching & Sync)
├── style.css                 # Design system & Glassmorphism styles
├── data/                     # Question banks (Normalized JSON)
│   ├── ancient_history.json
│   ├── polity.json
│   └── ... (Other subjects)
├── assets/
│   ├── js/                   # Modular Application Logic
│   │   ├── config.js         # Registry & Global Constants
│   │   ├── store.js          # Persistence & Quota Management
│   │   ├── adapter.js        # Data Normalizer
│   │   ├── engine.js         # Logic Core (Timer & Scoring)
│   │   ├── ui.js             # Architect (View rendering)
│   │   └── main.js           # Master Controller (Routing)
│   ├── images/               # Branding (icons, profile)
│   └── audio/                # Media (orientation audio)

🛠️ Technical Implementation
The Logic Core
 * engine.js: Uses Date.now() delta calculation to prevent JavaScript's setInterval drift issues.
 * adapter.js: A smart translator that normalizes various JSON formats (Index vs. Label vs. String) into a strict internal schema.
 * store.js: Managed localStorage with built-in "Quota Management" to prevent crashes on older devices.
Network Resilience
The main.js controller includes an exponential backoff retry mechanism. If a user’s network flickers while loading a subject, the app automatically retries 3 times before displaying a graceful error state.
🌐 Deployment
This app is entirely client-side and can be hosted for free on GitHub Pages, Vercel, or Netlify.
Deployment Steps:
 * Upload the folder to your preferred host.
 * Ensure your host provides HTTPS (mandatory for PWA features).
 * Visit the URL; your browser will prompt you to "Add to Home Screen."
🧪 Testing Checklist
 * [ ] PWA Install: Verify the install prompt appears on mobile Chrome/Safari.
 * [ ] Offline Mode: Load a quiz, turn off WiFi, and ensure the quiz continues.
 * [ ] Timer Accuracy: Check that the timer doesn't slow down when the browser tab is in the background.
 * [ ] Dark Mode: Toggle system settings to verify the UI adapts automatically.
📝 Maintenance
To add new questions or subjects:
 * Add your .json file to the data/ folder.
 * Register the subject in assets/js/config.js under subjectsGS1 or subjectsCSAT.
 * The app will automatically generate the UI card and handle the logic.
Version: 4.1.0 (Production Ready)
Developer Note: Optimized for high-traffic and low-bandwidth environments.
