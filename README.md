# SmartCV

An AI-powered web application that helps users create professional CVs and cover letters with ease.



## Overview
`
This web application simplifies the process of creating professional CVs and cover letters by leveraging artificial intelligence. Users can generate documents automatically using AI or manually craft them using pre-designed templates. The system ensures grammatically correct, professionally structured documents that stand out to employers.
`
### Key Features

- **AI-Powered Generation**: Create CVs and cover letters using Google Gemini API with personalized content[^3]
- **Manual Template Editor**: Choose from professionally designed templates for hands-on customization[^4]
- **PDF Export**: Download documents as ATS-compatible PDFs[^5]
- **Version Control**: Save and manage multiple document versions for different job applications[^1]
- **Responsive Design**: Fully functional on desktop and mobile devices[^2]
- **Secure Authentication**: JWT-based user authentication with bcrypt password hashing[^3]


## Tech Stack

### Frontend

- **React.js** - UI framework for building responsive interfaces[^1]
- **HTML5 \& CSS3** - Modern web standards[^2]
- **Bootstrap 5 \& Tailwind CSS** - Styling frameworks[^3]
- **jsPDF** - Client-side PDF generation[^4]


### Backend

- **Node.js** - JavaScript runtime environment[^1]
- **Express.js** - Web application framework[^2]
- **JWT** - Secure token-based authentication[^3]


### Database

- **PostgreSQL** - Relational database for user data and metadata[^1]
- **MongoDB** - Document-oriented storage for flexible CV/cover letter content[^2]


### External Services

- **Google Gemini API** - AI-powered content generation[^3]
- **Microsoft Azure** - Cloud hosting platform[^4]


### Development Tools

- **Visual Studio Code / WebStorm** - IDEs[^1]
- **Git \& GitHub** - Version control and collaboration[^2]
- **pgAdmin \& MongoDB Compass** - Database management tools[^3]


## Architecture

The application follows a three-tier architecture:[^6][^1]

```
┌─────────────────┐
│   React Frontend │
│   (Client-side)  │
└────────┬─────────┘
         │ REST API
┌────────▼─────────┐
│  Node.js Backend │
│   (Express.js)   │
└────┬────────┬────┘
     │        │
┌────▼────┐ ┌▼────────┐
│PostgreSQL│ │ MongoDB │
│ (Metadata)│ │(Content)│
└──────────┘ └─────────┘
```

- **Frontend**: Handles user interactions, form validation, and PDF rendering[^1]
- **Backend**: Manages authentication, AI orchestration, and business logic[^2]
- **Databases**: PostgreSQL stores user accounts and document metadata; MongoDB stores flexible JSON content[^3]


## Getting Started

### Prerequisites

- Node.js (v16 or higher)[^1]
- npm or yarn package manager[^2]
- PostgreSQL database instance[^3]
- MongoDB database instance[^4]
- Google Gemini API key[^5]


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

The application will be available at `http://localhost:3000`.[^5][^1]

**Production build:**

```bash
cd frontend
npm run build
cd ../backend
npm start
```


## Usage

1. **Register/Login**: Create an account or sign in to access the dashboard[^1]
2. **Choose Document Type**: Select CV or Cover Letter generation[^2]
3. **Select Mode**: Choose AI-assisted or manual creation[^3]
4. **Fill in Details**: Provide personal information, work experience, education, and skills[^4]
5. **Generate/Edit**: Let AI create the document or manually craft it using templates[^5]
6. **Export**: Download the finalized document as a PDF[^1]

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration[^1]
- `POST /auth/login` - User login[^2]
- `POST /auth/refresh` - Refresh JWT token[^3]


### Document Endpoints

- `POST /cv` - Generate CV with AI[^1]
- `POST /cv/manual` - Create CV manually[^2]
- `GET /cv/:id` - Retrieve specific CV[^3]
- `PUT /cv/:id` - Update CV[^4]
- `POST /cv/:id/export` - Export CV as PDF[^5]
- `POST /letters` - Generate cover letter with AI[^1]
- `GET /templates` - Get available templates[^2]


## Testing

Run unit tests:

```bash
npm run test
```

Run integration tests:

```bash
npm run test:integration
```

The testing strategy covers:[^2][^1]

- **Unit tests**: Individual component and function validation
- **Integration tests**: API endpoint and database interaction testing
- **System tests**: End-to-end user workflow validation


## Project Structure

```
cv-generator/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   └── services/          # Business logic
└── docs/                  # Documentation
```


## Security \& Compliance

- **GDPR Compliant**: User data handling follows GDPR regulations[^3]
- **Password Security**: bcrypt hashing with salt rounds[^4]
- **HTTPS Only**: All communications encrypted in transit[^5]
- **Input Validation**: Server-side validation on all endpoints[^1]
- **API Key Protection**: Sensitive credentials stored server-side only[^2]


## Contributing

Contributions are welcome! Please follow these guidelines:[^5][^1]

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes using Conventional Commits format
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Roadmap

- [x] User authentication and authorization[^1]
- [x] AI-powered CV generation[^2]
- [x] Template-based manual editing[^3]
- [x] PDF export functionality[^4]
- [ ] Cover letter generation (Sprint 4)[^5]
- [ ] Additional template designs[^1]
- [ ] Multi-language support[^2]


## Maintenance \& Support

The application follows an agile maintenance approach:[^3][^1]

- **Corrective**: Bug fixes and error resolution
- **Adaptive**: Updates for environment changes
- **Perfective**: New features and performance improvements
- **Preventive**: Proactive issue prevention


## License

This project is licensed under the MIT License - see the LICENSE file for details.[^5]

## Contact

Project maintained by [The Boys]

