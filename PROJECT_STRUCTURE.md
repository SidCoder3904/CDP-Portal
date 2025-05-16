# CDP Portal - Complete Directory Structure

## Root Structure
```
CDP-Portal/
│
├── .git/                   # Git repository
├── backend/                # Backend Flask application
├── cdp_portal/             # Frontend Next.js application
├── .gitignore              # Git ignore file for the repository
├── README.md               # Main project documentation
├── DOCUMENTATION.md        # Technical documentation
├── TA_GUIDE.md             # Guide for TAs
└── PROJECT_STRUCTURE.md    # This file
```

## Backend Structure
```
backend/
│
├── app/                    # Main application package
│   ├── __init__.py         # App initialization and configuration
│   ├── config.py           # Configuration settings
│   ├── models.py           # Data models
│   │
│   ├── routes/             # API routes/endpoints
│   │   ├── __init__.py     # Routes package initialization
│   │   ├── admin.py        # Admin routes
│   │   ├── auth.py         # Authentication routes
│   │   ├── comment_routes.py # Comment-specific routes
│   │   ├── comments.py     # Comments general routes
│   │   ├── documents.py    # Document management routes
│   │   ├── jobs.py         # Job management routes
│   │   ├── notices.py      # Notice/announcement routes
│   │   ├── notification_routes.py # Notification routes
│   │   ├── placement_cycles.py # Placement cycle routes
│   │   ├── reports.py      # Report generation routes
│   │   └── students.py     # Student management routes
│   │
│   ├── services/           # Business logic
│   │   ├── __init__.py     # Services package initialization
│   │   ├── auth_service.py # Authentication services
│   │   ├── email_service.py # Email notification services
│   │   ├── file_service.py # File handling services
│   │   ├── placement_service.py # Placement-related services
│   │   ├── report_service.py # Report generation services
│   │   └── student_service.py # Student-related services
│   │
│   └── utils/              # Utility functions and helpers
│       ├── __init__.py     # Utils package initialization
│       ├── date_utils.py   # Date handling utilities
│       ├── errors.py       # Error handlers
│       ├── formatters.py   # Data formatting utilities
│       ├── security.py     # Security-related utilities
│       └── validators.py   # Input validation utilities
│
├── instance/               # Instance-specific configuration
│   └── .env                # Environment variables (not in repo)
│
├── migrations/             # Database migrations (if applicable)
│
├── tests/                  # Test files
│   ├── __init__.py
│   ├── conftest.py         # Test configuration
│   ├── test_auth.py        # Auth route tests
│   ├── test_jobs.py        # Jobs route tests
│   └── test_students.py    # Students route tests
│
├── uploads/                # Directory for uploaded files
│   ├── documents/          # Uploaded documents
│   ├── images/             # Uploaded images
│   └── resumes/            # Uploaded resumes
│
├── venv/                   # Python virtual environment (not in repo)
│
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore for backend
├── app.py                  # Alternative entry point
├── main.py                 # Application entry point
├── Procfile                # For deployment on platforms like Heroku
├── requirements.txt        # Python dependencies
└── schema.sql              # Database schema for reference
```

## Frontend Structure
```
cdp_portal/
│
├── .next/                  # Next.js build output (not in repo)
├── node_modules/           # npm packages (not in repo)
│
├── public/                 # Static assets
│   ├── favicon.ico         # Website favicon
│   ├── logo.svg            # Logo image
│   ├── placeholder.svg     # Placeholder image
│   └── images/             # Static images
│       ├── backgrounds/    # Background images
│       └── icons/          # Icon images
│
├── src/                    # Source code
│   ├── app/                # Next.js app router pages
│   │   ├── (auth)/         # Authentication routes
│   │   │   ├── login/      # Login page
│   │   │   │   └── page.tsx # Login page component
│   │   │   ├── register/   # Registration page
│   │   │   │   └── page.tsx # Registration page component
│   │   │   └── layout.tsx  # Auth layout
│   │   │
│   │   ├── (dashboard)/    # Dashboard routes
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   │   └── page.tsx # Dashboard page component
│   │   │   └── layout.tsx  # Dashboard layout
│   │   │
│   │   ├── admin/          # Admin pages
│   │   │   ├── users/      # User management
│   │   │   │   └── page.tsx # Users page component
│   │   │   ├── settings/   # Admin settings
│   │   │   │   └── page.tsx # Settings page component
│   │   │   └── page.tsx    # Admin main page component
│   │   │
│   │   ├── students/       # Student management pages
│   │   │   ├── [id]/       # Student detail pages
│   │   │   │   └── page.tsx # Student detail component
│   │   │   ├── create/     # Create student page
│   │   │   │   └── page.tsx # Create student component
│   │   │   └── page.tsx    # Students list component
│   │   │
│   │   ├── jobs/           # Job management pages
│   │   │   ├── [id]/       # Job detail pages
│   │   │   │   ├── applicants/ # Job applicants page
│   │   │   │   │   └── page.tsx # Applicants component
│   │   │   │   └── page.tsx # Job detail component
│   │   │   ├── create/     # Create job page
│   │   │   │   └── page.tsx # Create job component
│   │   │   └── page.tsx    # Jobs list component
│   │   │
│   │   ├── cycles/         # Placement cycle pages
│   │   │   ├── [id]/       # Cycle detail pages
│   │   │   │   └── page.tsx # Cycle detail component
│   │   │   ├── create/     # Create cycle page
│   │   │   │   └── page.tsx # Create cycle component
│   │   │   └── page.tsx    # Cycles list component
│   │   │
│   │   ├── reports/        # Report generation pages
│   │   │   └── page.tsx    # Reports page component
│   │   │
│   │   ├── error.tsx       # Error handling component
│   │   ├── favicon.ico     # Favicon
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   ├── loading.tsx     # Loading state component
│   │   ├── not-found.tsx   # 404 page
│   │   └── page.tsx        # Home page
│   │
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Shadcn UI components
│   │   │   ├── alert-dialog.tsx # Alert dialog component
│   │   │   ├── avatar.tsx  # Avatar component
│   │   │   ├── button.tsx  # Button component
│   │   │   ├── checkbox.tsx # Checkbox component
│   │   │   ├── dialog.tsx  # Dialog component
│   │   │   ├── dropdown-menu.tsx # Dropdown menu component
│   │   │   ├── form.tsx    # Form component
│   │   │   ├── input.tsx   # Input component
│   │   │   ├── label.tsx   # Label component
│   │   │   ├── select.tsx  # Select component
│   │   │   ├── separator.tsx # Separator component
│   │   │   ├── tabs.tsx    # Tabs component
│   │   │   ├── toast.tsx   # Toast component
│   │   │   ├── tooltip.tsx # Tooltip component
│   │   │   └── ...
│   │   │
│   │   ├── layout/         # Layout components
│   │   │   ├── footer.tsx  # Footer component
│   │   │   ├── header.tsx  # Header component
│   │   │   ├── main-nav.tsx # Main navigation
│   │   │   └── sidebar.tsx # Sidebar component
│   │   │
│   │   ├── CycleStats.tsx  # Cycle statistics component
│   │   ├── DatePicker.tsx  # Date picker component
│   │   ├── FileUpload.tsx  # File upload component
│   │   ├── JobApplicants.tsx # Job applicants component
│   │   ├── JobDetails.tsx  # Job details component
│   │   ├── JobsList.tsx    # Jobs list component
│   │   ├── JobWorkflow.tsx # Job workflow component
│   │   ├── NoticeList.tsx  # Notice list component
│   │   ├── SearchInput.tsx # Search input component
│   │   ├── StudentsList.tsx # Students list component
│   │   ├── image-crop-model.tsx # Image cropping component
│   │   └── ...
│   │
│   ├── context/            # React context providers
│   │   ├── auth-context.tsx # Authentication context
│   │   ├── theme-context.tsx # Theme context
│   │   └── ...
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── use-auth.ts     # Authentication hook
│   │   ├── use-debounce.ts # Debounce hook
│   │   ├── use-local-storage.ts # Local storage hook
│   │   ├── use-toast.ts    # Toast notification hook
│   │   └── ...
│   │
│   ├── lib/                # Utility functions
│   │   ├── api.ts          # API client functions
│   │   ├── constants.ts    # Application constants
│   │   ├── date-utils.ts   # Date formatting utilities
│   │   ├── helpers.ts      # Helper functions
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── utils.ts        # General utilities
│   │   └── validators.ts   # Form validation functions
│   │
│   └── image.d.ts          # Type definitions for images
│
├── .env.local              # Local environment variables (not in repo)
├── .env.example            # Example environment variables
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore for frontend
├── components.json         # Shadcn UI components configuration
├── eslint.config.mjs       # ESLint additional configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.js          # Next.js configuration
├── next.config.ts          # TypeScript Next.js configuration
├── package-lock.json       # npm lock file
├── package.json            # npm dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── README.md               # Frontend-specific documentation
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Files and Their Purposes

### Backend Key Files

- **main.py**: The entry point for the Flask application
- **app/__init__.py**: Flask application factory and configuration
- **app/config.py**: Application configuration settings
- **app/models.py**: Data model definitions
- **app/routes/**: API endpoints organized by feature
- **app/services/**: Business logic layer that interfaces with the database
- **app/utils/**: Helper functions and utilities

### Frontend Key Files

- **src/app/page.tsx**: The home page of the application
- **src/app/layout.tsx**: The root layout component
- **src/app/globals.css**: Global CSS styles
- **src/components/**: Reusable UI components
- **src/context/auth-context.tsx**: Authentication state management
- **src/lib/api.ts**: API client for backend communication
- **src/lib/date-utils.ts**: Date formatting utilities
- **next.config.js**: Next.js configuration

## Navigation Structure

```
Home
├── Dashboard
├── Placement Cycles
│   ├── Cycle List
│   ├── Create Cycle
│   └── Cycle Details
├── Jobs
│   ├── Jobs List
│   ├── Create Job
│   └── Job Details
│       └── Applicants
├── Students
│   ├── Students List
│   ├── Create Student
│   └── Student Details
├── Reports
├── Notices
└── Admin
    ├── Users
    └── Settings
``` 