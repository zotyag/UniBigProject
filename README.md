# SmartCV

An AI-powered web application that helps users create professional CVs and cover letters with ease.



## Overview

This web application simplifies the process of creating professional CVs and cover letters by leveraging artificial intelligence. Users can generate documents automatically using AI or manually craft them using pre-designed templates. The system ensures grammatically correct, professionally structured documents that stand out to employers.

### Key Features

- **AI-Powered Generation**: Create CVs and cover letters using Google Gemini API with personalized content
- **PDF Export**: Download documents as ATS-compatible PDFs
- **Version Control**: Save and manage multiple document versions for different job applications
- **Secure Authentication**: JWT-based user authentication with bcrypt password hashing

## Project documents

Requirements Specification ([requirements_specification.md](Docs/requirements-specification.md)).

Functional Specification ([functional_specification.md](Docs/functional-specification.md)).

System Design ([system_design.md](Docs/system-design.md)).

## Tech Stack

### Frontend

- **React.js** - UI framework for building responsive interfaces<img src="Docs/Images/react.svg" alt="Diagram" width="40" height="30">
- **HTML5 \& CSS3** - Modern web standards<img src="Docs/Images/html.svg" alt="Diagram" width="40" height="30"><img src="Docs/Images/css.svg" alt="Diagram" width="40" height="30">
- **Bootstrap 5 \& Tailwind CSS** - Styling frameworks<img src="Docs/Images/bootstrap.svg" alt="Diagram" width="40" height="30"><img src="Docs/Images/tailwindcss.svg" alt="Diagram" width="40" height="30">

### Backend

- **Node.js** - JavaScript runtime environment<img src="Docs/Images/node.svg" alt="Diagram" width="40" height="30">
- **Express.js** - Web application framework<img src="Docs/Images/expres.svg" alt="Diagram" width="40" height="30">
- **JWT** - Secure token-based authentication<img src="Docs/Images/jwt.svg" alt="Diagram" width="40" height="30">

### Database

- **PostgreSQL** - Relational database for user data and metadata<img src="Docs/Images/postgresql.svg" alt="Diagram" width="40" height="30">
- **MongoDB** - Document-oriented storage for flexible CV/cover letter content<img src="Docs/Images/mongo.svg" alt="Diagram" width="40" height="30">

### External Services

- **Google Gemini API** - AI-powered content generation<img src="Docs/Images/gemini.svg" alt="Diagram" width="40" height="30">
- **Microsoft Azure** - Cloud hosting platform<img src="Docs/Images/azure.svg" alt="Diagram" width="40" height="30">
- **Railway** - Cloud hosting platform for databases<img src="Docs/Images/railway.svg" alt="Diagram" width="40" height="30">


### Development Tools

- **Visual Studio Code / WebStorm** - IDEs
- **Git \& GitHub** - Version control and collaboration
- **pgAdmin \& MongoDB Compass** - Database management tools

## Architecture

The application follows a three-tier architecture:

```
┌──────────────────┐
│   React Frontend │
│   (Client-side)  │
└────────┬─────────┘
         │ REST API
┌────────▼─────────┐
│  Node.js Backend │
│   (Express.js)   │
└────┬───────────┬─┘
     │           │
┌────▼──────┐ ┌──▼──────┐
│PostgreSQL │ │ MongoDB │
│ (Metadata)│ │(Content)│
└───────────┘ └─────────┘
```

- **Frontend**: Handles user interactions, form validation, and PDF rendering
- **Backend**: Manages authentication, AI orchestration, and business logic
- **Databases**: PostgreSQL stores user accounts and document metadata while MongoDB stores flexible JSON content


## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- PostgreSQL database instance
- MongoDB database instance
- Google Gemini API key


### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cv-generator.git
cd cv-generator
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create a `.env` file in the backend directory:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/cvdb
MONGODB_URI=mongodb://localhost:27017/cv-documents
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
```

5. **Initialize databases**

```bash
cd backend
npm run migrate
```


### Running the Application

**Development mode:**

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm start
```


## Usage

1. **Register/Login**: Create an account or sign in to access the dashboard
2. **Choose Document Type**: Select CV or Cover Letter generation
3. **Select Mode**: Choose AI-assisted or manual creation
4. **Fill in Details**: Provide personal information, work experience, education, and skills
5. **Generate/Edit**: Let AI create the document or manually craft it using templates
6. **Export**: Download the finalized document as a PDF


## Project Structure

```
cv-generator/
├── backend/
│   ├── node_modules/      # Backend dependencies
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── app.js         # Express app configuration
│   │   └── server.js      # Server entry point
│   ├── .env               # Environment variables
│   ├── db.js              # Database connection
│   ├── package-lock.json  # Dependency lock file
│   ├── package.json       # Backend dependencies
│   └── setup.sh           # Setup script
├── frontend/
│   ├── node_modules/      # Frontend dependencies
│   ├── public/
│   │   └── vite.svg       # Static assets
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # React components
│   │   ├── pages/         # Page-level components
│   │   ├── App.css        # App styles
│   │   ├── App.jsx        # Main App component
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── .gitignore         # Git ignore file
│   ├── eslint.config.js   # ESLint configuration
│   ├── index.html         # HTML template
│   ├── package-lock.json  # Dependency lock file
│   ├── package.json       # Frontend dependencies
│   ├── postcss.config.js  # PostCSS configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.js     # Vite configuration
├── Docs/                  # Documentation
└── README.md              # Project documentation
```


## Security \& Compliance

- **GDPR Compliant**: User data handling follows GDPR regulations
- **Password Security**: bcrypt hashing with salt rounds
- **HTTPS Only**: All communications encrypted in transit
- **Input Validation**: Server-side validation on all endpoints
- **API Key Protection**: Sensitive credentials stored server-side only


## Contact

Project maintained by [The Boys]

