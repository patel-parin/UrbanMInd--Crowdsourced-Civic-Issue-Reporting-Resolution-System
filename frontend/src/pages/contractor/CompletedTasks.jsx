import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
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
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    return (
        <div className="p-8 w-full min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Completed Tasks</h1>
                        <p className="text-gray-400 text-lg">History of your resolved issues and impact.</p>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                        <p className="text-green-400 text-xs uppercase tracking-wider font-semibold">Total Resolved</p>
                        <p className="text-3xl font-bold text-white">{tasks.length}</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="flex items-center justify-between p-6 border-l-4 border-green-500 bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                                        <div className="flex gap-6 text-sm text-gray-400">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                {task.location || task.gps?.address || 'Location N/A'}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                {new Date(task.updatedAt || Date.now()).toLocaleDateString()}
                                            </div>
                                            {task.fundAmount > 0 && (
                                                <div className="flex items-center text-green-400">
                                                    <span className="font-mono font-bold">${task.fundAmount}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-full">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Resolved
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 border-dashed">
                            <CheckCircle className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">No completed tasks yet</h3>
                            <p className="text-gray-400">Once you resolve issues, they will appear here.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CompletedTasks;
