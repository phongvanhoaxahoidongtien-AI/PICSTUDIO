# Lumix Studio - Ứng Dụng Chụp & Chỉnh Sửa Ảnh PWA Offline Đa Nền Tảng

Trình chụp và chỉnh sửa ảnh Progressive Web App (PWA) chuyên nghiệp giống **Meitu / Snow / BeautyCam + PicsArt / Samsung Gallery**, hoạt động **100% ngoại tuyến (offline)**, bảo mật tối đa (ảnh không bao giờ gửi lên server), tối ưu hóa trải nghiệm mượt mà trên mọi thiết bị: **iOS (Safari)**, Android, Windows, macOS và Linux.

---

## 🌟 Tính Năng Nổi Bật

### 📷 A. Chế Độ Chụp Ảnh Đẹp (Camera Real-time)
- **Truy cập Camera trước/sau mượt mà**: Chuyển đổi camera linh hoạt (`user` / `environment`), hỗ trợ đèn flash/torch (nếu thiết bị có hỗ trợ phần cứng).
- **Làm đẹp Live tức thì**:
  - Làm mịn da (Skin Smooth) mô phỏng thời gian thực.
  - Làm trắng da hồng hào (Whitening) và hiệu ứng tỏa sáng sương mai (Dewy Soft Glow).
  - Bộ lọc màu sắc nét (10+ presets thời thượng: *Điện ảnh, Vintage, Phim, Hoàng hôn, Trong trẻo, Trắng đen, Moody...*).
  - Presets làm đẹp 1 chạm trực tiếp trên camera (*Tự nhiên, Chuẩn Hàn, Quyến rũ, Tươi tắn, Da tuyết*).
- **Nhận diện khuôn mặt & Tự động lấy nét (Beauty Autofocus)**:
  - Thuật toán định vị khuôn mặt offline cực nhẹ (<5ms), vẽ khung reticle chuyên nghiệp bám theo chuyển động người dùng.
- **Tiện ích nhiếp ảnh**:
  - Lưới bố cục 3x3 (Rule of Thirds).
  - Hẹn giờ chụp đếm ngược (3s, 5s, 10s) với hiển thị số đếm lớn ấn tượng.
  - Âm thanh màn trập (Web Audio API tổng hợp offline, không cần tải file ngoài) kèm rung haptic feedback.
  - Chụp xong tự động lưu và chuyển thẳng sang Editor với bảng **Làm đẹp (Beauty)** sẵn sàng chỉnh sửa tiếp!

---

### 💄 B. Bảng Công Cụ Làm Đẹp Chuyên Sâu (Beauty Retouch)
- **1-Tap Beauty Presets**:
  - *Tự nhiên (Natural)*: Làn da mịn màng, trong trẻo như mặt mộc.
  - *Chuẩn Hàn (Korean Glow)*: Da sương mai dewy căng bóng, má hồng đào ngọt ngào.
  - *Quyến rũ (Glamour)*: Cằm V-line, mắt to long lanh, môi đỏ quyến rũ.
  - *Tươi tắn (Fresh)*: Năng động rạng rỡ với tone cam đào ấm áp.
  - *Da tuyết (Pale Snow)*: Trắng sứ thanh khiết, nhấn mắt và môi đỏ anh đào.
  - *Da em bé (Baby Skin)*: Xóa mờ mọi khuyết điểm, mềm mịn không tì vết.
  - *Sắc sảo (Bold Diva)*: Đường nét cằm góc cạnh, thần thái đỉnh cao.
- **Tinh chỉnh Làn da (Skin Retouch)**:
  - Mịn da (Bilateral-like edge preserving blur trên vùng da mặt, giữ nguyên chi tiết mắt, chân mày, tóc).
  - Làm trắng da & Nâng sáng vùng da tự nhiên.
  - Tỏa sáng nhẹ / Căng bóng (Dewy Glow).
  - Cân bằng tone da (ấm áp hồng hào hoặc trắng lạnh).
- **Định hình gương mặt (Face Reshape)**:
  - Thon gọn cằm / V-Line (Slim Face) tự nhiên.
  - Mắt to long lanh (Big Eyes).
- **Trang điểm (Makeup)**:
  - Son môi (Lipstick): Tùy chỉnh độ đậm + Bảng 10 màu son thời thượng (*Đỏ thuần, Đỏ cherry, Đỏ rượu vang, Hồng đào, Hồng fuchsia, Cam cháy, Cam san hô, Đỏ đất, Hồng đất, Nude đào*).
  - Má hồng (Blush): Tùy chỉnh độ đậm + Bảng 6 tone màu má (*Hồng đào, Hồng phấn, Cam đào, San hô ngọt, Đỏ nhẹ, Cam cháy*).
- **Nút so sánh Trước / Sau**: Nhấn giữ để xem tức thì ảnh gốc chưa làm đẹp.

---

### 🎨 C. Bộ Công Cụ Chỉnh Sửa Ảnh Đầy Đủ (Editor)

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
