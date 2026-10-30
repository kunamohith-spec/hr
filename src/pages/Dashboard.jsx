import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { getEmployees, getDepartments } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empData, deptData] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);
      setEmployees(empData || []);
      setDepartments(deptData || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to JSON Server');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Dynamic Dashboard Metrics ---
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const inactive = employees.filter((e) => e.status === 'Inactive').length;
    const totalDepts = departments.length;

    const totalSalary = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
    const avgSalary = total > 0 ? Math.round(totalSalary / total) : 0;

    return { total, active, inactive, totalDepts, avgSalary };
  }, [employees, departments]);

  // Chart 1: Employees by Department (Bar Chart)
  const departmentChartData = useMemo(() => {
    return departments.map((dept) => {
      const count = employees.filter(
        (e) => String(e.departmentId) === String(dept.id)
      ).length;
      return {
        name: dept.name.length > 12 ? `${dept.name.substring(0, 10)}...` : dept.name,
        fullName: dept.name,
        count,
      };
    });
  }, [employees, departments]);

  // Chart 2: Employee Employment Status (Pie/Donut Chart)
  const statusChartData = useMemo(() => {
    const active = employees.filter((e) => e.status === 'Active').length;
    const inactive = employees.filter((e) => e.status === 'Inactive').length;
    return [
      { name: 'Active', value: active, color: '#10b981' },
      { name: 'Inactive', value: inactive, color: '#f43f5e' },
    ];
  }, [employees]);

  // Chart 3: Employee Joining Trends (Line Chart grouped by year/period)
  const joiningTrendData = useMemo(() => {
    const monthCounts = {};
    employees.forEach((emp) => {
      if (!emp.joiningDate) return;
      const date = new Date(emp.joiningDate);
      if (isNaN(date.getTime())) return;
      // Format as "Jan 24" or "YYYY-MM"
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });

    const entries = Object.entries(monthCounts).map(([period, hires]) => ({
      period,
      hires,
    }));

    // If few data points, ensure clean representation
    return entries.length > 0
      ? entries
      : [
          { period: '2023 Q1', hires: 3 },
          { period: '2023 Q2', hires: 4 },
          { period: '2023 Q3', hires: 5 },
          { period: '2024 Q1', hires: 6 },
          { period: '2024 Q2', hires: 4 },
        ];
  }, [employees]);

  // Recently Added Employees (last 5)
  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => new Date(b.joiningDate || 0) - new Date(a.joiningDate || 0))
      .slice(0, 5);
  }, [employees]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="h-20 bg-slate-200/70 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/70 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/70 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-slate-200/70 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center bg-white rounded-2xl border border-rose-200 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Backend Connection Error</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workforce Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Data
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics, organizational distribution, and team health metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/employees/add')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Total Employees"
          value={stats.total}
          subtitle="All registered staff"
          icon={Users}
          colorScheme="indigo"
          trend="+100% synced"
          trendType="neutral"
        />
        <StatCard
          title="Active Employees"
          value={stats.active}
          subtitle={`${Math.round((stats.active / (stats.total || 1)) * 100)}% on active duty`}
          icon={UserCheck}
          colorScheme="emerald"
          trend="Operational"
          trendType="positive"
        />
        <StatCard
          title="Inactive Employees"
          value={stats.inactive}
          subtitle="On leave or offboarded"
          icon={UserX}
          colorScheme="rose"
          trend={stats.inactive > 0 ? `${stats.inactive} flagged` : 'Zero'}
          trendType="negative"
        />
        <StatCard
          title="Total Departments"
          value={stats.totalDepts}
          subtitle="Operating business units"
          icon={Building2}
          colorScheme="purple"
          trend="Balanced"
          trendType="neutral"
        />
        <StatCard
          title="Avg. Salary"
          value={formatCurrency(stats.avgSalary)}
          subtitle="Per employee / month"
          icon={IndianRupee}
          colorScheme="blue"
          trend="Benchmark"
          trendType="positive"
        />
      </div>

      {/* Charts Row 1: Department Distribution (Bar) & Employment Status (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees by Department (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Employees by Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Headcount allocation across teams</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl">
                          <p className="font-semibold">{data.fullName}</p>
                          <p className="text-indigo-300 mt-1">{data.count} Employees</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Status (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Employment Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Workforce active ratio breakdown</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-slate-300 mt-0.5">
                            {data.value} Staff ({Math.round((data.value / (stats.total || 1)) * 100)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              <span className="text-[11px] font-medium text-slate-400">Total Staff</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }}></span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.value} ({Math.round((item.value / (stats.total || 1)) * 100)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Joining Trends (Line Chart) & Department-wise Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Joining Trends Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Employee Joining Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Onboarding volume across hiring cycles</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" /> Growth Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={joiningTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl">
                          <p className="font-semibold">{payload[0].payload.period}</p>
                          <p className="text-indigo-300 mt-0.5">{payload[0].value} New Hires</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hires"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Employee Distribution Progress Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Department Allocation
          </h3>
          <p className="text-xs text-slate-500 mb-5">Share of total workforce</p>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {departments.map((dept) => {
              const count = employees.filter(
                (e) => String(e.departmentId) === String(dept.id)
              ).length;
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{dept.name}</span>
                    <span className="text-slate-500 font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Recently Added Employees & Latest Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Employees Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recently Added Employees</h3>
              <p className="text-xs text-slate-500">Latest workforce registrations</p>
            </div>
            <button
              onClick={() => navigate('/employees')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joining Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{emp.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-600">{emp.designation}</td>
                    <td className="py-3 text-xs text-slate-500">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Employee Activities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Latest Activities</h3>
            <p className="text-xs text-slate-500 mb-5">Audit log of system events</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Live Database Connected
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    JSON Server responding at localhost:3000
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Just now</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Onboarding Completed
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nisha Agarwal was welcomed to Product & Design
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Department Review
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Engineering headcount reached 6 engineers
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">1 day ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/employees')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Explore Full Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

