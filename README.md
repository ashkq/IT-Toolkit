# 🦸‍♂️ IT Hero 🛠️ - IT Security & Diagnostic Toolkit

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

## 🚀 Easy Installation

### For Regular Users (Recommended)
**Just download and run - no technical knowledge required!**

1. **Download the latest version:**
   - **Windows**: Download `IT-Hero-Setup.exe`
   - **macOS**: Download `IT-Hero.dmg`
   - **Linux**: Download `IT-Hero.AppImage`

2. **Install and run:**
   - **Windows**: Double-click the `.exe` file and follow the installer
   - **macOS**: Open the `.dmg` file and drag IT Hero to Applications
   - **Linux**: Make the `.AppImage` executable and double-click

3. **That's it!** IT Hero will start automatically and show your computer's real information.

### For Developers (Advanced Setup)
If you want to run from source code or contribute to development:

<details>
<summary>Click to expand developer setup instructions</summary>

#### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

#### Installation Steps
1. Clone the repository
2. Install backend dependencies: `cd backend && pip install -r requirements.txt`
3. Install frontend dependencies: `cd frontend && yarn install`
4. Set up environment files (see `.env.example` files)
5. Start MongoDB
6. Run backend: `cd backend && uvicorn server:app --host 0.0.0.0 --port 8001`
7. Run frontend: `cd frontend && yarn start`

</details>

## ⚙️ API Keys (Optional Enhancement)

To enable enhanced scanning features, you can add API keys:

### VirusTotal API Key (for malware scanning)
1. Go to [VirusTotal](https://www.virustotal.com/)
2. Create a free account and get an API key
3. In the app settings, add your VirusTotal API key

### Google Safe Browsing API Key (for website security)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Safe Browsing API and create an API key
3. In the app settings, add your Google API key

## 📝 Important Notes

### System Information Accuracy ⚠️
**Your Privacy & Data:**

- ✅ **When you download and run IT Hero locally**: Shows YOUR actual computer's information (CPU, memory, processes, network stats)
- ✅ **All data stays on your computer**: Nothing is sent to external servers
- ✅ **Your search history is private**: Scan history is stored locally on your device only

**Current Preview Note:** If you're viewing this on a web preview, you're seeing the server's information (Linux system with 62GB RAM). When you download IT Hero, you'll see your actual Windows/Mac/Linux computer's real specs.

### Privacy & Security
- All scanning functions work offline by default
- Optional API keys enhance scanning but are not required
- No personal data is collected or transmitted
- Search history is stored locally on your device only

## 🛠️ Building Your Own Executable

Want to create your own custom build?

1. Install development dependencies
2. Run `yarn build-desktop`
3. Find your executable in the `dist` folder

## 🆘 Need Help?

**Can't find the download files?** 
- Check the [Releases](../../releases) page for the latest downloads

**Having issues?**
- Make sure you have the latest version
- Try running as administrator (Windows) or with elevated permissions

**For technical support:**
- Open an issue on GitHub
- Check our troubleshooting guide

---

**Made with ❤️ for IT Heroes everywhere! 🦸‍♂️**

*No command line needed. No scripts to run. Just download and go!*
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
