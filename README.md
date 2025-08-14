# Simple Notes App

A clean and simple notes application inspired by Apple Notes, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✨ **User Authentication**: Sign up, sign in, and secure user sessions
- 📝 **Note Management**: Create, edit, and delete notes
- 🎨 **Clean UI**: Minimal and modern design using shadcn/ui components
- 🔄 **Real-time Collaboration**: Basic collaboration indicators (simulated)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🗄️ **Local Database**: SQLite with Prisma ORM for local development
- 🚀 **Fast Development**: Hot reload and optimized development experience

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Real-time**: Socket.IO (basic setup for collaboration simulation)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd simple-note-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Account

The app comes with a pre-configured demo account:

- **Email**: `demo@example.com`
- **Password**: `demo123`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── notes/         # Notes CRUD endpoints
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   └── providers/         # Context providers
└── lib/                   # Utility functions
    ├── auth.ts            # NextAuth configuration
    ├── db.ts              # Database utilities
    └── utils.ts           # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:push` - Push schema changes to database

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Notes
- `GET /api/notes` - List user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Database Schema

The app uses a simple two-table schema:

- **User**: id, email, password, name, timestamps
- **Note**: id, title, content, userId, timestamps

## Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.ts`
- Customize component variants in individual component files

### Components
- All UI components are in `src/components/ui/`
- Follow shadcn/ui patterns for consistency
- Easy to swap or modify components

## Deployment

### Local to Production
1. Update database connection in `prisma/schema.prisma`
2. Set environment variables for production
3. Run `npm run build` and `npm run start`

### Environment Variables
Create a `.env` file for production:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="your-domain"
```

## Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Rich text editor with markdown support
- [ ] Note sharing and permissions
- [ ] File attachments
- [ ] Search and filtering
- [ ] Tags and categories
- [ ] Dark mode toggle
- [ ] Export/import functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

Built with ❤️ using Next.js and modern web technologies.
