# EduFlow Frontend

Modern e-learning platform built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

App will be available at: http://localhost:5173

## 📦 Tech Stack

- **React 19** - UI framework
- **Vite 8** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Routing
- **Supabase** - Backend & Auth
- **Lucide React** - Icons

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
fe/
├── src/
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Login & Register
│   ├── components/     # Shared components
│   ├── context/        # React context (Auth)
│   ├── courses/        # Course management
│   ├── dashboard/      # Main dashboard
│   ├── evaluation/     # Performance stats
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Landing page
│   ├── realtime/       # Chat features
│   └── supabaseClient.js
├── public/             # Static assets
└── .env               # Environment variables (not in git)
```

## ⚠️ Important Notes

- Make sure Supabase is properly configured
- `.env` file is gitignored for security
- Use `.env.example` as a template

## 🐛 Troubleshooting

If the app doesn't load:
1. Check `.env` file has correct Supabase credentials
2. Verify `node_modules` are installed
3. Clear browser cache and restart dev server

For detailed setup instructions, see [SETUP.md](./SETUP.md)
