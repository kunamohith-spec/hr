import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Shield,
  Bell,
  Database,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sliders
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { showToast } = useToast();

  const [orgSettings, setOrgSettings] = useState({
    companyName: 'NexCorp Global Enterprises',
    companyEmail: 'hr@nexcorp.global',
    currency: 'INR (₹)',
    fiscalYearStart: 'April',
    autoEmployeeIdPrefix: 'EMP',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    newEmployeeAlert: true,
    salaryAuditLog: true,
    weeklyDigest: false,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Organization settings updated successfully.', 'success');
  };

  const handleTestConnection = async () => {
    try {
      const res = await fetch('http://localhost:3000/employees');
      if (res.ok) {
        showToast('JSON Server is healthy and reachable at http://localhost:3000!', 'success');
      } else {
        showToast(`Server returned status code: ${res.status}`, 'error');
      }
    } catch (err) {
      showToast('Cannot connect to http://localhost:3000. Is json-server running?', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              System Settings
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure enterprise portal defaults, database connections, and operational preferences
            </p>
          </div>
        </div>
      </div>

      {/* Backend & Environment Health Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend JSON Server Connectivity</h3>
              <p className="text-xs text-slate-500">Local REST API Engine</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 font-medium block">API Target</span>
            <span className="text-slate-900 font-mono font-semibold mt-0.5 block truncate">
              http://localhost:3000
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 font-medium block">Persistence Storage</span>
            <span className="text-slate-900 font-mono font-semibold mt-0.5 block">
              db.json (Auto-watch)
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 font-medium block">Active Resources</span>
            <span className="text-slate-900 font-semibold mt-0.5 block">
              /employees, /departments, /designations
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ping Database Server
          </button>
        </div>
      </div>

      {/* Organization Defaults Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Organization Information</h3>
              <p className="text-xs text-slate-500">Corporate entity details and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={orgSettings.companyName}
                onChange={(e) => setOrgSettings({ ...orgSettings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Official HR Email
              </label>
              <input
                type="email"
                value={orgSettings.companyEmail}
                onChange={(e) => setOrgSettings({ ...orgSettings, companyEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Currency Standard
              </label>
              <input
                type="text"
                value={orgSettings.currency}
                onChange={(e) => setOrgSettings({ ...orgSettings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Employee Code Prefix
              </label>
              <input
                type="text"
                value={orgSettings.autoEmployeeIdPrefix}
                onChange={(e) => setOrgSettings({ ...orgSettings, autoEmployeeIdPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notifications Preference */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Configure notifications triggers for administrators</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  New Employee Registration Alerts
                </span>
                <span className="text-xs text-slate-500">
                  Notify administration team when a new candidate or personnel is added
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.newEmployeeAlert}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, newEmployeeAlert: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Salary & CTC Modification Audits
                </span>
                <span className="text-xs text-slate-500">
                  Log and flag any updates made to employee compensation levels
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.salaryAuditLog}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, salaryAuditLog: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

