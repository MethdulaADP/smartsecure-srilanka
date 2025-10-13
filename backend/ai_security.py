"""
AI Threat Detection System for SmartSecure Sri Lanka
Phase 3 - Machine Learning Security Analysis
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import hashlib
import mimetypes
import re
import json
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
import os

class ThreatDetectionEngine:
    """Advanced AI-powered threat detection system"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.file_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.text_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Known malicious patterns
        self.malicious_patterns = [
            rb'<script[^>]*>.*?</script>',
            rb'javascript:',
            rb'vbscript:',
            rb'onload\s*=',
            rb'onerror\s*=',
            rb'eval\s*\(',
            rb'document\.write',
            rb'ActiveXObject',
            rb'Shell\.Application',
            rb'WScript\.Shell',
        ]
        
        # Suspicious file extensions
        self.high_risk_extensions = {
            '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.vbe', 
            '.js', '.jar', '.app', '.deb', '.pkg', '.dmg', '.iso'
        }
        
        # Safe file categories
        self.safe_categories = {
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'document': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
            'spreadsheet': ['.xls', '.xlsx', '.csv', '.ods'],
            'presentation': ['.ppt', '.pptx', '.odp'],
            'archive': ['.zip', '.rar', '.7z', '.tar', '.gz']
        }
    
    def calculate_file_hash(self, file_data: bytes) -> str:
        """Calculate SHA-256 hash of file"""
        return hashlib.sha256(file_data).hexdigest()
    
    def extract_file_features(self, filename: str, file_data: bytes, file_size: int) -> Dict:
        """Extract comprehensive features for AI analysis"""
        features = {}
        
        # Basic file metadata
        file_ext = os.path.splitext(filename.lower())[1]
        features['file_size'] = file_size
        features['file_extension'] = file_ext
        features['filename_length'] = len(filename)
        
        # MIME type detection
        mime_type, _ = mimetypes.guess_type(filename)
        features['mime_type'] = mime_type or 'unknown'
        
        # File hash
        features['file_hash'] = self.calculate_file_hash(file_data)
        
        # Entropy analysis (randomness indicator)
        features['entropy'] = self._calculate_entropy(file_data[:1024])  # First 1KB
        
        # String analysis
        text_content = self._extract_strings(file_data)
        features['text_ratio'] = len(text_content) / file_size if file_size > 0 else 0
        features['contains_urls'] = len(re.findall(rb'https?://\S+', file_data))
        features['contains_emails'] = len(re.findall(rb'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', file_data))
        
        # Malicious pattern detection
        features['malicious_patterns'] = sum(1 for pattern in self.malicious_patterns if re.search(pattern, file_data, re.IGNORECASE))
        
        # File structure analysis
        features['null_byte_ratio'] = file_data.count(b'\x00') / file_size if file_size > 0 else 0
        features['high_ascii_ratio'] = sum(1 for b in file_data[:1000] if b > 127) / min(1000, file_size) if file_size > 0 else 0
        
        return features
    
    def _calculate_entropy(self, data: bytes) -> float:
        """Calculate Shannon entropy of data"""
        if len(data) == 0:
            return 0.0
        
        # Count byte frequencies
        counts = np.bincount(data, minlength=256)
        probabilities = counts / len(data)
        
        # Calculate entropy
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        return entropy / 8.0  # Normalize to 0-1
    
    def _extract_strings(self, data: bytes, min_length: int = 4) -> bytes:
        """Extract printable strings from binary data"""
        strings = re.findall(rb'[!-~]{%d,}' % min_length, data)
        return b''.join(strings)
    
    def classify_file_category(self, filename: str, mime_type: str) -> str:
        """Classify file into security-relevant categories"""
        file_ext = os.path.splitext(filename.lower())[1]
        
        for category, extensions in self.safe_categories.items():
            if file_ext in extensions:
                return category
        
        if file_ext in self.high_risk_extensions:
            return 'executable'
        
        if mime_type:
            if mime_type.startswith('text/'):
                return 'text'
            elif mime_type.startswith('application/'):
                return 'application'
        
        return 'unknown'
    
    def analyze_file_threat(self, filename: str, file_data: bytes) -> Dict:
        """Comprehensive threat analysis of a file"""
        file_size = len(file_data)
        
        # Extract features
        features = self.extract_file_features(filename, file_data, file_size)
        
        # Calculate threat score
        threat_score = 0.0
        risk_factors = []
        
        # File extension risk
        file_ext = features['file_extension']
        if file_ext in self.high_risk_extensions:
            threat_score += 0.4
            risk_factors.append(f"High-risk file extension: {file_ext}")
        
        # Size anomalies
        if file_size < 10:  # Suspiciously small files
            threat_score += 0.2
            risk_factors.append("Suspiciously small file size")
        elif file_size > 100 * 1024 * 1024:  # Very large files
            threat_score += 0.1
            risk_factors.append("Unusually large file size")
        
        # Entropy analysis
        if features['entropy'] > 0.95:  # Very high entropy suggests encryption/compression
            threat_score += 0.2
            risk_factors.append("High entropy (possibly encrypted/packed)")
        
        # Malicious patterns
        pattern_count = features['malicious_patterns']
        if pattern_count > 0:
            threat_score += min(0.5, pattern_count * 0.1)
            risk_factors.append(f"Contains {pattern_count} suspicious patterns")
        
        # MIME type mismatch
        expected_mime = mimetypes.guess_type(filename)[0]
        if expected_mime and features['mime_type'] != expected_mime:
            threat_score += 0.1
            risk_factors.append("MIME type mismatch")
        
        # Null byte injection
        if features['null_byte_ratio'] > 0.1:
            threat_score += 0.3
            risk_factors.append("High null byte ratio")
        
        # Categorize file
        file_category = self.classify_file_category(filename, features['mime_type'])
        
        # Determine safety status
        is_safe = threat_score < 0.3
        scan_status = 'completed'
        
        return {
            'threat_score': min(1.0, threat_score),
            'is_safe': is_safe,
            'risk_factors': risk_factors,
            'file_category': file_category,
            'scan_status': scan_status,
            'features': features,
            'analysis_timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def detect_anomalous_behavior(self, user_activities: List[Dict]) -> Dict:
        """Detect anomalous user behavior patterns"""
        if len(user_activities) < 10:  # Need sufficient data
            return {
                'is_anomalous': False,
                'anomaly_score': 0.0,
                'indicators': [],
                'confidence': 0.0
            }
        
        # Convert activities to feature vectors
        features = []
        for activity in user_activities:
            feature_vector = [
                activity.get('hour', 0),  # Time of activity
                activity.get('file_size', 0) / (1024 * 1024),  # File size in MB
                len(activity.get('filename', '')),  # Filename length
                activity.get('upload_count', 0),  # Files uploaded in session
            ]
            features.append(feature_vector)
        
        features_array = np.array(features)
        
        # Detect anomalies using Isolation Forest
        if not self.is_trained and len(features) > 50:
            self.isolation_forest.fit(features_array)
            self.is_trained = True
        
        if self.is_trained:
            anomaly_predictions = self.isolation_forest.decision_function(features_array)
            anomaly_scores = self.isolation_forest.score_samples(features_array)
            
            # Calculate overall anomaly score
            overall_anomaly_score = np.mean(anomaly_scores)
            is_anomalous = overall_anomaly_score < -0.1  # Threshold for anomaly
            
            # Identify specific anomalous indicators
            indicators = []
            if is_anomalous:
                recent_activities = user_activities[-10:]  # Last 10 activities
                
                # Check for rapid uploads
                upload_times = [datetime.fromisoformat(a.get('timestamp', datetime.now(timezone.utc).isoformat())) 
                              for a in recent_activities]
                if len(upload_times) > 1:
                    time_diffs = [(upload_times[i] - upload_times[i-1]).total_seconds() 
                                for i in range(1, len(upload_times))]
                    avg_interval = np.mean(time_diffs)
                    if avg_interval < 30:  # Less than 30 seconds between uploads
                        indicators.append("Rapid file upload pattern detected")
                
                # Check for unusual file sizes
                file_sizes = [a.get('file_size', 0) for a in recent_activities]
                if file_sizes and max(file_sizes) > 50 * 1024 * 1024:  # > 50MB
                    indicators.append("Unusually large file uploads")
                
                # Check for off-hours activity
                hours = [datetime.fromisoformat(a.get('timestamp', datetime.now(timezone.utc).isoformat())).hour 
                        for a in recent_activities]
                night_activity = sum(1 for h in hours if h < 6 or h > 22)
                if night_activity / len(hours) > 0.5:
                    indicators.append("Significant off-hours activity")
            
            return {
                'is_anomalous': is_anomalous,
                'anomaly_score': abs(overall_anomaly_score),
                'indicators': indicators,
                'confidence': min(1.0, len(features) / 100.0)  # Confidence based on data volume
            }
        
        return {
            'is_anomalous': False,
            'anomaly_score': 0.0,
            'indicators': ['Insufficient data for analysis'],
            'confidence': 0.0
        }

class SecurityAnalytics:
    """Advanced security analytics and reporting"""
    
    def __init__(self):
        self.threat_engine = ThreatDetectionEngine()
    
    def generate_security_report(self, user_data: Dict, files: List[Dict], 
                               activities: List[Dict], security_events: List[Dict]) -> Dict:
        """Generate comprehensive security analytics report"""
        
        # File security analysis
        total_files = len(files)
        safe_files = sum(1 for f in files if f.get('is_safe', True))
        threat_files = total_files - safe_files
        
        # Calculate average threat score
        threat_scores = [f.get('threat_score', 0.0) for f in files if 'threat_score' in f]
        avg_threat_score = np.mean(threat_scores) if threat_scores else 0.0
        
        # File category distribution
        categories = {}
        for file in files:
            category = file.get('file_category', 'unknown')
            categories[category] = categories.get(category, 0) + 1
        
        # Security event analysis
        event_levels = {}
        for event in security_events:
            level = event.get('threat_level', 'LOW')
            event_levels[level] = event_levels.get(level, 0) + 1
        
        # User behavior analysis
        behavior_analysis = self.threat_engine.detect_anomalous_behavior(activities)
        
        # Risk assessment
        risk_score = self._calculate_risk_score(
            avg_threat_score, 
            threat_files / max(1, total_files),
            len(security_events),
            behavior_analysis['anomaly_score']
        )
        
        return {
            'user_id': user_data.get('id'),
            'report_timestamp': datetime.now(timezone.utc).isoformat(),
            'summary': {
                'total_files': total_files,
                'safe_files': safe_files,
                'threat_files': threat_files,
                'avg_threat_score': round(avg_threat_score, 3),
                'risk_level': self._get_risk_level(risk_score),
                'risk_score': round(risk_score, 3)
            },
            'file_analysis': {
                'categories': categories,
                'threat_distribution': {
                    'safe': safe_files,
                    'suspicious': sum(1 for f in files if 0.3 <= f.get('threat_score', 0) < 0.7),
                    'dangerous': sum(1 for f in files if f.get('threat_score', 0) >= 0.7)
                }
            },
            'security_events': {
                'total_events': len(security_events),
                'by_threat_level': event_levels,
                'recent_events': security_events[-5:] if security_events else []
            },
            'behavior_analysis': behavior_analysis,
            'recommendations': self._generate_recommendations(risk_score, behavior_analysis, security_events)
        }
    
    def _calculate_risk_score(self, avg_threat: float, threat_ratio: float, 
                            event_count: int, anomaly_score: float) -> float:
        """Calculate overall user risk score"""
        # Weighted combination of risk factors
        risk_score = (
            avg_threat * 0.3 +           # Average file threat score
            threat_ratio * 0.3 +         # Ratio of threatening files
            min(event_count / 10, 1.0) * 0.2 +  # Security events (capped)
            anomaly_score * 0.2          # Behavioral anomalies
        )
        return min(1.0, risk_score)
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to categorical level"""
        if risk_score < 0.3:
            return 'LOW'
        elif risk_score < 0.6:
            return 'MEDIUM'
        elif risk_score < 0.8:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def _generate_recommendations(self, risk_score: float, behavior_analysis: Dict, 
                                security_events: List[Dict]) -> List[str]:
        """Generate security recommendations based on analysis"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.append("🚨 High risk detected - Review recent file uploads immediately")
        
        if behavior_analysis.get('is_anomalous'):
            recommendations.append("⚠️ Unusual activity patterns detected - Monitor account closely")
        
        if any(event.get('threat_level') in ['HIGH', 'CRITICAL'] for event in security_events[-10:]):
            recommendations.append("🔍 Recent high-severity security events - Investigate immediately")
        
        if not recommendations:
            if risk_score < 0.3:
                recommendations.append("✅ Security status looks good - Continue current practices")
            else:
                recommendations.append("📊 Moderate risk level - Regular monitoring recommended")
        
        return recommendations

# Initialize global instances
threat_detector = ThreatDetectionEngine()
security_analytics = SecurityAnalytics()