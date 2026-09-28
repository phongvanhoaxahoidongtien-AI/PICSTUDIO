# Lumix Studio - Ứng Dụng Chỉnh Sửa Ảnh PWA Offline Đa Nền Tảng

Trình chỉnh sửa ảnh Progressive Web App (PWA) chuyên nghiệp, hoạt động **100% ngoại tuyến (offline)**, bảo mật tối đa (ảnh không bao giờ gửi lên server), tối ưu hóa trải nghiệm mượt mà trên mọi thiết bị: **iOS (Safari)**, Android, Windows, macOS và Linux.

---

## 🌟 Tính Năng Nổi Bật

### 1. Quản lý ảnh & Dự án
- Mở một hoặc nhiều ảnh cùng lúc từ thiết bị hoặc máy ảnh.
- Kéo thả (Drag & Drop) ảnh trực tiếp vào không gian làm việc.
- Hỗ trợ ảnh mẫu chất lượng cao để trải nghiệm ngay không cần tải ảnh lên.
- Lưu dự án và lịch sử chỉnh sửa vào **IndexedDB** cục bộ trên thiết bị.
- Hệ thống **Undo / Redo** vô hạn với snapshot trạng thái theo thời gian thực.
- Phím tắt tiện lợi: `Ctrl+Z` / `Cmd+Z` (Undo), `Ctrl+Y` / `Cmd+Shift+Z` (Redo), `Delete` (Xóa layer).

### 2. Cắt, Xoay & Cân Chỉnh Góc Nghiêng (Crop & Straighten)
- Cắt ảnh tự do hoặc theo các tỉ lệ tiêu chuẩn: `1:1 (Vuông)`, `4:5 (Instagram Feed)`, `9:16 (Story / Reels / TikTok)`, `16:9 (Phong cảnh)`, `4:3`, `3:4`, `Gốc`.
- Lưới hỗ trợ bố cục một phần ba (Rule of Thirds).
- Xoay 90° trái / phải, lật ngang (Flip Horizontal), lật dọc (Flip Vertical).
- Thanh trượt căn chỉnh độ nghiêng (Straighten) từ -45° đến +45°.

### 3. Bộ lọc màu Nghệ Thuật (18+ Presets)
- Các bộ lọc phong cách: *Normal, Vivid, Film Classic, Vintage 1970, Cinematic Teal & Orange, Noir B&W, Mono Graphic, Sunset, Cool Breeze, Fade Matte, Dramatic Dark, Cyberpunk Neon, Sepia, Emerald, Golden Hour, Moody Film, Pastel Dream, Polaroid*.
- Thanh trượt điều chỉnh độ đậm bộ lọc (Filter Intensity 0–100%).

### 4. Tinh chỉnh màu sắc chuyên sâu (Adjustments & Levels)
- **Ánh sáng**: Phơi sáng (Exposure), Độ sáng (Brightness), Tương phản (Contrast), Vùng sáng (Highlights), Vùng tối (Shadows).
- **Màu sắc**: Độ bão hòa (Saturation), Nhiệt độ màu (Temperature: ấm / lạnh), Sắc thái (Tint: xanh / tím).
- **Chi tiết**: Độ rõ nét (Clarity), Độ sắc nét (Sharpness), Viền tối nghệ thuật (Vignette).
- **Levels & Curves**: Điểm đen (Black Point), Độ dốc Gamma (Midtones), Điểm trắng (White Point).
- **Biểu đồ Histogram thời gian thực**: Trực quan hóa 4 kênh màu Red, Green, Blue và Luminance.
- **Tự động tối ưu hóa (Auto Enhance)**: Thuật toán cân bằng dynamic range dựa trên phân tích Histogram 100% offline, không cần AI đám mây.

### 5. Thêm chữ (Text & Typography)
- Thêm nhiều lớp chữ với khả năng di chuyển, xoay, phóng to thu nhỏ tự do.
- Tuyển chọn các phông chữ đẹp mắt hỗ trợ đầy đủ tiếng Việt có dấu: *Plus Jakarta Sans, Montserrat, Playfair Display, Caveat (Viết tay), Pacifico, Oswald*.
- Tùy chỉnh màu chữ, viền chữ (Stroke), bóng chữ (Shadow), hộp nền (Background Box).

### 6. Ghép ảnh Collage & Quản lý Layer
- Ghép nhiều ảnh vào một khung hình với các bố cục: *2 Dọc, 2 Ngang, 3 Ô (1 trên 2 dưới), 4 Ô (2x2 Quad), 6 Ô (3x2), 9 Ô (3x3), Tự do*.
- Tùy chỉnh khoảng cách viền, màu nền canvas, và tỉ lệ khung hình.
- Quản lý các lớp: Ẩn/hiện, khóa lớp, sắp xếp thứ tự trước/sau, nhân bản, độ mờ (Opacity) và chế độ hòa trộn (Blend Modes: *Normal, Multiply, Screen, Overlay, Darken, Lighten, Color Dodge*).

### 7. Vẽ tự do (Brush) & Sticker
- Bút vẽ tự do nhiều màu sắc, điều chỉnh kích thước ngòi và độ mờ đục.
- Cục tẩy (Eraser) xóa nét vẽ.
- Bộ sưu tập biểu tượng, huy hiệu retro, khung ảnh Polaroid, cuộn film và sticker vector offline.

### 8. Xuất ảnh & Chia sẻ
- Xuất định dạng: **JPEG**, **PNG**, **WebP**.
- Tùy chỉnh chất lượng (Quality 30% – 100%) và độ phân giải xuất (0.5x, 1x, 1.5x, 2x Ultra HD).
- Dự đoán dung lượng file xuất trước khi tải.
- Tích hợp **Web Share API**: Cho phép chia sẻ trực tiếp sang Instagram, Zalo, AirDrop, Tin nhắn trên điện thoại.

---

## 📱 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy môi trường Development
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

### 3. Build sản phẩm tối ưu
```bash
npm run build
```

---

## 📲 Hướng Dẫn Cài Đặt PWA & Kiểm Tra Offline Trên iOS (Safari)

### Cách cài đặt vào iPhone / iPad:
1. Mở trang web ứng dụng trong trình duyệt **Safari** trên iPhone/iPad.
2. Nhấn vào nút **Chia sẻ (Share)** (biểu tượng hình vuông có mũi tên chỉ lên) ở thanh công cụ dưới cùng của Safari.
3. Cuộn danh sách xuống và chọn **Thêm vào MH chính (Add to Home Screen)**.
4. Nhấn **Thêm (Add)** ở góc trên bên phải.
5. Biểu tượng ứng dụng **Lumix Studio** sẽ xuất hiện trên màn hình chính của iPhone giống như một app tải từ App Store.

### Cách kiểm tra chế độ Offline trên iOS:
1. Mở ứng dụng từ màn hình chính iPhone (hoặc trong Safari sau khi đã tải trang một lần).
2. Bật **Chế độ máy bay (Airplane Mode)** trên iPhone để ngắt hoàn toàn Wi-Fi và 4G/5G.
3. Đóng hẳn ứng dụng và mở lại từ màn hình chính.
4. Ứng dụng vẫn khởi động tức thì nhờ Service Worker và Cache Storage!
5. Bạn có thể mở ảnh từ cuộn Camera, chỉnh màu, áp bộ lọc, thêm chữ, ghép ảnh và xuất ảnh về máy bình thường 100% không cần kết nối mạng.

---

## 🛡️ Tối Ưu Hóa Bộ Nhớ Trên iOS Safari
- **Giới hạn bộ nhớ Canvas**: iOS Safari có giới hạn RAM cho HTML5 Canvas (~256MB). Nếu người dùng mở ảnh 48MP từ camera iPhone, Lumix Studio sẽ tự động tính toán và điều chỉnh kích thước về mức tối đa 2400px mà vẫn giữ nguyên độ nét chuẩn Retina, ngăn chặn hoàn toàn hiện tượng crash trang do tràn bộ nhớ (Out-Of-Memory).
- **Viewport Notch & Dynamic Island**: Đã cấu hình `viewport-fit=cover` và `safe-area-inset` giúp giao diện không bị che khuất bởi tai thỏ hoặc Dynamic Island.

---

## 🏗️ Kiến Trúc Mã Nguồn

```
src/
├── components/
│   ├── AdjustmentsPanel/  # Bảng điều chỉnh sáng, màu sắc, chi tiết, levels
│   ├── CollagePanel/      # Bảng chọn bố cục ghép ảnh lưới & tự do
│   ├── DrawPanel/         # Bút vẽ tự do & tẩy
│   ├── Editor/            # CanvasEditor, CropOverlay, HistogramView
│   ├── ExportModal/       # Hộp thoại xuất ảnh JPEG/PNG/WebP & Web Share
│   ├── FiltersPanel/      # 18+ preset bộ lọc màu nghệ thuật
│   ├── Header/            # Thanh điều hướng trên, Undo/Redo, Zoom, So sánh
│   ├── LayersPanel/       # Quản lý lớp ảnh, độ mờ, hòa trộn, khóa
│   ├── ProjectsModal/     # Thư viện quản lý dự án IndexedDB
│   ├── PWA/               # Nút cài đặt PWA & thông báo trạng thái offline
│   ├── StickersPanel/     # Sticker, khung ảnh & huy hiệu vector
│   ├── TextPanel/         # Thêm & sửa chữ, font tiếng Việt
│   └── Toolbar/           # Thanh công cụ BottomNav
├── hooks/
│   ├── useOnlineStatus.ts # Nhận diện kết nối mạng
│   └── usePWAInstall.ts   # Quản lý sự kiện cài đặt PWA & chỉ dẫn iOS
├── services/
│   └── db.ts              # Kho lưu trữ IndexedDB (idb)
├── stores/
│   └── editorStore.ts     # Quản lý toàn bộ state ứng dụng (Zustand)
├── types/
│   └── index.ts           # Định nghĩa cấu trúc dữ liệu TypeScript
└── utils/
    ├── filters.ts         # Danh sách 18+ preset bộ lọc màu
    ├── imageProcessing.ts # Xử lý pixel, bộ lọc, cân bằng histogram, chống tràn RAM
    ├── sampleImages.ts    # Tạo ảnh mẫu offline tự động
    └── stickers.ts        # Dữ liệu vector SVG sticker & frames
```
