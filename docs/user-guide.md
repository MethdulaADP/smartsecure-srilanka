# SmartSecure Sri Lanka – User Guide

## Overview
SmartSecure provides a secure portal for users to register, authenticate, upload files, and view basic analytics about their stored data. Future phases will introduce encryption, AI-driven classification, and advanced security insights.

## Key Features (Current Phase)
- Account registration & login (basic session persisted locally)
- File uploads (single or multiple)
- File listing with size & timestamp
- Basic analytics: total files, total storage, file type distribution
- Activity logging (server-side) for auditing core actions

## Roadmap Snapshot
| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Core auth, UI foundation | Complete |
| Phase 2 (current) | File storage, analytics scaffold | In progress |
| Phase 3 | Encryption & AI classification | Pending |
| Phase 4 | Advanced analytics & risk scoring | Pending |

## Getting Started
### 1. Accessing the App
Open the frontend in your browser (development typically runs on `http://localhost:5173`). Ensure the backend API is running (default `http://localhost:5001`).

### 2. Registering an Account
1. Navigate to the Register page.
2. Provide a username and password (no special complexity enforced yet).
3. Submit – on success you are redirected or can proceed to login.

### 3. Logging In
1. Go to the Login page.
2. Enter credentials created during registration.
3. On success you're routed to the Dashboard.

### 4. Uploading Files
1. Open the Dashboard.
2. Go to the Files tab.
3. Click the Upload Files button and select one or more files.
4. After upload the table refreshes automatically.

### 5. Viewing Analytics
- Overview tab: high‑level counts & storage.
- AI Insights tab: current basic breakdown by file category (extension group). Future: AI predictions & security recommendations.

## File Type Categorization (Current Logic)
The backend groups files by their inferred type (extension). This will later evolve (e.g., MIME detection, AI semantic classification).

## Activity Logging
Every register, login, and upload action is recorded in the `activity_logs` table with timestamp and user reference. A future UI view will expose a timeline and filters.

## Security Notes (Current Limitations)
- Password hashing uses SHA-256 (placeholder). Will upgrade to bcrypt/argon2.
- No JWT tokens yet; session persistence is local only.
- No encryption at rest yet.
- No virus/malware scanning yet.

## Planned Enhancements
| Category | Enhancement |
|----------|------------|
| Auth | JWT-based tokens, refresh flow, rate limiting |
| Storage | Encryption (Fernet or envelope pattern), signed download URLs |
| AI | Content classification, sensitive data detection (PII), anomaly scoring |
| Analytics | Time-series growth, per-type trends, risk level indicators |
| Security | File integrity hashes, malware scan integration |
| UX | Activity feed UI, toast notifications, progressive upload UI |

## Troubleshooting
| Issue | Possible Cause | Resolution |
|-------|----------------|-----------|
| Cannot register | Backend not running | Start backend Flask server |
| Login fails after restart | DB file reset | Re-register user |
| Upload fails | File too large or server error | Check backend console logs |
| Analytics empty | No files uploaded yet | Upload at least one file |

## Developer Quick Commands (Reference)
- Backend: `python backend/app.py`
- Frontend: `npm run dev`

## Support
For internal development questions, consult architecture doc (`docs/architecture.md`). External user support TBD.
