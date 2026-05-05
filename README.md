# AI Study Buddy Planner 🎓

A futuristic, AI-powered study companion with adaptive planning, burnout detection, and gamified productivity tracking.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Firebase Account
- Google Gemini API Key

### 2. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google & Email/Password).
3. Enable **Cloud Firestore** in `asia-southeast1` (or your preferred region).
4. Create a Web App and copy the configuration.

### 3. Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` folder:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` folder:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Running the App Locally

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🤖 AI Features
- **StudyBuddy Chatbot:** Explains complex topics and motivates you.
- **Adaptive Planner:** Generates custom schedules based on subjects and exam dates.
- **Burnout Detection:** Analyzes mood and workload to suggest recovery.
- **Daily Tips:** Personalized productivity advice every day.

## 🎨 Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend:** Node.js, Express.js.
- **AI:** Google Gemini API.
- **Database/Auth:** Firebase.

## 🛠️ Folder Structure
```text
ai-study-buddy-planner/
├── client/          # React Frontend
├── server/          # Express Backend
└── README.md
```
