# Enterprise Employee & HR Management Portal

A modern, full-stack Employee & Human Resources Management Portal built with **React**, **Vite**, **Tailwind CSS**, and **JSON Server**. Designed with SaaS-grade aesthetics inspired by enterprise HR platforms.

---

## Key Features

1. **Workforce Analytics & Interactive Dashboard**
   - Real-time statistics: Total Staff, Active Ratio, Inactive Flagging, Department Count, and Average Monthly Salary.
   - Dynamic charts powered by **Recharts**:
     - *Employees by Department* (Bar Chart)
     - *Workforce Status Distribution* (Donut/Pie Chart)
     - *Employee Joining Trends* (Line Chart)
   - Real-time department allocation breakdown and recent hire feeds.

2. **Employee Directory & CRUD Management**
   - Search across employee names, employee codes, and email addresses.
   - Filter by Department, Designation, and Employment Status.
   - Dynamic multi-criteria sorting (by Name, Monthly Salary, and Joining Date).
   - Clean client-side pagination and CSV export capability.
   - Modal confirmation before executing deletions.

3. **Employee Registration & Edit Modules**
   - Controlled forms with real-time field validation (Email, Phone, Salary, Required fields).
   - Dynamic department and designation mapping.
   - Duplicate Employee Code detection against the database.
   - Instant visual feedback and custom floating Toast notifications.

4. **Dedicated Employee Details Page**
   - Detailed profile views displaying contact details, organizational units, tenure in years, and annualized CTC.
   - Direct shortcuts to edit or remove records.

5. **Departments & Designations Management**
   - Live employee headcount computation per department.
   - Modal-driven CRUD operations for departments and operational roles.

6. **System & Organization Settings**
   - Entity defaults, currency preferences, notification triggers, and live JSON Server health check.

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6
- **Styling**: Tailwind CSS, Plus Jakarta Sans typography
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **API Client**: Axios with centralized error handling
- **Backend Mock Database**: JSON Server (`db.json`)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the JSON Server (Backend)
In your first terminal, start the mock REST API:
```bash
npx json-server --watch db.json --port 3000
```
*The server will expose:*
- `http://localhost:3000/employees`
- `http://localhost:3000/departments`
- `http://localhost:3000/designations`

### 3. Start the Frontend Application
In your second terminal, launch the Vite dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
├── db.json                     # JSON Server database (16+ employees, departments, designations)
├── index.html                  # HTML entry point with Plus Jakarta Sans fonts
├── package.json
├── tailwind.config.js          # Tailwind styling definitions & custom color schemes
├── vite.config.js
└── src/
    ├── App.jsx                 # Route configurations and layout wrapper
    ├── main.jsx                # App bootstrap with BrowserRouter & ToastProvider
    ├── index.css               # Global styles & Tailwind directives
    ├── context/
    │   └── ToastContext.jsx    # Custom animated Toast notification system
    ├── services/
    │   └── api.js              # Centralized Axios API service layer (GET, POST, PUT, DELETE)
    ├── components/
    │   ├── Sidebar.jsx         # Dark navy enterprise sidebar with active indicators
    │   ├── Navbar.jsx          # Top bar with global search, notifications, & user profile
    │   ├── StatCard.jsx        # Metric KPI cards
    │   ├── EmployeeTable.jsx   # Responsive employee data grid with badges & actions
    │   ├── EmployeeForm.jsx    # Controlled registration/edit form with validations
    │   ├── SearchBar.jsx       # Reusable search input with clear trigger
    │   ├── Pagination.jsx      # Pagination component
    │   └── ConfirmDialog.jsx   # Modal confirmation dialog for deletions
    └── pages/
        ├── Dashboard.jsx       # Analytics overview with dynamic Recharts
        ├── Employees.jsx       # Employee directory with filters and sorting
        ├── AddEmployee.jsx     # Employee registration
        ├── EmployeeDetails.jsx # Detailed employee profile
        ├── EditEmployee.jsx    # Employee edit form
        ├── Departments.jsx     # Department management & headcount tracking
        ├── Designations.jsx    # Designations management
        └── Settings.jsx        # System settings & API health check
```

