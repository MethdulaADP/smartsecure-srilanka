import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './AdvancedAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5004/analytics?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Generate mock data for demonstration
        setAnalyticsData(generateMockData());
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setAnalyticsData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const dates = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      userAnalytics: {
        registrationTrend: dates.map(date => ({ date, count: Math.floor(Math.random() * 10) + 2 })),
        activityTrend: dates.map(date => ({ date, activeUsers: Math.floor(Math.random() * 50) + 10 })),
        avgEngagement: 15.6,
        topActivities: [
          { activity: 'FILE_UPLOAD', count: 156 },
          { activity: 'LOGIN', count: 89 },
          { activity: 'FILE_DOWNLOAD', count: 67 },
          { activity: 'DASHBOARD_VIEW', count: 45 }
        ]
      },
      securityAnalytics: {
        threatTrends: dates.map(date => ({
          date,
          avgThreat: Math.random() * 0.5,
          totalFiles: Math.floor(Math.random() * 20) + 5,
          highThreatFiles: Math.floor(Math.random() * 3)
        })),
        securityEventsByLevel: { LOW: 45, MEDIUM: 12, HIGH: 3, CRITICAL: 1 },
        fileCategories: [
          { category: 'document', count: 120, avgThreat: 0.12 },
          { category: 'image', count: 89, avgThreat: 0.08 },
          { category: 'archive', count: 34, avgThreat: 0.23 },
          { category: 'unknown', count: 12, avgThreat: 0.45 }
        ]
      },
      performanceAnalytics: {
        cpuTrends: dates.map(date => ({ date, avgCpu: Math.random() * 60 + 20 })),
        memoryTrends: dates.map(date => ({ date, avgMemory: Math.random() * 40 + 30 })),
        status: 'demo_data'
      },
      businessInsights: {
        storageTrends: dates.map(date => ({
          date,
          totalSizeMb: Math.random() * 1000 + 200,
          fileCount: Math.floor(Math.random() * 50) + 10
        })),
        hourlyActivity: Array.from({length: 24}, (_, hour) => ({ hour, activity: Math.floor(Math.random() * 100) })),
        retentionRate: 78.5,
        activeUsers: 124,
        totalUsers: 158
      }
    };
  };

  if (loading) {
    return (
      <div className="advanced-analytics">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="advanced-analytics">
        <div className="analytics-error">
          <h3>Analytics Unavailable</h3>
          <p>Unable to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>User Growth Trend</h3>
          <Line
            data={{
              labels: analyticsData.userAnalytics.registrationTrend.map(item => item.date),
              datasets: [
                {
                  label: 'New Registrations',
                  data: analyticsData.userAnalytics.registrationTrend.map(item => item.count),
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'User Registration Trend' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>Active Users</h3>
          <Line
            data={{
              labels: analyticsData.userAnalytics.activityTrend.map(item => item.date),
              datasets: [
                {
                  label: 'Active Users',
                  data: analyticsData.userAnalytics.activityTrend.map(item => item.activeUsers),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Daily Active Users' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>Top Activities</h3>
          <Bar
            data={{
              labels: analyticsData.userAnalytics.topActivities.map(item => item.activity),
              datasets: [
                {
                  label: 'Count',
                  data: analyticsData.userAnalytics.topActivities.map(item => item.count),
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Most Common Activities' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>Storage Usage</h3>
          <Line
            data={{
              labels: analyticsData.businessInsights.storageTrends.map(item => item.date),
              datasets: [
                {
                  label: 'Storage (MB)',
                  data: analyticsData.businessInsights.storageTrends.map(item => item.totalSizeMb),
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Daily Storage Usage' }
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="security-tab">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Threat Level Distribution</h3>
          <Doughnut
            data={{
              labels: Object.keys(analyticsData.securityAnalytics.securityEventsByLevel),
              datasets: [
                {
                  data: Object.values(analyticsData.securityAnalytics.securityEventsByLevel),
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(127, 29, 29, 0.8)'
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Security Events by Severity' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>File Categories vs Threat Score</h3>
          <Bar
            data={{
              labels: analyticsData.securityAnalytics.fileCategories.map(item => item.category),
              datasets: [
                {
                  label: 'File Count',
                  data: analyticsData.securityAnalytics.fileCategories.map(item => item.count),
                  backgroundColor: 'rgba(99, 102, 241, 0.8)',
                  yAxisID: 'y'
                },
                {
                  label: 'Avg Threat Score',
                  data: analyticsData.securityAnalytics.fileCategories.map(item => item.avgThreat * 100),
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  yAxisID: 'y1'
                }
              ]
            }}
            options={{
              responsive: true,
              scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
              },
              plugins: {
                title: { display: true, text: 'File Categories Analysis' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>Threat Trends</h3>
          <Line
            data={{
              labels: analyticsData.securityAnalytics.threatTrends.map(item => item.date),
              datasets: [
                {
                  label: 'Average Threat Score',
                  data: analyticsData.securityAnalytics.threatTrends.map(item => item.avgThreat),
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'High Threat Files',
                  data: analyticsData.securityAnalytics.threatTrends.map(item => item.highThreatFiles),
                  borderColor: 'rgb(127, 29, 29)',
                  backgroundColor: 'rgba(127, 29, 29, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Daily Threat Analysis' }
              }
            }}
          />
        </div>

        <div className="analytics-card security-metrics">
          <h3>Security Metrics Summary</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Total Security Events</span>
              <span className="metric-value">
                {Object.values(analyticsData.securityAnalytics.securityEventsByLevel).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">High Risk Files</span>
              <span className="metric-value critical">
                {analyticsData.securityAnalytics.threatTrends.reduce((sum, item) => sum + item.highThreatFiles, 0)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Threat Score</span>
              <span className="metric-value">
                {(analyticsData.securityAnalytics.threatTrends.reduce((sum, item) => sum + item.avgThreat, 0) / 
                  analyticsData.securityAnalytics.threatTrends.length).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="performance-tab">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>System Performance</h3>
          <Line
            data={{
              labels: analyticsData.performanceAnalytics.cpuTrends.map(item => item.date),
              datasets: [
                {
                  label: 'CPU Usage (%)',
                  data: analyticsData.performanceAnalytics.cpuTrends.map(item => item.avgCpu),
                  borderColor: 'rgb(251, 146, 60)',
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Memory Usage (%)',
                  data: analyticsData.performanceAnalytics.memoryTrends.map(item => item.avgMemory),
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'System Resource Usage' }
              }
            }}
          />
        </div>

        <div className="analytics-card">
          <h3>Hourly Activity Pattern</h3>
          <Line
            data={{
              labels: analyticsData.businessInsights.hourlyActivity.map(item => `${item.hour}:00`),
              datasets: [
                {
                  label: 'Activity Count',
                  data: analyticsData.businessInsights.hourlyActivity.map(item => item.activity),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Activity by Hour of Day' }
              }
            }}
          />
        </div>

        <div className="analytics-card performance-summary">
          <h3>Performance Summary</h3>
          <div className="performance-metrics">
            <div className="performance-metric">
              <span className="metric-label">Data Source</span>
              <span className={`metric-badge ${analyticsData.performanceAnalytics.status === 'live_data' ? 'live' : 'demo'}`}>
                {analyticsData.performanceAnalytics.status === 'live_data' ? 'Live Data' : 'Demo Data'}
              </span>
            </div>
            <div className="performance-metric">
              <span className="metric-label">User Retention</span>
              <span className="metric-value">{analyticsData.businessInsights.retentionRate}%</span>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Active/Total Users</span>
              <span className="metric-value">
                {analyticsData.businessInsights.activeUsers}/{analyticsData.businessInsights.totalUsers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-analytics">
      <header className="analytics-header">
        <div className="header-content">
          <h1>📊 Advanced Analytics Dashboard</h1>
          <div className="header-controls">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-selector"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button onClick={fetchAnalyticsData} className="refresh-button">
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <nav className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          ⚡ Performance
        </button>
      </nav>

      <main className="analytics-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
      </main>
    </div>
  );
};

export default AdvancedAnalytics;