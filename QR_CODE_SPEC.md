# CamLiveAI QR Code Specification

> **Quick reference.** For the full integration guide (backend API contract, auth,
> QR generation, CORS, response format, examples, testing), see
> **[CAMLIVEAI_SPEC.md](./CAMLIVEAI_SPEC.md)**.

---

## QR Data Format

The QR code must contain this exact JSON:

```json
{
  "token": "jwt_or_api_key_here",
  "tenantType": "agriculture",
  "tenantSlug": "my-farm",
  "cameraId": "cam-001",
  "apiUrl": "https://your-api.com"
}
```

### Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `token` | ✅ | string | JWT or API key for `Authorization: Bearer` header |
| `tenantType` | ✅ | string | One of: `agriculture`, `waste_management`, `warehouse`, or custom |
| `tenantSlug` | ✅ | string | Human-readable name shown in the UI (e.g. `fruitsight`) |
| `cameraId` | ✅ | string | Unique camera/device identifier for your records |
| `apiUrl` | ✅ | string | Full base URL of your detection API (no trailing slash) |

### Validation

CamLiveAI accepts the QR scan only if all four required fields (`token`, `tenantType`,
`cameraId`, `tenantSlug`) are present and non-empty. If validation fails the scanner
silently continues.

---

## Examples

### FruitSight AI
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tenantType": "agriculture",
  "tenantSlug": "fruitsight",
  "cameraId": "CAM-A7X3",
  "apiUrl": "https://fruitsight-ai.onrender.com"
}
```

### WasteSight AI
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tenantType": "waste_management",
  "tenantSlug": "wastesight",
  "cameraId": "CAM-B2K9",
  "apiUrl": "https://fruitsight-ai.onrender.com"
}
```

### Custom Project
```json
{
  "token": "sk_abc123def456",
  "tenantType": "retail",
  "tenantSlug": "my-store",
  "cameraId": "device-xyz-789",
  "apiUrl": "https://your-api.com"
}
```

---

## 🚀 Full Integration Guide

All of this and much more in **[CAMLIVEAI_SPEC.md](./CAMLIVEAI_SPEC.md)**:

| Topic | |
|-------|-|
| Backend API contract | ✅ Request/response schemas, CORS, error handling |
| Auth setup | ✅ Register users, generate tokens, JWT vs API keys |
| QR generation | ✅ Python, Node.js, browser, CLI examples |
| Response format | ✅ Detection fields, bbox format, confidence mapping |
| Testing checklist | ✅ curl, full end-to-end walkthrough |
| CamLiveAI internals | ✅ Frame capture, data model, settings reference |

---

*App: https://camliveai.netlify.app · Repo: https://github.com/Lintshiwe/CamLiveAI*
