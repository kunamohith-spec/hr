import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  IndianRupee,
  Activity,
  Hash,
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react';

export default function EmployeeForm({
  initialData = null,
  isEdit = false,
  departments = [],
  designations = [],
  existingEmployees = [],
  onSubmit,
  isSubmitting = false,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        departmentId: String(initialData.departmentId || ''),
        designation: initialData.designation || '',
        joiningDate: initialData.joiningDate || '',
        salary: initialData.salary !== undefined ? initialData.salary : '',
        status: initialData.status || 'Active',
      });
    } else if (departments.length > 0 && designations.length > 0) {
      // Auto-set default department if empty
      setFormData((prev) => ({
        ...prev,
        departmentId: prev.departmentId || String(departments[0]?.id || '1'),
        designation: prev.designation || designations[0]?.title || '',
      }));
    }
  }, [initialData, departments, designations]);

  // Filter designations based on selected department (if designations have departmentId)
  const filteredDesignations = formData.departmentId
    ? designations.filter(
        (desig) =>
          !desig.departmentId ||
          String(desig.departmentId) === String(formData.departmentId)
      )
    : designations;

  const validate = () => {
    const newErrors = {};

    // Employee Code
    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee Code is required.';
    } else if (!/^[A-Z0-9_-]{3,12}$/i.test(formData.employeeCode.trim())) {
      newErrors.employeeCode = 'Code must be 3-12 alphanumeric characters (e.g., EMP001).';
    } else {
      // Check duplicate code
      const duplicate = existingEmployees.find(
        (emp) =>
          emp.employeeCode?.trim().toUpperCase() === formData.employeeCode.trim().toUpperCase() &&
          (!isEdit || String(emp.id) !== String(initialData?.id))
      );
      if (duplicate) {
        newErrors.employeeCode = `Employee code "${formData.employeeCode.trim()}" is already taken by ${duplicate.name}.`;
      }
    }

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+-\s]{10,15}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (10-15 digits).';
    }

    // Department
    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department.';
    }

    // Designation
    if (!formData.designation.trim()) {
      newErrors.designation = 'Please select or enter a designation.';
    }

    // Joining Date
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required.';
    }

    // Salary
    if (formData.salary === '' || formData.salary === null) {
      newErrors.salary = 'Monthly salary is required.';
    } else if (Number(formData.salary) <= 0 || isNaN(Number(formData.salary))) {
      newErrors.salary = 'Salary must be a positive number greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // If department changed, update designation option if current is not in filtered list
      if (name === 'departmentId') {
        const available = designations.filter(
          (d) => !d.departmentId || String(d.departmentId) === String(value)
        );
        if (available.length > 0 && !available.some((d) => d.title === prev.designation)) {
          updated.designation = available[0].title;
        }
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        salary: Number(formData.salary),
        employeeCode: formData.employeeCode.trim().toUpperCase(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Basic & Contact Information */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal & Identity Information</h3>
            <p className="text-xs text-slate-500">Provide official identity and contact details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Employee Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                onBlur={() => handleBlur('employeeCode')}
                placeholder="e.g. EMP017"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 uppercase font-mono rounded-xl border transition-all outline-none ${
                  errors.employeeCode
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.employeeCode && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.employeeCode}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border transition-all outline-none ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. rahul.sharma@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border transition-all outline-none ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="e.g. 9876543210"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border transition-all outline-none ${
                  errors.phone
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Department, Role & Compensation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Employment & Compensation</h3>
            <p className="text-xs text-slate-500">Assign organizational unit, title, and payroll terms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.departmentId && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.departmentId}
              </p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Designation / Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              >
                {filteredDesignations.length > 0 ? (
                  filteredDesignations.map((desig) => (
                    <option key={desig.id} value={desig.title}>
                      {desig.title}
                    </option>
                  ))
                ) : (
                  designations.map((desig) => (
                    <option key={desig.id} value={desig.title}>
                      {desig.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            {errors.designation && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.designation}
              </p>
            )}
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Joining Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>
            {errors.joiningDate && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.joiningDate}
              </p>
            )}
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Monthly Salary (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="number"
                name="salary"
                min="1000"
                step="500"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 55000"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-sm text-slate-900 rounded-xl border transition-all outline-none ${
                  errors.salary
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.salary && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.salary}
              </p>
            )}
          </div>

          {/* Employment Status */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Employment Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.status === 'Active'
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active Employee
                </span>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.status === 'Inactive'
                    ? 'bg-rose-50/60 border-rose-300 text-rose-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={handleChange}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Inactive / On Leave
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{isEdit ? 'Updating Employee...' : 'Adding Employee...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Register Employee'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

