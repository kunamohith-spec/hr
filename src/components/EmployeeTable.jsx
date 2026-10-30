import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  Briefcase,
  Users
} from 'lucide-react';

export default function EmployeeTable({
  employees = [],
  departments = [],
  sortField,
  sortOrder,
  onSort,
  onDeleteClick,
  isLoading = false,
}) {
  const navigate = useNavigate();

  // Helper to resolve department name
  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => String(d.id) === String(deptId));
    return dept ? dept.name : 'General';
  };

  // Helper for avatar color palette based on name
  const getAvatarBg = (name = '') => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No employees found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No records matched your search or active filter criteria. Try adjusting your query or resetting filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Employee</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Contact</th>
              <th className="py-3.5 px-4">Department & Role</th>
              <th
                onClick={() => onSort('joiningDate')}
                className="py-3.5 px-4 cursor-pointer select-none group hidden lg:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Joined</span>
                  {renderSortIcon('joiningDate')}
                </div>
              </th>
              <th
                onClick={() => onSort('salary')}
                className="py-3.5 px-4 cursor-pointer select-none group hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Salary</span>
                  {renderSortIcon('salary')}
                </div>
              </th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {employees.map((emp) => {
              const initials = emp.name
                ? emp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'EM';
              const avatarStyle = getAvatarBg(emp.name);
              const deptName = getDepartmentName(emp.departmentId);

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Name and ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 ${avatarStyle}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block text-left"
                        >
                          {emp.name}
                        </button>
                        <span className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 rounded border border-slate-200">
                          {emp.employeeCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact info */}
                  <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{emp.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{emp.designation}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {deptName}
                      </span>
                    </div>
                  </td>

                  {/* Joining Date */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 hidden lg:table-cell">
                    {emp.joiningDate ? (
                      new Date(emp.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Salary */}
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className="text-xs font-semibold text-slate-900">
                      {formatCurrency(emp.salary)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">/ month</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {emp.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/employees/edit/${emp.id}`)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(emp)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

