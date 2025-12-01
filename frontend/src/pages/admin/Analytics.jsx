import { useEffect, useState } from 'react';
import { BarChart, PieChart, Activity, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        inProgress: 0,
        byCategory: {}
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const issues = await issueService.getAll();

                // Calculate Stats
                const total = issues.length;
                const pending = issues.filter(i => i.status === 'pending').length;
                const resolved = issues.filter(i => i.status === 'resolved').length;
                const inProgress = issues.filter(i => i.status === 'in_progress').length;

                const byCategory = issues.reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + 1;
                    return acc;
                }, {});

                setStats({ total, pending, resolved, inProgress, byCategory });
            } catch (error) {
                console.error('Failed to load analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;

    const maxCategoryCount = Math.max(...Object.values(stats.byCategory), 1);

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-gray-400">Real-time insights into urban issues.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border-indigo-500/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Issues</p>
                            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-900/50 to-slate-900 border-orange-500/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Pending</p>
                            <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-500/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">In Progress</p>
                            <h3 className="text-3xl font-bold text-white">{stats.inProgress}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-500/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Resolved</p>
                            <h3 className="text-3xl font-bold text-white">{stats.resolved}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Category Breakdown Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-indigo-400" />
                        Issues by Category
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300 capitalize">{category}</span>
                                    <span className="text-gray-400">{count} issues</span>
                                </div>
                                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {Object.keys(stats.byCategory).length === 0 && (
                            <p className="text-center text-gray-500 py-8">No data available</p>
                        )}
                    </div>
                </Card>

                <Card className="flex flex-col justify-center items-center text-center p-8">
                    <div className="w-48 h-48 rounded-full border-8 border-gray-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin-slow opacity-50"></div>
                        <div className="text-center">
                            <span className="block text-4xl font-bold text-white">{Math.round((stats.resolved / (stats.total || 1)) * 100)}%</span>
                            <span className="text-gray-400 text-sm">Resolution Rate</span>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-400 max-w-xs">
                        Keep up the good work! A higher resolution rate indicates efficient city management.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
