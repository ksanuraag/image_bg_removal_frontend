# 🎨 AI Background Removal Frontend

A modern **React + Vite** web application for removing image backgrounds using AI.
Built with a focus on performance, user experience, and real-world deployment using CI/CD.

---

## 🚀 Live Demo

👉 http://3.150.235.217

---

## 🧠 Features

* Upload images from device
* Client-side image compression
* Real-time processing status (polling)
* AI-powered background removal
* Download transparent PNG output
* Fully responsive UI
* Fast loading with optimized build

---

## 🏗️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** CSS
* **Image Processing:** browser-image-compression
* **API Integration:** Fetch API
* **Server:** Nginx
* **CI/CD:** GitHub Actions

---

## 📂 Project Structure

```id="f1jv2k"
image_bg_removal_frontend/
│── src/
│── public/
│── index.html
│── package.json
│── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash id="c3d9k2"
git clone https://github.com/your-username/image_bg_removal_frontend.git
cd image_bg_removal_frontend
```

---

### 2. Install Dependencies

```bash id="n7x2q1"
npm install
```

---

### 3. Environment Setup

Create `.env` file:

```env id="v8p1l0"
VITE_API_URL=/api
```

👉 Uses relative API path for Nginx proxy

---

### 4. Run Development Server

```bash id="d4m7s2"
npm run dev
```

---

### 5. Build for Production

```bash id="z8r2k1"
npm run build
```

Output:

```id="q2m9t4"
dist/
```

---

## 🔗 API Integration

* `POST /api/remove-bg/`
* `GET /api/status/{id}/`

---

## 🔄 Workflow

```id="w8x2k9"
Upload → Compress → Send to API → Poll Status → Display Result → Download
```

---

## 🌐 Deployment Architecture

```id="p9k3x1"
React (Vite Build) → Nginx → Django API → Celery → AI Processing → S3
```

---

## ⚡ CI/CD (GitHub Actions)

This project uses **GitHub Actions** for automatic deployment.

### 🔄 Workflow

* Push to `main`
* Install dependencies
* Build React app
* Deploy to EC2 using SSH
* Sync files to `/var/www/frontend`

---

### 🛠️ Deployment Config

```yaml id="y7k3d1"
rsync -avz --delete dist/ ubuntu@EC2:/var/www/frontend/
```

---

## ⚠️ Important Deployment Notes

* Node.js version **20+ required** (Vite compatibility)
* Proper permissions required:

```bash id="k3m9v2"
sudo chown -R ubuntu:ubuntu /var/www/frontend
```

---

## 🌐 Nginx Configuration

```nginx id="n2k4x7"
location / {
    root /var/www/frontend;
    index index.html;
    try_files $uri /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:8000;
}
```

---

## ⚡ Performance Optimizations

* 📉 Image compression before upload
* 🚀 Reduced API payload size
* 🔄 Async polling instead of blocking
* 📱 Mobile-first design

---

## 🧠 Key Learnings

* React production build optimization
* Nginx static hosting
* CI/CD automation with GitHub Actions
* Handling deployment permissions in Linux
* Integrating frontend with async backend APIs

---

## 📌 Future Improvements

* Drag & drop upload
* Progress bar improvements
* Dark mode UI
* Batch image processing

---

## 👨‍💻 Author

**Anuraag K S**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
