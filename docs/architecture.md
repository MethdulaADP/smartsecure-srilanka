# SmartSecure Sri Lanka – Architecture

## High-Level Diagram (Current Phase)

[ Browser (React SPA) ]  <--HTTP/JSON-->  [ Flask API ]  <-->  [ SQLite DB ]
                                           |  
                                           +--> File System (uploads/<user_id>/)

Planned: Encryption layer, AI services, token auth provider, malware scanning module.

## Frontend Overview
- Framework: React + React Router (SPA)
- State: Minimal local component state + AuthContext for user session
- Styling: Tailwind CSS (single professional light theme)
- Service Layer: `frontend/src/services/api.js` centralizes HTTP calls
- Auth Persistence: `localStorage` user object (id, username)

### Key Components
| Component | Purpose |
|-----------|---------|
| AppRouter | Defines public & protected routes |
| AuthContext | Handles register/login via API and fallback logic |
| Dashboard | Tabbed interface (Overview, Files, Security, AI Insights) |
| Pages (Home, About, Contact, Services) | Marketing / static info |

## Backend Overview
- Framework: Flask + CORS
- Database: SQLite (file path configurable via environment variable `DB_PATH`)
- Tables: `users`, `activity_logs`, `files`
- Uploads: Stored under `uploads/<user_id>/` (relative to project root)

### Endpoints (Current)
| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness check |
| POST | /register | Create user (username, password) |
| POST | /login | Authenticate user |
| POST | /upload | Upload file (multipart) requires `user_id` field |
| GET | /files/<user_id> | List user files |
| GET | /analytics/<user_id> | Basic file analytics |

### Activity Logging
`activity_logger.log_activity(user_id, action, meta)` inserts a record into `activity_logs` with timestamp.

### Analytics Logic
`analytics_for_user(user_id)` returns:
- total_files
- total_storage (bytes)
- by_type: counts keyed by file extension/category

## Data Model
```
users(id INTEGER PK, username TEXT UNIQUE, password_hash TEXT, created_at TEXT)
activity_logs(id INTEGER PK, user_id INTEGER, action TEXT, metadata TEXT, created_at TEXT)
files(id INTEGER PK, user_id INTEGER, filename TEXT, file_size INTEGER, file_type TEXT, uploaded_at TEXT)
```

## Security Considerations (Current vs Planned)
| Aspect | Current | Planned |
|--------|---------|---------|
| Password Hash | SHA-256 | bcrypt/argon2 |
| Session | Local persisted object | JWT + refresh tokens |
| File Encryption | None | AES/Fernet per-file keys, possible envelope pattern |
| Malware Scan | None | ClamAV / 3rd-party API integration |
| Input Validation | Basic | Central validation layer + schema (pydantic / marshmallow) |
| Rate Limiting | None | IP + user-based throttling |

## Error Handling Strategy
Current: Minimal try/except in endpoints, returns JSON `{success:false,error:"..."}`.
Planned: Central error handler + structured error codes.

## Testing
- Basic test: `backend/tests/test_basic.py` covers health + auth cycle.
Planned: Add tests for upload, analytics, activity log queries, password hashing upgrade, and security regression tests.

## Deployment Considerations (Future)
| Layer | Plan |
|-------|------|
| Backend | Containerize (Gunicorn + Flask), environment-driven config |
| Frontend | Static hosting (e.g., CDN) |
| DB | Migrate to PostgreSQL for concurrency & reliability |
| File Storage | Object storage (S3-compatible) with signed URLs |
| Secrets | Managed via environment / secret manager |

## Extension Points
1. AI Classification Service: Pluggable microservice receiving file IDs or content hash.
2. Encryption Manager: Abstraction for key generation, storage (KMS), and file encrypt/decrypt.
3. Notification System: WebSocket or SSE for async analysis completion events.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Weak hashing | Credential compromise | Upgrade to bcrypt early |
| No encryption | Data exposure | Phase 3 encryption implementation |
| Single-node SQLite | Concurrency limits | Migrate to PostgreSQL |
| Large files | Disk exhaustion | Enforce size limits + quotas |
| Missing validation | Injection/DoS | Add schema validation layer |

## Next Architectural Steps
1. Introduce bcrypt + JWT auth flow.
2. Add file size/type validation & size limit enforcement.
3. Implement encryption pipeline (pre-storage encryption, key rotation policy).
4. Build AI classification placeholder service (async queue).
5. Replace SQLite with Postgres migration path.
6. Add download endpoint with access control & signed URL pattern.

## Glossary
- Activity Log: Audit trail of user-triggered events.
- Analytics: Aggregated metrics derived from stored entities.
- Extension Category: Derived from file extension (e.g., .pdf -> pdf).

---
Document Version: 0.1 (Generated)
