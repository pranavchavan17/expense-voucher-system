# Expense Voucher Management System

A full-stack **Expense Voucher Management System** built using **Spring Boot**, **React**, **MySQL**, and **JWT Authentication**.

The application automates the complete expense reimbursement workflow inside an organization by providing role-based access for **Employees**, **Directors**, and **Accounts**.

---

# Features

## Authentication

- JWT Authentication
- Role-Based Authorization
- Secure Login
- Protected Routes
- Automatic Session Handling
- Logout

---

# User Roles

## Employee

- Login
- Dashboard
- Create Expense Voucher
- Edit Draft Voucher
- Delete Draft Voucher
- Submit Voucher for Approval
- View Voucher Details
- Upload Signature
- View Personal Voucher History

---

## Director

- Login
- Dashboard
- View Pending Approvals
- View Voucher Details
- Approve Voucher
- Reject Voucher
- Upload Digital Signature

---

## Accounts

- Login
- Dashboard
- View Approved Vouchers
- Process Payments
- Payment History
- View Voucher Details

---

# Expense Voucher Workflow

```
Employee

      │

Create Voucher

      │

Upload Receipt

      │

Submit Voucher

      │

▼

Director Review

      │

Approve / Reject

      │

▼

Accounts Department

      │

Mark as Paid

      │

▼

Payment History
```

---

# Technology Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven
- Lombok

---

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

---

## Database

- MySQL

---

## API Documentation

- Swagger OpenAPI

---

# Project Structure

```
expense-voucher-system/

│

├── backend/

│   ├── src/main/java

│   ├── src/main/resources

│   ├── pom.xml

│

├── frontend/

│   ├── src

│   ├── public

│   ├── package.json

│

├── README.md

├── .env.example

└── database.sql
```

---

# Project Setup

## 1. Clone Repository

```bash
git clone https://github.com/pranavchavan17/expense-voucher-system.git
```

---

## 2. Backend Setup

Navigate to backend

```bash
cd backend
```

Install dependencies

```bash
mvn clean install
```

Run application

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## 3. Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Environment Variables

## Backend

Configure the following in `application.properties`

```
spring.datasource.url=jdbc:mysql://localhost:3306/expense_voucher_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

jwt.secret=YOUR_SECRET_KEY
jwt.expiration=86400000
```

---

## Frontend

Create `.env`

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

# API Documentation

Swagger UI

```
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON

```
http://localhost:8080/v3/api-docs
```
---

# Database Schema

## users

Stores

- User Information
- Email
- Password
- Role
- Signature
- Profile Details

---

## vouchers

Stores

- Voucher Number
- Expense Date
- Voucher Date
- Department
- Expense Title
- Expense Category
- Description
- Amount
- Receipt
- Employee Signature
- Director Signature
- Voucher Status

---

## Payment Information

Stores

- Payment Reference
- Payment Date
- Paid Amount

---

# Voucher Status Flow

```
DRAFT
↓
SUBMITTED
↓
APPROVED
↓
PAID
```
or
```
SUBMITTED

↓

REJECTED
---

# Roles

## Employee

Allowed Operations

- Create Voucher
- Update Draft
- Delete Draft
- Submit Voucher
- Upload Signature

---

## Director

Allowed Operations

- Approve Voucher
- Reject Voucher
- Upload Signature

---

## Accounts

Allowed Operations

- Mark Voucher as Paid
- View Payment History
--

# Authentication

JWT Token Authentication

Every protected API requires
```
Authorization
Bearer <JWT_TOKEN>
```
---

# Major Functionalities

- Secure Login
- JWT Authentication
- Role-Based Access
- Expense Voucher Creation
- Receipt Upload
- Voucher Approval
- Voucher Rejection
- Payment Processing
- Dashboard Statistics
- Signature Upload
- Payment History
- Swagger Documentation

---

# Default Users
## Director
```
Email
director@gmail.com

Password
Director@123
```
---
## Accounts
```
Email
accounts@gmail.com

Password
Accounts@123
```
---

## Employee

Employees can register using
```
POST
/api/v1/auth/register
```
---

# Assumptions

- One receipt is attached per voucher.
- Each user maintains a single signature.
- Director approval is required before payment.
- Only approved vouchers can be paid.
- JWT is used for stateless authentication.
- Role-based authorization is enforced on all protected APIs.

---

# Future Enhancements

- Email Notifications
- Cloud Storage
- PDF Generation
- Digital Signature Embedding
- Audit Logs
- Advanced Search & Filters
- Export Reports (PDF/Excel)
- Admin Management Module

---

# Author

**Pranav Chavan**

B.Tech Computer Engineering
Java Full Stack Developer

---

# License

This project was developed as part of a technical assessment for demonstration and evaluation purposes.
