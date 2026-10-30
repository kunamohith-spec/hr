import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  RotateCcw,
  Download,
  AlertCircle,
  Users,
  Search
} from 'lucide-react';
import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchBar from '../components/SearchBar';
import { getEmployees, getDepartments, getDesignations, deleteEmployee } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Employees() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empData, deptData, desigData] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDesignations(),
      ]);
      setEmployees(empData || []);
      setDepartments(deptData || []);
      setDesignations(desigData || []);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered & Sorted Employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search query: name, code, email
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(q) ||
          emp.employeeCode?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q)
      );
    }

    // Filter by department
    if (selectedDepartment !== 'ALL') {
      result = result.filter(
        (emp) => String(emp.departmentId) === String(selectedDepartment)
      );
    }

    // Filter by designation
    if (selectedDesignation !== 'ALL') {
      result = result.filter(
        (emp) => emp.designation?.toLowerCase() === selectedDesignation.toLowerCase()
      );
    }

    // Filter by status
    if (selectedStatus !== 'ALL') {
      result = result.filter((emp) => emp.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'salary') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === 'joiningDate') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    employees,
    searchQuery,
    selectedDepartment,
    selectedDesignation,
    selectedStatus,
    sortField,
    sortOrder,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, selectedDesignation, selectedStatus]);

  // Paginated data
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('ALL');
    setSelectedDesignation('ALL');
    setSelectedStatus('ALL');
    setSortField('name');
    setSortOrder('asc');
  };

  // Delete employee
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteEmployee(deleteTarget.id);
      showToast(`Employee ${deleteTarget.name} (${deleteTarget.employeeCode}) was successfully removed.`, 'success');
      setEmployees((prev) => prev.filter((emp) => String(emp.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Failed to delete employee: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ['Employee Code,Name,Email,Phone,Department ID,Designation,Joining Date,Salary,Status'];
    const rows = employees.map((emp) =>
      `"${emp.employeeCode}","${emp.name}","${emp.email}","${emp.phone}","${emp.departmentId}","${emp.designation}","${emp.joiningDate}",${emp.salary},"${emp.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee roster exported to CSV successfully.', 'info');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Employee Directory
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {employees.length} Total Staff
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage personnel, roles, compensations, and employee records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/employees/add')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Search Staff
            </label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search by employee name, code, or email..."
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-sm text-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Employment Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-sm text-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Designation:</span>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Roles</option>
              {designations.map((desig) => (
                <option key={desig.id} value={desig.title}>
                  {desig.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredEmployees.length}</strong> of{' '}
              <strong className="text-slate-800">{employees.length}</strong> employees
            </span>
            {(searchQuery ||
              selectedDepartment !== 'ALL' ||
              selectedDesignation !== 'ALL' ||
              selectedStatus !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Employee Table */}
      <EmployeeTable
        employees={paginatedEmployees}
        departments={departments}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onDeleteClick={(emp) => setDeleteTarget(emp)}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEmployees.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Employee Record"
        itemName={deleteTarget ? `${deleteTarget.name} (${deleteTarget.employeeCode})` : ''}
        message="Are you sure you want to permanently delete this employee? All corresponding records and credentials will be removed from JSON Server."
        confirmText="Confirm Delete"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

