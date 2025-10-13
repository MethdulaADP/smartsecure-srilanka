"""
Advanced Analytics and Reporting System
Business Intelligence for SmartSecure Sri Lanka
"""

import sqlite3
import json
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import math

class AdvancedAnalytics:
    """Advanced analytics and business intelligence"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def get_user_analytics(self, days=30):
        """Get comprehensive user analytics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # User registration trends
            cursor.execute('''
                SELECT DATE(created_date) as date, COUNT(*) as count
                FROM users 
                WHERE created_date > datetime('now', '-{} days')
                GROUP BY DATE(created_date)
                ORDER BY date
            '''.format(days))
            
            registration_trend = [{'date': row[0], 'count': row[1]} for row in cursor.fetchall()]
            
            # Active users by day
            cursor.execute('''
                SELECT DATE(timestamp) as date, COUNT(DISTINCT user_id) as active_users
                FROM activity_logs 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY DATE(timestamp)
                ORDER BY date
            '''.format(days))
            
            activity_trend = [{'date': row[0], 'active_users': row[1]} for row in cursor.fetchall()]
            
            # User engagement metrics
            cursor.execute('''
                SELECT user_id, COUNT(*) as activity_count
                FROM activity_logs 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY user_id
            '''.format(days))
            
            engagement_data = cursor.fetchall()
            avg_engagement = sum(row[1] for row in engagement_data) / len(engagement_data) if engagement_data else 0
            
            # Top activities
            cursor.execute('''
                SELECT activity_type, COUNT(*) as count
                FROM activity_logs 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY activity_type
                ORDER BY count DESC
                LIMIT 10
            '''.format(days))
            
            top_activities = [{'activity': row[0], 'count': row[1]} for row in cursor.fetchall()]
            
            conn.close()
            
            return {
                'registration_trend': registration_trend,
                'activity_trend': activity_trend,
                'avg_engagement': round(avg_engagement, 2),
                'top_activities': top_activities,
                'total_active_users': len(engagement_data)
            }
            
        except Exception as e:
            print(f"❌ User analytics error: {e}")
            return {}
    
    def get_security_analytics(self, days=30):
        """Get security-focused analytics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Threat detection trends
            cursor.execute('''
                SELECT DATE(upload_date) as date, 
                       AVG(threat_score) as avg_threat,
                       COUNT(*) as total_files,
                       SUM(CASE WHEN threat_score > 0.5 THEN 1 ELSE 0 END) as high_threat_files
                FROM files 
                WHERE upload_date > datetime('now', '-{} days')
                GROUP BY DATE(upload_date)
                ORDER BY date
            '''.format(days))
            
            threat_trends = []
            for row in cursor.fetchall():
                threat_trends.append({
                    'date': row[0],
                    'avg_threat': round(row[1] or 0, 3),
                    'total_files': row[2],
                    'high_threat_files': row[3]
                })
            
            # Security events by severity
            cursor.execute('''
                SELECT threat_level, COUNT(*) as count
                FROM security_events 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY threat_level
            '''.format(days))
            
            security_events_by_level = {row[0]: row[1] for row in cursor.fetchall()}
            
            # File categories analysis
            cursor.execute('''
                SELECT file_category, COUNT(*) as count, AVG(threat_score) as avg_threat
                FROM files 
                WHERE upload_date > datetime('now', '-{} days')
                GROUP BY file_category
                ORDER BY count DESC
            '''.format(days))
            
            file_categories = []
            for row in cursor.fetchall():
                file_categories.append({
                    'category': row[0],
                    'count': row[1],
                    'avg_threat': round(row[2] or 0, 3)
                })
            
            # Failed login attempts analysis
            cursor.execute('''
                SELECT DATE(timestamp) as date, COUNT(*) as failed_attempts
                FROM activity_logs 
                WHERE activity_type = 'SECURITY_LOGIN_FAILED'
                AND timestamp > datetime('now', '-{} days')
                GROUP BY DATE(timestamp)
                ORDER BY date
            '''.format(days))
            
            failed_login_trend = [{'date': row[0], 'failed_attempts': row[1]} for row in cursor.fetchall()]
            
            conn.close()
            
            return {
                'threat_trends': threat_trends,
                'security_events_by_level': security_events_by_level,
                'file_categories': file_categories,
                'failed_login_trend': failed_login_trend
            }
            
        except Exception as e:
            print(f"❌ Security analytics error: {e}")
            return {}
    
    def get_performance_analytics(self, days=7):
        """Get system performance analytics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if system_metrics table exists and has data
            cursor.execute('''
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='system_metrics'
            ''')
            
            if not cursor.fetchone():
                conn.close()
                return self._get_mock_performance_data()
            
            # CPU usage trends
            cursor.execute('''
                SELECT DATE(timestamp) as date, AVG(metric_value) as avg_cpu
                FROM system_metrics 
                WHERE metric_type = 'cpu_usage'
                AND timestamp > datetime('now', '-{} days')
                GROUP BY DATE(timestamp)
                ORDER BY date
            '''.format(days))
            
            cpu_trends = [{'date': row[0], 'avg_cpu': round(row[1], 2)} for row in cursor.fetchall()]
            
            # Memory usage trends
            cursor.execute('''
                SELECT DATE(timestamp) as date, AVG(metric_value) as avg_memory
                FROM system_metrics 
                WHERE metric_type = 'memory_usage'
                AND timestamp > datetime('now', '-{} days')
                GROUP BY DATE(timestamp)
                ORDER BY date
            '''.format(days))
            
            memory_trends = [{'date': row[0], 'avg_memory': round(row[1], 2)} for row in cursor.fetchall()]
            
            conn.close()
            
            if not cpu_trends and not memory_trends:
                return self._get_mock_performance_data()
            
            return {
                'cpu_trends': cpu_trends,
                'memory_trends': memory_trends,
                'status': 'live_data'
            }
            
        except Exception as e:
            print(f"❌ Performance analytics error: {e}")
            return self._get_mock_performance_data()
    
    def _get_mock_performance_data(self):
        """Generate mock performance data for demonstration"""
        import random
        
        cpu_trends = []
        memory_trends = []
        
        for i in range(7):
            date = (datetime.now() - timedelta(days=6-i)).strftime('%Y-%m-%d')
            cpu_trends.append({
                'date': date,
                'avg_cpu': round(random.uniform(20, 80), 2)
            })
            memory_trends.append({
                'date': date,
                'avg_memory': round(random.uniform(30, 70), 2)
            })
        
        return {
            'cpu_trends': cpu_trends,
            'memory_trends': memory_trends,
            'status': 'demo_data'
        }
    
    def get_business_insights(self, days=30):
        """Get business intelligence insights"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Storage usage patterns
            cursor.execute('''
                SELECT DATE(upload_date) as date, 
                       SUM(file_size) as total_size,
                       COUNT(*) as file_count
                FROM files 
                WHERE upload_date > datetime('now', '-{} days')
                GROUP BY DATE(upload_date)
                ORDER BY date
            '''.format(days))
            
            storage_trends = []
            for row in cursor.fetchall():
                storage_trends.append({
                    'date': row[0],
                    'total_size_mb': round(row[1] / (1024*1024), 2),
                    'file_count': row[2]
                })
            
            # Peak usage hours
            cursor.execute('''
                SELECT strftime('%H', timestamp) as hour, COUNT(*) as activity_count
                FROM activity_logs 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY strftime('%H', timestamp)
                ORDER BY hour
            '''.format(days))
            
            hourly_activity = [{'hour': int(row[0]), 'activity': row[1]} for row in cursor.fetchall()]
            
            # User retention metrics
            cursor.execute('''
                SELECT COUNT(DISTINCT user_id) as total_users
                FROM activity_logs 
                WHERE timestamp > datetime('now', '-{} days')
            '''.format(days))
            
            active_users = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
            total_users = cursor.fetchone()[0]
            
            retention_rate = (active_users / total_users * 100) if total_users > 0 else 0
            
            conn.close()
            
            return {
                'storage_trends': storage_trends,
                'hourly_activity': hourly_activity,
                'retention_rate': round(retention_rate, 2),
                'active_users': active_users,
                'total_users': total_users
            }
            
        except Exception as e:
            print(f"❌ Business insights error: {e}")
            return {}
    
    def generate_executive_report(self, days=30):
        """Generate executive summary report"""
        try:
            user_analytics = self.get_user_analytics(days)
            security_analytics = self.get_security_analytics(days)
            performance_analytics = self.get_performance_analytics(7)
            business_insights = self.get_business_insights(days)
            
            # Calculate key metrics
            total_files = sum(trend.get('total_files', 0) for trend in security_analytics.get('threat_trends', []))
            avg_threat_score = sum(trend.get('avg_threat', 0) for trend in security_analytics.get('threat_trends', [])) / len(security_analytics.get('threat_trends', [1]))
            
            security_events = sum(security_analytics.get('security_events_by_level', {}).values())
            
            # Risk assessment
            if avg_threat_score > 0.7 or security_events > 50:
                risk_level = 'HIGH'
            elif avg_threat_score > 0.4 or security_events > 20:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'
            
            return {
                'report_date': datetime.now(timezone.utc).isoformat(),
                'period_days': days,
                'executive_summary': {
                    'total_users': business_insights.get('total_users', 0),
                    'active_users': business_insights.get('active_users', 0),
                    'retention_rate': business_insights.get('retention_rate', 0),
                    'total_files_processed': total_files,
                    'avg_threat_score': round(avg_threat_score, 3),
                    'security_events': security_events,
                    'risk_level': risk_level
                },
                'detailed_analytics': {
                    'user_metrics': user_analytics,
                    'security_metrics': security_analytics,
                    'performance_metrics': performance_analytics,
                    'business_metrics': business_insights
                },
                'recommendations': self._generate_executive_recommendations(avg_threat_score, security_events, business_insights)
            }
            
        except Exception as e:
            print(f"❌ Executive report error: {e}")
            return {}
    
    def _generate_executive_recommendations(self, avg_threat, security_events, business_data):
        """Generate executive recommendations"""
        recommendations = []
        
        if avg_threat > 0.5:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Security',
                'recommendation': 'Implement stricter file upload policies and enhance threat detection'
            })
        
        if security_events > 30:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Security',
                'recommendation': 'Review security event responses and consider additional monitoring'
            })
        
        if business_data.get('retention_rate', 0) < 60:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Business',
                'recommendation': 'Improve user engagement and retention strategies'
            })
        
        if not recommendations:
            recommendations.append({
                'priority': 'LOW',
                'category': 'Operations',
                'recommendation': 'System performance is good - continue current practices'
            })
        
        return recommendations

# Initialize analytics
def create_analytics_engine(db_path):
    """Create analytics engine instance"""
    return AdvancedAnalytics(db_path)