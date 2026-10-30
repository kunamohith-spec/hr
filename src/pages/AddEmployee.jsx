import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import EmployeeForm from '../components/EmployeeForm';
import { getDepartments, getDesignations, getEmployees, addEmployee } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [existingEmployees, setExistingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setLoading(true);
        const [deptData, desigData, empData] = await Promise.all([
          getDepartments(),
          getDesignations(),
          getEmployees(),
        ]);
        setDepartments(deptData || []);
        setDesignations(desigData || []);
        setExistingEmployees(empData || []);
      } catch (err) {
        setError(err.message);
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadPrerequisites();
  }, []);

  const handleSubmit = async (employeeData) => {
    try {
      setSubmitting(true);
      const newRecord = await addEmployee(employeeData);
      showToast(
        `Employee "${newRecord.name}" (${newRecord.employeeCode}) was successfully registered!`,
        'success'
      );
      navigate('/employees');
    } catch (err) {
      showToast(`Failed to register employee: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200/80 rounded-xl w-1/3"></div>
        <div className="h-64 bg-slate-200/80 rounded-2xl w-full"></div>
        <div className="h-64 bg-slate-200/80 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Prerequisite Loading Failed</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Register New Employee
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create an official employee profile in the organizational registry
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/employees')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
      </div>

      {/* Controlled Registration Form */}
      <EmployeeForm
        isEdit={false}
        departments={departments}
        designations={designations}
        existingEmployees={existingEmployees}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
}

