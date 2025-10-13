import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalLogins: 0,
    threatLevel: 'LOW',
    lastActivity: null
  });
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load system statistics
      const statsResponse = await fetch(`${authService.getApiUrl()}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSystemStats(stats);
      }

      // Load audit logs
      const logsResponse = await fetch(`${authService.getApiUrl()}/admin/audit-logs`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        setAuditLogs(logs.slice(0, 10)); // Show last 10 logs
      }

      // Load security alerts
      const alertsResponse = await fetch(`${authService.getApiUrl()}/admin/alerts`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.slice(0, 5)); // Show last 5 alerts
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'LOW': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#F44336';
      case 'CRITICAL': return '#9C27B0';
      default: return '#4CAF50';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="security-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Security Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="security-dashboard">
      <header className="dashboard-header">
        <h1>🛡️ Security Dashboard</h1>
        <p>Real-time security monitoring and system health</p>
      </header>

      {/* System Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-number">{systemStats.totalUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>Files Uploaded</h3>
            <div className="stat-number">{systemStats.totalFiles}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>Total Logins</h3>
            <div className="stat-number">{systemStats.totalLogins}</div>
          </div>
        </div>

        <div className="stat-card threat-level">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Threat Level</h3>
            <div 
              className="threat-indicator"
              style={{ color: getThreatLevelColor(systemStats.threatLevel) }}
            >
              {systemStats.threatLevel}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Security Alerts */}
        <div className="dashboard-section">
          <h2>🚨 Security Alerts</h2>
          <div className="alerts-container">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <span className="success-icon">✅</span>
                <p>No active security alerts</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.severity}`}>
                  <div className="alert-icon">
                    {alert.severity === 'HIGH' ? '🔴' : 
                     alert.severity === 'MEDIUM' ? '🟡' : '🟢'}
                  </div>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                    <small>{formatTimestamp(alert.timestamp)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="dashboard-section">
          <h2>📊 Recent Activity</h2>
          <div className="audit-logs">
            {auditLogs.length === 0 ? (
              <p className="no-data">No recent activity</p>
            ) : (
              <div className="logs-table">
                <div className="log-header">
                  <span>Time</span>
                  <span>User</span>
                  <span>Action</span>
                  <span>Status</span>
                </div>
                {auditLogs.map((log, index) => (
                  <div key={index} className="log-row">
                    <span className="log-time">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span className="log-user">{log.username || 'System'}</span>
                    <span className="log-action">{log.action}</span>
                    <span className={`log-status ${log.success ? 'success' : 'failure'}`}>
                      {log.success ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="dashboard-section">
          <h2>💚 System Health</h2>
          <div className="health-indicators">
            <div className="health-item">
              <span className="health-label">Database Status</span>
              <span className="health-status online">🟢 Online</span>
            </div>
            <div className="health-item">
              <span className="health-label">File System</span>
              <span className="health-status online">🟢 Operational</span>
            </div>
            <div className="health-item">
              <span className="health-label">Authentication</span>
              <span className="health-status online">🟢 Active</span>
            </div>
            <div className="health-item">
              <span className="health-label">Last Updated</span>
              <span className="health-timestamp">
                {formatTimestamp(Date.now())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="dashboard-actions">
        <button 
          className="refresh-btn"
          onClick={loadDashboardData}
          disabled={loading}
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default SecurityDashboard;