# ☁️ Cloud Cost Intelligence Dashboard

A full-stack cloud analytics platform that helps organizations monitor, analyze, and optimize AWS cloud spending through interactive dashboards, AI-powered insights, and real-time billing analytics.

---

## 🚀 Live Demo

Frontend: (https://vercel.com/ankisinghhs-projects/cloud-cost-intelligence/8gNL51jZRP2FTfUnN3qALA6Ge2Vv)

Backend API: (https://dashboard.render.com/web/srv-d86325ugvqtc73eamnpg)

---

## 📌 Overview

Cloud Cost Intelligence Dashboard is designed to provide visibility into cloud spending patterns and identify optimization opportunities. The platform integrates AWS Cost Explorer APIs, processes billing datasets, and generates actionable recommendations to help reduce infrastructure costs.

This project demonstrates Full-Stack Development, Cloud Integration, Authentication, Deployment, and Production Debugging skills.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT Authentication
- HTTP-only Cookies
- Secure Password Hashing using bcrypt
- Protected Routes
- User Signup/Login System

### 📊 Cloud Analytics Dashboard
- AWS Spend Tracking
- Cost Trend Visualization
- Service-wise Cost Analysis
- Region-wise Analytics
- Dataset Monitoring
- Interactive Dashboard UI

### ☁️ AWS Integration
- AWS Cost Explorer API Integration
- Daily Cost Monitoring
- Billing Analytics
- Spend Aggregation
- Cloud Cost Optimization Insights

### 🤖 AI Insight Engine
- Cost Anomaly Detection
- High-Spend Alerts
- Optimization Recommendations
- Risk Severity Classification
- Rule-Based Cost Intelligence

### 📂 Dataset Processing
- CSV Upload Support
- JSON Upload Support
- Billing Data Parsing
- Dataset Validation
- Automated Analytics Generation

### 📈 Analytics & Reporting
- Spend Summaries
- Trend Monitoring
- Cost Intelligence Feed
- Optimization Opportunities
- Infrastructure Health Indicators

---

## 🏗️ System Architecture

Frontend (React + TypeScript)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
MongoDB Atlas Database
        │
        ▼
AWS Cost Explorer APIs

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide Icons

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Zod Validation
- Cookie Parser
- CORS

### Database
- MongoDB Atlas
- Mongoose

### Cloud & DevOps
- AWS Cost Explorer
- AWS IAM
- Render
- Vercel
- GitHub

---

## 📁 Project Structure

```bash
insightdash/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.tsx
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── workers/
│   │   └── config/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/cloud-cost-intelligence.git
cd cloud-cost-intelligence
```

---

## Backend Setup

```bash
cd server
npm install
```

Create `.env`

```env
PORT=5001

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_access_key

AWS_SECRET_ACCESS_KEY=your_secret_key

AWS_REGION=ap-south-1
```

Run Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5001
```

Run Frontend

```bash
npm run dev
```

---

## 🔑 AWS Configuration

### Required IAM Permissions

Attach:

- AWS Cost Explorer Read Access
- Billing Read Access

Recommended Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ce:GetCostAndUsage"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

---

## 📊 Sample Dashboard Metrics

- Total Cloud Spend
- Active Regions
- Cost Trends
- AI Recommendations
- Dataset Analytics
- AWS Service Utilization

---

## 🚀 Deployment

### Frontend Deployment

Platform:
- Vercel

Build Command

```bash
vite build
```

Output Directory

```bash
dist
```

---

### Backend Deployment

Platform:
- Render

Build Command

```bash
npm install && npm run build
```

Start Command

```bash
npm start
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Environment Variables
- HTTP-only Cookies
- Protected APIs
- AWS Read-Only Access
- Input Validation

---

## 📈 Project Highlights

- Built a production-ready cloud analytics platform.
- Processed and analyzed 10,000+ cloud billing records.
- Integrated AWS Cost Explorer for real-time spend visibility.
- Implemented secure authentication and protected APIs.
- Developed AI-powered cost optimization recommendations.
- Deployed frontend on Vercel and backend on Render.
- Integrated MongoDB Atlas cloud database.

---

## 🧠 Challenges Solved

### CORS Issues
Resolved cross-origin communication between Vercel and Render deployments.

### Authentication Cookies
Configured secure cookies for production environments.

### MongoDB Atlas Connectivity
Managed cloud database connections using environment variables.

### TypeScript Build Errors
Implemented strict type validation and null-safe handling.

### Production Deployment
Configured cloud hosting and environment-specific settings.

---

## 🔮 Future Enhancements

- Docker Containerization
- Kubernetes Deployment
- OpenAI-Powered Cost Insights
- Multi-Cloud Support (AWS, Azure, GCP)
- Real-Time WebSockets
- Cost Forecasting
- Advanced Analytics
- CI/CD Pipelines

---

## 🤝 AI-Assisted Development

This project leveraged modern AI-assisted development tools including:

- GitHub Copilot
- ChatGPT

for debugging, deployment troubleshooting, code optimization, API integration guidance, and accelerating development workflows.

---

## 👨‍💻 Author

Ankit Singh

Computer Science Graduate (2025)

Skills:
MERN Stack | AWS Cloud | TypeScript | MongoDB | Node.js | React.js | DevOps Fundamentals

---

## ⭐ If you found this project useful, consider giving it a star.
