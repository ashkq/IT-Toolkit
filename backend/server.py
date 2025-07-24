from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
import psutil
import platform
import socket
import ssl
import hashlib
import subprocess
import re
import tempfile
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor
import requests
import vt
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json
import time
import ipaddress
import secrets
import string
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create the main app
app = FastAPI(title="🦸‍♂️IT Hero 🛠", description="IT Security & Diagnostic Toolkit - Your Complete IT Superhero Solution")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=4)

# Pydantic Models
class SystemInfo(BaseModel):
    os_name: str
    os_version: str
    hostname: str
    local_ip: str
    public_ip: Optional[str]
    ram_total: float
    ram_used: float
    ram_percentage: float
    disk_total: float
    disk_used: float
    disk_free: float
    disk_percentage: float
    uptime: str
    top_processes: List[Dict[str, Any]]

class ScanResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_size: int
    file_hash: str
    risk_level: str
    suspicious_indicators: List[str]
    virustotal_result: Optional[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SecurityReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    https_valid: bool
    ssl_cert_info: Dict[str, Any]
    http_headers: Dict[str, str]
    redirects: List[str]
    safe_browsing_result: Optional[Dict[str, Any]]
    security_score: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PortScanResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    open_ports: List[Dict[str, Any]]
    closed_ports: List[int]
    scan_duration: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PingResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    success: bool
    response_time: Optional[float]
    packets_sent: int
    packets_received: int
    packet_loss: float
    error_message: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TracerouteResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    hops: List[Dict[str, Any]]
    total_hops: int
    success: bool
    error_message: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SubnetCalculation(BaseModel):
    ip_address: str
    subnet_mask: str
    cidr_notation: str
    network_address: str
    broadcast_address: str
    host_range: Dict[str, str]
    total_hosts: int
    usable_hosts: int
    subnet_class: str

class PasswordGeneration(BaseModel):
    password: str
    strength: str
    strength_score: int
    length: int
    has_uppercase: bool
    has_lowercase: bool
    has_numbers: bool
    has_special: bool

# Helper functions
def get_system_info():
    """Collect comprehensive system information"""
    try:
        # Basic system info
        os_name = platform.system()
        os_version = platform.version()
        hostname = socket.gethostname()
        
        # Network info
        local_ip = socket.gethostbyname(hostname)
        public_ip = None
        try:
            public_ip = requests.get('https://api.ipify.org', timeout=5).text
        except:
            pass
        
        # Memory info
        memory = psutil.virtual_memory()
        ram_total = round(memory.total / (1024**3), 2)  # GB
        ram_used = round(memory.used / (1024**3), 2)
        ram_percentage = memory.percent
        
        # Disk info
        disk = psutil.disk_usage('/')
        disk_total = round(disk.total / (1024**3), 2)  # GB
        disk_used = round(disk.used / (1024**3), 2)
        disk_free = round(disk.free / (1024**3), 2)
        disk_percentage = round((disk.used / disk.total) * 100, 1)
        
        # Uptime
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = str(datetime.now() - boot_time).split('.')[0]
        
        # Top 5 CPU processes
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'cpu_percent': round(proc.info['cpu_percent'], 1),
                    'memory_percent': round(proc.info['memory_percent'], 1)
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        top_processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:5]
        
        return SystemInfo(
            os_name=os_name,
            os_version=os_version,
            hostname=hostname,
            local_ip=local_ip,
            public_ip=public_ip,
            ram_total=ram_total,
            ram_used=ram_used,
            ram_percentage=ram_percentage,
            disk_total=disk_total,
            disk_used=disk_used,
            disk_free=disk_free,
            disk_percentage=disk_percentage,
            uptime=uptime,
            top_processes=top_processes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to collect system info: {str(e)}")

def analyze_file_content(file_content: bytes, filename: str) -> tuple:
    """Analyze file for suspicious content"""
    suspicious_indicators = []
    risk_level = "Safe"
    
    # Check file extension
    suspicious_extensions = ['.exe', '.bat', '.ps1', '.scr', '.com', '.pif', '.cmd', '.vbs', '.js']
    if any(filename.lower().endswith(ext) for ext in suspicious_extensions):
        suspicious_indicators.append(f"Suspicious file extension: {Path(filename).suffix}")
        risk_level = "High Risk"
    
    # Check file content for suspicious strings
    content_str = str(file_content, errors='ignore').lower()
    suspicious_patterns = [
        'powershell', 'cmd.exe', 'base64', 'wget', 'curl', 'download',
        'eval(', 'exec(', 'system(', 'shell_exec', 'passthru',
        'malware', 'virus', 'trojan', 'backdoor', 'keylogger'
    ]
    
    for pattern in suspicious_patterns:
        if pattern in content_str:
            suspicious_indicators.append(f"Suspicious content: '{pattern}' found")
            if risk_level == "Safe":
                risk_level = "Medium Risk"
    
    # Calculate file hash
    file_hash = hashlib.sha256(file_content).hexdigest()
    
    return suspicious_indicators, risk_level, file_hash

async def scan_with_virustotal(file_content: bytes, api_key: str) -> dict:
    """Scan file with VirusTotal API"""
    try:
        def _scan():
            with vt.Client(api_key) as client:
                # Upload file and wait for analysis
                analysis = client.scan_file(file_content, wait_for_completion=True)
                return client.get_object(f"/analyses/{analysis.id}").to_dict()
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, _scan)
        return result
    except Exception as e:
        return {"error": str(e)}

def check_website_security(url: str) -> dict:
    """Check website security (HTTPS, headers, etc.)"""
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Make request and follow redirects
        session = requests.Session()
        response = session.get(url, timeout=10, allow_redirects=True)
        
        # Check HTTPS
        https_valid = url.startswith('https://')
        
        # SSL Certificate info
        ssl_info = {}
        if https_valid:
            try:
                hostname = url.split('//')[1].split('/')[0]
                context = ssl.create_default_context()
                with socket.create_connection((hostname, 443), timeout=5) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        cert = ssock.getpeercert()
                        ssl_info = {
                            'subject': dict(x[0] for x in cert['subject']),
                            'issuer': dict(x[0] for x in cert['issuer']),
                            'version': cert['version'],
                            'notAfter': cert['notAfter'],
                            'notBefore': cert['notBefore']
                        }
            except Exception as e:
                ssl_info = {'error': f'Could not retrieve SSL certificate: {str(e)}'}
        
        # HTTP Headers - normalize to lowercase for checking
        headers = dict(response.headers)
        headers_lower = {k.lower(): v for k, v in headers.items()}
        
        # Redirect history
        redirects = [resp.url for resp in response.history]
        
        # Security score calculation
        security_score = 0
        if https_valid:
            security_score += 30
        if 'strict-transport-security' in headers_lower:
            security_score += 20
        if 'x-frame-options' in headers_lower:
            security_score += 15
        if 'x-content-type-options' in headers_lower:
            security_score += 15
        if 'content-security-policy' in headers_lower:
            security_score += 20
        
        return {
            'https_valid': https_valid,
            'ssl_cert_info': ssl_info,
            'http_headers': headers,
            'redirects': redirects,
            'security_score': security_score,
            'status_code': response.status_code
        }
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout - website took too long to respond'}
    except requests.exceptions.ConnectionError:
        return {'error': 'Connection failed - unable to reach website'}
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {str(e)}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

async def check_safe_browsing(url: str, api_key: str) -> dict:
    """Check URL with Google Safe Browsing API"""
    try:
        def _check():
            service = build("safebrowsing", "v4", developerKey=api_key)
            body = {
                "client": {"clientId": "security-toolkit", "clientVersion": "1.0.0"},
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}],
                },
            }
            response = service.threatMatches().find(body=body).execute()
            return response.get("matches", [])
        
        loop = asyncio.get_event_loop()
        threats = await loop.run_in_executor(executor, _check)
        return {"threats": threats, "safe": len(threats) == 0}
    except Exception as e:
        return {"error": str(e)}

def scan_ports(target: str, ports: List[int]) -> dict:
    """Scan ports on target host"""
    try:
        start_time = datetime.now()
        open_ports = []
        closed_ports = []
        
        # Resolve hostname if needed
        try:
            target_ip = socket.gethostbyname(target)
        except socket.gaierror:
            return {"error": f"Could not resolve hostname: {target}"}
        
        # Common service names
        service_names = {
            21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
            80: "HTTP", 110: "POP3", 135: "RPC", 139: "NetBIOS", 143: "IMAP",
            443: "HTTPS", 993: "IMAPS", 995: "POP3S", 1433: "MSSQL", 3306: "MySQL",
            3389: "RDP", 5432: "PostgreSQL", 5900: "VNC", 8080: "HTTP-Alt", 8443: "HTTPS-Alt"
        }
        
        for port in ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)  # Increased timeout slightly
                result = sock.connect_ex((target_ip, port))
                
                if result == 0:
                    service = service_names.get(port, "Unknown")
                    open_ports.append({
                        "port": port,
                        "service": service,
                        "status": "open"
                    })
                else:
                    closed_ports.append(port)
                
                sock.close()
            except Exception as e:
                # If individual port scan fails, mark as closed
                closed_ports.append(port)
                continue
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        return {
            "open_ports": open_ports,
            "closed_ports": closed_ports,
            "scan_duration": duration
        }
    except Exception as e:
        return {"error": f"Port scan failed: {str(e)}"}

def ping_host(target: str, count: int = 4) -> dict:
    """Ping a host and return response times"""
    try:
        start_time = time.time()
        
        # Resolve hostname if needed
        try:
            target_ip = socket.gethostbyname(target)
        except socket.gaierror:
            return {"error": f"Could not resolve hostname: {target}"}
        
        # Try system ping first
        try:
            import subprocess
            import platform
            
            # Determine ping command based on OS
            system = platform.system().lower()
            if system == "windows":
                cmd = ["ping", "-n", str(count), target_ip]
            else:
                cmd = ["ping", "-c", str(count), target_ip]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            packets_sent = count
            packets_received = 0
            response_times = []
            
            # Parse ping output
            lines = result.stdout.split('\n')
            for line in lines:
                if 'time=' in line:
                    packets_received += 1
                    # Extract time from line (works for both Windows and Unix)
                    time_match = re.search(r'time[<=]\s*(\d+\.?\d*)', line)
                    if time_match:
                        response_times.append(float(time_match.group(1)))
            
            packet_loss = ((packets_sent - packets_received) / packets_sent) * 100
            avg_response_time = sum(response_times) / len(response_times) if response_times else None
            
            return {
                "success": packets_received > 0,
                "response_time": avg_response_time,
                "packets_sent": packets_sent,
                "packets_received": packets_received,
                "packet_loss": packet_loss,
                "response_times": response_times
            }
            
        except (subprocess.TimeoutExpired, FileNotFoundError, PermissionError):
            # Fall back to socket-based connectivity test
            return _socket_ping(target_ip, count)
            
    except Exception as e:
        return {"error": f"Ping operation failed: {str(e)}"}

def _socket_ping(target_ip: str, count: int) -> dict:
    """Socket-based connectivity test as ping alternative"""
    try:
        packets_sent = count
        packets_received = 0
        response_times = []
        
        for i in range(count):
            try:
                start_time = time.time()
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)  # 5 second timeout
                
                # Try to connect to port 80 (HTTP) as a connectivity test
                result = sock.connect_ex((target_ip, 80))
                end_time = time.time()
                
                if result == 0 or result == 111:  # Connected or connection refused (but reachable)
                    packets_received += 1
                    response_time = (end_time - start_time) * 1000  # Convert to ms
                    response_times.append(response_time)
                
                sock.close()
                time.sleep(0.5)  # Small delay between attempts
                
            except Exception:
                continue
        
        packet_loss = ((packets_sent - packets_received) / packets_sent) * 100
        avg_response_time = sum(response_times) / len(response_times) if response_times else None
        
        return {
            "success": packets_received > 0,
            "response_time": avg_response_time,
            "packets_sent": packets_sent,
            "packets_received": packets_received,
            "packet_loss": packet_loss,
            "response_times": response_times,
            "note": "Socket-based connectivity test (ping command not available)"
        }
        
    except Exception as e:
        return {"error": f"Socket ping failed: {str(e)}"}

def traceroute_host(target: str, max_hops: int = 30) -> dict:
    """Perform traceroute to target host"""
    try:
        # Resolve hostname if needed
        try:
            target_ip = socket.gethostbyname(target)
        except socket.gaierror:
            return {"error": f"Could not resolve hostname: {target}"}
        
        import subprocess
        import platform
        
        system = platform.system().lower()
        if system == "windows":
            cmd = ["tracert", "-h", str(max_hops), target_ip]
        else:
            cmd = ["traceroute", "-m", str(max_hops), target_ip]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            hops = []
            lines = result.stdout.split('\n')
            hop_num = 0
            
            for line in lines:
                if not line.strip():
                    continue
                    
                # Parse hop information (basic parsing)
                if system == "windows":
                    # Windows tracert format
                    if re.match(r'\s*\d+', line):
                        hop_num += 1
                        parts = line.strip().split()
                        if len(parts) >= 4:
                            # Extract IP and timing info
                            ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                            time_matches = re.findall(r'(\d+)\s*ms', line)
                            
                            hop_info = {
                                "hop": hop_num,
                                "ip": ip_match.group(1) if ip_match else "*",
                                "hostname": None,
                                "response_times": [int(t) for t in time_matches[:3]],
                                "avg_time": sum([int(t) for t in time_matches[:3]]) / len(time_matches[:3]) if time_matches else None
                            }
                            hops.append(hop_info)
                else:
                    # Unix traceroute format
                    if re.match(r'\s*\d+', line):
                        hop_num += 1
                        parts = line.strip().split()
                        if len(parts) >= 3:
                            hop_info = {
                                "hop": hop_num,
                                "ip": parts[1] if '(' in parts[1] else parts[1],
                                "hostname": parts[1].split('(')[0] if '(' in parts[1] else None,
                                "response_times": [],
                                "avg_time": None
                            }
                            
                            # Extract timing information
                            time_matches = re.findall(r'(\d+\.?\d*)\s*ms', line)
                            if time_matches:
                                hop_info["response_times"] = [float(t) for t in time_matches]
                                hop_info["avg_time"] = sum([float(t) for t in time_matches]) / len(time_matches)
                            
                            hops.append(hop_info)
            
            return {
                "success": len(hops) > 0,
                "hops": hops,
                "total_hops": len(hops),
                "target_reached": any(hop.get("ip") == target_ip for hop in hops)
            }
            
        except subprocess.TimeoutExpired:
            return {"error": "Traceroute timeout"}
        except Exception as e:
            return {"error": f"Traceroute failed: {str(e)}"}
            
    except Exception as e:
        return {"error": f"Traceroute operation failed: {str(e)}"}

def calculate_subnet(ip_address: str, subnet_mask: str) -> dict:
    """Calculate subnet information"""
    try:
        # Handle CIDR notation
        if '/' in ip_address:
            network = ipaddress.IPv4Network(ip_address, strict=False)
            ip = network.network_address
            prefix_length = network.prefixlen
        else:
            ip = ipaddress.IPv4Address(ip_address)
            
            # Convert subnet mask to prefix length
            if '.' in subnet_mask:
                mask = ipaddress.IPv4Address(subnet_mask)
                prefix_length = ipaddress.IPv4Network(f"0.0.0.0/{mask}").prefixlen
            else:
                prefix_length = int(subnet_mask)
            
            network = ipaddress.IPv4Network(f"{ip}/{prefix_length}", strict=False)
        
        # Calculate subnet information
        network_address = str(network.network_address)
        broadcast_address = str(network.broadcast_address)
        total_hosts = network.num_addresses
        usable_hosts = max(0, total_hosts - 2)  # Subtract network and broadcast
        
        # Determine subnet class
        first_octet = int(str(network.network_address).split('.')[0])
        if 1 <= first_octet <= 126:
            subnet_class = "A"
        elif 128 <= first_octet <= 191:
            subnet_class = "B"
        elif 192 <= first_octet <= 223:
            subnet_class = "C"
        else:
            subnet_class = "Other"
        
        # Host range
        if usable_hosts > 0:
            host_range = {
                "start": str(network.network_address + 1),
                "end": str(network.broadcast_address - 1)
            }
        else:
            host_range = {"start": "N/A", "end": "N/A"}
        
        return {
            "success": True,
            "ip_address": str(ip),
            "subnet_mask": str(network.netmask),
            "cidr_notation": str(network),
            "network_address": network_address,
            "broadcast_address": broadcast_address,
            "host_range": host_range,
            "total_hosts": total_hosts,
            "usable_hosts": usable_hosts,
            "subnet_class": subnet_class
        }
        
    except Exception as e:
        return {"error": f"Subnet calculation failed: {str(e)}"}

def generate_password(length: int = 12, include_uppercase: bool = True, 
                     include_lowercase: bool = True, include_numbers: bool = True, 
                     include_special: bool = True) -> dict:
    """Generate a secure password with strength analysis"""
    try:
        if length < 4:
            return {"error": "Password length must be at least 4 characters"}
        
        # Build character set
        chars = ""
        if include_lowercase:
            chars += string.ascii_lowercase
        if include_uppercase:
            chars += string.ascii_uppercase
        if include_numbers:
            chars += string.digits
        if include_special:
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if not chars:
            return {"error": "At least one character type must be selected"}
        
        # Generate password ensuring at least one character from each selected type
        password = ""
        
        # Add at least one character from each selected type
        if include_lowercase and len(password) < length:
            password += secrets.choice(string.ascii_lowercase)
        if include_uppercase and len(password) < length:
            password += secrets.choice(string.ascii_uppercase)
        if include_numbers and len(password) < length:
            password += secrets.choice(string.digits)
        if include_special and len(password) < length:
            password += secrets.choice("!@#$%^&*()_+-=[]{}|;:,.<>?")
        
        # Fill remaining length with random characters
        while len(password) < length:
            password += secrets.choice(chars)
        
        # Shuffle the password
        password_list = list(password)
        random.shuffle(password_list)
        password = ''.join(password_list)
        
        # Calculate strength
        strength_score = 0
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        # Scoring criteria
        if len(password) >= 8:
            strength_score += 20
        if len(password) >= 12:
            strength_score += 10
        if has_upper:
            strength_score += 15
        if has_lower:
            strength_score += 15
        if has_digit:
            strength_score += 15
        if has_special:
            strength_score += 25
        
        # Determine strength level
        if strength_score >= 80:
            strength = "Very Strong"
        elif strength_score >= 60:
            strength = "Strong"
        elif strength_score >= 40:
            strength = "Medium"
        elif strength_score >= 20:
            strength = "Weak"
        else:
            strength = "Very Weak"
        
        return {
            "success": True,
            "password": password,
            "strength": strength,
            "strength_score": strength_score,
            "length": len(password),
            "has_uppercase": has_upper,
            "has_lowercase": has_lower,
            "has_numbers": has_digit,
            "has_special": has_special
        }
        
    except Exception as e:
        return {"error": f"Password generation failed: {str(e)}"}

# API Routes
@api_router.get("/system-info", response_model=SystemInfo)
async def get_system_info_endpoint():
    """Get comprehensive system information"""
    return get_system_info()

@api_router.post("/scan-file")
@limiter.limit("5/minute")
async def scan_file_endpoint(request: Request, file: UploadFile = File(...)):
    """Scan uploaded file for malware and threats"""
    try:
        if file.size > 50 * 1024 * 1024:  # 50MB limit
            raise HTTPException(status_code=413, detail="File too large (max 50MB)")
        
        # Read file content
        file_content = await file.read()
        
        # Basic analysis
        suspicious_indicators, risk_level, file_hash = analyze_file_content(file_content, file.filename)
        
        # VirusTotal scan
        virustotal_result = None
        vt_api_key = os.getenv('VIRUSTOTAL_API_KEY')
        if vt_api_key:
            virustotal_result = await scan_with_virustotal(file_content, vt_api_key)
            
            # Adjust risk level based on VirusTotal results
            if 'attributes' in virustotal_result and 'stats' in virustotal_result['attributes']:
                stats = virustotal_result['attributes']['stats']
                if stats.get('malicious', 0) > 0:
                    risk_level = "High Risk"
                elif stats.get('suspicious', 0) > 0:
                    risk_level = "Medium Risk"
        
        # Create scan result
        scan_result = ScanResult(
            filename=file.filename,
            file_size=file.size,
            file_hash=file_hash,
            risk_level=risk_level,
            suspicious_indicators=suspicious_indicators,
            virustotal_result=virustotal_result
        )
        
        # Store in database
        await db.scan_results.insert_one(scan_result.dict())
        
        return scan_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/check-website")
@limiter.limit("10/minute")
async def check_website_endpoint(request: Request, url: str = Form(...)):
    """Check website security and reputation"""
    try:
        # Check cache first
        cached = await db.security_reports.find_one({"url": url})
        if cached and cached.get('timestamp', datetime.min) > datetime.utcnow() - timedelta(minutes=30):
            return cached
        
        # Basic security check
        security_data = check_website_security(url)
        
        # Handle errors in security check
        if 'error' in security_data:
            raise HTTPException(status_code=400, detail=f"Failed to check website: {security_data['error']}")
        
        # Safe Browsing check
        safe_browsing_result = None
        sb_api_key = os.getenv('GOOGLE_SAFEBROWSING_API_KEY')
        if sb_api_key:
            try:
                safe_browsing_result = await check_safe_browsing(url, sb_api_key)
                
                # Adjust security score based on Safe Browsing
                if safe_browsing_result and safe_browsing_result.get('safe') is False:
                    security_data['security_score'] = max(0, security_data.get('security_score', 0) - 50)
            except Exception as e:
                # Don't fail the entire request if Safe Browsing fails
                safe_browsing_result = {"error": str(e)}
        
        # Create security report
        security_report = SecurityReport(
            url=url,
            https_valid=security_data.get('https_valid', False),
            ssl_cert_info=security_data.get('ssl_cert_info', {}),
            http_headers=security_data.get('http_headers', {}),
            redirects=security_data.get('redirects', []),
            safe_browsing_result=safe_browsing_result,
            security_score=security_data.get('security_score', 0)
        )
        
        # Store in database (replace existing)
        await db.security_reports.replace_one(
            {"url": url},
            security_report.dict(),
            upsert=True
        )
        
        return security_report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/scan-ports")
@limiter.limit("3/minute")
async def scan_ports_endpoint(request: Request, target: str = Form(...), ports: str = Form(...)):
    """Scan network ports on target host"""
    try:
        # Parse ports
        if ports == "common":
            port_list = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 993, 995, 1433, 3306, 3389, 5432, 5900, 8080, 8443]
        else:
            port_list = [int(p.strip()) for p in ports.split(',') if p.strip().isdigit()]
        
        if len(port_list) > 100:
            raise HTTPException(status_code=400, detail="Too many ports (max 100)")
        
        if not port_list:
            raise HTTPException(status_code=400, detail="No valid ports specified")
        
        # Run port scan in thread pool
        def _scan():
            return scan_ports(target, port_list)
        
        loop = asyncio.get_event_loop()
        scan_data = await loop.run_in_executor(executor, _scan)
        
        if 'error' in scan_data:
            raise HTTPException(status_code=400, detail=scan_data['error'])
        
        # Create port scan result
        port_scan_result = PortScanResult(
            target=target,
            open_ports=scan_data['open_ports'],
            closed_ports=scan_data['closed_ports'],
            scan_duration=scan_data['scan_duration']
        )
        
        # Store in database
        await db.port_scans.insert_one(port_scan_result.dict())
        
        return port_scan_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Historical data endpoints
@api_router.get("/scan-history")
async def get_scan_history():
    """Get file scan history"""
    scans = await db.scan_results.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(length=50)
    return scans

@api_router.get("/security-history")
async def get_security_history():
    """Get website security check history"""
    reports = await db.security_reports.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(length=50)
    return reports

@api_router.get("/port-scan-history")
async def get_port_scan_history():
    """Get port scan history"""
    scans = await db.port_scans.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(length=50)
    return scans

# New Network Tools Endpoints
@api_router.post("/ping")
@limiter.limit("10/minute")
async def ping_endpoint(request: Request, target: str = Form(...), count: int = Form(4)):
    """Ping a host and return response times"""
    try:
        if count > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 pings allowed")
        
        # Run ping in thread pool
        def _ping():
            return ping_host(target, count)
        
        loop = asyncio.get_event_loop()
        ping_data = await loop.run_in_executor(executor, _ping)
        
        if 'error' in ping_data:
            raise HTTPException(status_code=400, detail=ping_data['error'])
        
        # Create ping result
        ping_result = PingResult(
            target=target,
            success=ping_data['success'],
            response_time=ping_data.get('response_time'),
            packets_sent=ping_data['packets_sent'],
            packets_received=ping_data['packets_received'],
            packet_loss=ping_data['packet_loss'],
            error_message=ping_data.get('error_message')
        )
        
        # Store in database
        await db.ping_results.insert_one(ping_result.dict())
        
        return ping_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/traceroute")
@limiter.limit("5/minute")
async def traceroute_endpoint(request: Request, target: str = Form(...), max_hops: int = Form(30)):
    """Perform traceroute to target host"""
    try:
        if max_hops > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 hops allowed")
        
        # Run traceroute in thread pool
        def _traceroute():
            return traceroute_host(target, max_hops)
        
        loop = asyncio.get_event_loop()
        traceroute_data = await loop.run_in_executor(executor, _traceroute)
        
        if 'error' in traceroute_data:
            raise HTTPException(status_code=400, detail=traceroute_data['error'])
        
        # Create traceroute result
        traceroute_result = TracerouteResult(
            target=target,
            hops=traceroute_data['hops'],
            total_hops=traceroute_data['total_hops'],
            success=traceroute_data['success'],
            error_message=traceroute_data.get('error_message')
        )
        
        # Store in database
        await db.traceroute_results.insert_one(traceroute_result.dict())
        
        return traceroute_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/subnet-calculator")
async def subnet_calculator_endpoint(request: Request, ip_address: str = Form(...), subnet_mask: str = Form(...)):
    """Calculate subnet information"""
    try:
        result = calculate_subnet(ip_address, subnet_mask)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return SubnetCalculation(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-password")
async def generate_password_endpoint(
    request: Request,
    length: int = Form(12),
    include_uppercase: bool = Form(True),
    include_lowercase: bool = Form(True),
    include_numbers: bool = Form(True),
    include_special: bool = Form(True)
):
    """Generate a secure password"""
    try:
        if length > 128:
            raise HTTPException(status_code=400, detail="Maximum password length is 128 characters")
        
        result = generate_password(length, include_uppercase, include_lowercase, include_numbers, include_special)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return PasswordGeneration(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# History endpoints for new tools
@api_router.get("/ping-history")
async def get_ping_history():
    """Get ping test history"""
    results = await db.ping_results.find().sort("timestamp", -1).limit(50).to_list(length=50)
    return results

@api_router.get("/traceroute-history")
async def get_traceroute_history():
    """Get traceroute history"""
    results = await db.traceroute_results.find().sort("timestamp", -1).limit(50).to_list(length=50)
    return results

# Health check
@api_router.get("/")
async def root():
    return {"message": "🦸‍♂️IT Hero 🛠 API", "description": "IT Security & Diagnostic Toolkit", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()