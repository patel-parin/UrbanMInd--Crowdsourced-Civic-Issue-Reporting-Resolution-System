import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        activeContractors: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
                // Fallback mock data
                setStats({
                    totalIssues: 156,
                    openIssues: 42,
                    resolvedIssues: 114,
                    activeContractors: 12,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Issues', value: stats.totalIssues, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Open Issues', value: stats.openIssues, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Active Contractors', value: stats.activeContractors, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    // Simple SVG Bar Chart Component
    const BarChart = () => (
        <div className="w-full h-64 flex items-end justify-between gap-2 px-4">
            {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group hover:bg-blue-500/40 transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h} issues
                    </div>
                </div>
            ))}
        </div>
    );

    // Simple SVG Pie Chart Representation (CSS Conic Gradient)
    const PieChart = () => (
        <div className="relative w-48 h-48 rounded-full" style={{
            background: `conic-gradient(
                #3b82f6 0% 40%, 
                #f97316 40% 70%, 
                #22c55e 70% 100%
            )`
        }}>
            <div className="absolute inset-0 m-8 bg-[#1e1e2e] rounded-full flex items-center justify-center">
                <div className="text-center">
                    <span className="text-gray-400 text-xs">Distribution</span>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">Overview of system performance and issues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="flex items-center p-6">
                            <div className={`p-4 rounded-full mr-4 ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Issue Trends</h3>
                    <div className="flex-1 flex items-center justify-center">
                        <BarChart />
                    </div>
                </Card>
                <Card className="h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Category Distribution</h3>
                    <div className="flex-1 flex items-center justify-center gap-8">
                        <PieChart />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-gray-300 text-sm">Infrastructure (40%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-gray-300 text-sm">Public Safety (30%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-300 text-sm">Sanitation (30%)</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
