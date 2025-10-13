"""
Real-time System Monitoring for SmartSecure Sri Lanka
Advanced system metrics collection and monitoring
"""

import psutil
import time
import json
from datetime import datetime, timezone
import threading
import queue
import sqlite3
from pathlib import Path

class SystemMonitor:
    """Real-time system monitoring and metrics collection"""
    
    def __init__(self, db_path):
        self.db_path = db_path
        self.metrics_queue = queue.Queue()
        self.is_monitoring = False
        self.monitor_thread = None
        
    def get_system_metrics(self):
        """Get current system metrics"""
        try:
            # CPU Usage
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory Usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available
            memory_total = memory.total
            
            # Disk Usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            disk_free = disk.free
            disk_total = disk.total
            
            # Network Stats
            network = psutil.net_io_counters()
            
            # Process Stats
            process_count = len(psutil.pids())
            
            return {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'cpu': {
                    'usage_percent': round(cpu_percent, 2),
                    'count': cpu_count,
                    'frequency': cpu_freq.current if cpu_freq else 0,
                    'status': 'high' if cpu_percent > 80 else 'medium' if cpu_percent > 60 else 'normal'
                },
                'memory': {
                    'usage_percent': round(memory_percent, 2),
                    'available_gb': round(memory_available / (1024**3), 2),
                    'total_gb': round(memory_total / (1024**3), 2),
                    'used_gb': round((memory_total - memory_available) / (1024**3), 2),
                    'status': 'high' if memory_percent > 85 else 'medium' if memory_percent > 70 else 'normal'
                },
                'disk': {
                    'usage_percent': round(disk_percent, 2),
                    'free_gb': round(disk_free / (1024**3), 2),
                    'total_gb': round(disk_total / (1024**3), 2),
                    'used_gb': round((disk_total - disk_free) / (1024**3), 2),
                    'status': 'high' if disk_percent > 90 else 'medium' if disk_percent > 75 else 'normal'
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                },
                'processes': {
                    'count': process_count,
                    'status': 'high' if process_count > 200 else 'normal'
                },
                'overall_status': self._calculate_overall_status(cpu_percent, memory_percent, disk_percent)
            }
        except Exception as e:
            print(f"❌ System metrics error: {e}")
            return self._get_default_metrics()
    
    def _calculate_overall_status(self, cpu, memory, disk):
        """Calculate overall system health status"""
        if cpu > 85 or memory > 90 or disk > 95:
            return 'critical'
        elif cpu > 70 or memory > 80 or disk > 85:
            return 'warning'
        elif cpu > 50 or memory > 60 or disk > 70:
            return 'moderate'
        else:
            return 'excellent'
    
    def _get_default_metrics(self):
        """Return default metrics when monitoring fails"""
        return {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'cpu': {'usage_percent': 0, 'count': 1, 'frequency': 0, 'status': 'unknown'},
            'memory': {'usage_percent': 0, 'available_gb': 0, 'total_gb': 0, 'used_gb': 0, 'status': 'unknown'},
            'disk': {'usage_percent': 0, 'free_gb': 0, 'total_gb': 0, 'used_gb': 0, 'status': 'unknown'},
            'network': {'bytes_sent': 0, 'bytes_recv': 0, 'packets_sent': 0, 'packets_recv': 0},
            'processes': {'count': 0, 'status': 'unknown'},
            'overall_status': 'unknown'
        }
    
    def store_metrics(self, metrics):
        """Store metrics in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Store individual metrics
            timestamp = metrics['timestamp']
            
            cursor.execute('''
                INSERT INTO system_metrics (metric_type, metric_value, timestamp)
                VALUES (?, ?, ?)
            ''', ('cpu_usage', metrics['cpu']['usage_percent'], timestamp))
            
            cursor.execute('''
                INSERT INTO system_metrics (metric_type, metric_value, timestamp)
                VALUES (?, ?, ?)
            ''', ('memory_usage', metrics['memory']['usage_percent'], timestamp))
            
            cursor.execute('''
                INSERT INTO system_metrics (metric_type, metric_value, timestamp)
                VALUES (?, ?, ?)
            ''', ('disk_usage', metrics['disk']['usage_percent'], timestamp))
            
            cursor.execute('''
                INSERT INTO system_metrics (metric_type, metric_value, timestamp)
                VALUES (?, ?, ?)
            ''', ('process_count', metrics['processes']['count'], timestamp))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"❌ Metrics storage error: {e}")
    
    def get_historical_metrics(self, hours=24):
        """Get historical metrics from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT metric_type, metric_value, timestamp
                FROM system_metrics
                WHERE timestamp > datetime('now', '-{} hours')
                ORDER BY timestamp DESC
            '''.format(hours))
            
            metrics = {}
            for row in cursor.fetchall():
                metric_type, value, timestamp = row
                if metric_type not in metrics:
                    metrics[metric_type] = []
                metrics[metric_type].append({
                    'value': value,
                    'timestamp': timestamp
                })
            
            conn.close()
            return metrics
            
        except Exception as e:
            print(f"❌ Historical metrics error: {e}")
            return {}
    
    def start_monitoring(self, interval=30):
        """Start background monitoring"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        
        def monitor_loop():
            while self.is_monitoring:
                try:
                    metrics = self.get_system_metrics()
                    self.store_metrics(metrics)
                    self.metrics_queue.put(metrics)
                    time.sleep(interval)
                except Exception as e:
                    print(f"❌ Monitoring loop error: {e}")
                    time.sleep(interval)
        
        self.monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
        print("✅ System monitoring started")
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        print("🛑 System monitoring stopped")
    
    def get_latest_metrics(self):
        """Get latest metrics from queue"""
        try:
            return self.metrics_queue.get_nowait()
        except queue.Empty:
            return self.get_system_metrics()

class NetworkMonitor:
    """Network monitoring and security analysis"""
    
    def __init__(self):
        self.baseline_stats = None
        self.anomaly_threshold = 1.5  # 50% increase from baseline
    
    def get_network_stats(self):
        """Get current network statistics"""
        try:
            stats = psutil.net_io_counters()
            connections = len(psutil.net_connections())
            
            return {
                'bytes_sent': stats.bytes_sent,
                'bytes_recv': stats.bytes_recv,
                'packets_sent': stats.packets_sent,
                'packets_recv': stats.packets_recv,
                'errors_in': stats.errin,
                'errors_out': stats.errout,
                'drops_in': stats.dropin,
                'drops_out': stats.dropout,
                'connections': connections,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            print(f"❌ Network stats error: {e}")
            return {}
    
    def detect_network_anomalies(self, current_stats):
        """Detect unusual network activity"""
        if not self.baseline_stats:
            self.baseline_stats = current_stats
            return []
        
        anomalies = []
        
        # Check for unusual traffic spikes
        if current_stats.get('bytes_sent', 0) > self.baseline_stats.get('bytes_sent', 0) * self.anomaly_threshold:
            anomalies.append("Unusual outbound traffic spike detected")
        
        if current_stats.get('bytes_recv', 0) > self.baseline_stats.get('bytes_recv', 0) * self.anomaly_threshold:
            anomalies.append("Unusual inbound traffic spike detected")
        
        # Check for excessive connections
        if current_stats.get('connections', 0) > 100:
            anomalies.append(f"High number of network connections: {current_stats.get('connections', 0)}")
        
        # Check for network errors
        if current_stats.get('errors_in', 0) > 10 or current_stats.get('errors_out', 0) > 10:
            anomalies.append("Network errors detected")
        
        return anomalies

# Initialize monitoring instances
def create_system_monitor(db_path):
    """Create and configure system monitor"""
    return SystemMonitor(db_path)

def create_network_monitor():
    """Create and configure network monitor"""
    return NetworkMonitor()