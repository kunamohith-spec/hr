import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  IndianRupee,
  Shield,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { getEmployeeById, getDepartments, deleteEmployee } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [empData, deptData] = await Promise.all([
          getEmployeeById(id),
          getDepartments(),
        ]);
        setEmployee(empData);
        setDepartments(deptData || []);
      } catch (err) {
        setError(err.message || 'Employee not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEmployee(id);
      showToast(`Employee "${employee.name}" was removed from the system.`, 'success');
      navigate('/employees');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const d = departments.find((dept) => String(dept.id) === String(deptId));
    return d ? d.name : 'Engineering & Operations';
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200/80 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/80 rounded-2xl"></div>
          <div className="h-64 bg-slate-200/80 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-rose-200 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Employee Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {error || `No employee found with record ID "${id}".`}
        </p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>
      </div>
    );
  }

  const initials = employee.name
    ? employee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'EM';

  const tenureYears = employee.joiningDate
    ? (
        (new Date() - new Date(employee.joiningDate)) /
        (1000 * 60 * 60 * 24 * 365.25)
      ).toFixed(1)
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate('/employees')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => navigate(`/employees/edit/${employee.id}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Decorative Top Accent Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 flex justify-end">
          <span
            className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              employee.status === 'Active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                employee.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            ></span>
            {employee.status} Status
          </span>
        </div>

        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-white shadow-xl">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {employee.name}
                </h1>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                  {employee.designation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                {employee.employeeCode}
              </span>
              <span className="text-xs font-medium text-slate-400">
                DB ID #{employee.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Personal Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Contact & Identification
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </span>
              <a
                href={`mailto:${employee.email}`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                {employee.email}
              </a>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Number
              </span>
              <a
                href={`tel:${employee.phone}`}
                className="text-xs font-semibold text-slate-800"
              >
                {employee.phone}
              </a>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Employee Code
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {employee.employeeCode}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-400" />
                System Profile
              </span>
              <span className="text-xs font-semibold text-slate-800">Standard User</span>
            </div>
          </div>
        </div>

        {/* Organizational & Employment Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Employment Details
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                Department
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {getDepartmentName(employee.departmentId)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Job Title
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {employee.designation}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Date of Joining
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {employee.joiningDate
                  ? new Date(employee.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Organizational Tenure
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {tenureYears} Years in Service
              </span>
            </div>
          </div>
        </div>

        {/* Compensation Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-indigo-300">
              <IndianRupee className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
                Monthly Gross Compensation
              </p>
              <h2 className="text-3xl font-extrabold text-white mt-0.5">
                {formatCurrency(employee.salary)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Annualized CTC: {formatCurrency(employee.salary * 12)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/employees/edit/${employee.id}`)}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modify Salary & Role
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Employee Record"
        itemName={`${employee.name} (${employee.employeeCode})`}
        message="Are you sure you want to permanently delete this employee? This will remove all their details from the database."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

