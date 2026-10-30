import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  UserCheck,
  Building,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenSidebar, employees = [] }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees for global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = employees.filter((emp) =>
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    ).slice(0, 5);
    setSearchResults(matches);
  }, [searchQuery, employees]);

  const handleSelectEmployee = (id) => {
    navigate(`/employees/${id}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const notifications = [
    {
      id: 1,
      title: 'New Employee Added',
      desc: 'Nisha Agarwal joined as UI/UX Designer',
      time: '10 mins ago',
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 2,
      title: 'Department Sync Completed',
      desc: 'Engineering roster synced successfully',
      time: '1 hour ago',
      icon: Building,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 3,
      title: 'Salary Adjustment Processed',
      desc: 'Quarterly review cycle applied',
      time: '3 hours ago',
      icon: CheckCircle2,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left section: Mobile menu & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employee, ID, role or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-12 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Quick search popup */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Employees ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {searchResults.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                            {emp.name}
                          </p>
                          <span className="text-xs font-mono text-slate-400">
                            {emp.employeeCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.designation} • {emp.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No employee records found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  3 new
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* Admin Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/20">
                AU
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">Admin User</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Head of HR</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">admin@hrportal.org</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-slate-400" />
                  Organization
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

