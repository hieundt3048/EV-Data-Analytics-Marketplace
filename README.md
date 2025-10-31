# Sàn giao dịch phân tích dữ liệu xe điện (EV Data Analytics Marketplace)

## Tổng quan
Sàn giao dịch phân tích dữ liệu xe điện là một nền tảng web full-stack được thiết kế để tạo điều kiện trao đổi dữ liệu giữa người tiêu dùng dữ liệu và nhà cung cấp dữ liệu trong lĩnh vực xe điện. Nền tảng này bao gồm một backend bằng Java Spring Boot và một frontend bằng React.

## Tính năng
- **Người tiêu dùng dữ liệu (Data Consumers)**: Người dùng có thể tìm kiếm, mua các bộ dữ liệu và truy cập API để tích hợp dữ liệu vào ứng dụng của họ.
- **Nhà cung cấp dữ liệu (Data Providers)**: Người dùng có thể đăng ký dữ liệu của mình, thiết lập chính sách giá và theo dõi doanh thu từ việc bán dữ liệu.
- **Quản lý của quản trị viên (Admin Management)**: Quản trị viên có thể quản lý người dùng, xử lý thanh toán và tạo báo cáo để giám sát hoạt động của nền tảng.

## Cấu trúc chi tiết dự án
Dự án này là một monorepo chứa hai phần chính: backend Java Spring Boot và frontend React.

### Backend (Thư mục `src` và file `pom.xml`)
Backend chịu trách nhiệm về toàn bộ logic nghiệp vụ, xử lý dữ liệu và cung cấp API cho frontend.

```
├── src/
│   ├── main/
│   │   ├── java/com/evmarketplace/
│   │   │   ├── Controller/          # Xử lý yêu cầu HTTP và trả về kết quả.
│   │   │   ├── Service/             # Chứa logic nghiệp vụ chính.
│   │   │   ├── Repository/          # Tương tác với cơ sở dữ liệu.
│   │   │   ├── data/ (hoặc Pojo/)   # Các lớp mô hình dữ liệu (Entity).
│   │   │   ├── config/              # Cấu hình bảo mật, hệ thống.
│   │   │   └── Application.java     # File khởi chạy ứng dụng Spring Boot.
│   │   │
│   │   └── resources/
│   │       ├── application.properties # File cấu hình chính (cơ sở dữ liệu, cổng...).
│   │       ├── static/              # Chứa file tĩnh (CSS, JS, ảnh).
│   │       └── templates/           # Chứa template HTML cho server-side rendering.
│   │
│   └── test/                        # Chứa mã nguồn kiểm thử (tests).
│
└── pom.xml                          # File cấu hình Maven, quản lý thư viện và build.
```
**Giải thích chi tiết các file và thư mục backend:**
-   **`Controller/`**: Nhận các yêu cầu HTTP từ client (ví dụ: trình duyệt). Nó gọi các `Service` tương ứng để xử lý và trả về dữ liệu (thường là JSON) cho client.
-   **`Service/`**: Chứa logic nghiệp vụ cốt lõi. Ví dụ: xử lý đăng ký người dùng, tính toán doanh thu. Đây là lớp trung gian giữa `Controller` và `Repository`.
-   **`Repository/`**: Là giao diện để tương tác với cơ sở dữ liệu. Sử dụng Spring Data JPA để tự động hóa các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) mà không cần viết SQL thủ công.
-   **`data/` (hoặc `Pojo/`, `model/`)**: Chứa các lớp Java (gọi là Entity) ánh xạ tới các bảng trong cơ sở dữ liệu. Mỗi đối tượng của lớp này đại diện cho một hàng trong bảng.
-   **`config/`**: Chứa các lớp cấu hình cho Spring, ví dụ như `SecurityConfig` để thiết lập quy tắc xác thực và phân quyền người dùng.
-   **`Application.java`**: Điểm khởi đầu của toàn bộ ứng dụng backend. Phương thức `main` trong file này sẽ khởi chạy máy chủ web và toàn bộ hệ thống Spring Boot.
-   **`application.properties`**: File cấu hình quan trọng nhất, chứa thông tin kết nối cơ sở dữ liệu, cổng máy chủ, và các thiết lập khác.
-   **`pom.xml`**: File cấu hình của Maven. Nó khai báo các thư viện (dependencies) mà dự án cần, và các chỉ dẫn để xây dựng (build) dự án thành file `.jar`.

### Frontend (Thư mục `ev-frontend`)
Frontend chịu trách nhiệm về giao diện và trải nghiệm người dùng, được xây dựng bằng React và Vite.

```
├── ev-frontend/
│   ├── src/
│   │   ├── components/              # Các thành phần UI nhỏ, tái sử dụng được.
│   │   ├── pages/                   # Các thành phần đại diện cho từng trang.
│   │   ├── context/                 # Quản lý trạng thái toàn cục (global state).
│   │   ├── styles/                  # Các file CSS riêng cho từng thành phần.
│   │   ├── main.jsx                 # Điểm khởi đầu của ứng dụng React.
│   │   └── index.css                # File CSS toàn cục.
│   │
│   ├── public/
│   │   └── index.html               # File HTML gốc của ứng dụng.
│   │
│   ├── package.json                 # Quản lý thư viện và các script lệnh.
│   ├── vite.config.js               # File cấu hình cho Vite.
│   └── tailwind.config.js           # File cấu hình cho Tailwind CSS.
```
**Giải thích chi tiết các file và thư mục frontend:**
-   **`src/components/`**: Chứa các thành phần giao diện (UI) nhỏ có thể tái sử dụng ở nhiều nơi, ví dụ: `Header.jsx`, `Footer.jsx`, `Button.jsx`.
-   **`src/pages/`**: Chứa các thành phần lớn, đại diện cho một trang hoàn chỉnh, ví dụ: `HomePage.jsx`, `LoginPage.jsx`. Các trang này thường được ghép lại từ nhiều `components` nhỏ hơn.
-   **`src/context/`**: Sử dụng React Context API để quản lý trạng thái (state) chung cho toàn ứng dụng, ví dụ như thông tin người dùng đã đăng nhập.
-   **`main.jsx`**: Là file JavaScript đầu tiên được thực thi. Nó render (kết xuất) thành phần gốc của React (thường là `<App />`) vào file `index.html`.
-   **`public/index.html`**: Là file HTML duy nhất của ứng dụng trang đơn (SPA). Toàn bộ giao diện của ứng dụng React sẽ được "gắn" vào một thẻ `<div>` trong file này.
-   **`package.json`**: Liệt kê tất cả các thư viện JavaScript mà dự án cần (dependencies) và định nghĩa các script lệnh như `npm run dev` (chạy môi trường phát triển) và `npm run build` (build ra sản phẩm cuối).
-   **`vite.config.js`**: File cấu hình cho Vite - công cụ build giúp khởi động máy chủ phát triển và đóng gói (bundle) code một cách nhanh chóng.

## Yêu cầu cài đặt
- Java JDK 17 trở lên
- Apache Maven
- Node.js 18 trở lên

## Cài đặt và Chạy ứng dụng
Để chạy toàn bộ ứng dụng, bạn cần khởi động cả máy chủ backend và frontend trong các cửa sổ terminal riêng biệt.

### 1. Backend (Spring Boot)
Di chuyển đến thư mục gốc của dự án và chạy lệnh sau để khởi động máy chủ Java:
```bash
mvn spring-boot:run
```
Backend thường sẽ khởi động tại `http://localhost:8080`.

### 2. Frontend (React)
Mở một cửa sổ terminal mới, di chuyển vào thư mục `ev-frontend`, cài đặt các phụ thuộc và khởi động máy chủ phát triển.
```bash
# Di chuyển đến thư mục frontend
cd ev-frontend

# Cài đặt các phụ thuộc (chỉ cần một lần)
npm install

# Khởi động máy chủ phát triển
npm run dev
```
Frontend thường sẽ khởi động tại `http://localhost:5173`. Bây giờ bạn có thể truy cập ứng dụng trong trình duyệt của mình tại địa chỉ này.

## Đóng góp
Chúng tôi hoan nghênh các đóng góp! Vui lòng gửi một pull request hoặc mở một issue cho bất kỳ cải tiến hoặc sửa lỗi nào.

## Giấy phép
Dự án này được cấp phép theo Giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.
