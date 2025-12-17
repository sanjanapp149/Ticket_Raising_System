# Ticket_Management_System
Ticket Raising System

This project is a secure internal IT Incident Management System designed to help employees report IT issues, attach supporting evidence, and track resolution status, while allowing administrators to manage the workflow efficiently.

The system enforces strict Role-Based Access Control (RBAC) using JWT authentication. Employees are limited to their own tickets, while Admins can view and manage all tickets, assign priorities, update status, and track audit history. Sensitive data is protected using field-level encryption to ensure confidentiality at rest and in transit.

## Key Highlights
User registration & login
Secure JWT-based authentication
Role-based access control (Employee vs Admin)
Encrypted confidential data storage
File uploads (images & PDFs)
Audit logging for all status changes
Dockerized full-stack setup (Backend + Frontend + DB)
## Technology Used
## Backend
Python,Django,Django REST Framework,JWT Authentication (SimpleJWT),SQLite
## Frontend
React.js,Redux Toolkit,Axios,Tailwind / CSS3
## Infrastructure
Docker
## To run docker file
docker-compose up --build
## Authentication & RBAC
Roles
1) Employee
* Can create tickets
* Can view only their own tickets
* Can upload attachments
* Cannot change status, priority, or assignments
* Cannot view confidential notes
2)Admin
* Can view all tickets
* Can update ticket status
* Can assign tickets to users
* Can set priority
* Can view decrypted confidential notes
* Can delete tickets
## Ticket Management Features
a) Ticket Fields
  1) Title
  2) Description
  3) Priority (Low / Medium / High)
  4) Status (Open / In Progress / Resolved)
  5) Creator (Employee)
  6) Assigned To (Admin only)
  7) Created At / Updated At
  8) Confidential Notes (Encrypted)
  9) Attachments (Image/PDF)
  10) Audit Logs
b) Audit Log (History Tracking)
Every time  Admin changes the ticket status, the system automatically creates an audit log entry.This will allow user to track the status of the ticket.
## Setup Steps
### Option 1: Manual Setup (Recommended for development)
#### Backend (Django)
# Clone the repository
git clone <your-repo-url>
cd <project-folder>/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # On Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Run server
python manage.py runserver
Backend will run on http://127.0.0.1:8000
#### Frontend (React) 
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start

Frontend will run on http://localhost:3000

#### API Documentation
## http://127.0.0.1:8000/swagger/	
1) Interactive Swagger UI
## http://127.0.0.1:8000/redoc/	
2) Clean API documentation
   
POST  /api/auth/login/Login   (returns access & refresh) 
POST  /api/auth/register/     (Register new user)
GET   /api/auth/me/             (Get current user info)
GET   /api/tickets/             (List all tickets (admin) / my tickets)
GET   /api/tickets/<id>/        (Retrieve single ticket)
POST   /api/tickets/Create       (new ticket (with attachments))
PATCH  /api/tickets/<id>/       (Update ticket (status, assigned_to, confidential_notes))
DELETE  /api/tickets/<id>/     (Delete ticketYesYesGET/api/users/List all users (for assignment))


#### Encryption Logic

Field: confidential_notes in Ticket model
Library: cryptography.fernet (Fernet symmetric encryption)
Location: backend/tickets/utils.py

## How it works:

When an admin saves/updates confidential_notes:
The text is encrypted using a secret key before saving to DB.

When an admin views the ticket:
The encrypted value is decrypted on-the-fly using get_confidential_notes() method.

Non-admin users:
Receive null for this field (hidden completely).


