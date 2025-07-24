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
    { id: 'network-utilities', name: 'Network Utilities', icon: '🌐' },
    { id: 'network-analyzer', name: 'Network Analyzer', icon: '🔍' },
    { id: 'malware-scanner', name: 'Malware Scanner', icon: '🛡️' },
    { id: 'website-checker', name: 'Website Security', icon: '🔒' },
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
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            <span className="text-4xl md:text-6xl">🦸‍♂️</span>
            <span className="animated-gradient mx-2">IT Hero</span>
            <span className="text-4xl md:text-6xl">🛠</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-2">IT Security & Diagnostic Toolkit</p>
          <p className="text-xs md:text-sm text-gray-500">Your Complete IT Superhero Solution</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all mb-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg md:text-xl">{tab.icon}</span>
              <span className="text-sm md:text-base">{tab.name}</span>
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
          {activeTab === 'network-utilities' && <NetworkUtilitiesTab systemInfo={systemInfo} />}
          {activeTab === 'network-analyzer' && <NetworkAnalyzerTab />}
          {activeTab === 'malware-scanner' && <MalwareScannerTab />}
          {activeTab === 'website-checker' && <WebsiteCheckerTab />}
          {activeTab === 'port-scanner' && <PortScannerTab />}
        </div>
      </div>
    </div>
  );
};

// Network Tools Section Component
const NetworkToolsSection = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Quick Ping Test */}
      <QuickPingTester />
      
      {/* Network Speed Visualizer */}
      <NetworkSpeedVisualizer />
      
      {/* Password Generator */}
      <PasswordGenerator />
    </div>
  );
};

// Quick Ping Tester Component
const QuickPingTester = () => {
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const testPing = async () => {
    setPinging(true);
    try {
      const formData = new FormData();
      formData.append('target', '8.8.8.8');
      formData.append('count', '4');

      const response = await axios.post(`${API}/ping`, formData);
      setPingResult(response.data);
    } catch (err) {
      console.error('Ping test failed:', err);
      setPingResult({ error: 'Ping test failed' });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <h4 className="font-bold mb-2 text-green-400">📡 Quick Ping</h4>
      <button
        onClick={testPing}
        disabled={pinging}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm transition-colors mb-2"
      >
        {pinging ? '⏳ Pinging...' : '🏓 Ping 8.8.8.8'}
      </button>
      {pingResult && !pingResult.error && (
        <div className="text-xs">
          <div className="text-green-400">
            {pingResult.response_time ? `${pingResult.response_time.toFixed(1)}ms` : 'N/A'}
          </div>
          <div className="text-gray-400">
            {pingResult.packet_loss ? `${pingResult.packet_loss.toFixed(1)}% loss` : '0% loss'}
          </div>
        </div>
      )}
      {pingResult?.error && (
        <div className="text-xs text-red-400">{pingResult.error}</div>
      )}
    </div>
  );
};

// Network Speed Visualizer Component
const NetworkSpeedVisualizer = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedData, setSpeedData] = useState({ download: 0, upload: 0 });

  const simulateSpeedTest = () => {
    setIsAnimating(true);
    
    // Simulate speed test with random values
    setTimeout(() => {
      setSpeedData({
        download: Math.random() * 100 + 20,
        upload: Math.random() * 50 + 10
      });
      setIsAnimating(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <h4 className="font-bold mb-2 text-blue-400">🚀 Speed Test</h4>
      <button
        onClick={simulateSpeedTest}
        disabled={isAnimating}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm transition-colors mb-2"
      >
        {isAnimating ? '⏳ Testing...' : '📊 Test Speed'}
      </button>
      
      {isAnimating && (
        <div className="flex justify-center space-x-1 mb-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 bg-blue-500 rounded animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      )}
      
      {!isAnimating && speedData.download > 0 && (
        <div className="text-xs">
          <div className="text-green-400">↓ {speedData.download.toFixed(1)} Mbps</div>
          <div className="text-yellow-400">↑ {speedData.upload.toFixed(1)} Mbps</div>
        </div>
      )}
    </div>
  );
};

// Password Generator Component
const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = async () => {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('length', length.toString());
      formData.append('include_uppercase', 'true');
      formData.append('include_lowercase', 'true');
      formData.append('include_numbers', 'true');
      formData.append('include_special', 'true');

      const response = await axios.post(`${API}/generate-password`, formData);
      setPassword(response.data.password);
    } catch (err) {
      console.error('Password generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <h4 className="font-bold mb-2 text-orange-400">🔐 Password Generator</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs">Length:</span>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            min="4"
            max="32"
            className="flex-1 bg-gray-600 border border-gray-500 rounded px-1 py-1 text-xs text-white"
          />
        </div>
        
        <button
          onClick={generatePassword}
          disabled={generating}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
        >
          {generating ? '⏳' : '🎲 Generate'}
        </button>
        
        {password && (
          <div className="space-y-1">
            <div className="bg-gray-600 rounded px-2 py-1 text-xs font-mono break-all">
              {password}
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors"
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Network Analyzer Tab Component  
const NetworkAnalyzerTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">🔍 Network Analyzer Dashboard</h2>
      
      {/* Main Diagnostic Tools */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PingTesterFull />
        <TracerouteVisualizer />
      </div>
      
      {/* Speed Test Visualization */}
      <div className="bg-gray-800 rounded-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">🚀 Network Speed Analyzer</h3>
        <NetworkSpeedDashboard />
      </div>
    </div>
  );
};

// Full-featured Ping Tester Component
const PingTesterFull = () => {
  const [target, setTarget] = useState('8.8.8.8');
  const [count, setCount] = useState(4);
  const [pinging, setPinging] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runPingTest = async () => {
    if (!target) return;

    setPinging(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('count', count.toString());

      const response = await axios.post(`${API}/ping`, formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ping test failed');
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-green-400">📡 Ping Test</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Host</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="8.8.8.8 or google.com"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ping Count</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={1}>1 ping</option>
              <option value={4}>4 pings</option>
              <option value={8}>8 pings</option>
              <option value={10}>10 pings</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={runPingTest}
          disabled={!target || pinging}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded transition-colors"
        >
          {pinging ? '⏳ Pinging...' : '🏓 Start Ping Test'}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 bg-gray-700 rounded-lg p-4">
          <h4 className="font-bold mb-2">Ping Results for {result.target}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{result.response_time?.toFixed(1) || 'N/A'}</div>
              <div className="text-sm text-gray-400">Avg Response (ms)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{result.packets_sent}</div>
              <div className="text-sm text-gray-400">Packets Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">{result.packets_received}</div>
              <div className="text-sm text-gray-400">Packets Received</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${result.packet_loss === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.packet_loss}%
              </div>
              <div className="text-sm text-gray-400">Packet Loss</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Traceroute Visualizer Component
const TracerouteVisualizer = () => {
  const [target, setTarget] = useState('google.com');
  const [maxHops, setMaxHops] = useState(15);
  const [tracing, setTracing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runTraceroute = async () => {
    if (!target) return;

    setTracing(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('max_hops', maxHops.toString());

      const response = await axios.post(`${API}/traceroute`, formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Traceroute failed');
    } finally {
      setTracing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-purple-400">🗺️ Traceroute Visualizer</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Host</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="google.com or 8.8.8.8"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Hops</label>
            <select
              value={maxHops}
              onChange={(e) => setMaxHops(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={10}>10 hops</option>
              <option value={15}>15 hops</option>
              <option value={20}>20 hops</option>
              <option value={30}>30 hops</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={runTraceroute}
          disabled={!target || tracing}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-2 rounded transition-colors"
        >
          {tracing ? '⏳ Tracing route...' : '🗺️ Trace Route'}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h4 className="font-bold mb-4">Route to {result.target} ({result.total_hops} hops)</h4>
          
          {/* Visual Route Display */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0 w-16 h-8 bg-green-600 rounded flex items-center justify-center text-xs font-bold">
                START
              </div>
              {result.hops.map((hop, index) => (
                <React.Fragment key={index}>
                  <div className="flex-shrink-0 w-2 h-0.5 bg-gray-400"></div>
                  <div className="flex-shrink-0 w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">
                    {hop.hop}
                  </div>
                </React.Fragment>
              ))}
              <div className="flex-shrink-0 w-2 h-0.5 bg-gray-400"></div>
              <div className="flex-shrink-0 w-16 h-8 bg-red-600 rounded flex items-center justify-center text-xs font-bold">
                TARGET
              </div>
            </div>
          </div>
          
          {/* Hop Details */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {result.hops.map((hop, index) => (
              <div key={index} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-400">Hop {hop.hop}:</span>
                  <span className="ml-2 font-mono text-sm">{hop.ip}</span>
                  {hop.hostname && (
                    <span className="ml-2 text-gray-400 text-sm">({hop.hostname})</span>
                  )}
                </div>
                <div className="text-right">
                  {hop.avg_time !== null ? (
                    <span className="text-green-400 font-bold">{hop.avg_time?.toFixed(1)}ms</span>
                  ) : (
                    <span className="text-red-400">*</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Network Speed Dashboard Component
const NetworkSpeedDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({ download: 0, upload: 0, ping: 0 });
  const [progress, setProgress] = useState(0);

  const runSpeedTest = () => {
    setIsRunning(true);
    setProgress(0);
    setResults({ download: 0, upload: 0, ping: 0 });

    // Simulate speed test with animated progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setResults({
            download: Math.random() * 150 + 50,
            upload: Math.random() * 75 + 25,
            ping: Math.random() * 30 + 10
          });
          setIsRunning(false);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={runSpeedTest}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg text-lg font-bold transition-colors"
        >
          {isRunning ? '⏳ Testing...' : '🚀 Start Speed Test'}
        </button>
      </div>

      {isRunning && (
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-400">{progress}%</div>
            <div className="w-full bg-gray-600 rounded-full h-4 mt-2">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Animated Speed Bars */}
          <div className="flex justify-center space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 bg-blue-500 rounded animate-pulse"
                style={{ 
                  height: `${Math.random() * 40 + 20}px`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {!isRunning && results.download > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {results.download.toFixed(1)}
            </div>
            <div className="text-gray-400">Download (Mbps)</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(results.download / 2, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {results.upload.toFixed(1)}
            </div>
            <div className="text-gray-400">Upload (Mbps)</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${Math.min(results.upload / 1.5, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {results.ping.toFixed(0)}
            </div>
            <div className="text-gray-400">Ping (ms)</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full"
                style={{ width: `${Math.max(100 - results.ping * 2, 10)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Network Utilities Tab Component (dedicated page)
const NetworkUtilitiesTab = ({ systemInfo }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🌐 Network Utilities</h2>
      
      {/* Network Information Section */}
      {systemInfo && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">📡 Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div><strong>Local IP:</strong> {systemInfo.local_ip}</div>
            </div>
            <div className="space-y-2">
              <div><strong>Public IP:</strong> {systemInfo.public_ip || "N/A"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Network Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* WiFi Speed Test */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-bold text-center mb-3 text-blue-400">📶 WiFi Speed Test</h4>
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
              ⚡ Start
            </button>
          </div>
        </div>
        
        {/* Password Generator */}
        <PasswordGenerator />
      </div>

      {/* Advanced Network Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ping Tester */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">🏓 Advanced Ping Tester</h3>
          <PingTesterFull />
        </div>

        {/* Traceroute */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-purple-400">🗺️ Traceroute Visualizer</h3>
          <TracerouteVisualizer />
        </div>
      </div>

      {/* Network Speed Dashboard */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">🚀 Network Speed Analyzer</h3>
        <NetworkSpeedDashboard />
      </div>
    </div>
  );
};

// System Info Tab Component (updated to remove network tools)
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
        <div className="bg-gray-800 rounded-lg p-6 md:col-span-3">
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