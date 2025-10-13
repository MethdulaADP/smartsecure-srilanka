import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './AdvancedDashboard.css';

const AdvancedDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalLogins: 0,
    threatLevel: 'LOW',
    lastActivity: null,
    activeUsers: 0,
    storageUsed: 0,
    uptime: '99.9%',
    systemHealth: 'Excellent'
  });
  
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 23,
    networkActivity: 156,
    activeConnections: 12
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [fileActivity, setFileActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 10 seconds for real-time feel
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load system statistics
      const statsResponse = await fetch(`${authService.getApiUrl()}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSystemStats(prev => ({ ...prev, ...stats }));
      }

      // Load audit logs
      const logsResponse = await fetch(`${authService.getApiUrl()}/admin/audit-logs?limit=15`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        setAuditLogs(logs);
      }

      // Load security alerts
      const alertsResponse = await fetch(`${authService.getApiUrl()}/admin/security-alerts`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setSecurityAlerts(alerts);
      }

      // Simulate real-time metrics (in real app, this would come from server)
      setRealtimeMetrics(prev => ({
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.max(10, Math.min(95, prev.diskUsage + (Math.random() - 0.5) * 2)),
        networkActivity: Math.max(50, Math.min(500, prev.networkActivity + (Math.random() - 0.5) * 50)),
        activeConnections: Math.max(5, Math.min(50, prev.activeConnections + Math.floor((Math.random() - 0.5) * 5)))
      }));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return '#ff4757';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#26de81';
      default: return '#26de81';
    }
  };

  const getSystemHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent': return '#26de81';
      case 'good': return '#2ed573';
      case 'warning': return '#ffa502';
      case 'critical': return '#ff4757';
      default: return '#26de81';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LOGIN': return '🔐';
      case 'REGISTER': return '👤';
      case 'FILE_UPLOAD': return '📁';
      case 'SECURITY_ALERT': return '🚨';
      case 'SYSTEM': return '⚙️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Advanced Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🛡️ SmartSecure Sri Lanka - Advanced Security Dashboard</h1>
          <div className="dashboard-controls">
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="time-range-selector"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button onClick={loadDashboardData} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{systemStats.totalUsers}</div>
            <div className="metric-change">+{systemStats.activeUsers} active</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">📁</div>
          <div className="metric-content">
            <h3>Total Files</h3>
            <div className="metric-value">{systemStats.totalFiles}</div>
            <div className="metric-change">{formatBytes(systemStats.storageUsed || 0)}</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">🚨</div>
          <div className="metric-content">
            <h3>Security Alerts</h3>
            <div className="metric-value">{securityAlerts.length}</div>
            <div className="metric-change">Threat: {systemStats.threatLevel}</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>System Health</h3>
            <div className="metric-value" style={{ color: getSystemHealthColor(systemStats.systemHealth) }}>
              {systemStats.systemHealth}
            </div>
            <div className="metric-change">Uptime: {systemStats.uptime}</div>
          </div>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="realtime-section">
        <h2>🔴 Real-time System Metrics</h2>
        <div className="realtime-grid">
          <div className="realtime-card">
            <h4>CPU Usage</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${realtimeMetrics.cpuUsage}%`,
                  backgroundColor: realtimeMetrics.cpuUsage > 80 ? '#ff4757' : realtimeMetrics.cpuUsage > 60 ? '#ffa502' : '#26de81'
                }}
              ></div>
            </div>
            <span className="metric-percentage">{realtimeMetrics.cpuUsage.toFixed(1)}%</span>
          </div>

          <div className="realtime-card">
            <h4>Memory Usage</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${realtimeMetrics.memoryUsage}%`,
                  backgroundColor: realtimeMetrics.memoryUsage > 80 ? '#ff4757' : realtimeMetrics.memoryUsage > 60 ? '#ffa502' : '#26de81'
                }}
              ></div>
            </div>
            <span className="metric-percentage">{realtimeMetrics.memoryUsage.toFixed(1)}%</span>
          </div>

          <div className="realtime-card">
            <h4>Disk Usage</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${realtimeMetrics.diskUsage}%`,
                  backgroundColor: realtimeMetrics.diskUsage > 80 ? '#ff4757' : realtimeMetrics.diskUsage > 60 ? '#ffa502' : '#26de81'
                }}
              ></div>
            </div>
            <span className="metric-percentage">{realtimeMetrics.diskUsage.toFixed(1)}%</span>
          </div>

          <div className="realtime-card">
            <h4>Network Activity</h4>
            <div className="network-stats">
              <div className="network-value">{realtimeMetrics.networkActivity.toFixed(0)} MB/s</div>
              <div className="network-connections">{realtimeMetrics.activeConnections} active connections</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Security Alerts */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3>🔔 Security Alerts</h3>
            <span className="alert-count">{securityAlerts.length}</span>
          </div>
          <div className="card-content">
            {securityAlerts.length === 0 ? (
              <div className="no-alerts">
                <div className="no-alerts-icon">✅</div>
                <p>No security alerts. System is secure!</p>
              </div>
            ) : (
              <div className="alerts-list">
                {securityAlerts.map((alert, index) => (
                  <div key={index} className={`alert-item ${alert.severity?.toLowerCase()}`}>
                    <div className="alert-icon">
                      {alert.severity === 'HIGH' ? '🚨' : alert.severity === 'MEDIUM' ? '⚠️' : 'ℹ️'}
                    </div>
                    <div className="alert-content">
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-time">{alert.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="dashboard-card logs-card">
          <div className="card-header">
            <h3>📊 Recent Activity</h3>
            <span className="log-count">{auditLogs.length} events</span>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {auditLogs.map((log, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(log.activity_type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">{log.description}</div>
                    <div className="activity-meta">
                      <span className="activity-type">{log.activity_type}</span>
                      <span className="activity-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Level Status */}
        <div className="dashboard-card threat-card">
          <div className="card-header">
            <h3>🛡️ Threat Assessment</h3>
          </div>
          <div className="card-content">
            <div className="threat-level">
              <div 
                className="threat-indicator"
                style={{ backgroundColor: getThreatLevelColor(systemStats.threatLevel) }}
              >
                {systemStats.threatLevel}
              </div>
              <div className="threat-description">
                {systemStats.threatLevel === 'LOW' && 'System is secure. No immediate threats detected.'}
                {systemStats.threatLevel === 'MEDIUM' && 'Moderate security activity. Monitor closely.'}
                {systemStats.threatLevel === 'HIGH' && 'High security risk detected. Take immediate action.'}
              </div>
            </div>
            
            <div className="security-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>End-to-end Encryption</span>
                <span className="feature-status active">Active</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Real-time Monitoring</span>
                <span className="feature-status active">Active</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>AI Threat Detection</span>
                <span className="feature-status active">Active</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📝</span>
                <span>Audit Logging</span>
                <span className="feature-status active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary" onClick={() => window.location.href = '/files'}>
            📁 File Manager
          </button>
          <button className="action-btn secondary" onClick={() => window.location.href = '/users'}>
            👥 User Management
          </button>
          <button className="action-btn warning" onClick={loadDashboardData}>
            🔄 Refresh Data
          </button>
          <button className="action-btn success" onClick={() => window.location.href = '/settings'}>
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;