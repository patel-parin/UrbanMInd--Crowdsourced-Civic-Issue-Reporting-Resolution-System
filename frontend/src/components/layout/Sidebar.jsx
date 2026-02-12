import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    User,
    Map,
    List,
    Users,
    BarChart,
    CheckSquare,
    Upload,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const links = {
        citizen: [
            { to: '/citizen/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/citizen/report', icon: PlusCircle, label: 'Report' },
            { to: '/citizen/history', icon: History, label: 'History' },
            { to: '/citizen/map', icon: Map, label: 'Map' },
            { to: '/citizen/profile', icon: User, label: 'Profile' },
        ],
        admin: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/issues', icon: List, label: 'Issues' },
            { to: '/admin/contractors', icon: Users, label: 'Contractors' },
            { to: '/admin/analytics', icon: BarChart, label: 'Analytics' },
        ],
        contractor: [
            { to: '/contractor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/contractor/tasks', icon: CheckSquare, label: 'Tasks' },
            { to: '/contractor/completed', icon: Upload, label: 'Done' },
        ],
    };

    const roleLinks = user ? links[user.role] || [] : [];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 px-6 py-4 bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
            >
                {roleLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            clsx(
                                "relative group p-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                                    : "text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <div className="relative flex flex-col items-center">
                                <link.icon className="w-6 h-6" />
                                {/* Tooltip */}
                                <span className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#1e293b]/90 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">
                                    {link.label}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e293b]/90 rotate-45 border-r border-b border-white/10"></div>
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 bg-white/20 blur-md rounded-xl -z-10"
                                    />
                                )}
                            </div>
                        )}
                    </NavLink>
                ))}

                <div className="w-px h-8 bg-white/10 mx-2" />

                <button
                    onClick={logout}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 hover:scale-105 group relative"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#1e293b]/90 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">
                        Sign Out
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e293b]/90 rotate-45 border-r border-b border-white/10"></div>
                    </span>
                </button>
            </motion.div>
        </div>
    );
};

export default Sidebar;
