# 🦸‍♂️ IT Hero 🔨⚒️ - IT Security & Diagnostic Toolkit

Your Complete IT Superhero Solution for security analysis, network diagnostics, and system monitoring.

## ✨ Features

### 🖥️ System Information & Diagnostics
- Real-time system overview (OS, memory, storage)
- Live process monitoring
- System uptime tracking

### 🌐 Network Utilities  
- **Ping Connection Test** - Test connectivity to any host
- **WiFi Speed Test** - Measure network performance
- **Password Generator** - Create secure passwords

### 🗺️ Traceroute Visualizer
- Visual network route mapping
- Hop-by-hop analysis
- Performance metrics

### 🛡️ Malware & Threat Scanner
- File upload scanning
- VirusTotal integration
- Risk assessment and reporting

### 🔒 Website Security Checker
- HTTPS/SSL certificate analysis
- Security headers validation
- Google Safe Browsing integration

### 🔓 Port Scanner
- Network port scanning
- Service identification
- Security assessment

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd it-hero-toolkit
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   yarn install
   ```

4. **Environment Configuration:**
   
   Create `backend/.env`:
   ```env
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="security_toolkit"
   
   # Optional API Keys for Enhanced Features
   VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
   GOOGLE_SAFEBROWSING_API_KEY=your_google_api_key_here
   ```
   
   Create `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

5. **Start MongoDB:**
   ```bash
   # On macOS with Homebrew:
   brew services start mongodb-community
   
   # On Ubuntu:
   sudo systemctl start mongod
   
   # On Windows:
   net start MongoDB
   ```

6. **Start the Application:**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   yarn start
   ```

7. **Access the Application:**
   Open your browser and go to: `http://localhost:3000`

## ⚙️ API Keys Setup (Optional)

To enable enhanced features, you can obtain free API keys:

### VirusTotal API Key (for malware scanning)
1. Go to [VirusTotal](https://www.virustotal.com/)
2. Create a free account
3. Go to your profile and generate an API key
4. Add it to `backend/.env` as `VIRUSTOTAL_API_KEY`

### Google Safe Browsing API Key (for website security)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Safe Browsing API
4. Create credentials (API Key)
5. Add it to `backend/.env` as `GOOGLE_SAFEBROWSING_API_KEY`

## 🔧 Development

### Project Structure
```
it-hero-toolkit/
├── backend/           # FastAPI backend
│   ├── server.py     # Main application
│   ├── requirements.txt
│   └── .env
├── frontend/          # React frontend
│   ├── src/
│   │   └── App.js    # Main React component
│   ├── package.json
│   └── .env
└── README.md
```

### Technology Stack
- **Backend:** FastAPI, Python 3.11, MongoDB
- **Frontend:** React 19, Tailwind CSS
- **Security:** VirusTotal API, Google Safe Browsing
- **System Analysis:** psutil, platform libraries

## 🛠️ Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the connection string in `backend/.env`

**Port Already in Use:**
- Kill processes using ports 3000 or 8001
- Or change ports in the respective configuration files

**CORS Issues:**
- Ensure backend is running before frontend
- Check that `REACT_APP_BACKEND_URL` points to correct backend URL

**Permission Denied (Linux/macOS):**
- Some system functions may require elevated privileges
- Run with appropriate permissions if needed

## 📝 Important Notes

### System Information Accuracy
- **Web Version:** Shows server system information (hosting environment)
- **Local Version:** Shows actual local machine information when run locally
- The application is designed to run locally for accurate system diagnostics

### Security Features
- All scanning functions work without API keys but have limited capabilities
- API keys enable enhanced scanning with VirusTotal and Google Safe Browsing
- No sensitive data is stored - all operations are performed locally

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for IT Heroes everywhere! 🦸‍♂️**
