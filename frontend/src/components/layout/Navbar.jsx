import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import Button from '../common/Button';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-40 h-20 px-6 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                        <span className="text-white text-xl font-bold">U</span>
                    </div>
                    <div>
                        <span className="hidden sm:block text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">Urban Mind</span>
                        <span className="hidden sm:block text-xs text-gray-400 -mt-1">Civic Intelligence</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                    </button>

                    {/* Notification Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">Mark all read</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {/* Mock Notifications */}
                            <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-300">New issue reported in your area: <span className="text-white font-medium">Pothole on Main St.</span></p>
                                        <p className="text-xs text-gray-500 mt-1">2 mins ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-300">Issue resolved: <span className="text-white font-medium">Street Light Repair</span></p>
                                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 text-center border-t border-white/10">
                            <button className="text-xs text-gray-400 hover:text-white transition-colors">View all notifications</button>
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-indigo-400 capitalize font-medium tracking-wide">{user.role}</p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-800 p-[2px] group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
