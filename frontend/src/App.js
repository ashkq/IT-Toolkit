import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('system-info');
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'system-info', name: 'System Info', icon: '🖥️' },
    { id: 'network-analyzer', name: 'Network Analyzer', icon: '🔍' },
    { id: 'malware-scanner', name: 'Malware Scanner', icon: '🛡️' },
    { id: 'website-checker', name: 'Website Security', icon: '🌐' },
    { id: 'port-scanner', name: 'Port Scanner', icon: '🔓' },
  ];

  useEffect(() => {
    if (activeTab === 'system-info') {
      fetchSystemInfo();
    }
  }, [activeTab]);

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API}/system-info`);
      setSystemInfo(response.data);
    } catch (err) {
      setError('Failed to fetch system information');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🛡️ IT Security & Diagnostic Toolkit
          </h1>
          <p className="text-gray-400">Complete security analysis and system diagnostics</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'system-info' && (
            <SystemInfoTab 
              systemInfo={systemInfo} 
              loading={loading} 
              error={error} 
              onRefresh={fetchSystemInfo} 
            />
          )}
          {activeTab === 'malware-scanner' && <MalwareScannerTab />}
          {activeTab === 'website-checker' && <WebsiteCheckerTab />}
          {activeTab === 'port-scanner' && <PortScannerTab />}
        </div>
      </div>
    </div>
  );
};

// System Info Tab Component
const SystemInfoTab = ({ systemInfo, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Collecting system information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">❌ Error</h3>
        <p>{error}</p>
        <button 
          onClick={onRefresh}
          className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!systemInfo) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Information & Diagnostics</h2>
        <button 
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Overview */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-400">🖥️ System Overview</h3>
          <div className="space-y-2">
            <div><strong>OS:</strong> {systemInfo.os_name}</div>
            <div><strong>Version:</strong> {systemInfo.os_version}</div>
            <div><strong>Hostname:</strong> {systemInfo.hostname}</div>
            <div><strong>Uptime:</strong> {systemInfo.uptime}</div>
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">🌐 Network</h3>
          <div className="space-y-2">
            <div><strong>Local IP:</strong> {systemInfo.local_ip}</div>
            <div><strong>Public IP:</strong> {systemInfo.public_ip || 'N/A'}</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-purple-400">💾 Memory</h3>
          <div className="space-y-2">
            <div><strong>Total:</strong> {systemInfo.ram_total} GB</div>
            <div><strong>Used:</strong> {systemInfo.ram_used} GB</div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full" 
                style={{width: `${systemInfo.ram_percentage}%`}}
              ></div>
            </div>
            <div className="text-sm text-gray-400">{systemInfo.ram_percentage}% used</div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-yellow-400">💽 Storage</h3>
          <div className="space-y-2">
            <div><strong>Total:</strong> {systemInfo.disk_total} GB</div>
            <div><strong>Used:</strong> {systemInfo.disk_used} GB</div>
            <div><strong>Free:</strong> {systemInfo.disk_free} GB</div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full" 
                style={{width: `${systemInfo.disk_percentage}%`}}
              ></div>
            </div>
            <div className="text-sm text-gray-400">{systemInfo.disk_percentage}% used</div>
          </div>
        </div>

        {/* Top Processes */}
        <div className="bg-gray-800 rounded-lg p-6 md:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-red-400">⚡ Top CPU Processes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">PID</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">CPU %</th>
                  <th className="text-left py-2">Memory %</th>
                </tr>
              </thead>
              <tbody>
                {systemInfo.top_processes.map((proc, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{proc.pid}</td>
                    <td className="py-2">{proc.name}</td>
                    <td className="py-2">{proc.cpu_percent}%</td>
                    <td className="py-2">{proc.memory_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Malware Scanner Tab Component
const MalwareScannerTab = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await axios.get(`${API}/scan-history`);
      setScanHistory(response.data.slice(0, 10)); // Show last 10 scans
    } catch (err) {
      console.error('Error fetching scan history:', err);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API}/scan-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setScanResult(response.data);
      fetchScanHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.detail || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High Risk': return 'text-red-400';
      case 'Medium Risk': return 'text-yellow-400';
      case 'Safe': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🛡️ Malware & Threat Scanner</h2>

      {/* File Upload */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Upload File for Scanning</h3>
        <div className="space-y-4">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile || scanning}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-2 rounded transition-colors"
          >
            {scanning ? '🔄 Scanning...' : '🔍 Scan File'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Scan Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">File Information</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Filename:</strong> {scanResult.filename}</div>
                <div><strong>Size:</strong> {(scanResult.file_size / 1024).toFixed(2)} KB</div>
                <div><strong>SHA256:</strong> <span className="font-mono text-xs">{scanResult.file_hash}</span></div>
                <div>
                  <strong>Risk Level:</strong> 
                  <span className={`ml-2 font-bold ${getRiskColor(scanResult.risk_level)}`}>
                    {scanResult.risk_level}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Analysis Details</h4>
              {scanResult.suspicious_indicators.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {scanResult.suspicious_indicators.map((indicator, index) => (
                    <li key={index} className="text-yellow-400">⚠️ {indicator}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-400">✅ No suspicious indicators found</p>
              )}
            </div>
          </div>

          {/* VirusTotal Results */}
          {scanResult.virustotal_result && scanResult.virustotal_result.attributes && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-bold mb-2">VirusTotal Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-red-400">
                    {scanResult.virustotal_result.attributes.stats.malicious || 0}
                  </div>
                  <div className="text-sm text-gray-400">Malicious</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-yellow-400">
                    {scanResult.virustotal_result.attributes.stats.suspicious || 0}
                  </div>
                  <div className="text-sm text-gray-400">Suspicious</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {scanResult.virustotal_result.attributes.stats.clean || 0}
                  </div>
                  <div className="text-sm text-gray-400">Clean</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {scanResult.virustotal_result.attributes.stats.undetected || 0}
                  </div>
                  <div className="text-sm text-gray-400">Undetected</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Scans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Filename</th>
                  <th className="text-left py-2">Risk Level</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{scan.filename}</td>
                    <td className={`py-2 font-bold ${getRiskColor(scan.risk_level)}`}>
                      {scan.risk_level}
                    </td>
                    <td className="py-2">{new Date(scan.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Website Security Checker Tab Component
const WebsiteCheckerTab = () => {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchSecurityHistory();
  }, []);

  const fetchSecurityHistory = async () => {
    try {
      const response = await axios.get(`${API}/security-history`);
      setHistory(response.data.slice(0, 10));
    } catch (err) {
      console.error('Error fetching security history:', err);
    }
  };

  const checkWebsite = async () => {
    if (!url) return;

    setChecking(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('url', url);

      const response = await axios.post(`${API}/check-website`, formData);
      setResult(response.data);
      fetchSecurityHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Security check failed');
    } finally {
      setChecking(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🌐 Website Security Checker</h2>

      {/* URL Input */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Check Website Security</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., example.com)"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
          />
          <button
            onClick={checkWebsite}
            disabled={!url || checking}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded transition-colors"
          >
            {checking ? '🔄 Checking...' : '🔍 Check Security'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Security Results */}
      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Security Report for {result.url}</h3>
          
          {/* Security Score */}
          <div className="mb-6 text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.security_score)}`}>
              {result.security_score}/100
            </div>
            <div className="text-gray-400">Security Score</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Security */}
            <div>
              <h4 className="font-bold mb-2">🔐 Basic Security</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>HTTPS:</span>
                  <span className={result.https_valid ? 'text-green-400' : 'text-red-400'}>
                    {result.https_valid ? '✅ Enabled' : '❌ Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SSL Certificate:</span>
                  <span className={result.ssl_cert_info.error ? 'text-red-400' : 'text-green-400'}>
                    {result.ssl_cert_info.error ? '❌ Invalid' : '✅ Valid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Headers */}
            <div>
              <h4 className="font-bold mb-2">🛡️ Security Headers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Strict-Transport-Security:</span>
                  <span className={result.http_headers['strict-transport-security'] ? 'text-green-400' : 'text-red-400'}>
                    {result.http_headers['strict-transport-security'] ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>X-Frame-Options:</span>
                  <span className={result.http_headers['x-frame-options'] ? 'text-green-400' : 'text-red-400'}>
                    {result.http_headers['x-frame-options'] ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Content-Security-Policy:</span>
                  <span className={result.http_headers['content-security-policy'] ? 'text-green-400' : 'text-red-400'}>
                    {result.http_headers['content-security-policy'] ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safe Browsing Results */}
          {result.safe_browsing_result && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-bold mb-2">🚨 Google Safe Browsing</h4>
              {result.safe_browsing_result.safe ? (
                <p className="text-green-400">✅ No security threats detected</p>
              ) : (
                <div className="text-red-400">
                  <p>❌ Security threats detected:</p>
                  <ul className="mt-2 ml-4">
                    {result.safe_browsing_result.threats?.map((threat, index) => (
                      <li key={index}>• {threat.threatType}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SSL Certificate Details */}
          {result.ssl_cert_info && !result.ssl_cert_info.error && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-bold mb-2">📜 SSL Certificate Details</h4>
              <div className="text-sm space-y-1">
                <div><strong>Subject:</strong> {result.ssl_cert_info.subject?.CN || 'N/A'}</div>
                <div><strong>Issuer:</strong> {result.ssl_cert_info.issuer?.CN || 'N/A'}</div>
                <div><strong>Valid Until:</strong> {result.ssl_cert_info.notAfter}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Security Checks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">URL</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">HTTPS</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((check, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{check.url}</td>
                    <td className={`py-2 font-bold ${getScoreColor(check.security_score)}`}>
                      {check.security_score}/100
                    </td>
                    <td className="py-2">
                      <span className={check.https_valid ? 'text-green-400' : 'text-red-400'}>
                        {check.https_valid ? '✅' : '❌'}
                      </span>
                    </td>
                    <td className="py-2">{new Date(check.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Port Scanner Tab Component
const PortScannerTab = () => {
  const [target, setTarget] = useState('');
  const [ports, setPorts] = useState('common');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchPortScanHistory();
  }, []);

  const fetchPortScanHistory = async () => {
    try {
      const response = await axios.get(`${API}/port-scan-history`);
      setHistory(response.data.slice(0, 10));
    } catch (err) {
      console.error('Error fetching port scan history:', err);
    }
  };

  const scanPorts = async () => {
    if (!target) return;

    setScanning(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('ports', ports);

      const response = await axios.post(`${API}/scan-ports`, formData);
      setResult(response.data);
      fetchPortScanHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Port scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🔍 Network Port Scanner</h2>

      {/* Scan Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Port Scan Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target (IP or Domain)</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.1 or google.com"
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ports to Scan</label>
            <select
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
            >
              <option value="common">Common Ports (21, 22, 80, 443, etc.)</option>
              <option value="80,443">Web Ports (80, 443)</option>
              <option value="21,22,23">Remote Access (21, 22, 23)</option>
              <option value="25,110,143,993,995">Email Ports (25, 110, 143, 993, 995)</option>
            </select>
          </div>
          <button
            onClick={scanPorts}
            disabled={!target || scanning}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded transition-colors"
          >
            {scanning ? '🔄 Scanning...' : '🔍 Start Port Scan'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scan Results */}
      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Port Scan Results for {result.target}</h3>
          
          <div className="mb-4 text-sm text-gray-400">
            Scan completed in {result.scan_duration.toFixed(2)} seconds
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Open Ports */}
            <div>
              <h4 className="font-bold mb-2 text-green-400">✅ Open Ports ({result.open_ports.length})</h4>
              {result.open_ports.length > 0 ? (
                <div className="space-y-2">
                  {result.open_ports.map((port, index) => (
                    <div key={index} className="bg-gray-700 rounded p-3">
                      <div className="font-bold text-green-400">Port {port.port}</div>
                      <div className="text-sm text-gray-400">{port.service}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No open ports found</p>
              )}
            </div>

            {/* Closed Ports Summary */}
            <div>
              <h4 className="font-bold mb-2 text-red-400">❌ Closed Ports ({result.closed_ports.length})</h4>
              {result.closed_ports.length > 0 ? (
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-sm">
                    {result.closed_ports.slice(0, 20).join(', ')}
                    {result.closed_ports.length > 20 && ` and ${result.closed_ports.length - 20} more...`}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No closed ports in scan range</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Port Scans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Open Ports</th>
                  <th className="text-left py-2">Duration</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{scan.target}</td>
                    <td className="py-2 text-green-400">{scan.open_ports.length}</td>
                    <td className="py-2">{scan.scan_duration.toFixed(2)}s</td>
                    <td className="py-2">{new Date(scan.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;