# EV Frontend

This folder contains a Vite + React scaffold for the EV Data Analytics Marketplace landing experience ported from the original HTML.

## Getting Started

1. Install dependencies (requires Node.js 18+):
   ```cmd
   npm install
   ```
2. Start the dev server:
   ```cmd
   npm run dev
   ```
3. Build for production:
   ```cmd
   npm run build
   ```
4. Preview the production build locally:
   ```cmd
   npm run preview
   ```

## Tailwind CSS

Tailwind is wired in with PostCSS. The main stylesheet (`src/index.css`) pulls in Tailwind layers and the legacy styles that power the landing page. Adjust `tailwind.config.js` if you relocate components.

## Static Assets

Copy your existing images into `public/static/images` (for example, `LogoEV.png` and `search.png`) so the page can display them. Any files in `public` are served at the site root.

## Cấu trúc thư mục

```
ev-frontend/
├─ index.html                 # Trang HTML gốc Vite phục vụ ứng dụng
├─ package.json               # Khai báo phụ thuộc và script npm
├─ vite.config.js             # Cấu hình Vite cho React
├─ postcss.config.cjs         # Kết nối Tailwind + Autoprefixer
├─ tailwind.config.js         # Khai báo đường dẫn quét class Tailwind
├─ eslint.config.js           # Quy tắc lint cho React 18
├─ public/
│  └─ static/
│     └─ images/              # Nơi đặt ảnh như LogoEV.png, search.png
└─ src/
   ├─ main.jsx                # Điểm vào React, mount component lên #root
   ├─ index.css               # Import Tailwind và stylesheet chính
   ├─ pages/
   │  └─ IndexPage.jsx        # Component trang landing EV DataHub
   └─ styles/
      └─ index.css            # CSS gốc chuyển từ dự án Java sang
```
