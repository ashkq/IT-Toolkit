#!/usr/bin/env python3
"""
Backend API Tests for IT Security & Diagnostic Toolkit
Tests all backend endpoints and third-party integrations
"""

import requests
import json
import time
import tempfile
import os
from datetime import datetime
import hashlib

# Backend URL from environment
BACKEND_URL = "https://164589e4-a16c-4890-beb6-62a9309810c9.preview.emergentagent.com/api"

class SecurityToolkitTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error=""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "details": details,
            "error": error
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_health_check(self):
        """Test basic API health check"""
        try:
            response = self.session.get(f"{BACKEND_URL}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Health Check", True, f"API is running: {data['message']}")
                    return True
                else:
                    self.log_test("Health Check", False, error="Invalid response format")
                    return False
            else:
                self.log_test("Health Check", False, error=f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, error=str(e))
            return False

    def test_system_info_api(self):
        """Test GET /api/system-info endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/system-info", timeout=15)
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = [
                    'os_name', 'os_version', 'hostname', 'local_ip', 
                    'ram_total', 'ram_used', 'ram_percentage',
                    'disk_total', 'disk_used', 'disk_free', 'disk_percentage',
                    'uptime', 'top_processes'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("System Info API", False, 
                                error=f"Missing fields: {missing_fields}")
                    return False
                
                # Validate data types and ranges
                if not isinstance(data['ram_percentage'], (int, float)) or not (0 <= data['ram_percentage'] <= 100):
                    self.log_test("System Info API", False, error="Invalid RAM percentage")
                    return False
                
                if not isinstance(data['top_processes'], list):
                    self.log_test("System Info API", False, error="top_processes should be a list")
                    return False
                
                self.log_test("System Info API", True, 
                            f"OS: {data['os_name']}, RAM: {data['ram_percentage']}%, "
                            f"Disk: {data['disk_percentage']}%, Processes: {len(data['top_processes'])}")
                return True
            else:
                self.log_test("System Info API", False, error=f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("System Info API", False, error=str(e))
            return False

    def test_file_malware_scanner(self):
        """Test POST /api/scan-file endpoint"""
        try:
            # Create a test file with suspicious content
            test_content = b"""
            import subprocess
            import base64
            # This is a test file with suspicious patterns
            subprocess.call(['powershell', '-Command', 'echo malware test'])
            eval('print("suspicious eval")')
            """
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as tmp_file:
                tmp_file.write(test_content)
                tmp_file_path = tmp_file.name
            
            try:
                # Upload file for scanning
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('test_suspicious.py', f, 'text/plain')}
                    response = self.session.post(f"{BACKEND_URL}/scan-file", 
                                               files=files, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check required fields
                    required_fields = ['filename', 'file_size', 'file_hash', 'risk_level', 
                                     'suspicious_indicators', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        self.log_test("File Malware Scanner", False, 
                                    error=f"Missing fields: {missing_fields}")
                        return False
                    
                    # Verify suspicious content detection
                    if not data['suspicious_indicators']:
                        self.log_test("File Malware Scanner", False, 
                                    error="Failed to detect suspicious content")
                        return False
                    
                    # Check if VirusTotal integration worked
                    vt_result = data.get('virustotal_result')
                    vt_status = "VirusTotal integrated" if vt_result and 'error' not in vt_result else "VirusTotal not available"
                    
                    self.log_test("File Malware Scanner", True, 
                                f"Risk: {data['risk_level']}, Indicators: {len(data['suspicious_indicators'])}, {vt_status}")
                    return True
                else:
                    self.log_test("File Malware Scanner", False, error=f"HTTP {response.status_code}")
                    return False
            finally:
                # Clean up temp file
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_test("File Malware Scanner", False, error=str(e))
            return False

    def test_website_security_checker(self):
        """Test POST /api/check-website endpoint"""
        try:
            # Test with a well-known secure website
            test_url = "google.com"
            data = {'url': test_url}
            
            response = self.session.post(f"{BACKEND_URL}/check-website", 
                                       data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Check required fields
                required_fields = ['url', 'https_valid', 'ssl_cert_info', 'http_headers', 
                                 'redirects', 'security_score', 'timestamp']
                missing_fields = [field for field in required_fields if field not in result]
                if missing_fields:
                    self.log_test("Website Security Checker", False, 
                                error=f"Missing fields: {missing_fields}")
                    return False
                
                # Verify HTTPS/SSL checking
                if not isinstance(result['https_valid'], bool):
                    self.log_test("Website Security Checker", False, 
                                error="https_valid should be boolean")
                    return False
                
                # Check security score
                if not isinstance(result['security_score'], int) or not (0 <= result['security_score'] <= 100):
                    self.log_test("Website Security Checker", False, 
                                error="Invalid security score")
                    return False
                
                # Check Safe Browsing integration
                sb_result = result.get('safe_browsing_result')
                sb_status = "Safe Browsing integrated" if sb_result and 'error' not in sb_result else "Safe Browsing not available"
                
                self.log_test("Website Security Checker", True, 
                            f"HTTPS: {result['https_valid']}, Score: {result['security_score']}, {sb_status}")
                return True
            else:
                self.log_test("Website Security Checker", False, error=f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Website Security Checker", False, error=str(e))
            return False

    def test_port_scanner(self):
        """Test POST /api/scan-ports endpoint"""
        try:
            # Test port scanning on localhost with common ports
            data = {
                'target': '127.0.0.1',
                'ports': 'common'
            }
            
            response = self.session.post(f"{BACKEND_URL}/scan-ports", 
                                       data=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                
                # Check required fields
                required_fields = ['target', 'open_ports', 'closed_ports', 'scan_duration', 'timestamp']
                missing_fields = [field for field in required_fields if field not in result]
                if missing_fields:
                    self.log_test("Port Scanner", False, 
                                error=f"Missing fields: {missing_fields}")
                    return False
                
                # Verify data types
                if not isinstance(result['open_ports'], list):
                    self.log_test("Port Scanner", False, error="open_ports should be a list")
                    return False
                
                if not isinstance(result['closed_ports'], list):
                    self.log_test("Port Scanner", False, error="closed_ports should be a list")
                    return False
                
                if not isinstance(result['scan_duration'], (int, float)):
                    self.log_test("Port Scanner", False, error="scan_duration should be numeric")
                    return False
                
                # Check if scan found any ports
                total_ports = len(result['open_ports']) + len(result['closed_ports'])
                if total_ports == 0:
                    self.log_test("Port Scanner", False, error="No ports scanned")
                    return False
                
                self.log_test("Port Scanner", True, 
                            f"Open: {len(result['open_ports'])}, Closed: {len(result['closed_ports'])}, "
                            f"Duration: {result['scan_duration']:.2f}s")
                return True
            else:
                self.log_test("Port Scanner", False, error=f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Port Scanner", False, error=str(e))
            return False

    def test_history_endpoints(self):
        """Test all history API endpoints"""
        history_endpoints = [
            ('scan-history', 'File Scan History'),
            ('security-history', 'Website Security History'),
            ('port-scan-history', 'Port Scan History')
        ]
        
        all_passed = True
        for endpoint, name in history_endpoints:
            try:
                response = self.session.get(f"{BACKEND_URL}/{endpoint}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(f"{name} API", True, f"Retrieved {len(data)} records")
                    else:
                        self.log_test(f"{name} API", False, error="Response should be a list")
                        all_passed = False
                else:
                    self.log_test(f"{name} API", False, error=f"HTTP {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"{name} API", False, error=str(e))
                all_passed = False
        
        return all_passed

    def test_rate_limiting(self):
        """Test rate limiting on sensitive endpoints"""
        try:
            # Test rate limiting on file scan endpoint (5/minute limit)
            print("Testing rate limiting (this may take a moment)...")
            
            # Create a small test file
            test_content = b"test file for rate limiting"
            
            success_count = 0
            rate_limited = False
            
            for i in range(7):  # Try 7 requests (limit is 5/minute)
                try:
                    with tempfile.NamedTemporaryFile() as tmp_file:
                        tmp_file.write(test_content)
                        tmp_file.seek(0)
                        
                        files = {'file': ('test.txt', tmp_file, 'text/plain')}
                        response = self.session.post(f"{BACKEND_URL}/scan-file", 
                                                   files=files, timeout=10)
                        
                        if response.status_code == 200:
                            success_count += 1
                        elif response.status_code == 429:  # Too Many Requests
                            rate_limited = True
                            break
                        
                        time.sleep(0.5)  # Small delay between requests
                        
                except Exception:
                    continue
            
            if rate_limited:
                self.log_test("Rate Limiting", True, 
                            f"Rate limiting working - {success_count} requests succeeded before limit")
                return True
            elif success_count >= 5:
                self.log_test("Rate Limiting", False, 
                            error="Rate limiting not enforced - too many requests succeeded")
                return False
            else:
                self.log_test("Rate Limiting", False, 
                            error="Could not properly test rate limiting")
                return False
                
        except Exception as e:
            self.log_test("Rate Limiting", False, error=str(e))
            return False

    def test_error_handling(self):
        """Test error handling with invalid inputs"""
        error_tests = [
            {
                'name': 'Invalid URL for website check',
                'endpoint': 'check-website',
                'data': {'url': 'not-a-valid-url'},
                'method': 'POST'
            },
            {
                'name': 'Invalid target for port scan',
                'endpoint': 'scan-ports',
                'data': {'target': 'invalid-host-name-12345', 'ports': '80,443'},
                'method': 'POST'
            },
            {
                'name': 'Missing file for scan',
                'endpoint': 'scan-file',
                'data': {},
                'method': 'POST'
            }
        ]
        
        all_passed = True
        for test in error_tests:
            try:
                if test['method'] == 'POST':
                    if test['endpoint'] == 'scan-file':
                        # Special case for file upload
                        response = self.session.post(f"{BACKEND_URL}/{test['endpoint']}", 
                                                   data=test['data'], timeout=10)
                    else:
                        response = self.session.post(f"{BACKEND_URL}/{test['endpoint']}", 
                                                   data=test['data'], timeout=10)
                
                # Should return 4xx or 5xx error
                if 400 <= response.status_code < 600:
                    self.log_test(f"Error Handling - {test['name']}", True, 
                                f"Properly returned HTTP {response.status_code}")
                else:
                    self.log_test(f"Error Handling - {test['name']}", False, 
                                error=f"Expected error status, got HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Error Handling - {test['name']}", False, error=str(e))
                all_passed = False
        
        return all_passed

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("IT Security & Diagnostic Toolkit - Backend API Tests")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print()
        
        # Run tests in order
        tests = [
            self.test_health_check,
            self.test_system_info_api,
            self.test_file_malware_scanner,
            self.test_website_security_checker,
            self.test_port_scanner,
            self.test_history_endpoints,
            self.test_rate_limiting,
            self.test_error_handling
        ]
        
        passed = 0
        total = 0
        
        for test in tests:
            if test():
                passed += 1
            total += 1
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
            if result['error']:
                print(f"   Error: {result['error']}")
        
        return passed, total, self.test_results

if __name__ == "__main__":
    tester = SecurityToolkitTester()
    passed, total, results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if passed == total else 1)