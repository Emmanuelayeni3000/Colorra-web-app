# 🎨 Colorra - Palette Creation Web Application

Colorra is a modern web application for generating, editing, and managing beautiful color palettes. Designed with developers and designers in mind, it provides essential tools like palette creation, editing, and image color extraction. 

## 🚀 Tech Stack

### Frontend:
- **React (with TypeScript)**
- **Tailwind CSS**
- **Zustand** for global state management (auth/user state, palette state)
- **@shadcn/ui** for UI components
- **react-color** or **@radix-ui/colors** for color picking tools
- **color-thief** or **node-vibrant** for extracting colors from images

### Backend:
- **Node.js** + **Express.js**
- **Prisma** as ORM
- **SQLite** as the database (simple, lightweight for prototyping)

## 🧠 Application Structure

```
colorra-app/
│
├── frontend/               # Next.js (React + TypeScript) project
│   ├── components/         # Shared UI components
│   ├── pages/
│   │   ├── index.tsx       # Home Page
│   │   ├── auth/
│   │   │   ├── signin.tsx  # Sign In Page
│   │   │   ├── signup.tsx  # Sign Up Page
│   │   ├── dashboard.tsx   # Palette Dashboard
│   │   ├── profile.tsx     # User Profile
│   ├── store/              # Zustand stores (auth, palette)
│   ├── styles/
│   └── utils/              # Helper functions
│
├── backend/                # Node.js + Express backend
│   ├── prisma/             # Prisma schema and client
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── index.ts
│   └── .env
│
├── README.md
└── package.json
```

---

## 🌈 UI Design Guidelines

- Use a **modern, vibrant, and clean aesthetic**
- Stick to a **soft sans-serif font** (e.g., Inter, Nunito, DM Sans)
- **Smooth scroll animations** for transitions
- **Grid layout** with responsive design principles
- Cards and components must use:
  - **2xl rounded corners**
  - **Soft shadows**
  - **Ample padding**

### Suggested Theme Colors

- **Primary:** `  #8b5cf6` (Vivid purple)
- **Secondary:** ` #F4EBFF` (Lavender Tint)
- **Accent:** ` #14b8a6` (vivid turquoise)
- **Neutral Background:** `#F9FAFB`
- **Text:** `#1F2937` (Dark Gray)

These colors offer a modern, aesthetic feel suitable for creativity-driven apps.

---
## 📦 Features
✅ MVP Scope
 Create color palettes

 Edit palettes

 Upload image & extract colors (color-thief or node-vibrant)

 Auth (Sign In/Sign Up) – using email/password

 Save palettes to user dashboard

 Like/favorite palettes

 View and manage own palettes

 User profile page

## ❤️ Favorite / Like Palettes
Add a "❤️" icon or button to each palette

When clicked, mark as favorite

Favorite palettes are stored and retrievable per user

Add a “Favorites” tab/section in the user dashboard



## 📁 Prisma + SQLite Setup (Backend)

### 1. Initialize Prisma
```
npm install prisma --save-dev
npx prisma init
```

### 2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  password String
  palettes Palette[]
}

model Palette {
  id       Int      @id @default(autoincrement())
  name     String
  colors   String[]
  user     User     @relation(fields: [userId], references: [id])
  userId   Int
  createdAt DateTime @default(now())
}
```

### 3. Generate and Migrate DB:
```
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Data (Optional):
```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@colorra.app',
      password: 'securepassword', // hash in production
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

Then run:
```
npx tsx prisma/seed.ts
```

> Note: Prisma and SQLite are lightweight and fast, suitable for small to medium scale applications.

---

## 🛠️ GitHub Copilot Instructions

To GitHub Copilot:

You’re assisting in building **Colorra**, a modern color palette web app. Stick to the stack and structure above. 

### Key Instructions:

- Don’t use deprecated packages
- Use **shadcn/ui** for all UI components
- Use **TypeScript** across frontend and backend
- Ensure all components are **responsive**
- Sidebar should collapse into a hamburger toggle on smaller screens
- Persist tokens locally with Zustand, and keep auth logic clean
- Use Prisma best practices: data validation, error handling, clear schema design

Ensure each page has the necessary metadata, headers, and accessibility tags.

---

### ✅ Pages Required:
- **Home Page:** App intro, benefits, how it works
- **Sign Up / Sign In Pages:** Auth logic + Zustand
- **Dashboard Page:** CRUD for palettes, color pickers, upload images
- **User Profile Page:** Info, logout, settings

---

### Hosting Note
Tokens stored in Zustand + localStorage are **browser-specific**. Each device/browser has isolated localStorage, so login sessions don’t carry across devices. This is standard.

---

**Let’s build Colorra with excellent UX, clean code, and modern tooling.**
