import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock, ArrowUpRight, Filter } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';

const CompletedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await issueService.getAssignedTasks();
                // Filter for resolved tasks
                const completed = data.filter(task => task.status === 'resolved');
                setTasks(completed);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 w-full min-h-screen animate-fade-in space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-2">
                            Completed Tasks
                        </h1>
                        <p className="text-gray-400 text-lg">History of your resolved issues and impact.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 backdrop-blur-sm flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-green-400 text-xs uppercase tracking-wider font-bold">Total Resolved</p>
                                <p className="text-2xl font-bold text-white leading-none mt-0.5">{tasks.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:border-green-500/30 transition-all duration-300">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{task.title}</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/20">
                                                Resolved
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center bg-white/5 px-2 py-1 rounded-md">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                                {task.location || task.gps?.address || 'Location N/A'}
                                            </div>
                                            <div className="flex items-center bg-white/5 px-2 py-1 rounded-md">
                                                <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                                {new Date(task.updatedAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0 pl-0 md:pl-6 md:border-l md:border-white/10">
                                        {task.fundAmount > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">Funds Earned</p>
                                                <p className="text-xl font-bold text-green-400 font-mono">${task.fundAmount}</p>
                                            </div>
                                        )}

                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                            <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No completed tasks yet</h3>
                            <p className="text-gray-400 max-w-md mx-auto">Once you resolve issues and they are approved, they will appear here as part of your history.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CompletedTasks;
