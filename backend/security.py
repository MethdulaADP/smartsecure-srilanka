"""
Enhanced Authentication System with JWT and Security Features
SmartSecure Sri Lanka - Phase 2 Security Enhancement
"""
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
import os
from typing import Optional, Dict, Any

class SecurityManager:
    """Advanced security management for SmartSecure Sri Lanka"""
    
    def __init__(self, secret_key: str, expiration_hours: int = 24):
        self.secret_key = secret_key
        self.expiration_hours = expiration_hours
        self.algorithm = 'HS256'
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt with salt"""
        salt_rounds = int(os.getenv('BCRYPT_ROUNDS', 12))
        salt = bcrypt.gensalt(rounds=salt_rounds)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def generate_jwt_token(self, user_id: int, username: str, additional_claims: Optional[Dict] = None) -> str:
        """Generate JWT token with user information"""
        payload = {
            'user_id': user_id,
            'username': username,
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + timedelta(hours=self.expiration_hours),
            'iss': 'SmartSecure-SriLanka',  # Issuer
            'aud': 'SmartSecure-Users',     # Audience
        }
        
        if additional_claims:
            payload.update(additional_claims)
            
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                audience='SmartSecure-Users',
                issuer='SmartSecure-SriLanka'
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_token(self, token: str) -> Optional[str]:
        """Refresh JWT token if valid"""
        payload = self.verify_jwt_token(token)
        if payload:
            # Remove old timestamps
            payload.pop('iat', None)
            payload.pop('exp', None)
            return self.generate_jwt_token(
                payload['user_id'], 
                payload['username'],
                {k: v for k, v in payload.items() if k not in ['user_id', 'username', 'iat', 'exp', 'iss', 'aud']}
            )
        return None

def token_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        # Check for token in request body (fallback)
        if not token:
            data = request.get_json(silent=True) or {}
            token = data.get('token')
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        try:
            security_manager = SecurityManager(current_app.config['JWT_SECRET_KEY'])
            payload = security_manager.verify_jwt_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Token is invalid or expired'}), 401
            
            # Add user info to request context
            request.user_id = payload['user_id']
            request.username = payload['username']
            
        except Exception as e:
            return jsonify({'success': False, 'error': f'Token verification failed: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def generate_secure_session(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate secure session data with token"""
    security_manager = SecurityManager(current_app.config['JWT_SECRET_KEY'])
    
    token = security_manager.generate_jwt_token(
        user_data['id'], 
        user_data['username'],
        {
            'email': user_data.get('email', ''),
            'created_date': user_data.get('created_date', ''),
            'session_type': 'web'
        }
    )
    
    return {
        'success': True,
        'user': {
            'id': user_data['id'],
            'username': user_data['username'],
            'email': user_data.get('email', '')
        },
        'token': token,
        'expires_in': int(os.getenv('JWT_EXPIRATION_HOURS', 24)) * 3600,  # seconds
        'token_type': 'Bearer'
    }

class SecurityAudit:
    """Security audit and monitoring"""
    
    @staticmethod
    def log_security_event(db_path, user_id: Optional[int], event_type: str, 
                          description: str, ip_address: str = None, 
                          user_agent: str = None, severity: str = 'INFO'):
        """Log security-related events for audit trail"""
        from activity_logger import log_activity
        
        audit_data = {
            'event_type': event_type,
            'description': description,
            'severity': severity,
            'ip_address': ip_address or request.environ.get('REMOTE_ADDR', 'unknown'),
            'user_agent': user_agent or request.environ.get('HTTP_USER_AGENT', 'unknown'),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        log_activity(
            db_path, 
            user_id, 
            f'SECURITY_{event_type}', 
            f"[{severity}] {description} | IP: {audit_data['ip_address']}"
        )
    
    @staticmethod
    def check_suspicious_activity(db_path, user_id: int = None, ip_address: str = None) -> Dict[str, Any]:
        """Basic suspicious activity detection"""
        import sqlite3
        
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        suspicious_indicators = []
        
        # Check for multiple failed logins
        if user_id:
            cur.execute('''
                SELECT COUNT(*) FROM activity_logs 
                WHERE user_id = ? AND activity_type = 'SECURITY_LOGIN_FAILED' 
                AND timestamp > datetime('now', '-1 hour')
            ''', (user_id,))
            failed_logins = cur.fetchone()[0]
            if failed_logins >= 5:
                suspicious_indicators.append(f"Multiple failed login attempts: {failed_logins}")
        
        # Check for rapid file uploads
        if user_id:
            cur.execute('''
                SELECT COUNT(*) FROM activity_logs 
                WHERE user_id = ? AND activity_type = 'FILE_UPLOAD' 
                AND timestamp > datetime('now', '-10 minutes')
            ''', (user_id,))
            rapid_uploads = cur.fetchone()[0]
            if rapid_uploads >= 10:
                suspicious_indicators.append(f"Rapid file uploads detected: {rapid_uploads}")
        
        conn.close()
        
        return {
            'suspicious': len(suspicious_indicators) > 0,
            'indicators': suspicious_indicators,
            'risk_level': 'HIGH' if len(suspicious_indicators) >= 2 else 'MEDIUM' if len(suspicious_indicators) == 1 else 'LOW'
        }