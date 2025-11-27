import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { dashboardService } from '../../api/services/dashboardService';


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
                const data = await dashboardService.getStats();
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
                <Card className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">Issue Trends Chart (Placeholder)</p>
                </Card>
                <Card className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">Category Distribution Chart (Placeholder)</p>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
