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



🧰 Getting Started (Local Development)#

1. Clone the repository
git clone https://github.com/<your-org-or-username>/collaborative-task-app.git
cd collaborative-task-app

2. Install dependencies: npm install

3. Set up environment variables

Create a .env.local file in the project root:

MONGODB_URL="your mongodb url here"
EMAIL_USER="your email here"
EMAIL_PASS="your email pass key here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
JWT_SECRET="your jwt secret here"
GOOGLE_CLIENT_ID="your google client id here"
GOOGLE_CLIENT_SECRET="your google client secret here"


4. Start the development server: npm run dev


Preview the production build: npm start


🌍 Deployment (Vercel)

Push your project to GitHub

Visit https://vercel.com

Import the repository and configure environment variables under
Project Settings → Environment Variables

Click Deploy 



🤝 Contributors
22/0250	NDUBUISI MIRACLE DAVID
23/0221	NELSON-NWANONEZE DAVID TOCHUKWU
23/0220	NELSON-NWANONEZE SAMUEL SOMTOCHUKWU
22/0244	NGONADI CHINONSO MICHAEL
22/0020	NWAGBO SOMTOMCHUKWU BILL
22/0037	NWAKWURIBE KAMSIYOCHI DENNIS
22/0291	NWALUE PRECIOUS SHAWN
22/0256	NWANGWU ONYEDIKACHUKWU VINCENT
22/0013	NZEGWU KENECHUKWU ANALIEFO
22/3286	NZERIBE CHINANU UZOCHUKWU

📬 Support
For inquiries, feedback, or contributions, please open an issue or submit a pull request on GitHub.

Persistent data storage and real-time updates

Deployment via Vercel
