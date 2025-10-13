import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './AIThreatDetection.css';

const AIThreatDetection = () => {
  const [threats, setThreats] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    aiStatus: 'ONLINE',
    lastScan: null,
    threatScore: 0,
    protectionLevel: 'HIGH'
  });

  useEffect(() => {
    loadThreatData();
    // Auto-scan every 5 minutes
    const interval = setInterval(runAIScan, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadThreatData = async () => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/ai/threats`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || []);
        setSystemHealth(data.systemHealth || systemHealth);
      }
    } catch (error) {
      console.error('Failed to load threat data:', error);
    }
  };

  const runAIScan = async () => {
    setScanning(true);
    try {
      const response = await fetch(`${authService.getApiUrl()}/ai/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const results = await response.json();
        setScanResults(results);
        await loadThreatData(); // Refresh threat data
      }
    } catch (error) {
      console.error('AI scan failed:', error);
      setScanResults({
        success: false,
        message: 'Scan failed due to network error'
      });
    } finally {
      setScanning(false);
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getProtectionIcon = (level) => {
    switch (level) {
      case 'HIGH': return '🛡️';
      case 'MEDIUM': return '⚠️';
      case 'LOW': return '🔍';
      default: return '🤖';
    }
  };

  return (
    <div className="ai-threat-detection">
      <div className="threat-header">
        <h1>🤖 AI Threat Detection</h1>
        <p>Advanced machine learning security monitoring</p>
      </div>

      {/* AI System Status */}
      <div className="ai-status-grid">
        <div className="status-card">
          <div className="status-icon">🤖</div>
          <div className="status-content">
            <h3>AI Engine</h3>
            <div className={`status-indicator ${systemHealth.aiStatus.toLowerCase()}`}>
              {systemHealth.aiStatus}
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-icon">🎯</div>
          <div className="status-content">
            <h3>Threat Score</h3>
            <div className="score-display">
              {systemHealth.threatScore}/100
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-icon">{getProtectionIcon(systemHealth.protectionLevel)}</div>
          <div className="status-content">
            <h3>Protection Level</h3>
            <div className="protection-level">
              {systemHealth.protectionLevel}
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-icon">⏰</div>
          <div className="status-content">
            <h3>Last Scan</h3>
            <div className="last-scan">
              {systemHealth.lastScan ? 
                new Date(systemHealth.lastScan).toLocaleTimeString() : 
                'Never'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="scan-controls">
        <button 
          className={`scan-btn ${scanning ? 'scanning' : ''}`}
          onClick={runAIScan}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <span className="spinner"></span>
              🔍 AI Scanning...
            </>
          ) : (
            '🚀 Run AI Security Scan'
          )}
        </button>

        {scanResults && (
          <div className={`scan-results ${scanResults.success ? 'success' : 'error'}`}>
            <h4>
              {scanResults.success ? '✅ Scan Complete' : '❌ Scan Failed'}
            </h4>
            <p>{scanResults.message}</p>
            {scanResults.threatsFound && (
              <p>🎯 Threats detected: {scanResults.threatsFound}</p>
            )}
          </div>
        )}
      </div>

      {/* Threat Detection Results */}
      <div className="threats-section">
        <h2>🎯 Active Threats</h2>
        
        {threats.length === 0 ? (
          <div className="no-threats">
            <div className="safe-icon">🛡️</div>
            <h3>System Secure</h3>
            <p>No active threats detected by AI monitoring</p>
          </div>
        ) : (
          <div className="threats-grid">
            {threats.map((threat, index) => (
              <div key={index} className="threat-card">
                <div className="threat-header">
                  <span 
                    className="threat-level"
                    style={{ color: getThreatColor(threat.level) }}
                  >
                    {threat.level}
                  </span>
                  <span className="threat-time">
                    {new Date(threat.detected).toLocaleString()}
                  </span>
                </div>
                
                <h4 className="threat-title">{threat.title}</h4>
                <p className="threat-description">{threat.description}</p>
                
                <div className="threat-details">
                  <span className="threat-source">📍 {threat.source}</span>
                  <span className="threat-confidence">
                    🎯 Confidence: {threat.confidence}%
                  </span>
                </div>

                <div className="threat-actions">
                  <button className="action-btn quarantine">
                    🔒 Quarantine
                  </button>
                  <button className="action-btn investigate">
                    🔍 Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Learning Panel */}
      <div className="ai-learning-section">
        <h2>🧠 AI Learning Center</h2>
        
        <div className="learning-stats">
          <div className="learning-item">
            <span className="learning-label">Pattern Recognition</span>
            <div className="learning-bar">
              <div className="learning-progress" style={{width: '87%'}}></div>
            </div>
            <span className="learning-value">87%</span>
          </div>

          <div className="learning-item">
            <span className="learning-label">Behavioral Analysis</span>
            <div className="learning-bar">
              <div className="learning-progress" style={{width: '92%'}}></div>
            </div>
            <span className="learning-value">92%</span>
          </div>

          <div className="learning-item">
            <span className="learning-label">Anomaly Detection</span>
            <div className="learning-bar">
              <div className="learning-progress" style={{width: '95%'}}></div>
            </div>
            <span className="learning-value">95%</span>
          </div>

          <div className="learning-item">
            <span className="learning-label">Predictive Modeling</span>
            <div className="learning-bar">
              <div className="learning-progress" style={{width: '78%'}}></div>
            </div>
            <span className="learning-value">78%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThreatDetection;