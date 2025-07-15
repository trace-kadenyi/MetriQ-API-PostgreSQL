# MetriQ API

The backend server for **MetriQ**, a performance benchmarking platform that analyzes and compares website metrics using Google PageSpeed Insights and AI-powered summaries. Built with **Node.js**, **Express**, and **MongoDB**.

---

## 🧠 Stack

- Node.js + Express (server)
- MongoDB (database)
- Passport.js (Google & GitHub OAuth)
- Axios (API requests)
- OpenRouter + DeepSeek (AI summaries)
- Google PageSpeed Insights API (site audits)
- Deployed on Vercel

---

## 📁 Project Structure

```
/backend
│
├── auth/
│   └── passport.js
│
├── controllers/
│   ├── aiSummaryController.js
│   ├── comparisonController.js
│   ├── competitorAiAnalysisController.js
│   ├── favouriteController.js
│   ├── reportController.js
│   └── userThemeController.js
│
├── models/
│   ├── ReportSchema.js
│   ├── ComparisonSchema.js
│   ├── FavouriteSchema.js
│   └── UserSchema.js
│
├── routes/
│   ├── comparisonRoutes.js
│   ├── competitorAiAnalysisRoutes.js
│   ├── favouritesRoutes.js
│   ├── reportRoutes.js
│   ├── root.js
│   ├── summarize.js
│   ├── urlChecker.js
│   └── userRoutes.js
│
├── utils/
│   ├── fetchPageSpeedData.js
│   ├── getUserFriendlySuggestions.js
│   └── getUserId.js
│
├── views/
│   └── index.html
│
├── .env
├── server.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/trace-kadenyi/MetriQ-API.git
cd MetriQ-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
DATABASE_URI=your_mongodb_connection_string
PAGESPEED_API_KEY=google_api_key
OPENROUTER_API_KEY=your_openrouter_key
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your__secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
SESSION_SECRET=your_cookie_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=google_callback_url
GITHUB_CALLBACK_URL=github_callback_url
```

### 4. Run the server

```bash
npm start
```

The API will be running at `http://localhost:4000`.

---

## 🧪 API Endpoints

### 🔍 PageSpeed Reports

- **POST** `/api/reports`

  - Body: `{ url: "https://example.com" }`
  - Fetches PageSpeed data (mobile + desktop), saves to DB

- **GET** `/api/reports/:url`
  - Fetches last 5 reports for a given URL

---

### 🤖 AI Summaries (DeepSeek via OpenRouter)

- **POST** `/api/summarize`
  - Body: `{ reports: [ ... ] }`
  - Returns a generated summary (not saved to DB)

---

### 📊 Competitor Comparison

- **POST** `/api/comparison`
- **POST** `/api/competitor-ai-analysis`

---

### ❤️ Favourites

- **GET** `/api/favourites`
- **POST** `/api/favourites`
- **DELETE** `/api/favourites/:id`

---

### 🎨 User Theme

- **GET** `/api/user/theme`
- **PATCH** `/api/user/theme` with `{ theme: "dark" | "light" }`

---

### 📌 API Routes Summary

| Endpoint                    | Method(s)      | Description                                         |
| --------------------------- | -------------- | --------------------------------------------------- |
| `/api/auth/google`          | `GET`          | Initiate Google OAuth login                         |
| `/api/auth/google/callback` | `GET`          | Google OAuth callback and redirect                  |
| `/api/auth/github`          | `GET`          | Initiate GitHub OAuth login                         |
| `/api/auth/github/callback` | `GET`          | GitHub OAuth callback and redirect                  |
| `/api/auth/me`              | `GET`          | Get currently authenticated user                    |
| `/api/auth/logout`          | `POST`         | Logout the user and clear session                   |
| `/api/user/theme`           | `GET`, `PATCH` | Get or update theme preference                      |
| `/api/url/check`            | `POST`         | Check reachability and validity of a URL            |
| `/api/url/report`           | `POST`, `GET`  | Create new PageSpeed report or fetch last 5 reports |
| `/api/summarize`            | `POST`         | Generate AI summary from given reports              |
| `/api/favourites`           | `GET`          | Get all favourited reports                          |
| `/api/favourites/toggle`    | `POST`         | Toggle favourite state of a report                  |
| `/api/favourites/claim`     | `POST`         | Transfer anonymous favourites to authenticated user |
| `/api/compare`              | `POST`         | Compare multiple sites and store as group           |
| `/api/ai/comparison`        | `POST`         | Generate AI analysis for competitors' performance   |
| `/` or `/index.html`        | `GET`          | Serve static homepage (for testing or fallback)     |

---

## 🧰 Dev Scripts

```bash
npm start        # Run with nodemon
```

---

## ✅ Features

- Account sign up with Google or Github
- Fetch and store PageSpeed Insights data for mobile and desktop
- Store up to 5 recent reports per URL
- Generate AI-powered analyses of report data via DeepSeek
- Compare multiple competitors anonymously
- Generate AI-powered analyses of how the user stacks up against competitors
- Manage user favourites
- Store and sync theme preferences
- Clean, modular Express structure

---

## 📌 Todo / In Progress

- [ ] Rate limiting or usage quotas

---

## 💡 Notes

- The frontend (MERN) app is in a separate repo: [MetriQ Frontend](https://github.com/trace-kadenyi/MetriQ.git)
- User accounts, reports and favourites are stored in MongoDB Atlas
- Competitor comparison reports and Ai summaries are generated on-demand and not stored permanently

---

## 📄 License

MIT License. © Tracey Kadenyi 2025.
