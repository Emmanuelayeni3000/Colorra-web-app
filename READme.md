# Colorra Web App

![Colorra Banner](./frontend/public/images/colorra-logo.png)

A modern web application for creating, sharing, and discovering beautiful color palettes. Built with Next.js and Express, Colorra empowers designers, developers, and creatives to curate stunning color combinations.

## ✨ Features

### 🎨 Palette Management
- **Create Palettes:** Generate color palettes from images or build them from scratch
- **Edit & Customize:** Modify colors, names, and descriptions of your palettes
- **Export Options:** Download palettes as JSON, CSS, SCSS, or PNG formats
- **Category Organization:** Organize palettes by categories (Warm, Cool, Earth Tones, Pastel, Neutral, Vibrant, Minimal)

### 🌐 Social Features
- **Explore Palettes:** Discover palettes created by the community
- **Palette of the Day:** Featured palette selected daily based on engagement
- **User Profiles:** Showcase your palettes and build your creative portfolio
- **Follow System:** Follow other creators and build your personalized feed
- **Comments:** Engage with the community through comments on palettes
- **Remix Palettes:** Create your own version of palettes you love

### 📌 Save & Organize
- **Bookmarks:** Save your favorite palettes from other users
- **Favorites:** Mark your own palettes as favorites for quick access
- **Shared Palettes:** Share palettes directly with other users

### 📢 Activity Feed
- **Global Feed:** See what's happening across the entire community
- **Personalized Feed:** Activities from users you follow
- **Activity Management:** Remove your own activities from the feed

### 🔔 Notifications
- **Activity Notifications:** Stay updated on interactions with your content
- **Bell Icon:** Quick access to notifications from the dashboard header

### ♿ Accessibility
- **Color Blindness Simulator:** Preview how your palettes appear to people with different types of color vision deficiency

## 🚀 Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) - React framework for production
- [React 18](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible component primitives
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [Sonner](https://sonner.emilkowalski.com/) - Toast notifications

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.com/) - PostgreSQL database platform
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Password hashing

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git
- Supabase account ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Emmanuelayeni3000/Colorra-web-app.git
   cd Colorra-web-app
   ```

2. **Set up the backend**
   ```sh
   cd backend
   npm install
   
   # Set up the database
   npx prisma generate
   npx prisma db push
   
   # (Optional) Seed sample data
   npx prisma db seed
   ```

3. **Set up the frontend**
   ```sh
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create `.env` in the backend folder:
   ```env
   # Get these from Supabase Dashboard → Settings → Database → Connection String
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   JWT_SECRET="your-secret-key"
   FRONTEND_URL="http://localhost:3000"
   ```

   Create `.env.local` in the frontend folder:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

### Running the Application

1. **Start the backend server** (runs on port 5000)
   ```sh
   cd backend
   npm run dev
   ```

2. **Start the frontend development server** (runs on port 3000)
   ```sh
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
Colorra-web-app/
├── backend/
│   ├── prisma/           # Database schema and migrations
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, error handling, uploads
│   │   ├── routes/       # API route definitions
│   │   └── services/     # Business logic
│   └── uploads/          # User uploaded files
│
├── frontend/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Sidebar, Header)
│   │   ├── palette/      # Palette-related components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   ├── pages/            # Next.js pages
│   ├── public/           # Static assets
│   ├── store/            # Zustand state stores
│   └── styles/           # Global styles
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/reset` - Reset password

### Palettes
- `GET /api/palettes` - Get user's palettes
- `GET /api/palettes/public` - Get public palettes
- `GET /api/palettes/daily` - Get palette of the day
- `POST /api/palettes` - Create a palette
- `PUT /api/palettes/:id` - Update a palette
- `DELETE /api/palettes/:id` - Delete a palette
- `POST /api/palettes/:id/bookmark` - Bookmark a palette
- `POST /api/palettes/:id/remix` - Remix a palette

### Activity
- `GET /api/activity/global` - Get global activity feed
- `GET /api/activity/me` - Get personalized activity feed
- `DELETE /api/activity/:id` - Delete an activity

### Users
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Developed By

<a href="mailto:ayeniemmanuel914@gmail.com">Emmanuel Ayeni</a>

---

<p align="center">
  Made with ❤️ for the creative community
</p>