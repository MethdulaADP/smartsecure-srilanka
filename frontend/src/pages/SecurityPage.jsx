import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SecurityPage() {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    riskLevel: 'LOW',
    totalFiles: 0,
    scannedFiles: 0,
    threatsDetected: 0
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [showThreatDetails, setShowThreatDetails] = useState(false);

  useEffect(() => {
    loadSecurityData();
    
    // Auto-scan every 5 minutes if enabled
    let autoScanInterval;
    if (autoScanEnabled) {
      autoScanInterval = setInterval(() => {
        handleScanFiles();
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (autoScanInterval) clearInterval(autoScanInterval);
    };
  }, [autoScanEnabled]);

  const loadSecurityData = async () => {
    try {
      const token = localStorage.getItem('smartsecure_token');
      
      // Get user's files
      const filesResponse = await fetch('http://localhost:5004/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const userFiles = filesData.files || [];
        setFiles(userFiles);
        
        // Calculate security status (only count files that have been scanned)
        const scanned = userFiles.filter(f => f.last_scan !== null && f.last_scan !== undefined).length;
        const threats = userFiles.filter(f => f.is_safe === 0 && f.last_scan).length;
        
        let riskLevel = 'LOW';
        if (threats > 5) riskLevel = 'HIGH';
        else if (threats > 0) riskLevel = 'MEDIUM';
        
        setSecurityStatus({
          riskLevel,
          totalFiles: userFiles.length,
          scannedFiles: scanned,
          threatsDetected: threats
        });
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanFiles = async () => {
    setScanning(true);
    setScanProgress(0);
    console.log('🔍 Starting file scan...');
    
    try {
      const token = localStorage.getItem('smartsecure_token');
      
      // Get all files first
      const filesResponse = await fetch('http://localhost:5004/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const userFiles = filesData.files || [];
        console.log(`📁 Found ${userFiles.length} files to scan`);
        
        // Scan each file individually with progress
        for (let i = 0; i < userFiles.length; i++) {
          const file = userFiles[i];
          console.log(`🔬 Scanning file ${i + 1}/${userFiles.length}: ${file.filename} (ID: ${file.id})`);
          
          try {
            const scanResponse = await fetch('http://localhost:5004/security/scan', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fileId: file.id })
            });
            
            if (scanResponse.ok) {
              const scanResult = await scanResponse.json();
              console.log(`✅ Scan complete for ${file.filename}:`, scanResult);
            } else {
              const errorText = await scanResponse.text();
              console.error(`❌ Scan failed for ${file.filename}:`, errorText);
            }
          } catch (err) {
            console.error(`❌ Error scanning file ${file.id}:`, err);
          }
          
          // Update progress
          setScanProgress(Math.round(((i + 1) / userFiles.length) * 100));
          
          // Small delay to show progress (optional)
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('✅ All files scanned! Reloading data...');
        setLastScanTime(new Date());
        await loadSecurityData();
        console.log('✅ Data reloaded successfully');
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };

  const toggleAutoScan = () => {
    setAutoScanEnabled(!autoScanEnabled);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading security data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Security Status Banner */}
      <div className={`rounded-2xl p-8 mb-6 shadow-2xl border-2 ${
        securityStatus.riskLevel === 'HIGH' ? 'bg-red-50 border-red-500' :
        securityStatus.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-500' :
        'bg-green-50 border-green-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`text-6xl ${
              securityStatus.riskLevel === 'HIGH' ? 'animate-pulse' : ''
            }`}>
              {securityStatus.riskLevel === 'HIGH' ? '🚨' :
               securityStatus.riskLevel === 'MEDIUM' ? '⚠️' : '✅'}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Security Level: {securityStatus.riskLevel}
              </h1>
              <p className={`text-lg ${
                securityStatus.riskLevel === 'HIGH' ? 'text-red-700' :
                securityStatus.riskLevel === 'MEDIUM' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {securityStatus.riskLevel === 'HIGH' ? 'Multiple threats detected - Action required' :
                 securityStatus.riskLevel === 'MEDIUM' ? 'Some files need attention' :
                 'All your files are secure'}
              </p>
            </div>
          </div>
          <button
            onClick={handleScanFiles}
            disabled={scanning}
            className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
              scanning 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105'
            }`}
          >
            {scanning ? '🔄 Scanning...' : '🔍 Scan All Files'}
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">📁</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {securityStatus.totalFiles}
              </div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">Files in your account</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🔍</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {securityStatus.scannedFiles}
              </div>
              <div className="text-sm text-gray-500">Scanned</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">Files analyzed</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🛡️</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {securityStatus.scannedFiles - securityStatus.threatsDetected}
              </div>
              <div className="text-sm text-gray-500">Clean</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">Safe files</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">⚠️</span>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                securityStatus.threatsDetected > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {securityStatus.threatsDetected}
              </div>
              <div className="text-sm text-gray-500">Threats</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">Issues detected</div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Account Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-bold text-gray-900">Password Protection</div>
                <div className="text-sm text-gray-600">Your account is protected with bcrypt encryption</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔑</span>
              <div>
                <div className="font-bold text-gray-900">JWT Authentication</div>
                <div className="text-sm text-gray-600">Secure token-based session management</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="font-bold text-gray-900">File Encryption</div>
                <div className="text-sm text-gray-600">All uploaded files are encrypted at rest</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <div className="font-bold text-gray-900 text-lg">AI Threat Detection</div>
                  <div className="text-sm text-gray-600">
                    {scanning ? `Scanning... ${scanProgress}%` : 'Automatic scanning for malicious content'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleAutoScan}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    autoScanEnabled 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Auto-scan: {autoScanEnabled ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={handleScanFiles}
                  disabled={scanning}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
                    scanning 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {scanning ? '🔄 Scanning...' : '🔍 Scan Now'}
                </button>
              </div>
            </div>
            
            {/* Scan Progress Bar */}
            {scanning && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Last Scan Time */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {lastScanTime ? (
                  <>
                    <span className="font-semibold">Last scan:</span> {lastScanTime.toLocaleString()}
                  </>
                ) : (
                  <span className="text-gray-500">No scan performed yet</span>
                )}
              </div>
              {files.length > 0 && (
                <button
                  onClick={() => setShowThreatDetails(!showThreatDetails)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  {showThreatDetails ? 'Hide Details' : 'View Threat Details'}
                </button>
              )}
            </div>
            
            {/* Threat Details */}
            {showThreatDetails && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                <div className="font-bold text-gray-900 mb-2">📋 File Scan Results:</div>
                {files.map((file, index) => {
                  // Check if file has been scanned (last_scan is not null)
                  const hasBeenScanned = file.last_scan !== null && file.last_scan !== undefined;
                  const isThreat = hasBeenScanned && file.is_safe === 0;
                  const isSafe = hasBeenScanned && file.is_safe === 1;
                  const threatLevel = file.threat_score > 0.7 ? 'HIGH' : file.threat_score > 0.4 ? 'MEDIUM' : 'LOW';
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        isThreat 
                          ? 'bg-red-50 border-red-300' 
                          : isSafe
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {isThreat ? '⚠️' : isSafe ? '✅' : '⏳'}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {file.filename}
                            </div>
                            <div className="text-xs text-gray-600">
                              {!hasBeenScanned
                                ? 'Not scanned yet'
                                : isSafe 
                                  ? `Safe - Threat Level: ${threatLevel}`
                                  : `THREAT DETECTED - Level: ${threatLevel} (Score: ${file.threat_score?.toFixed(2) || 'N/A'})`
                              }
                            </div>
                          </div>
                        </div>
                        {file.last_scan && (
                          <div className="text-xs text-gray-500">
                            {new Date(file.last_scan).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Recent Security Activity</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Account login successful</div>
              <div className="text-sm text-gray-600">You logged in from 127.0.0.1</div>
            </div>
            <div className="text-xs text-gray-500">Just now</div>
          </div>

          {files.slice(0, 3).map((file, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">📤</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">File uploaded: {file.filename}</div>
                <div className="text-sm text-gray-600">
                  {file.is_safe ? '✓ Scanned and marked as safe' : 'Waiting for security scan'}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(file.uploaded_at || file.upload_date).toLocaleDateString()}
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <div>No recent activity</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
