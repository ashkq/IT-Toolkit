# 🦸‍♂️ IT Hero Desktop Installer Instructions

## 🎯 **FOR USERS: How to Install IT Hero**

### **Step 1: Download the Right File**
Download the appropriate installer for your operating system:

- **🪟 Windows Users**: Download `IT-Hero-Setup.exe`
- **🍎 macOS Users**: Download `IT-Hero.dmg`
- **🐧 Linux Users**: Download `IT-Hero.AppImage`

### **Step 2: Install IT Hero**
1. **Double-click** the downloaded file
2. **Follow the installation prompts**
3. **That's it!** IT Hero is now installed on your computer

### **Step 3: Run IT Hero**
- **Windows**: Look for "IT Hero" in your Start Menu or Desktop
- **macOS**: Look for "IT Hero" in your Applications folder
- **Linux**: The AppImage can be run directly or installed to your system

### **✨ What Happens When You Run IT Hero:**
- The app starts automatically in the background
- Your default web browser opens to IT Hero
- All system tools are ready to use immediately
- **No technical setup required!**

---

## 🛠️ **FOR DEVELOPERS: How to Build the Installer**

### **Before Building:**
1. **Add Your App Icon** (see instructions below)
2. **Test the application** to ensure it works properly

### **Build the Installer:**

**Option 1: Use the Build Script (Recommended)**
```bash
# Linux/macOS
./BUILD_INSTALLER.sh

# Windows
BUILD_INSTALLER.bat
```

**Option 2: Manual Build**
```bash
cd frontend
npm install electron electron-builder express --save-dev
npm run build
cp package-desktop.json package.json
npx electron-builder --publish=never
```

### **📁 Output Files:**
After building, you'll find the installer files in `frontend/dist/`:
- `IT-Hero-Setup.exe` (Windows installer)
- `IT-Hero.dmg` (macOS installer)
- `IT-Hero.AppImage` (Linux installer)

---


### **User Experience:**
- ✅ **No command line required**
- ✅ **No technical knowledge needed**
- ✅ **Automatic background servers**
- ✅ **Opens in familiar web browser**
- ✅ **Professional desktop icon**

---

## 🔧 **Technical Details**

### **What the Installer Does:**
1. **Bundles everything**: React frontend, Python backend, all dependencies
2. **Creates shortcuts**: Desktop and Start Menu entries
3. **Handles startup**: Automatically starts servers when app launches
4. **Browser integration**: Opens IT Hero in default browser
5. **Background operation**: Servers run hidden from user

### **System Requirements:**
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later
- **Linux**: Most modern distributions

### **No Additional Installation Required:**
- ✅ Python runtime included
- ✅ Node.js runtime included
- ✅ All dependencies bundled
- ✅ MongoDB embedded (if needed)

---
