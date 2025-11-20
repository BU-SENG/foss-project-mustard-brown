📘 Collaborative Task Management Web App

A web-based platform that enables teams to create, assign, and track tasks in real time, improving coordination and workflow management.
The system helps users organize their workflow efficiently, ensuring transparency, accountability, and seamless collaboration across teams.

🚀 Features
👥 User Features

Create and manage tasks with titles, descriptions, and due dates

Assign tasks to team members and set priorities

View ongoing, completed, and overdue tasks in a clear dashboard

Receive real-time updates on task changes and progress

Collaborate using task comments and activity logs

Authenticate and manage user accounts securely

👨‍💼 Admin / Team Lead Features

Create teams and invite members via email or username

Monitor task progress across members

Update task statuses and reassign responsibilities

Manage project-wide task boards for multiple teams

📅 Productivity Features

Real-time synchronization across users

Search and filter tasks by status, priority, or assigned member

Notification system for task updates and deadlines

Responsive UI for desktop and mobile

⚙ Additional System Features

Authentication (via Firebase/Auth provider)

Role-based access for team members and leads

Next.js App Router architecture for efficient routing




🛠 Tech Stack


| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Frontend           | **Next.js (React Framework)**               |
| Styling            | **Tailwind CSS + PostCSS**                  |
| Backend / Database | **Firebase / Supabase (Auth, Realtime DB)** |
| State Management   | **React Context API / Hooks**               |
| Build Tool         | **Next.js + Vercel Build System**           |
| Deployment         | **Vercel**                                  |
| Others             | **Real-time sync, Role-based routing**      |






📂 Project Structure (Summary)

/public
/src
  /app
  /Components
  /Constants
  /Models
  /Utils
.eslint.config.mjs
.jsconfig.json
.next.config.mjs
.postcss.config.mjs
/package.json
/package-lock.json
/tailwind.config.js
/.env.local



🧰 Getting Started (Local Development)#

1. Clone the repository
git clone https://github.com/<your-org-or-username>/collaborative-task-app.git
cd collaborative-task-app

2. Install dependencies: npm install

3. Set up environment variables

Create a .env.local file in the project root:

NEXT_PUBLIC_API_KEY=your-firebase-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_PROJECT_ID=your-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_APP_ID=your-app-id


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
