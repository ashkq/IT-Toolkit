#!/usr/bin/env python3
"""
Focused Backend API Tests for IT Hero - Testing specific endpoints as requested
"""

import requests
import json
import time
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://fe91e244-8a70-4d9d-8fad-66ab3321e92a.preview.emergentagent.com/api"

class FocusedTester:
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

    def test_system_info_endpoint(self):
        """Test GET /api/system-info - verify it returns real system data"""
        try:
            response = self.session.get(f"{BACKEND_URL}/system-info", timeout=15)
            if response.status_code == 200:
                data = response.json()
                
                # Check for real system data (not placeholder)
                real_data_indicators = []
                
                # Check OS name is real
                if data.get('os_name') and data['os_name'] != 'Unknown':
                    real_data_indicators.append(f"OS: {data['os_name']}")
                
                # Check hostname is real
                if data.get('hostname') and data['hostname'] != 'localhost':
                    real_data_indicators.append(f"Hostname: {data['hostname']}")
                
                # Check RAM data is realistic
                if data.get('ram_total', 0) > 0 and data.get('ram_percentage', 0) > 0:
                    real_data_indicators.append(f"RAM: {data['ram_total']}GB ({data['ram_percentage']}%)")
                
                # Check disk data is realistic
                if data.get('disk_total', 0) > 0:
                    real_data_indicators.append(f"Disk: {data['disk_total']}GB ({data['disk_percentage']}%)")
                
                # Check processes list
                if data.get('top_processes') and len(data['top_processes']) > 0:
                    real_data_indicators.append(f"Processes: {len(data['top_processes'])} running")
                
                # Check uptime is realistic
                if data.get('uptime') and data['uptime'] != '0:00:00':
                    real_data_indicators.append(f"Uptime: {data['uptime']}")
                
                if len(real_data_indicators) >= 4:  # At least 4 real data points
                    self.log_test("System Info Endpoint", True, 
                                f"Real system data detected: {', '.join(real_data_indicators)}")
                    return True
                else:
                    self.log_test("System Info Endpoint", False, 
                                error=f"Insufficient real data indicators: {real_data_indicators}")
                    return False
            else:
                self.log_test("System Info Endpoint", False, error=f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("System Info Endpoint", False, error=str(e))
            return False

    def test_ping_functionality(self):
        """Test POST /api/ping with target="8.8.8.8" and count=4"""
        try:
            data = {
                'target': '8.8.8.8',
                'count': 4
            }
            
            response = self.session.post(f"{BACKEND_URL}/ping", data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify real ping data
                real_ping_indicators = []
                
                # Check target is correct
                if result.get('target') == '8.8.8.8':
                    real_ping_indicators.append("Target: 8.8.8.8")
                
                # Check packet counts
                if result.get('packets_sent') == 4:
                    real_ping_indicators.append(f"Sent: {result['packets_sent']}")
                
                # Check we got some response
                if result.get('packets_received', 0) > 0:
                    real_ping_indicators.append(f"Received: {result['packets_received']}")
                
                # Check response time is realistic
                if result.get('response_time') and result['response_time'] > 0:
                    real_ping_indicators.append(f"Response time: {result['response_time']:.2f}ms")
                
                # Check packet loss calculation
                if 'packet_loss' in result:
                    real_ping_indicators.append(f"Packet loss: {result['packet_loss']}%")
                
                if len(real_ping_indicators) >= 4:
                    self.log_test("Ping Functionality", True, 
                                f"Real ping data: {', '.join(real_ping_indicators)}")
                    return True
                else:
                    self.log_test("Ping Functionality", False, 
                                error=f"Insufficient real ping data: {real_ping_indicators}")
                    return False
            else:
                self.log_test("Ping Functionality", False, error=f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Ping Functionality", False, error=str(e))
            return False

    def test_port_scanning(self):
        """Test POST /api/scan-ports with target="google.com" and ports="common"""
        try:
            data = {
                'target': 'google.com',
                'ports': 'common'
            }
            
            response = self.session.post(f"{BACKEND_URL}/scan-ports", data=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify real port scan data
                real_scan_indicators = []
                
                # Check target is correct
                if result.get('target') == 'google.com':
                    real_scan_indicators.append("Target: google.com")
                
                # Check we have port data
                open_ports = result.get('open_ports', [])
                closed_ports = result.get('closed_ports', [])
                
                if isinstance(open_ports, list) and isinstance(closed_ports, list):
                    total_ports = len(open_ports) + len(closed_ports)
                    real_scan_indicators.append(f"Total ports scanned: {total_ports}")
                    
                    if len(open_ports) > 0:
                        # Google should have some open ports (80, 443)
                        open_port_numbers = [port['port'] for port in open_ports if isinstance(port, dict)]
                        real_scan_indicators.append(f"Open ports: {open_port_numbers}")
                    
                    real_scan_indicators.append(f"Closed ports: {len(closed_ports)}")
                
                # Check scan duration is realistic
                if result.get('scan_duration', 0) > 0:
                    real_scan_indicators.append(f"Scan duration: {result['scan_duration']:.2f}s")
                
                if len(real_scan_indicators) >= 3:
                    self.log_test("Port Scanning", True, 
                                f"Real port scan data: {', '.join(real_scan_indicators)}")
                    return True
                else:
                    self.log_test("Port Scanning", False, 
                                error=f"Insufficient real scan data: {real_scan_indicators}")
                    return False
            else:
                self.log_test("Port Scanning", False, error=f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Port Scanning", False, error=str(e))
            return False

    def test_password_generation(self):
        """Test POST /api/generate-password with length=16"""
        try:
            data = {
                'length': 16,
                'include_uppercase': True,
                'include_lowercase': True,
                'include_numbers': True,
                'include_special': True
            }
            
            response = self.session.post(f"{BACKEND_URL}/generate-password", data=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify strong password generation
                password_indicators = []
                
                # Check password length
                password = result.get('password', '')
                if len(password) == 16:
                    password_indicators.append(f"Length: {len(password)}")
                
                # Check character types
                has_upper = result.get('has_uppercase', False)
                has_lower = result.get('has_lowercase', False)
                has_numbers = result.get('has_numbers', False)
                has_special = result.get('has_special', False)
                
                if has_upper:
                    password_indicators.append("Has uppercase")
                if has_lower:
                    password_indicators.append("Has lowercase")
                if has_numbers:
                    password_indicators.append("Has numbers")
                if has_special:
                    password_indicators.append("Has special chars")
                
                # Check strength
                strength = result.get('strength', '')
                strength_score = result.get('strength_score', 0)
                
                if strength and strength_score > 0:
                    password_indicators.append(f"Strength: {strength} ({strength_score})")
                
                # Verify password is not placeholder
                if password and password != 'password123' and len(set(password)) > 8:  # Good entropy
                    password_indicators.append(f"Password: {password[:4]}...{password[-2:]}")
                
                if len(password_indicators) >= 6 and has_upper and has_lower and has_numbers and has_special:
                    self.log_test("Password Generation", True, 
                                f"Strong password generated: {', '.join(password_indicators)}")
                    return True
                else:
                    self.log_test("Password Generation", False, 
                                error=f"Weak password or missing features: {password_indicators}")
                    return False
            else:
                self.log_test("Password Generation", False, error=f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Password Generation", False, error=str(e))
            return False

    def run_focused_tests(self):
        """Run the specific tests requested in the review"""
        print("=" * 70)
        print("IT Hero Backend API - Focused Testing")
        print("=" * 70)
        print(f"Testing backend at: {BACKEND_URL}")
        print()
        print("Testing specific scenarios as requested:")
        print("1. GET /api/system-info - verify real system data")
        print("2. POST /api/ping with target='8.8.8.8' and count=4")
        print("3. POST /api/scan-ports with target='google.com' and ports='common'")
        print("4. POST /api/generate-password with length=16")
        print()
        
        # Run the specific tests
        tests = [
            ("System Information", self.test_system_info_endpoint),
            ("Ping Functionality", self.test_ping_functionality),
            ("Port Scanning", self.test_port_scanning),
            ("Password Generation", self.test_password_generation)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"Running {test_name} test...")
            if test_func():
                passed += 1
        
        print("=" * 70)
        print(f"FOCUSED TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 70)
        
        return passed, total, self.test_results

if __name__ == "__main__":
    tester = FocusedTester()
    passed, total, results = tester.run_focused_tests()
    
    # Print summary
    print("\nTest Results Summary:")
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['test']}")
        if result['details']:
            print(f"   {result['details']}")
        if result['error']:
            print(f"   Error: {result['error']}")
    
    # Exit with appropriate code
    exit(0 if passed == total else 1)