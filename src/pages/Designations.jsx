import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Building,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  Users
} from 'lucide-react';
import {
  getDesignations,
  getDepartments,
  getEmployees,
  addDesignation,
  updateDesignation,
  deleteDesignation,
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export default function Designations() {
  const { showToast } = useToast();

  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [formData, setFormData] = useState({ title: '', departmentId: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [desigData, deptData, empData] = await Promise.all([
        getDesignations(),
        getDepartments(),
        getEmployees(),
      ]);
      setDesignations(desigData || []);
      setDepartments(deptData || []);
      setEmployees(empData || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute how many employees hold each designation
  const designationHeadcounts = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const key = emp.designation?.trim().toLowerCase();
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  // Filtered designations
  const filteredDesignations = useMemo(() => {
    return designations.filter((d) => {
      const matchesSearch =
        !searchQuery.trim() ||
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        String(d.departmentId) === String(selectedDeptFilter);

      return matchesSearch && matchesDept;
    });
  }, [designations, searchQuery, selectedDeptFilter]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingDesig(null);
    setFormData({
      title: '',
      departmentId: departments[0]?.id ? String(departments[0].id) : '',
      description: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (desig) => {
    setEditingDesig(desig);
    setFormData({
      title: desig.title,
      departmentId: desig.departmentId ? String(desig.departmentId) : '',
      description: desig.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Job title is required.';
    }
    if (!formData.departmentId) {
      errors.departmentId = 'Please select a parent department.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDesig) {
        const updated = await updateDesignation(editingDesig.id, {
          ...editingDesig,
          title: formData.title.trim(),
          departmentId: formData.departmentId,
          description: formData.description.trim(),
        });
        setDesignations((prev) =>
          prev.map((d) => (String(d.id) === String(editingDesig.id) ? updated : d))
        );
        showToast(`Designation "${updated.title}" updated successfully.`, 'success');
      } else {
        const created = await addDesignation({
          title: formData.title.trim(),
          departmentId: formData.departmentId,
          description: formData.description.trim(),
        });
        setDesignations((prev) => [...prev, created]);
        showToast(`Designation "${created.title}" added to directory.`, 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(`Operation failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDesignation(deleteTarget.id);
      setDesignations((prev) => prev.filter((d) => String(d.id) !== String(deleteTarget.id)));
      showToast(`Designation "${deleteTarget.title}" deleted successfully.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const d = departments.find((dept) => String(dept.id) === String(deptId));
    return d ? d.name : 'Cross-Functional';
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designations
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {designations.length} Roles Defined
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Standardize organizational titles, role responsibilities, and operational tiers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Designation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search designations or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>

        <div>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Designations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredDesignations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No designations found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new designation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesignations.map((desig) => {
            const count = designationHeadcounts[desig.title?.trim().toLowerCase()] || 0;
            return (
              <div
                key={desig.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-purple-200 transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      <Building className="w-3.5 h-3.5" />
                      {getDepartmentName(desig.departmentId)}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-400">
                      #{desig.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {desig.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[38px]">
                    {desig.description || 'Standard operational role within department hierarchy.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>{count} {count === 1 ? 'Holding Role' : 'Holding Role'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(desig)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Designation"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(desig)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Designation"
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

      {/* Add / Edit Designation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDesig ? 'Edit Designation' : 'Create New Designation'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border outline-none transition-all ${
                    formErrors.title
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe key responsibilities and expectations for this designation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                ></textarea>
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
                  <span>{editingDesig ? 'Update Designation' : 'Create Designation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Designation"
        itemName={deleteTarget ? deleteTarget.title : ''}
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

