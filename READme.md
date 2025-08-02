# Colorra Web App

Colorra is a modern web application for creating, managing, and sharing color palettes. It features user authentication, persistent user profiles with avatar uploads, and a beautiful, responsive UI.

## Features

- 🎨 **Palette Creation**: Easily create and save custom color palettes.
- 🖼️ **Avatar Upload**: Upload and update your profile avatar with persistent storage.
- 👤 **User Authentication**: Secure JWT-based login and registration.
- � **Password Reset**: Secure password reset functionality with email verification.
- 📧 **Email Service**: Automated email notifications for password resets.
- ✨ **Modern Animations**: Beautiful scroll animations and interactive UI elements.
- �🗂️ **Dashboard**: View and manage your palettes in a user-friendly dashboard.
- ⚡ **Fast & Responsive**: Built with Next.js, React, Zustand, and shadcn/ui for a seamless experience.
- 🗄️ **Persistent Storage**: All user data and images are stored securely in a SQLite database via Prisma ORM.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Zustand, shadcn/ui, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with SMTP support
- **File Uploads**: Multer middleware, Express static file serving
- **Security**: bcryptjs password hashing, crypto token generation

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Emmanuelayeni3000/Colorra-web-app.git
   cd Colorra-web-app
   ```
2. **Install dependencies:**
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `backend` and `frontend` folders and fill in the required values.
   - For email functionality, configure SMTP settings in the backend `.env` file:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     FROM_EMAIL=noreply@colorra.com
     ```

4. **Set up the database:**
   ```sh
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: Creates demo data
   ```

5. **Start the backend server:**
   ```sh
   npm run dev
   ```

6. **Start the frontend app:**
   ```sh
   cd ../frontend
   npm run dev
   ```

7. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
Colorra-web-app/
├── backend/         # Express API, Prisma, uploads
├── frontend/        # Next.js app, React components
├── PRD.md           # Product requirements
├── README.md        # Project documentation
```

## Development
- **Frontend**: Located in `/frontend`. Uses Next.js, Zustand, shadcn/ui, Framer Motion.
- **Backend**: Located in `/backend`. Uses Express, Prisma, Multer, Nodemailer.
- **Database**: SQLite with Prisma ORM, includes user authentication and password reset.
- **Uploads**: User avatars are stored in `/backend/uploads` and served statically.
- **Email**: Password reset emails sent via Nodemailer (SMTP configuration required).

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Author
[Emmanuel Ayeni](mailto:ayeniemmanuel914@gmail.com)

---

Enjoy using Colorra! If you have any questions or feedback, feel free to open an issue or contact the author.
