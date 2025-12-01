
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, DollarSign, TrendingUp, Star, Activity } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { issueService } from '../../api/services/issueService';

const ContractorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksData, profileData] = await Promise.all([
                    issueService.getAssignedTasks(),
                    issueService.getProfile()
                ]);
                setTasks(tasksData);
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await issueService.updateStatus(taskId, newStatus);
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
            toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update task status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    const activeTasks = tasks.filter(t => t.status !== 'resolved');
    const resolvedTasks = tasks.filter(t => t.status === 'resolved');
    const lastContract = resolvedTasks.length > 0 ? resolvedTasks[0] : null;

    const stats = {
        totalEarnings: resolvedTasks.reduce((acc, curr) => acc + (curr.fundAmount || 0), 0),
        pendingFunds: activeTasks.reduce((acc, curr) => acc + (curr.status === 'fund_approval_pending' ? (curr.fundAmount || 0) : 0), 0),
        rating: profile?.rating || 0,
        efficiency: profile?.efficiency || 0
    };

    return (
        <div className="space-y-8">
            {/* Header & Welcome */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Welcome, {profile?.companyName || 'Contractor'}
                    </h1>
                    <p className="text-gray-400 text-lg">Here's your performance overview and active work.</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-yellow-500 font-bold text-lg">{stats.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">Rating</span>
                </div>
            </div>

            {/* Financial & Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-900/40 to-gray-900 border-green-500/20">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Earnings</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-900/40 to-gray-900 border-orange-500/20">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending Funds</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${stats.pendingFunds.toLocaleString()}</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-900/40 to-gray-900 border-blue-500/20">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Tasks</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{activeTasks.length}</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-gray-900 border-purple-500/20">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Efficiency</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.efficiency}%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        Active Tasks
                    </h2>

                    {activeTasks.length > 0 ? (
                        activeTasks.map((task) => (
                            <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="group relative overflow-hidden border-0 bg-gray-800 hover:bg-gray-750 transition-all">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="p-6 pl-8 flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{task.title}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {task.location}</span>
                                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-center gap-2 min-w-[140px]">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</span>
                                            <span className="text-white font-bold capitalize bg-gray-700 px-3 py-1 rounded-lg text-sm">
                                                {task.status.replace(/_/g, ' ')}
                                            </span>
                                            {task.status === 'assigned' && (
                                                <Button size="sm" onClick={() => updateStatus(task._id, 'under_contractor_survey')} className="w-full">Start Survey</Button>
                                            )}
                                            {task.status === 'under_contractor_survey' && (
                                                <Button size="sm" onClick={async () => {
                                                    const amount = prompt("Enter required fund amount ($):");
                                                    if (amount) {
                                                        try {
                                                            await issueService.requestFunds(task._id, amount);
                                                            // Optimistic update
                                                            setTasks(tasks.map(t => t._id === task._id ? { ...t, status: 'fund_approval_pending', fundAmount: amount } : t));
                                                            toast.success(`Funds requested: $${amount}`);
                                                        } catch (e) { toast.error('Failed to request funds'); }
                                                    }
                                                }} className="w-full bg-orange-600 hover:bg-orange-700">Request Funds</Button>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <Button size="sm" onClick={() => updateStatus(task._id, 'resolved')} className="w-full bg-green-600 hover:bg-green-700">Complete</Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50 border-dashed">
                            <p className="text-gray-400">No active tasks. Good job!</p>
                        </div>
                    )}
                </div>

                {/* Last Contract / Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        Last Contract
                    </h2>

                    {lastContract ? (
                        <Card className="p-6 bg-gray-800/80 border-green-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle className="w-24 h-24 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{lastContract.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lastContract.description}</p>

                            <div className="space-y-3 pt-4 border-t border-gray-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Completed On</span>
                                    <span className="text-white">{new Date(lastContract.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Funds Earned</span>
                                    <span className="text-green-400 font-bold">${lastContract.fundAmount || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Location</span>
                                    <span className="text-white truncate max-w-[150px]">{lastContract.location || lastContract.gps?.address}</span>
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full mt-6" onClick={() => window.location.href = '/contractor/completed'}>
                                View All History
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-8 text-center bg-gray-800/50 border-dashed">
                            <p className="text-gray-500">No completed contracts yet.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractorDashboard;
