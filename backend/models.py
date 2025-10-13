"""
Enhanced Database Models for SmartSecure Sri Lanka
Phase 3 - PostgreSQL Migration + AI Analytics
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

db = SQLAlchemy()

class User(db.Model):
    """Enhanced User model with security features"""
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Security fields
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)
    last_password_change = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))
    
    # Profile fields
    full_name = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    organization = db.Column(db.String(200), nullable=True)
    
    # Audit fields
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Relationships
    files = db.relationship('File', backref='user', lazy=True, cascade='all, delete-orphan')
    activities = db.relationship('ActivityLog', backref='user', lazy=True)
    security_events = db.relationship('SecurityEvent', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }

class File(db.Model):
    """Enhanced File model with security and AI analysis"""
    __tablename__ = 'files'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # File metadata
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    mime_type = db.Column(db.String(100), nullable=True)
    file_hash = db.Column(db.String(64), nullable=True, index=True)  # SHA-256 hash
    
    # Security analysis
    is_safe = db.Column(db.Boolean, default=True, nullable=False)
    threat_score = db.Column(db.Float, default=0.0, nullable=False)  # 0.0 = safe, 1.0 = dangerous
    scan_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, scanning, completed, error
    
    # AI Analysis results
    ai_analysis = db.Column(JSONB, nullable=True)  # Store AI analysis results
    file_category = db.Column(db.String(50), nullable=True)  # document, image, archive, etc.
    
    # Audit fields
    uploaded_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    last_accessed = db.Column(db.DateTime(timezone=True), nullable=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'filename': self.filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'is_safe': self.is_safe,
            'threat_score': self.threat_score,
            'scan_status': self.scan_status,
            'file_category': self.file_category,
            'uploaded_at': self.uploaded_at.isoformat(),
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None
        }

class ActivityLog(db.Model):
    """Enhanced activity logging for security audit"""
    __tablename__ = 'activity_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Activity details
    activity_type = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)  # IPv6 compatible
    user_agent = db.Column(db.Text, nullable=True)
    
    # Context data
    metadata = db.Column(JSONB, nullable=True)  # Additional context data
    severity = db.Column(db.String(10), default='INFO', nullable=False)  # INFO, WARN, ERROR, CRITICAL
    
    # Audit fields
    timestamp = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False, index=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'activity_type': self.activity_type,
            'description': self.description,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata
        }

class SecurityEvent(db.Model):
    """Advanced security event tracking"""
    __tablename__ = 'security_events'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Event details
    event_type = db.Column(db.String(50), nullable=False, index=True)
    threat_level = db.Column(db.String(10), default='LOW', nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    description = db.Column(db.Text, nullable=False)
    
    # Detection details
    detection_method = db.Column(db.String(50), nullable=False)  # rule_based, ai_model, signature, etc.
    confidence_score = db.Column(db.Float, default=0.0, nullable=False)  # 0.0 - 1.0
    
    # Response
    status = db.Column(db.String(20), default='new', nullable=False)  # new, investigating, resolved, false_positive
    response_actions = db.Column(JSONB, nullable=True)
    
    # Context
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    metadata = db.Column(JSONB, nullable=True)
    
    # Audit fields
    detected_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'event_type': self.event_type,
            'threat_level': self.threat_level,
            'description': self.description,
            'confidence_score': self.confidence_score,
            'status': self.status,
            'detected_at': self.detected_at.isoformat(),
            'metadata': self.metadata
        }

class ThreatIntelligence(db.Model):
    """AI-powered threat intelligence database"""
    __tablename__ = 'threat_intelligence'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Threat signature
    signature_type = db.Column(db.String(50), nullable=False, index=True)  # file_hash, pattern, behavior
    signature_value = db.Column(db.String(500), nullable=False, index=True)
    
    # Threat details
    threat_name = db.Column(db.String(200), nullable=False)
    threat_category = db.Column(db.String(50), nullable=False)  # malware, phishing, suspicious, etc.
    severity = db.Column(db.String(10), default='MEDIUM', nullable=False)
    
    # Intelligence data
    description = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(100), nullable=False)  # internal, external_feed, user_report
    confidence = db.Column(db.Float, default=0.5, nullable=False)
    
    # Metadata
    metadata = db.Column(JSONB, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Audit fields
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

class AIAnalysisJob(db.Model):
    """Track AI analysis jobs and results"""
    __tablename__ = 'ai_analysis_jobs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = db.Column(UUID(as_uuid=True), db.ForeignKey('files.id'), nullable=True, index=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Job details
    job_type = db.Column(db.String(50), nullable=False)  # threat_detection, classification, pattern_analysis
    status = db.Column(db.String(20), default='queued', nullable=False)  # queued, running, completed, failed
    priority = db.Column(db.Integer, default=50, nullable=False)  # 0 = highest, 100 = lowest
    
    # Results
    results = db.Column(JSONB, nullable=True)
    confidence_scores = db.Column(JSONB, nullable=True)
    processing_time = db.Column(db.Float, nullable=True)  # seconds
    
    # Error handling
    error_message = db.Column(db.Text, nullable=True)
    retry_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Audit fields
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

def migrate_from_sqlite(sqlite_path, app):
    """Migrate existing SQLite data to PostgreSQL"""
    import sqlite3
    from security import SecurityManager
    
    print("🔄 Starting migration from SQLite...")
    
    with app.app_context():
        # Connect to old SQLite database
        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        try:
            # Migrate users
            cur.execute('SELECT * FROM users')
            sqlite_users = cur.fetchall()
            user_mapping = {}  # old_id -> new_uuid
            
            for old_user in sqlite_users:
                new_user = User(
                    username=old_user['username'],
                    email=old_user['email'],
                    password_hash=old_user['password_hash'],
                    created_at=datetime.fromisoformat(old_user['created_date']) if old_user['created_date'] else datetime.now(timezone.utc)
                )
                db.session.add(new_user)
                db.session.flush()  # Get the UUID
                user_mapping[old_user['id']] = new_user.id
            
            # Migrate files
            cur.execute('SELECT * FROM files')
            sqlite_files = cur.fetchall()
            
            for old_file in sqlite_files:
                if old_file['user_id'] in user_mapping:
                    new_file = File(
                        user_id=user_mapping[old_file['user_id']],
                        filename=old_file['filename'],
                        original_filename=old_file['filename'],
                        file_path=old_file['stored_path'],
                        file_size=old_file['file_size'],
                        uploaded_at=datetime.fromisoformat(old_file['uploaded_at']) if old_file['uploaded_at'] else datetime.now(timezone.utc)
                    )
                    db.session.add(new_file)
            
            # Migrate activity logs
            cur.execute('SELECT * FROM activity_logs')
            sqlite_activities = cur.fetchall()
            
            for old_activity in sqlite_activities:
                user_uuid = user_mapping.get(old_activity['user_id'])
                new_activity = ActivityLog(
                    user_id=user_uuid,
                    activity_type=old_activity['activity_type'],
                    description=old_activity['description'],
                    timestamp=datetime.fromisoformat(old_activity['timestamp']) if old_activity['timestamp'] else datetime.now(timezone.utc)
                )
                db.session.add(new_activity)
            
            db.session.commit()
            print(f"✅ Migration completed! Migrated {len(sqlite_users)} users, {len(sqlite_files)} files, {len(sqlite_activities)} activities")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {e}")
            raise
        finally:
            conn.close()