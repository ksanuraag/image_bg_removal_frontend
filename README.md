# AI Background Removal Frontend

A modern **React + Vite** web application for removing image backgrounds using AI.
Designed with performance, user experience, and mobile optimization in mind.

---

## 🚀 Features

* Upload images directly from device
* Client-side image compression (faster uploads)
* Real-time progress tracking
* AI-powered background removal integration
* Download processed PNG images
* Mobile-friendly responsive UI
* Smooth UX with loading states and feedback

---

## 🏗️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** CSS
* **Image Compression:** browser-image-compression
* **API Integration:** Fetch API
* **Deployment:** Nginx (served as static files)

---

## 📂 Project Structure

```id="c8jv5m"
image_bg_removal_frontend/
│── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│── public/
│── index.html
│── package.json
│── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash id="7tf8mx"
git clone https://github.com/your-username/image_bg_removal_frontend.git
cd image_bg_removal_frontend
```

---

### 2. Install Dependencies

```bash id="4kw1xe"
npm install
```

---

### 3. Configure Environment

Create a `.env` file:

```env id="4q2jvn"
VITE_API_URL=
```

👉 Uses relative API path (`/api`) for seamless Nginx proxy integration.

---

### 4. Run Development Server

```bash id="z9ny5c"
npm run dev
```

👉 Open:

```id="w7u4l2"
http://localhost:5173
```

---

### 5. Build for Production

```bash id="h7l9d1"
npm run build
```

👉 Output folder:

```id="q9t2bm"
dist/
```

---

## 🔗 API Integration

The frontend communicates with the backend via:

```id="r6k2tq"
/api/remove-bg/
```

```id="p4k1dx"
/api/status/{id}/
```

---

## 🔄 Workflow

```id="5l8k3j"
User Upload → Client Compression → API Request → Poll Status → Display Result → Download
```

---

## 🌐 Deployment

Frontend is served using **Nginx**:

* Static files → `/var/www/frontend`
* API requests → proxied to Django backend

Example Nginx setup:

```nginx id="q4v1xs"
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
* 🔄 Polling instead of blocking requests
* 📱 Optimized for mobile devices

---

## 🧠 Key Learnings

* Handling large file uploads efficiently
* Client-side image optimization
* Async UI updates with polling
* Integrating frontend with scalable backend APIs
* Deploying React apps using Nginx

---

## 📌 Future Improvements

* Drag & drop upload support
* Image preview editing
* Batch processing
* Dark mode UI
* Progress bar enhancements

---

## 👨‍💻 Author

**Anuraag K S**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
