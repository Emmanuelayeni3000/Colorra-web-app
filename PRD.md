# Product Requirements Document (PRD) – Colorra

## 1. Product Overview

**Colorra** is a web application that enables users to generate, customize, and manage color palettes. It allows authentication, palette creation and editing, image-based palette generation, and favoriting palettes. The initial focus is on providing a seamless UI/UX for core features.

---

## 2. Target Audience

- Designers
- Developers
- Artists
- Branding experts
- General users who need aesthetic color palettes

---

## 3. Core Features

### 3.1 User Authentication
- Sign up
- Sign in
- Sign out
- Persist user session using Zustand + localStorage
- Use hashed password storage
- Secure authentication flow using JWT (optional)

### 3.2 Palette Creation
- Generate palettes manually using color pickers (react-color or @radix-ui/colors)
- Extract colors from images (color-thief or node-vibrant)
- Assign a name and description to each palette
- Save palette to user’s account

### 3.3 Palette Management
- View saved palettes
- Edit palette colors, name, and description
- Delete palettes
- Mark/unmark palettes as favorite
- Toggle favorite state with a heart icon

### 3.4 Responsive Dashboard
- View all palettes
- Filter palettes (all, favorites)
- Toggle sidebar (hamburger on small screens)
- Modern layout with scroll animations and clean UI

### 3.5 User Profile
- View account info
- List all palettes created
- Sign out

---

## 4. Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Zustand (for auth and palette state)
- shadcn/ui components
- San-serif fonts
- Scroll animations
- Responsive sidebar with hamburger toggle

### Backend
- Node.js + Express
- RESTful API
- Prisma ORM
- SQLite database (development)
- JWT for secure authentication

---

## 5. Database Models (Prisma + SQLite)

### User
```ts
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  palettes  Palette[]
}
```

### Palette
```ts
model Palette {
  id          String   @id @default(uuid())
  userId      String
  name        String
  description String?
  colors      String[] // Stored as array of hex values
  imageUrl    String?
  isFavorite  Boolean  @default(false)

  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 6. UI Components & Pages

### Pages
- `/` — Home (modern landing with scroll animations)
- `/signup` — Sign up
- `/signin` — Sign in
- `/dashboard` — Dashboard (palette creation, management)
- `/profile` — User profile

### Components
- ColorPicker
- PaletteCard
- ImageUploader
- Sidebar (collapsible)
- TopNavbar
- AuthForm
- FavoriteToggle

---

## 7. UX & UI Guidelines

- Modern, minimal, and clean
- Primary Color Theme: Deep Indigo + Soft Blue + Accent Coral or Mint
- Smooth hover animations
- Responsive from mobile to desktop
- Use icons from lucide-react or tabler-icons

---

## 8. Project Structure Suggestion

```
/client
  /components
  /pages
  /store
  /utils
  /styles
/server
  /controllers
  /routes
  /models
  /middleware
  /prisma
```

---

## 9. Additional Notes

- Tokens stored in localStorage will work per device/browser session.
- Prisma SQLite is ideal for development. Later, upgrade to PostgreSQL or MySQL for production.
- Use `.env` to store secrets (JWT secret, DB URL).
- Prefer functional components and React hooks throughout the app.
