# Auto Mail Generation

An automated email generation system with OCR processing, built with Node.js backend and React frontend.

## Project Structure

```
auto-mail-generation/
├── backend/          # Node.js Express server
│   ├── config/       # Database and external service configurations
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   ├── services/     # Business logic services
│   ├── uploads/      # File upload directory
│   ├── scripts/      # Utility scripts
│   └── server.js     # Main server file
└── frontend/         # React + Vite application
    ├── src/          # Source code
    │   ├── components/  # React components
    │   └── assets/      # Static assets
    ├── public/       # Public assets
    └── vite.config.ts   # Vite configuration
```

## Backend

### Technologies
- Node.js
- Express.js
- MongoDB (configured in `config/db.js`)
- Google APIs (configured in `config/google.js`)
- Tesseract OCR (eng.traineddata)

### Services
- **gmailService**: Gmail integration for email operations
- **ocrService**: Optical Character Recognition for document processing
- **grokService**: AI-powered text processing

### API Routes
- **Auth Routes** (`/api/auth`): User authentication
- **Application Routes** (`/api/applications`): Application management
- **Profile Routes** (`/api/profile`): User profile management

### Setup

```bash
cd backend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=<your_mongodb_uri>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GMAIL_ADDRESS=<your_gmail_address>
GMAIL_PASSWORD=<your_app_password>
```

## Frontend

### Technologies
- React (TypeScript)
- Vite
- CSS3

### Components
- **Antigravity**: Physics-based animation component
- **DecryptedText**: Text decryption/reveal effect
- **ScrollVelocity**: Scroll-based animation
- **SplitText**: Text splitting effects
- **TextType**: Typing animation component

### Setup

```bash
cd frontend
npm install
npm run dev
```

## Running the Project

1. **Backend**: 
   ```bash
   cd backend && npm start
   ```
   Server runs on http://localhost:5000 (or configured port)

2. **Frontend**:
   ```bash
   cd frontend && npm run dev
   ```
   App runs on http://localhost:5173 (default Vite port)

## Key Features

- **User Authentication**: Secure login/signup system
- **OCR Processing**: Extract text from images using Tesseract
- **Email Generation**: Automated email creation with AI assistance
- **Gmail Integration**: Send generated emails directly from Gmail
- **User Profiles**: Manage user information and preferences
- **Application Management**: Track and manage email applications

## Development

### Scripts

**Backend**:
- `npm start` - Start the server
- `npm run check_db` - Check database connection

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

Proprietary - All rights reserved
