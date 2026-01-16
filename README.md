# 3D Photo Gallery from Google Drive

Website hiển thị ảnh từ Google Drive dưới dạng 3D gallery với Three.js, host trên GitHub Pages.

![Status](https://img.shields.io/badge/Status-Active-success)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Tính năng

- ✨ **3D Gallery**: Hiển thị ảnh trong không gian 3D
- ☁️ **Google Drive**: Tự động sync ảnh từ Google Drive
- 🎨 **3 Layouts**: Grid, Circle, Spiral
- 🖱️ **Interactive**: Xoay, zoom, click
- 📱 **Responsive**: Mobile-friendly
- ⚡ **Fast**: Progressive loading

---

## 🚀 Quick Start (10 phút)

### 1. Tạo Google API Key (5 phút)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới
3. Enable **Google Drive API**
4. Tạo **API Key** (Credentials > Create Credentials)
5. Restrict API Key:
   - HTTP referrers: `https://[username].github.io/*`
   - API: Google Drive API only

### 2. Chuẩn bị Google Drive Folder (2 phút)

1. Tạo folder trên Google Drive
2. Upload ảnh (JPG, PNG, GIF, WebP)
3. Share folder: **"Anyone with the link can view"**
4. Copy Folder ID từ URL: `drive.google.com/drive/folders/FOLDER_ID`

### 3. Cấu hình Code (1 phút)

Mở `js/config.js`:

```javascript
GOOGLE_API_KEY: 'YOUR_API_KEY',
GOOGLE_FOLDER_ID: 'YOUR_FOLDER_ID',
```

### 4. Deploy (2 phút)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[username]/[username].github.io.git
git push -u origin main
```

Enable GitHub Pages: Settings > Pages > Source: main

**Done!** Truy cập: `https://[username].github.io`

---

## 🎮 Cách dùng

### Controls
- 🖱️ **Drag**: Xoay camera
- 🔍 **Scroll**: Zoom in/out
- 👆 **Click**: Xem ảnh full size
- ⌨️ **Arrow keys**: Navigate ảnh
- ⌨️ **ESC**: Đóng modal
- 🔽 **Toggle button**: Ẩn/hiện panel

### Layouts
- **Grid**: Lưới 5 cột
- **Circle**: Vòng tròn
- **Spiral**: Xoắn ốc

---

## 📸 Supported Formats

### ✅ Được hỗ trợ:
- JPG/JPEG (khuyến nghị)
- PNG
- GIF
- WebP

### ❌ Không hỗ trợ:
- HEIC/HEIF (Apple format)
- RAW formats
- TIFF

**Convert HEIC:** https://heictojpg.com/

---

## 🐛 Troubleshooting

### Lỗi: "Requests from referer null are blocked"

**Nguyên nhân:** Đang mở file HTML trực tiếp (`file://`)

**Giải pháp:** Chạy HTTP server

```bash
python -m http.server 8000
# Truy cập: http://localhost:8000
```

Và thêm `http://localhost:*` vào API Key restrictions.

### Lỗi: CORS blocked

**Nguyên nhân:** File ảnh không public

**Giải pháp:** 
1. Mở từng ảnh trong folder
2. Share > "Anyone with the link can view"

### Lỗi: 403 Forbidden

**Nguyên nhân:** API Key chưa đúng hoặc chưa có quyền

**Giải pháp:**
1. Check API Key trong `config.js`
2. Check folder và files đều public
3. Đợi 2-3 phút sau khi config API Key

---

## ⚙️ Customization

### Thay đổi màu sắc

`css/style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Thay đổi layout

`js/config.js`:
```javascript
GALLERY: {
    gridColumns: 5,      // Số cột
    circleRadius: 40,    // Bán kính circle
    spacing: 15,         // Khoảng cách
}
```

### Auto-rotate

`js/config.js`:
```javascript
ANIMATION: {
    autoRotate: true,
    autoRotateSpeed: 0.5,
}
```

---

## 📁 Cấu trúc

```
├── index.html           # Main HTML
├── css/style.css        # Styling
├── js/
│   ├── config.js       # ⚙️ Configuration
│   ├── gdrive.js       # Google Drive API
│   ├── gallery3d.js    # Three.js 3D
│   └── main.js         # Controller
└── README.md           # This file
```

---

## 🔧 Development

### Local Testing

```bash
# Start server
python -m http.server 8000

# Add to API Key restrictions
http://localhost:*
```

### Deploy

```bash
git add .
git commit -m "Update"
git push
```

GitHub Pages tự động deploy sau 1-2 phút.

---

## 💡 Tips

1. **Optimize ảnh**: Resize về 1920x1080, compress trước khi upload
2. **Batch upload**: Upload nhiều ảnh cùng lúc vào folder
3. **Auto sync**: Thêm ảnh mới vào folder, website tự động cập nhật
4. **Mobile**: Dùng touch gestures để xoay/zoom

---

## 📚 Tech Stack

- **Three.js r128** - 3D rendering
- **Google Drive API v3** - Cloud storage
- **Vanilla JS** - No frameworks
- **GitHub Pages** - Free hosting

---

## 📄 License

MIT License - Free to use

---

## 👤 Author

**Pham Van Trinh**
- GitHub: [@phamvantrinh99](https://github.com/phamvantrinh99)

---

Made with ❤️ using Three.js and Google Drive API
