# Colorra Development Setup

## Quick Start

1. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend  
   cd ../backend
   npm install
   ```

2. **Setup Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: Creates demo data
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend (http://localhost:5000)
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend (http://localhost:3000)  
   cd frontend
   npm run dev
   ```

## VS Code Tasks

Use VS Code's Command Palette (Ctrl+Shift+P) > "Tasks: Run Task":

- **Install Frontend Dependencies**
- **Install Backend Dependencies**  
- **Setup Database**
- **Frontend Dev Server**
- **Backend Dev Server**

## Project Status

### ✅ Completed
- **Frontend Structure**: Next.js + TypeScript + Tailwind CSS
- **Backend Structure**: Node.js + Express + Prisma + SQLite
- **Authentication**: Sign up/in pages with JWT tokens
- **State Management**: Zustand stores for auth and palettes
- **UI Components**: shadcn/ui components (Button, Input, Card, etc.)
- **Pages**: Home, Sign Up, Sign In, Dashboard, Profile
- **Components**: Sidebar, PaletteCard, CreatePaletteModal
- **Database Models**: User and Palette models with Prisma
- **API Client**: HTTP client with interceptors
- **Responsive Design**: Mobile-first with hamburger menu
- **Real API Integration**: Full CRUD operations with backend
- **Color Picker**: ChromePicker integrated with palette creation
- **Image Color Extraction**: ColorThief integration implemented
- **Error Handling**: Toast notifications for errors and success
- **Loading States**: Loading indicators in components
- **Export/Download**: Palette export functionality (JSON, CSS, SCSS)
- **Profile Updates**: Backend API implementation completed

### 🚧 Partially Implemented
- **Form Validation**: Basic validation, needs enhancement
- **Search/Filter**: Frontend implemented, backend needs optimization

### ❌ Missing/Todo
- **Password Reset**: Forgot password functionality  
- **File Upload**: Image upload to server/cloud storage
- **Enhanced Search**: Backend search with multiple criteria
- **Palette Sharing**: Share palettes with other users
- **Palette Collections**: Group palettes into collections
- **Email Verification**: User email verification system

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`.env`)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL="file:./dev.db"
```

## Default Demo Account
- **Email**: demo@colorra.app
- **Password**: password123

## Technology Stack

### Frontend
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Color (color picker)
- Lucide React (icons)
- Axios (HTTP client)

### Backend  
- Node.js + Express
- Prisma ORM + SQLite
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- express-validator (validation)

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  palettes  Palette[]
}

model Palette {
  id          String   @id @default(uuid())
  name        String
  description String?
  colors      String   // JSON array of hex colors
  imageUrl    String?
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

## Next Steps

✅ **COMPLETED** - All core functionality implemented!

### Ready to Use Features:
1. **Authentication System** - Sign up, sign in, JWT tokens
2. **Palette Management** - Create, edit, delete, favorite palettes
3. **Color Tools** - Color picker, image color extraction with ColorThief
4. **Export Functionality** - Download palettes as JSON, CSS, SCSS
5. **Real-time Updates** - Toast notifications, loading states
6. **Responsive Design** - Mobile-first, sidebar navigation
7. **Profile Management** - Update profile, change password

### Getting Started:
1. `cd backend && npm install && npx prisma generate && npx prisma db push`
2. `cd ../frontend && npm install`
3. `cd ../backend && npm run dev` (Terminal 1)
4. `cd ../frontend && npm run dev` (Terminal 2)
5. Visit http://localhost:3000

### Optional Enhancements:
- Password reset functionality
- File upload to cloud storage
- Palette sharing between users
- Email verification system
