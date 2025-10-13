# SmartSecure Sri Lanka — Action Plan (2025-09-27)

Focused answer to: **“what we have to do”** — this file is your current, prioritized execution guide.

## ✅ Current State (Snapshot)
Frontend (React + Vite + Tailwind):
- Pages & routing in place: Home, Services, About, Contact, Login, Register, Dashboard, 404
- **Multi-language Support: English, Sinhala, Tamil with language switcher** ✅ COMPLETED
- AuthContext integrates real API with graceful mock fallback
- Dashboard: file upload, listing, basic analytics tabs (Overview, Files, Security placeholder, AI Insights)
- Responsive layout + marketing sections complete

Backend (Flask + SQLite):
- Endpoints: /health, /register, /login, /upload, /files/<id>, /analytics/<id>
- Tables: users, files, activity_logs (logging invoked for register/login/upload)
- File storage under backend/uploads/<user_id>
- Basic analytics aggregation implemented
- Password hashing = SHA-256 (placeholder — needs upgrade)

Docs:
- architecture.md (reflects Flask shift, but development-plan.md still references Express / outdated statuses)
- user-guide.md aligned with current features
- This plan replacing older “tomorrow” note

## 🎯 Immediate Priority Themes
1. Security Hardening (auth & storage)
2. User Experience & Visibility (activity feed, file actions)
3. Reliability & Testing
4. Future Feature Foundations (encryption + AI scaffolds)
5. Documentation & Plan Realignment

---
## 🔐 1. Security & Auth (High Priority)
| Task | Why | Deliverable |
|------|-----|-------------|
| Replace SHA-256 with bcrypt | Prevent fast brute force | `bcrypt` dependency + migration logic (re-hash on login) |
| Introduce JWT access + refresh tokens | API stateless auth | /login issues tokens; decorator to protect endpoints |
| Add /logout (blacklist optional) | Session clarity | Simple client-side purge + optional server token revocation list |
| Input validation layer | Prevent malformed data | Central helper (e.g., lightweight schema checks) |
| Rate limiting (basic) | Mitigate abuse | Simple in-memory (per IP) wrapper (later Redis) |

### Notes
- Implement bcrypt first; store new column (or reuse password_hash). For legacy (SHA-256) users, detect length/prefix → rehash.
- JWT secret via environment variable (.env). Short access (15m) + refresh (7d).

---
## 📁 2. File Handling & Activity UX
| Task | Why | Deliverable |
|------|-----|-------------|
| Add file download endpoint | Round-trip completeness | GET /download/<file_id> (auth + ownership check) |
| Add delete endpoint | User control / cleanup | DELETE /files/<file_id> |
| Enforce size & type policy | Prevent abuse & dangerous uploads | Validate MIME + extension whitelist; configurable limit |
| Persist file content hash (SHA-256) | Future integrity & dedupe | New column `content_hash` |
| Expose activity feed endpoint | Surface audit trail | GET /activity/<user_id>?limit=50 |
| UI Activity timeline | Transparency | Dashboard “Activity” section |

---
## 🧪 3. Testing & Quality
| Layer | Initial Tests |
|-------|--------------|
| Auth | register → login → token refresh → protected route |
| Files | upload small file, reject oversize, list matches count |
| Analytics | Counts & by_type accuracy with known fixtures |
| Activity | Events logged for register/login/upload |

Add a lightweight `pytest` suite (`backend/tests/`) and GitHub Actions workflow later.

---
## 🔐 4. Encryption & AI (Design Foundations)
| Task | Type | Outcome |
|------|------|---------|
| Draft encryption architecture | Doc | Chosen approach (file-level AES + envelope keys) |
| Introduce key management abstraction | Code scaffold | Placeholder module `encryption/keys.py` |
| Stub AI classification service (separate module/process) | Scaffold | REST endpoint `/ai/classify` returns mock categories |
| Queue interface design (future async) | Doc | Outline using Redis / simple table queue |

Implement after auth hardening & file operations.

---
## 🧩 5. Documentation & Plan Realignment
| Task | Action |
|------|--------|
| Update `development-plan.md` | Mark completed items; replace Express with Flask; adjust phase timelines |
| Add SECURITY.md | State current limitations & roadmap |
| Update architecture.md | After JWT + bcrypt integration |
| Add API reference doc | Enumerate endpoints + auth requirements |

---
## 📦 6. DevOps / Tooling
| Task | Why |
|------|-----|
| Add `.env.example` | Standardize config (SECRET_KEY, DB path, MAX_UPLOAD_MB) |
| Introduce Dockerfile (backend) | Ease onboarding & deployment baseline |
| Pre-commit hooks (black/isort/ruff or flake8) | Code consistency |
| Logging improvements | Structured JSON logs for future aggregation |

---
## 🗺️ 7. Stretch / Later
- Object storage abstraction (S3) interface
- Malware scanning integration (ClamAV / API)
- Signed URLs for downloads
- Quotas per user & file versioning
- Metrics endpoint (/metrics) for Prometheus

---
## ⏱️ Suggested Order of Execution (Next 2–3 Working Sessions)
1. bcrypt migration + dependency add
2. JWT auth (access + refresh) + securing endpoints
3. Download + delete endpoints
4. Activity feed endpoint + UI tab
5. File validation (size/MIME) + hash storage
6. Initial pytest suite
7. Development-plan.md & SECURITY.md updates
8. Encryption design doc draft

---
## 🚀 “Do Today” Micro List (If Limited Time ~3–4 hrs)
1. Install & switch to bcrypt (update register/login flows)
2. Add JWT issuance & @require_auth decorator (protect upload/files/analytics)
3. Create /activity/<user_id> returning last 25 events
4. Add Activity tab in Dashboard consuming new endpoint (simple list)

If extra time: implement /download/<file_id>

---
## 🔧 Dependencies to Add Soon
Backend (requirements.txt additions):
- bcrypt
- PyJWT (or flask-jwt-extended)
- python-dotenv (optional for .env loading)
Testing: pytest

---
## 📑 Quick Reference (Current Endpoints)
Auth not yet enforced (will change after JWT step):
POST /register, POST /login, POST /upload, GET /files/<user_id>, GET /analytics/<user_id>
Planned new: GET /activity/<user_id>, GET /download/<file_id>, DELETE /files/<file_id>

---
## ❗ Risks To Address Early
| Risk | Mitigation Step in Plan |
|------|-------------------------|
| Weak password hashing | bcrypt migration (Step 1) |
| No auth guard on data endpoints | JWT decorator (Step 2) |
| Unbounded uploads | Enforce size/type & quotas |
| Missing activity visibility | Activity feed endpoint + UI |
| Future encryption retrofitting complexity | Draft architecture before storing sensitive data |

---
## ✅ Completion Definition (Short-Term Milestone)
Milestone considered “hardened core” when:
- bcrypt + JWT live
- Upload, list, analytics, download, delete all require auth
- Activity feed visible in UI
- Basic test suite passes (auth + files + analytics + activity)
- Docs updated to match reality

---
## 📣 Notes
- Avoid premature AI implementation until encryption + auth are stable.
- Add minimal metrics (counts) after tests to confirm endpoints remain performant.
- Keep commits granular: (feat/auth-jwt), (feat/files-download), (chore/docs-plan-sync).

---
Prepared: 2025-09-27

Update this file at the end of each session: Move finished tasks to a short “Done Today” block at top if desired.
