# 3D Photo Gallery from Cloudinary

Website hiển thị ảnh từ Cloudinary dưới dạng 3D gallery với Three.js, host trên GitHub Pages.

![Status](https://img.shields.io/badge/Status-Active-success)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Tính năng

- ✨ **3D Gallery**: Hiển thị ảnh trong không gian 3D
- ☁️ **Cloudinary CDN**: Load ảnh nhanh, không CORS
- 🎨 **3 Layouts**: Grid, Circle, Spiral
- 🖱️ **Interactive**: Xoay, zoom, click
- 📱 **Responsive**: Mobile-friendly
- ⚡ **Auto Optimization**: Cloudinary tự động optimize ảnh

---

## 🚀 Quick Start (5 phút)

### 1. Tạo Cloudinary Account (2 phút)

1. Vào [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up free (25GB storage, 25GB bandwidth/month)
3. Vào Dashboard, copy **Cloud name**

### 2. Upload Ảnh (2 phút)

1. Vào **Media Library**
2. Tạo folder mới (ví dụ: `gallery`)
3. Upload ảnh vào folder
4. **Không cần set public** - Cloudinary tự động public!

### 3. Cấu Hình Code (1 phút)

Mở `js/config.js` và update:

```javascript
CLOUDINARY_CLOUD_NAME: 'your-cloud-name',  // Từ Dashboard
CLOUDINARY_FOLDER_NAME: 'gallery',         // Tên folder của bạn
```

### 4. Test Local

```bash
# Python
python -m http.server 8000

# Hoặc Node.js
npx http-server -p 8000
```

Mở: `http://localhost:8000`

### 5. Deploy GitHub Pages

```bash
git add .
git commit -m "Switch to Cloudinary"
git push
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

## ✨ Tại Sao Cloudinary?

### So Sánh Với Google Drive

| Feature | Google Drive | Cloudinary |
|---------|-------------|------------|
| CORS Issues | ❌ Có | ✅ Không |
| Setup | 😰 Phức tạp | 😊 Đơn giản |
| API Key | ✅ Cần | ❌ Không cần |
| Auto Optimization | ❌ Không | ✅ Có |
| CDN Speed | ⚠️ Chậm | ✅ Nhanh |
| Free Tier | 15GB | 25GB |

### Ưu Điểm Cloudinary

✅ **Không CORS** - Work 100% mọi lúc  
✅ **Không cần API Key** - Chỉ cần Cloud name  
✅ **Auto Optimization** - Tự động resize, compress  
✅ **CDN Global** - Load nhanh khắp thế giới  
✅ **Easy Upload** - Web UI đẹp, dễ dùng  
✅ **Transformations** - Resize, crop on-the-fly  

---

## 📸 Supported Formats

### ✅ Được hỗ trợ:
- JPG/JPEG (khuyến nghị)
- PNG
- GIF
- WebP
- BMP

### ❌ Không hỗ trợ:
- HEIC/HEIF (Apple format)
- RAW formats

**Convert HEIC:** https://heictojpg.com/

---

## 🐛 Troubleshooting

### Ảnh không hiển thị?
1. ✅ Kiểm tra Cloud Name đúng chưa
2. ✅ Kiểm tra Folder Name đúng chưa
3. ✅ Mở Console (F12) xem lỗi gì

### Không chạy được local?
1. ✅ Phải chạy qua HTTP server (không mở trực tiếp HTML)
2. ✅ Dùng `python -m http.server` hoặc `npx http-server`

### Muốn thêm ảnh mới?
1. Upload vào Cloudinary folder
2. Reload trang - tự động hiện!

---

## 📁 Cấu trúc Project

```
phamvantrinh99.github.io/
├── index.html              # Main HTML
├── css/
│   └── style.css          # Styles + animations
├── js/
│   ├── config.js          # Configuration
│   ├── cloudinary.js      # Cloudinary integration
│   ├── gallery3d.js       # Three.js engine
│   └── main.js            # Main app logic
├── README.md              # This file
└── TECHNICAL.md           # Technical docs
```

---

## 🛠️ Công nghệ

- **Three.js r128**: 3D rendering
- **OrbitControls**: Camera controls
- **Cloudinary CDN**: Image hosting & optimization
- **Vanilla JavaScript**: No frameworks
- **GitHub Pages**: Free hosting

---

## 🎨 Cloudinary Features

### Auto Optimization
Ảnh tự động được optimize:
```
w_800,q_auto,f_auto  → Width 800px, quality auto, format auto
```

### On-the-fly Transformations
```
/w_500,h_500,c_fill/  → Crop to 500x500
/e_blur:300/          → Blur effect
/e_grayscale/         → Grayscale
```

### Responsive Images
Cloudinary tự động chọn format tốt nhất (WebP cho Chrome, JPEG cho Safari)

---

## 📄 License

MIT License - Xem [LICENSE](LICENSE)

---

## 🤝 Contributing

Pull requests welcome! Mọi đóng góp đều được hoan nghênh.

---

## 📞 Support

Có vấn đề? Tạo [Issue](https://github.com/phamvantrinh99/phamvantrinh99.github.io/issues)

---

**Made with ❤️ by phamvantrinh99**
