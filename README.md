# 3D Photo Gallery & Vietnamese Calendar

Website đa chức năng với 3D photo gallery, quản lý ảnh, và lịch Việt Nam, host trên GitHub Pages.

![Status](https://img.shields.io/badge/Status-Active-success)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Tính năng

### 📸 3D Photo Gallery
- ✨ **3D Gallery**: Hiển thị ảnh trong không gian 3D với Three.js
- ☁️ **Cloudinary CDN**: Load ảnh nhanh, không CORS
- 🎨 **Multiple Layouts**: Sphere, Grid, Wave, Helix, DNA
- 🖱️ **Interactive**: Xoay, zoom, click để xem full size
- 📱 **Mobile Support**: Touch-friendly, responsive design
- ⚡ **Auto Optimization**: Cloudinary tự động optimize ảnh

### 🗓️ Vietnamese Calendar
- 📅 **Dual Calendar**: Hiển thị cả dương lịch và âm lịch
- 🎊 **Holiday Marking**: Tự động đánh dấu ngày lễ Việt Nam
- 🐉 **Zodiac Info**: Hiển thị Can Chi và con giáp
- ⏰ **Tet Countdown**: Đếm ngược đến Tết Nguyên Đán
- ✨ **Beautiful UI**: Gradient, animations, particle effects
- 📱 **Responsive**: Tối ưu cho cả desktop và mobile

### 🎛️ Image Management
- 📤 **Easy Upload**: Drag & drop hoặc click để upload
- 👁️ **Preview**: Xem trước ảnh trước khi upload
- 🗑️ **Delete**: Xóa ảnh không cần thiết
- 📋 **Grid View**: Xem tất cả ảnh dạng lưới
- 📱 **Mobile Friendly**: Upload từ camera hoặc thư viện

### 🔊 Voice Explorer
- 🎤 **Voice List**: Xem tất cả voices có sẵn trên thiết bị
- 🔍 **Filter**: Lọc theo ngôn ngữ
- 📊 **Export**: Export danh sách ra Excel (CSV/XLSX)
- 🌍 **Language Names**: Hiển thị tên ngôn ngữ bằng tiếng Việt

---

## 🧭 Navigation

Website có 4 trang chính:

1. **🏠 Home (index.html)**: 3D Photo Gallery
   - Xem ảnh trong không gian 3D
   - Multiple layouts và effects
   - Touch-friendly controls

2. **🗓️ Calendar (calendar.html)**: Vietnamese Calendar
   - Lịch Việt Nam với âm dương
   - Đánh dấu ngày lễ
   - Countdown đến Tết

3. **🎛️ Manage (manage.html)**: Image Management
   - Upload ảnh lên Cloudinary
   - Preview và delete
   - Drag & drop support

4. **🔊 Voices (voices.html)**: Voice Explorer
   - Xem danh sách voices
   - Filter theo ngôn ngữ
   - Export ra Excel

Sử dụng menu hamburger (☰) ở góc trên bên trái để di chuyển giữa các trang.

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

### 📸 3D Gallery Controls
- 🖱️ **Drag**: Xoay camera
- 🔍 **Scroll**: Zoom in/out
- 👆 **Click/Tap**: Xem ảnh full size
- ⌨️ **Arrow keys**: Navigate ảnh
- ⌨️ **ESC**: Đóng modal
- 🔄 **Auto Rotate**: Tự động xoay gallery và từng ảnh

### 🎨 Gallery Layouts
- **Sphere**: Hình cầu 3D
- **Grid**: Lưới vuông
- **Wave**: Sóng lượn
- **Helix**: Xoắn ốc kép
- **DNA**: Chuỗi xoắn kép

### 🗓️ Calendar Features
- 📅 **Click vào ngày**: Xem thông tin chi tiết (dương lịch, âm lịch, Can Chi)
- ◀️ **Previous/Next**: Chuyển tháng
- 📍 **Today**: Nhảy về tháng hiện tại
- 🎊 **Holiday Icons**: Emoji đánh dấu ngày lễ
- ⏰ **Live Countdown**: Đếm ngược thời gian thực đến Tết

### 🎛️ Image Management
- 📤 **Upload**: Drag & drop hoặc click "Select Files"
- 👁️ **Preview**: Xem trước và xóa ảnh không mong muốn
- ✅ **Confirm**: Click "Upload All" để upload
- 🗑️ **Delete**: Click nút X trên mỗi ảnh để xóa
- 🔍 **View**: Click vào ảnh trong preview để xem full size

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

### ✅ Image Formats
**Gallery & Upload:**
- JPG/JPEG (khuyến nghị - best compatibility)
- PNG (supports transparency)
- GIF (animated supported)
- WebP (modern format, smaller size)
- BMP (basic format)
- HEIC/HEIF (Apple format - auto converted by Cloudinary)

### 📊 Export Formats
**Voice List Export:**
- CSV (Excel compatible)
- XLSX (Advanced Excel format with SheetJS)

### ❌ Không hỗ trợ
- RAW formats (CR2, NEF, ARW, etc.)
- TIFF (too large for web)

**Tip:** Cloudinary tự động convert và optimize mọi format về WebP/JPEG tùy browser!

---

## 🐛 Troubleshooting

### 📸 Gallery Issues

**Ảnh không hiển thị?**
1. ✅ Kiểm tra Cloud Name đúng chưa
2. ✅ Kiểm tra Folder Name đúng chưa
3. ✅ Mở Console (F12) xem lỗi gì

**Không click được ảnh trên mobile?**
1. ✅ Đảm bảo đã cập nhật code mới nhất
2. ✅ Touch events đã được implement

**Muốn thêm ảnh mới?**
1. Upload vào Cloudinary folder hoặc dùng trang Manage
2. Reload trang - tự động hiện!

### 🗓️ Calendar Issues

**Ngày lễ không hiển thị?**
1. ✅ Kiểm tra file `js/calendar.js` có danh sách holidays
2. ✅ Reload trang để cập nhật

**Popup không đóng được?**
1. ✅ Click vào nút X hoặc click ra ngoài popup
2. ✅ Đảm bảo JavaScript không bị lỗi (F12 Console)

### 🎛️ Upload Issues

**Không upload được trên iPhone?**
1. ✅ Đảm bảo file input không có `capture="environment"`
2. ✅ Chọn "Photo Library" thay vì "Take Photo"

**Upload bị duplicate file picker?**
1. ✅ Đã fix: event propagation được xử lý đúng

### 🔊 Voice Issues

**Không có voices?**
1. ✅ Đợi vài giây để browser load voices
2. ✅ Thử reload trang
3. ✅ Một số browser có ít voices hơn

### 🌐 General Issues

**Không chạy được local?**
1. ✅ Phải chạy qua HTTP server (không mở trực tiếp HTML)
2. ✅ Dùng `python -m http.server` hoặc `npx http-server`

**Lỗi CORS?**
1. ✅ Cloudinary không có CORS issues
2. ✅ Đảm bảo chạy qua HTTP server khi test local

---

## 📁 Cấu trúc Project

```
phamvantrinh99.github.io/
├── index.html              # 3D Gallery page
├── calendar.html           # Vietnamese Calendar page
├── manage.html             # Image Management page
├── voices.html             # Voice Explorer page
├── css/
│   ├── style.css          # Main styles
│   ├── calendar.css       # Calendar styles
│   ├── manage.css         # Management styles
│   └── voices.css         # Voice explorer styles
├── js/
│   ├── config.js          # Cloudinary configuration
│   ├── cloudinary.js      # Cloudinary API integration
│   ├── gallery3d.js       # Three.js 3D engine
│   ├── main.js            # Gallery app logic
│   ├── calendar.js        # Calendar logic
│   ├── lunar.js           # Lunar calendar conversion
│   ├── particles-calendar.js  # Particle effects
│   ├── manage.js          # Image management logic
│   └── voices.js          # Voice explorer logic
├── README.md              # This file
└── TECHNICAL.md           # Technical documentation
```

---

## 🛠️ Công nghệ

### Core Technologies
- **Three.js r128**: 3D rendering engine
- **OrbitControls**: Camera interaction
- **Cloudinary API**: Image hosting & CDN
- **Web Speech API**: Voice synthesis
- **Vanilla JavaScript**: No frameworks needed
- **GitHub Pages**: Free hosting

### Calendar Features
- **Lunar Calendar Algorithm**: Ho Ngoc Duc's algorithm
- **CSS Animations**: Smooth transitions & effects
- **Particle System**: Custom CSS/JS particle effects
- **Responsive Design**: Mobile-first approach

### Libraries Used
- **SheetJS (xlsx)**: Excel export functionality
- **Intl.DisplayNames**: Language name localization

---

## 🎨 Feature Highlights

### 🗓️ Vietnamese Calendar Features

**Dual Calendar System:**
- Hiển thị đồng thời dương lịch và âm lịch
- Tự động convert chính xác theo thuật toán Ho Ngoc Duc
- Hiển thị Can Chi (Giáp Tý, Ất Sửu, etc.)
- Hiển thị con giáp (Tý, Sửu, Dần, etc.)

**Vietnamese Holidays:**
- **Solar Holidays**: Tết Dương lịch, 30/4, 2/9, Giáng sinh, etc.
- **Lunar Holidays**: Tết Nguyên Đán, Tết Trung Thu, Vu Lan, etc.
- **Special Days**: Giỗ Tổ Hùng Vương, Phật Đản, etc.

**Interactive Features:**
- Click vào ngày để xem popup thông tin chi tiết
- Countdown đến Tết với animation đẹp mắt
- Particle effects bay lượn trên background
- Responsive design cho mobile và desktop

**UI/UX:**
- Glass-morphism design
- Smooth animations và transitions
- Color-coded days (today, weekend, holiday)
- Icon indicators cho ngày lễ

### ☁️ Cloudinary Features

**Auto Optimization:**
```
w_800,q_auto,f_auto  → Width 800px, quality auto, format auto
```

**On-the-fly Transformations:**
```
/w_500,h_500,c_fill/  → Crop to 500x500
/e_blur:300/          → Blur effect
/e_grayscale/         → Grayscale
```

**Responsive Images:**
Cloudinary tự động chọn format tốt nhất (WebP cho Chrome, JPEG cho Safari)

**Upload Features:**
- Drag & drop support
- Preview before upload
- Individual image removal
- Progress tracking
- Error handling

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

## 🎯 Roadmap

### Planned Features
- [ ] Weather integration
- [ ] Photo filters and effects
- [ ] Calendar event creation
- [ ] Social sharing
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

### Recently Added ✅
- [x] Vietnamese Calendar with lunar dates
- [x] Holiday marking system
- [x] Tet countdown
- [x] Image upload with preview
- [x] Voice explorer with export
- [x] Mobile touch support
- [x] Particle effects
- [x] Multiple 3D layouts

---

## 🌟 Credits

- **Three.js**: 3D rendering library
- **Cloudinary**: Image hosting and CDN
- **Ho Ngoc Duc**: Lunar calendar algorithm
- **SheetJS**: Excel export functionality

---

## 📊 Stats

- **Total Pages**: 4 (Gallery, Calendar, Manage, Voices)
- **Supported Languages**: Vietnamese, English
- **Image Formats**: 6+ formats
- **3D Layouts**: 5 layouts
- **Holidays**: 15+ Vietnamese holidays
- **Free Tier**: 25GB storage, 25GB bandwidth/month

---

**Made with ❤️ by phamvantrinh99**

**Live Demo**: [https://phamvantrinh99.github.io](https://phamvantrinh99.github.io)
