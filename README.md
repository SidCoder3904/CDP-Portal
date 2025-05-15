# Career Development Portal (CDP)

## Overview
The Career Development Portal is a full-stack web application designed to manage placement cycles, job postings, student applications, and the overall recruitment process for educational institutions.

## Repository
```
git clone https://github.com/SidCoder3904/CDP-Portal.git
cd CDP-Portal
```

## Setup Instructions

### Backend Setup

1. **Set up Python virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment
   # For Windows:
   venv\Scripts\activate
   
   # For macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/cdp
   JWT_SECRET_KEY=your_jwt_secret_key
   MAIL_SERVER=smtp.example.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@example.com
   MAIL_PASSWORD=your_email_password
   MAIL_USE_TLS=True
   ```

4. **Run the backend server**:
   ```bash
   python main.py
   ```
   The backend server will run on http://localhost:5000 by default.

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd cdp_portal
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the cdp_portal directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:3000.

## Project Structure

### Backend Structure
```
backend/
│
├── app/                    # Main application package
│   ├── __init__.py         # App initialization and configuration
│   ├── config.py           # Configuration settings
│   ├── models.py           # Data models
│   │
│   ├── routes/             # API routes/endpoints
│   │   ├── auth.py         # Authentication routes
│   │   ├── jobs.py         # Job management routes
│   │   ├── students.py     # Student management routes
│   │   └── ...
│   │
│   ├── services/           # Business logic
│   │   ├── placement_service.py
│   │   └── ...
│   │
│   └── utils/              # Utility functions and helpers
│       └── errors.py       # Error handlers
│
├── uploads/                # Directory for uploaded files
├── requirements.txt        # Python dependencies
├── main.py                 # Application entry point
└── schema.sql              # Database schema
```

### Frontend Structure
```
cdp_portal/
│
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── page.tsx        # Home page
│   │   ├── login/          # Login pages
│   │   ├── dashboard/      # Dashboard pages
│   │   └── ...
│   │
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── CycleStats.tsx  # Cycle statistics component
│   │   ├── JobDetails.tsx  # Job details component
│   │   └── ...
│   │
│   ├── context/            # React context providers
│   │   └── auth-context.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── ...
│   │
│   └── lib/                # Utility functions
│       └── ...
│
├── package.json            # npm dependencies
└── next.config.js          # Next.js configuration
```

For a more detailed and comprehensive directory structure, please refer to [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Making Changes

### Backend Changes

#### Adding/Modifying API Endpoints
1. Locate the appropriate file in `backend/app/routes/`
2. Add or modify route handlers
3. Implement business logic in `backend/app/services/` folder
4. Import and use services in your route handlers
5. Register new blueprints in `backend/app/__init__.py` if adding new route files

#### Database Schema Changes
1. Update MongoDB collections and structure in related service files
2. Update `schema.sql` if necessary for documentation
3. Update corresponding data models in `backend/app/models.py`

### Frontend Changes

#### UI Components
1. Locate or create components in `cdp_portal/src/components/`
2. Follow the existing component patterns
3. Use shadcn/ui components from `cdp_portal/src/components/ui/` where possible

#### Pages/Routes
1. Add or modify pages in `cdp_portal/src/app/` directory following Next.js app router structure
2. Import and use components in your pages

#### API Calls
1. Create or update API call functions in service files
2. Handle responses and errors appropriately
3. Use existing patterns for authentication and error handling

## Key Features and Components

### CycleStats Component
- Displays company and student counts from JobsList and StudentsList components

### Job Management
- JobDetails and JobWorkflow components handle job data structure
- Includes eligibility criteria, hiring flow steps, and package information

### Candidate Selection
- JobApplicants component allows selecting and marking candidates
- Uses applicationId to identify applications for status updates
- UI differentiates between "Application Status" and "Hiring Stage"

### Date Formatting
- Dates displayed in readable format (MMM DD, YYYY) throughout the application

### Placement Cycles
- Functionality to select and mark placement cycles as inactive
- Features "Mark Inactive" button and selection checkboxes

### Reports
- Report generation with multiple report types
- Company-wise recruitment reports

## Deployment

### Backend Deployment
1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Deploy on a service like Heroku, AWS, or similar platforms

### Frontend Deployment
1. Build the Next.js application
   ```bash
   npm run build
   ```
2. Deploy the built application to services like Vercel, Netlify, or similar platforms 