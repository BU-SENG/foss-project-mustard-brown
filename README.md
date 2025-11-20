# **OpenTask – Real-Time Collaborative Task Management Web App**
Organize teams, track progress, and ship faster with a beautiful, real-time task board

OpenTask is a full-stack web application that lets teams create, assign, and track tasks in real time. Built for students, startups, and remote teams, it combines the simplicity of Trello with real-time updates, role-based access, email/Google login, notifications, and a clean responsive UI all in one easy-to-deploy package.

<br><br>

<div align="center">

<img src="https://github.com/BU-SENG/foss-project-mustard-brown/blob/main/landingpageOS.jpg?raw=true" width="48%"/>
<img src="https://github.com/BU-SENG/foss-project-mustard-brown/blob/main/dashboardoss.jpg?raw=true" width="48%"/>

<img src="https://github.com/BU-SENG/foss-project-mustard-brown/blob/main/projectpageoss.jpg?raw=true" width="31%"/>
<img src="https://github.com/BU-SENG/foss-project-mustard-brown/blob/main/teamsoss.jpg?raw=true" width="31%"/>
<img src="https://github.com/BU-SENG/foss-project-mustard-brown/blob/main/teaskpageoss.jpg?raw=true" width="31%"/>

</div>

<br><br>

## ✨ Key Features

- Real-time task updates (MongoDB Change Streams)
- Create & assign tasks with priority, due dates, and rich descriptions
- Team creation
- Role-based access (Member / Team Lead)
- Task comments + activity logs
- Powerful search & filters
- Email + Google OAuth authentication
- Fully responsive (mobile + desktop)

<br><br>

## 🛠 Tech Stack


| Layer              | Technology                          |
|-------------------|-------------------------------------|
| Frontend          | Next.js 14 (App Router)             |
| Styling           | Tailwind CSS                        |
| Authentication    | Custom JWT + Google OAuth (googleapis)|
| Database          | MongoDB + Mongoose                  |
| Email Service     | Nodemailer (SMTP/Gmail)             |
| State Management  | React Hooks + Context               |
| Deployment        | Vercel                              |
| Others            | SweetAlert2, Axios, React Icons     |

<br><br>

## 📂 Project Structure

```plaintext
├─ 📂 .next/                  # Auto-generated build folder
├─ 📂 node_modules/           # Dependencies
├─ 📂 public/                 # Static files (logos, icons)
├─ 📂 src/
│  ├─ 📂 app/                 # Pages, layouts & API routes (App Router)
│  ├─ 📂 Components/          # Reusable UI components
│  ├─ 📂 Constants/           # Enums & config values
│  ├─ 📂 Models/              # MongoDB schemas
│  ├─ 📂 Utils/               # Helpers & utilities
│  └─ 📂 UIUX Design/         # Figma / design files
├─ 🔒 .env                    # Secret keys (never commit!)
├─ 📄 .env.example            # Public env template
├─ 🚫 .gitignore
├─ 🧹 eslint.config.mjs
├─ 🛠  jsconfig.json
├─ ⚙️  next.config.mjs
├─ 🎨 postcss.config.mjs
├─ 📦 package.json
└─ 📖 README.md
```
<br><br>

## 🧰 Getting Started
Follow these simple steps to run OpenTask on your machine:
<br>
### Step 1: Clone the Repository
```bash
git clone https://github.com/BU-SENG/foss-project-mustard-brown.git
cd foss-project-mustard-brown
```
<br>

### Step 2: Install Dependencies
```bash
npm install
```
<br>

### Step 3: Set up Environment Variables
Create a .env.local file in the project root and add the following:
```bash
MONGODB_URI="your_mongodb_atlas_or_local_url_here"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password-or-smtp-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
JWT_SECRET="a-very-strong-secret-key-at-least-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
Tip: Use .env.example (already in the repo) as a template, just copy it to .env.local and fill in your values.

<br>

### Step 4: Run the Deployment Server
```bash
npm run dev
```

<br>

### Production Build (Optional)
```bash
npm run build   # Build the app
npm start       # Start production server
```

<br><br>

<br><br><br>

## 🌍 Deploy on Vercel (One-Click, Zero Config)

The easiest and fastest way to deploy OpenTask:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BU-SENG/foss-project-mustard-brown)

### Manual Steps (if the button doesn’t work)
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** → Import this GitHub repo
3. Add these Environment Variables (same as your `.env.local`):
   - `MONGODB_URI`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `NEXT_PUBLIC_BASE_URL` → set to your Vercel URL (e.g., https://opentask-yourname.vercel.app)
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Click **Deploy** → Done in ~60 seconds!

Your live app will be at: `https://your-project-name.vercel.app`

<br><br>

## 👥 Contributors – The Amazing Team

22/0250 NDUBUISI MIRACLE DAVID
23/0221 NELSON-NWANONEZE DAVID TOCHUKWU
23/0220 NELSON-NWANONEZE SAMUEL SOMTOCHUKWU
22/0244 NGONADI CHINONSO MICHAEL
22/0020 NWAGBO SOMTOMCHUKWU BILL
22/0037 NWAKWURIBE KAMSIYOCHI DENNIS
22/0291 NWALUE PRECIOUS SHAWN
22/0256 NWANGWU ONYEDIKACHUKWU VINCENT
22/0013 NZEGWU KENECHUKWU ANALIEFO
22/3286 NZERIBE CHINANU UZOCHUKWU

<br>

📬 Support
For inquiries, feedback, or contributions, please open an issue or submit a pull request on GitHub.

Persistent data storage and real-time updates

Deployment via Vercel
