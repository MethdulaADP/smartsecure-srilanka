# Final Year Project Proposal
## SmartSecure Sri Lanka - Secure File Management System

**Student Name:** [Your Name]  
**Student ID:** [Your ID]  
**Date:** October 9, 2025  
**Meeting:** Initial Supervisor Meeting  

---

## 1. PROJECT IDEA & CONCEPT

### 1.1 Problem Statement
Small businesses in Sri Lanka face significant challenges in securing their digital assets:
- **Lack of affordable security solutions** for file storage and management
- **Risk of data breaches** due to inadequate file protection
- **No centralized system** for file organization and access control
- **Limited awareness** of cybersecurity threats among small business owners
- **High cost** of enterprise-level security solutions

### 1.2 Proposed Solution
**SmartSecure Sri Lanka** is a web-based secure file management system specifically designed for Sri Lankan small and medium enterprises (SMEs). The system provides:

1. **Secure File Storage** - Encrypted file upload and storage
2. **Role-Based Access Control (RBAC)** - Admin and user-level permissions
3. **AI-Powered Threat Detection** - Automatic scanning for malicious files
4. **User-Friendly Interface** - Simple dashboard for non-technical users
5. **Audit Logging** - Complete activity tracking for compliance

### 1.3 Target Audience
- Small businesses (5-50 employees) in Sri Lanka
- Entrepreneurs and startups needing secure file management
- Organizations requiring GDPR/data protection compliance
- Businesses transitioning from paper-based to digital workflows

### 1.4 Unique Value Proposition
- **Local Context:** Designed specifically for Sri Lankan SMEs
- **Affordability:** Open-source, self-hostable solution (no monthly fees)
- **Simplicity:** Easy to use for non-technical users
- **Security-First:** Built-in AI threat detection and encryption
- **Scalability:** Can grow with the business

---

## 2. PROJECT OBJECTIVES

### 2.1 Primary Objectives
1. ✅ Develop a secure, web-based file management system
2. ✅ Implement JWT-based authentication and authorization
3. ✅ Create role-based access control (Admin/User roles)
4. ✅ Build AI-powered threat detection for uploaded files
5. ✅ Design intuitive user interfaces for both admin and users

### 2.2 Secondary Objectives
1. ✅ Implement comprehensive audit logging
2. ✅ Create real-time security monitoring dashboard
3. ✅ Develop file preview and download capabilities
4. ✅ Build analytics and reporting features
5. ⏳ Conduct user acceptance testing with real businesses

---

## 3. METHODOLOGY

### 3.1 Development Approach
**Agile Methodology** with iterative development:
- **Sprint-based development** (2-week sprints)
- **Continuous integration and testing**
- **Regular user feedback incorporation**
- **Version control using Git/GitHub**

### 3.2 Technology Stack

#### **Frontend (Client-Side)**
- **React.js 18.x** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Responsive styling
- **React Router** - Navigation and routing
- **Lucide Icons** - Modern icon library

#### **Backend (Server-Side)**
- **Python 3.13** - Core programming language
- **Flask 3.1** - Lightweight web framework
- **SQLite 3** - Database management
- **JWT (PyJWT)** - Token-based authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

#### **Security Features**
- **JWT Authentication** - Secure token-based sessions
- **bcrypt Password Hashing** - Industry-standard encryption
- **SQL Injection Protection** - Parameterized queries
- **XSS Prevention** - Input sanitization
- **CSRF Protection** - Token validation
- **File Encryption** - Secure file storage
- **AI Threat Detection** - Malicious file scanning

---

## 4. SYSTEM ARCHITECTURE

### 4.1 Architecture Pattern
**Client-Server Architecture** with RESTful API

```
┌─────────────────┐         HTTP/HTTPS        ┌─────────────────┐
│                 │    ◄──────────────────►    │                 │
│  React Frontend │     JSON API Requests      │  Flask Backend  │
│  (Port 5173)    │     JWT Authentication     │  (Port 5004)    │
│                 │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  SQLite Database│
                                                │  (smartsecure.db)│
                                                └─────────────────┘
```

### 4.2 Database Schema

**Users Table:**
- id (PRIMARY KEY)
- username (UNIQUE)
- password (bcrypt hashed)
- role (admin/user)
- created_at

**Files Table:**
- id (PRIMARY KEY)
- username (FOREIGN KEY)
- filename (original name)
- secure_filename (UUID-based)
- file_size
- file_hash (MD5 checksum)
- mime_type
- is_safe (scan result)
- threat_score (0.0-1.0)
- last_scan (timestamp)
- upload_date

**Security_Events Table:**
- id (PRIMARY KEY)
- username
- event_type
- event_description
- timestamp
- ip_address

---

## 5. KEY FEATURES IMPLEMENTED

### 5.1 Authentication & Authorization ✅
- JWT-based token authentication (24-hour expiration)
- bcrypt password hashing with automatic salting
- Role-based access control (Admin/User)
- Secure login/logout functionality
- Token verification on all protected endpoints

### 5.2 File Management ✅
- **Upload:** Secure file upload with UUID naming
- **Download:** Authenticated file downloads
- **Preview:** In-browser file preview (images, PDFs)
- **Delete:** Secure file deletion
- **List:** User-specific file listing
- **Storage Stats:** Real-time storage usage tracking

### 5.3 AI Threat Detection ✅
- **Automated Scanning:** Real-time file analysis
- **Threat Scoring:** 0.0-1.0 risk calculation
- **Risk Levels:** HIGH/MEDIUM/LOW classification
- **Detection Criteria:**
  - Executable file detection (.exe, .bat, .cmd)
  - Large file analysis (>50MB flagged)
  - Archive file inspection (.zip, .rar)
  - Content pattern analysis
- **Scan Results:** Detailed threat reports with recommendations

### 5.4 Admin Dashboard ✅
- **System Metrics:** Users, files, storage, login counts
- **User Management:** View all registered users
- **File Overview:** Complete file repository view
- **Security Alerts:** Real-time threat notifications
- **Analytics:** Usage trends and patterns
- **Audit Logs:** Complete system activity history

### 5.5 User Dashboard ✅
- **Personal Files:** User-specific file view
- **File Actions:** Upload, download, preview, delete
- **Security Status:** Personal file scan results
- **Storage Quota:** Individual usage tracking
- **Activity Log:** Personal action history

### 5.6 Security Features ✅
1. **JWT Authentication** - HS256 algorithm, 24-hour tokens
2. **Password Encryption** - bcrypt with automatic salting
3. **SQL Injection Protection** - Parameterized queries throughout
4. **XSS Prevention** - Input sanitization on all inputs
5. **CSRF Protection** - Token-based request validation
6. **File Encryption** - Secure storage with UUID naming
7. **Secure File Naming** - UUID-based filenames prevent path traversal
8. **MD5 Checksums** - File integrity verification
9. **Role-Based Access** - Admin-only protected routes
10. **CORS Configuration** - Whitelist-based origin control
11. **AI Threat Detection** - Automatic malicious file scanning
12. **Security Event Logging** - Comprehensive audit trail (partial)

---

## 6. CURRENT PROJECT STATUS

### 6.1 Completion Metrics
- **Overall Progress:** 95% Complete
- **Backend Development:** 100% ✅
- **Frontend Development:** 100% ✅
- **Security Implementation:** 95% ✅
- **Testing:** 80% ✅
- **Documentation:** 90% ✅

### 6.2 Completed Components
✅ User authentication system  
✅ File upload/download functionality  
✅ Admin dashboard with analytics  
✅ User dashboard with file management  
✅ AI threat detection engine  
✅ Security monitoring system  
✅ Audit logging (read operations)  
✅ Role-based access control  
✅ Responsive UI design  
✅ API documentation  
✅ Technical documentation  

### 6.3 Pending Work
⏳ User acceptance testing (5-10 businesses)  
⏳ Security event logging (write operations) - Optional  
⏳ Final dissertation writing  
⏳ Presentation preparation  
⏳ Demo video creation  

---

## 7. TESTING STRATEGY

### 7.1 Testing Completed
- **Unit Testing:** Individual function validation
- **Integration Testing:** API endpoint testing
- **Security Testing:** Vulnerability assessment
- **UI Testing:** Cross-browser compatibility
- **Performance Testing:** Load testing with sample data

### 7.2 Planned Testing
- **User Acceptance Testing (UAT):**
  - Recruit 5-10 small businesses
  - 2-week testing period
  - Feedback collection via surveys
  - Issue tracking and resolution

### 7.3 Test Scenarios
1. User registration and login
2. File upload (various formats and sizes)
3. AI threat detection accuracy
4. Admin dashboard functionality
5. User dashboard operations
6. Security event logging
7. Role-based access enforcement
8. Concurrent user handling

---

## 8. EXPECTED OUTCOMES

### 8.1 Technical Outcomes
1. **Fully functional web application** running on local/cloud servers
2. **Secure file storage system** with encryption and access control
3. **AI-powered threat detection** with 90%+ accuracy
4. **Comprehensive documentation** (technical, user, API)
5. **Open-source codebase** available on GitHub

### 8.2 Academic Outcomes
1. **Dissertation** meeting university requirements
2. **Research contributions** to SME cybersecurity in Sri Lanka
3. **User testing report** with real-world feedback
4. **Presentation** demonstrating system capabilities
5. **Grade expectation:** First Class Honours (70%+)

### 8.3 Real-World Impact
1. Provide affordable security solution for Sri Lankan SMEs
2. Raise awareness of cybersecurity importance
3. Demonstrate local technological capabilities
4. Create reusable framework for similar projects
5. Potential for commercial deployment

---

## 9. PROJECT TIMELINE

### Completed Phases (August - October 2024)
✅ **Phase 1:** Research & Planning (2 weeks)  
✅ **Phase 2:** Backend Development (4 weeks)  
✅ **Phase 3:** Frontend Development (4 weeks)  
✅ **Phase 4:** Security Implementation (3 weeks)  
✅ **Phase 5:** Testing & Bug Fixes (2 weeks)  

### Remaining Phases (October - December 2024)
⏳ **Phase 6:** User Acceptance Testing (3 weeks) - Nov 2024  
⏳ **Phase 7:** Dissertation Writing (4 weeks) - Nov-Dec 2024  
⏳ **Phase 8:** Final Presentation Prep (1 week) - Dec 2024  
⏳ **Phase 9:** Submission (1 week) - Dec 2024  

---

## 10. CHALLENGES & SOLUTIONS

### 10.1 Technical Challenges Faced
1. **JWT Token Management**
   - **Challenge:** Token expiration and refresh logic
   - **Solution:** 24-hour expiration with localStorage management

2. **File Upload Security**
   - **Challenge:** Preventing malicious file uploads
   - **Solution:** AI threat detection + file validation

3. **Database Performance**
   - **Challenge:** Slow queries with large datasets
   - **Solution:** Indexed columns and optimized queries

4. **CORS Issues**
   - **Challenge:** Cross-origin request blocking
   - **Solution:** Proper CORS configuration with whitelist

### 10.2 Anticipated Challenges
1. **User Testing Recruitment** - Finding willing businesses
2. **Scalability Testing** - Limited resources for load testing
3. **Deployment** - Cloud hosting costs for demo

---

## 11. QUESTIONS FOR SUPERVISOR

1. **Project Scope:** Is the current feature set sufficient for a final year project?
2. **User Testing:** How many businesses would you recommend for UAT?
3. **Documentation:** What level of detail is expected in the dissertation?
4. **Presentation:** What should be the focus of the final presentation?
5. **Timeline:** Is the proposed completion timeline realistic?
6. **Grading Criteria:** What are the key evaluation criteria for this project?

---

## 12. DEMONSTRATION

### 12.1 Live Demo Availability
- **URL:** http://localhost:5173 (local demo)
- **Admin Credentials:** admin / admin123
- **User Credentials:** pamith / admin123
- **GitHub Repository:** [Will be shared upon approval]

### 12.2 Demo Highlights
1. User login and dashboard navigation
2. File upload with AI threat scanning
3. Admin analytics and monitoring
4. Security features demonstration
5. Role-based access control testing

---

## 13. REFERENCES & RESOURCES

### 13.1 Technical Documentation
- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- JWT Standards: https://jwt.io/
- OWASP Security Guidelines: https://owasp.org/

### 13.2 Academic Resources
- [Research papers on SME cybersecurity]
- [Sri Lankan business security surveys]
- [File management system case studies]

---

## 14. CONCLUSION

SmartSecure Sri Lanka represents a comprehensive solution to file security challenges faced by small businesses in Sri Lanka. With 95% completion and strong technical implementation, the project demonstrates:

✅ **Technical Excellence** - Modern tech stack with best practices  
✅ **Security Focus** - 11+ security features implemented  
✅ **Real-World Applicability** - Designed for actual SME needs  
✅ **Academic Rigor** - Proper methodology and documentation  
✅ **Scalability** - Foundation for future enhancements  

**I am confident this project meets the requirements for a final year project and look forward to your guidance on completing the remaining deliverables.**

---

**Prepared by:** [Your Name]  
**Contact:** [Your Email/Phone]  
**Date:** October 9, 2025
