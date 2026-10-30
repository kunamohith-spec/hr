import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EmployeeDetails from './pages/EmployeeDetails';
import EditEmployee from './pages/EditEmployee';
import Departments from './pages/Departments';
import Designations from './pages/Designations';
import Settings from './pages/Settings';
import { getEmployees } from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalEmployees, setGlobalEmployees] = useState([]);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Keep a lightweight cached list for global navbar search
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await getEmployees();
        setGlobalEmployees(data || []);
      } catch (err) {
        // Silent catch for global search cache
      }
    };
    fetchGlobalData();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          employees={globalEmployees}
        />

        {/* Dynamic Route Pages */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/employees/edit/:id" element={<EditEmployee />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

