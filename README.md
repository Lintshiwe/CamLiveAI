# CamLiveAI

**A standalone mobile camera detection terminal** that connects to any computer vision API via QR code pairing.

Scan a QR code → Camera starts → Real-time detection. Works with FruitSight AI, WasteSight AI, InventorySight AI, or any custom detection API.

## How It Works

1. **Open the app** on your phone — the camera scanner starts immediately
2. **Scan a QR code** generated from any connected platform (FruitSight, WasteSight, etc.)
3. **The app pairs automatically** — no login, no configuration
4. **Camera feed starts** with real-time detection bounding boxes
5. **View results** — detection list with confidence scores, timestamps

## Features

- **Auto QR scanning** — Camera starts scanning as soon as the app opens
- **Real-time detection** — Frames captured and sent to the detection API every 3s (single mode) or 500ms (live mode)
- **Multi-platform** — Works with FruitSight AI, WasteSight AI, InventorySight AI, or any custom backend
- **Bounding boxes** — Visual overlays with class labels and confidence colors
- **Detection feed** — Scrollable list of all detections with timestamps
- **Settings** — Adjust confidence threshold, resolution, FPS, and display options
- **User switching** — Select between signed-in users

## QR Code Format

The QR code must contain a JSON object:

```json
{
  "token": "your-auth-token",
  "tenantType": "agriculture",
  "tenantSlug": "your-tenant",
  "cameraId": "your-camera-id",
  "apiUrl": "https://your-api.com"
}
```

See **[QR_CODE_SPEC.md](./QR_CODE_SPEC.md)** for the complete specification, including how to generate QR codes from your own project.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** (v4)
- **lucide-react** — All icons
- **jsQR** — QR code scanning

## Deployment

The app is deployed to Netlify at **https://camliveai.netlify.app**.

To deploy your own instance:

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

## Project Structure

```
src/
├── App.tsx                     # Main app (pairing → camera → detection)
├── components/
│   ├── CameraViewport.tsx      # Full-screen camera with bbox overlays
│   ├── QRPairingOverlay.tsx    # Auto-scan QR code overlay
│   ├── DetectionSheet.tsx      # Detection results bottom sheet
│   ├── BottomTabBar.tsx        # 4-tab navigation
│   ├── ControlsOverlay.tsx     # Camera controls (snap, capture, switch)
│   ├── StatusOverlay.tsx       # FPS, detection count, connection
│   ├── SettingsModal.tsx       # App settings
│   ├── BoundingBox.tsx         # Detection bounding box overlay
│   ├── DetectionItem.tsx       # Single detection row
│   └── UserPanel.tsx           # User switcher
├── hooks/
│   ├── useRealtimeDetection.ts # Frame capture + API loop
│   └── useInterval.ts          # setInterval hook
├── types.ts                    # Shared types
└── constants.ts                # Mock data

QR_CODE_SPEC.md                  # QR code format for cross-platform compatibility
```

## API Integration

By default, the app sends detection requests to `https://fruitsight-ai.onrender.com/detection/single`. To use a custom API:

1. Generate a QR code with your own `apiUrl`
2. Scan it with CamLiveAI
3. The app will use your endpoint for all detection requests

The API should accept:
- `POST` with `{image: "<base64_jpeg>"}` 
- `Authorization: Bearer <token>` header
- Return `{detections: [{bbox, class_name, confidence, ...}]}`

## GitHub

- **Repository**: https://github.com/Lintshiwe/CamLiveAI
- **Issues**: https://github.com/Lintshiwe/CamLiveAI/issues

---

*Built for the FruitSight AI ecosystem — compatible with any CV detection platform.*
