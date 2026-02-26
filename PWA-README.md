# PWA (Progressive Web App) Setup Guide

## ✅ Đã hoàn thành

### 1. **Core PWA Files**
- ✅ `manifest.json` - PWA configuration
- ✅ `service-worker.js` - Offline caching & background sync
- ✅ `js/pwa.js` - PWA install prompt & update handler
- ✅ `css/pwa.css` - PWA UI styling

### 2. **Updated All HTML Files**
- ✅ `index.html` (Dashboard)
- ✅ `gallery.html` (3D Gallery)
- ✅ `manage.html` (Image Management)
- ✅ `voices.html` (Voice Synthesis)
- ✅ `calendar.html` (Vietnamese Calendar)
- ✅ `loto.html` (Lô Tô Digital)

### 3. **PWA Features**

#### 📱 **Install Prompt**
- Tự động hiển thị banner "Install App" khi truy cập
- Click "Install" để thêm app vào home screen
- Hoạt động trên:
  - ✅ Chrome/Edge (Desktop & Mobile)
  - ✅ Safari iOS 11.3+
  - ✅ Android Chrome

#### 🔄 **Offline Support**
- Cache tất cả static files (HTML, CSS, JS)
- Hoạt động offline sau lần truy cập đầu tiên
- Auto-update khi có version mới

#### 🎨 **Native App Experience**
- Fullscreen mode (no browser UI)
- Custom splash screen
- Theme color matching
- iOS safe area support

#### 📲 **iOS Specific**
- Apple Touch Icon
- Status bar styling
- Standalone mode
- Viewport fit for notch devices

## 📋 Cách sử dụng trên iPhone

### Bước 1: Truy cập website
1. Mở Safari trên iPhone
2. Truy cập: `https://phamvantrinh99.github.io`

### Bước 2: Thêm vào Home Screen
1. Nhấn nút **Share** (icon mũi tên lên)
2. Scroll xuống và chọn **"Add to Home Screen"**
3. Đặt tên (mặc định: "Web Apps")
4. Nhấn **"Add"**

### Bước 3: Sử dụng như app
1. Mở app từ Home Screen
2. App sẽ chạy fullscreen (không có Safari UI)
3. Hoạt động offline sau lần đầu load

## 🛠️ Tạo Icons

### Cách 1: Tự động (Recommended)
1. Mở file: `icons/generate-icons.html` trong browser
2. Click **"Download All Icons"**
3. Tất cả icons sẽ được tải về tự động

### Cách 2: Sử dụng tool online
1. Truy cập: https://realfavicongenerator.net/
2. Upload logo (512x512px)
3. Generate và download tất cả sizes

### Required Icon Sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (Apple Touch Icon)
- 192x192
- 384x384
- 512x512

## 🧪 Testing PWA

### Desktop (Chrome/Edge)
1. Mở DevTools (F12)
2. Tab **Application** → **Manifest**
3. Kiểm tra manifest.json
4. Tab **Service Workers** → Kiểm tra SW status
5. Tab **Cache Storage** → Xem cached files

### Mobile (Chrome)
1. Truy cập website
2. Menu → **"Add to Home screen"**
3. Kiểm tra icon và name
4. Mở app và test offline mode

### iOS Safari
1. Truy cập website
2. Share → **"Add to Home Screen"**
3. Mở app từ Home Screen
4. Kiểm tra fullscreen mode

## 🔧 Cấu hình

### Thay đổi Theme Color
Edit `manifest.json`:
```json
"theme_color": "#667eea"
```

### Thay đổi App Name
Edit `manifest.json`:
```json
"name": "Your App Name",
"short_name": "App"
```

### Cache thêm files
Edit `service-worker.js`:
```javascript
const STATIC_ASSETS = [
  // Thêm files cần cache
  '/new-file.js'
];
```

## 📊 PWA Checklist

- ✅ HTTPS (GitHub Pages tự động)
- ✅ manifest.json
- ✅ Service Worker
- ✅ Icons (all sizes)
- ✅ Responsive design
- ✅ Offline fallback
- ✅ iOS meta tags
- ✅ Theme color
- ✅ Viewport fit

## 🚀 Deployment

1. Commit tất cả files:
```bash
git add .
git commit -m "Add PWA support"
git push
```

2. Đợi GitHub Pages deploy (~1-2 phút)

3. Test PWA:
   - Desktop: Chrome DevTools → Lighthouse → PWA audit
   - Mobile: Truy cập và test install

## 📱 Features by Platform

| Feature | Chrome Desktop | Chrome Mobile | Safari iOS |
|---------|---------------|---------------|------------|
| Install Prompt | ✅ | ✅ | Manual (Share) |
| Offline Mode | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ (iOS 16.4+) |
| Background Sync | ✅ | ✅ | ❌ |
| Fullscreen | ✅ | ✅ | ✅ |
| App Shortcuts | ✅ | ✅ | ❌ |

## 🐛 Troubleshooting

### PWA không hiển thị install prompt
- Kiểm tra HTTPS
- Clear cache và reload
- Kiểm tra manifest.json syntax
- Kiểm tra Service Worker đã register

### Offline không hoạt động
- Kiểm tra Service Worker status
- Xem Cache Storage trong DevTools
- Kiểm tra file paths trong STATIC_ASSETS

### iOS không fullscreen
- Kiểm tra meta tag `apple-mobile-web-app-capable`
- Phải thêm từ Home Screen (không phải Safari)
- Reload app sau khi add

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [iOS PWA Support](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

## 🎉 Done!

Website của bạn giờ đây là một Progressive Web App với:
- ✅ Offline support
- ✅ Installable on all devices
- ✅ Native app experience
- ✅ Auto-updates
- ✅ iOS optimized
