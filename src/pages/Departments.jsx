import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Users,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  getDepartments,
  getEmployees,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export default function Departments() {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Department modal state (for Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptData, empData] = await Promise.all([
        getDepartments(),
        getEmployees(),
      ]);
      setDepartments(deptData || []);
      setEmployees(empData || []);
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

  // Compute headcount per department dynamically
  const departmentCounts = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const deptId = String(emp.departmentId);
      counts[deptId] = (counts[deptId] || 0) + 1;
    });
    return counts;
  }, [employees]);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(q) ||
        dept.description?.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setFormErrors({});
    setModalOpen(true);
  };

  // Form submit (Add or Edit)
  const handleSubmitDept = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Department name is required.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Brief department description is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDept) {
        const updated = await updateDepartment(editingDept.id, {
          ...editingDept,
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        setDepartments((prev) =>
          prev.map((d) => (String(d.id) === String(editingDept.id) ? updated : d))
        );
        showToast(`Department "${updated.name}" updated successfully.`, 'success');
      } else {
        const created = await addDepartment({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        setDepartments((prev) => [...prev, created]);
        showToast(`Department "${created.name}" created successfully.`, 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(`Operation failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDepartment(deleteTarget.id);
      setDepartments((prev) => prev.filter((d) => String(d.id) !== String(deleteTarget.id)));
      showToast(`Department "${deleteTarget.name}" deleted successfully.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Departments
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {departments.length} Units
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organize functional units, manage divisional structures, and monitor headcount
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search department name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
      </div>

      {/* Departments Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No departments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const count = departmentCounts[String(dept.id)] || 0;
            return (
              <div
                key={dept.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      ID #{dept.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[40px]">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700">
                      {count} {count === 1 ? 'Employee' : 'Employees'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dept)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDept} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence Research"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border outline-none transition-all ${
                    formErrors.name
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe the responsibilities and focus of this department..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: null });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border outline-none transition-all ${
                    formErrors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDept ? 'Update Department' : 'Create Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Department"
        itemName={deleteTarget ? deleteTarget.name : ''}
        message={`Are you sure you want to delete the department "${deleteTarget?.name}"?`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

