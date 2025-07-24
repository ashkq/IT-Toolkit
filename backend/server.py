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
app = FastAPI(title="IT Security & Diagnostic Toolkit", description="Complete security and diagnostic toolkit")
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
    scans = await db.scan_results.find().sort("timestamp", -1).limit(50).to_list(length=50)
    return scans

@api_router.get("/security-history")
async def get_security_history():
    """Get website security check history"""
    reports = await db.security_reports.find().sort("timestamp", -1).limit(50).to_list(length=50)
    return reports

@api_router.get("/port-scan-history")
async def get_port_scan_history():
    """Get port scan history"""
    scans = await db.port_scans.find().sort("timestamp", -1).limit(50).to_list(length=50)
    return scans

# Health check
@api_router.get("/")
async def root():
    return {"message": "IT Security & Diagnostic Toolkit API", "status": "running"}

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