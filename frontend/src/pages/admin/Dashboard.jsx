import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, Clock, Activity, ArrowUpRight, Map as MapIcon, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';
import { issueService } from '../../api/services/issueService';

// Fix Leaflet default icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        activeContractors: 0,
    });
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, issuesData] = await Promise.all([
                    adminService.getStats(),
                    issueService.getAll()
                ]);
                setStats(statsData);
                setIssues(issuesData);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Issues', value: stats.totalIssues, icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Open Issues', value: stats.openIssues, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'Active Contractors', value: stats.activeContractors, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ];

    const priorityIssues = issues.filter(i => ['high', 'critical', 'urgent'].includes(i.priority?.toLowerCase()));

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">Real-time overview of system performance</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <Activity className="w-4 h-4" />
                    <span>System Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="flex items-center p-6 relative overflow-hidden group" hover>
                            <div className={`absolute right-0 top-0 p-20 opacity-5 rounded-full blur-3xl transition-all duration-500 group-hover:opacity-10 ${stat.bg.replace('/10', '/30')}`} />
                            <div className={`p-4 rounded-2xl mr-4 ${stat.bg} ${stat.border} border backdrop-blur-md`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                                    <span className="text-xs text-green-400 flex items-center">
                                        <ArrowUpRight className="w-3 h-3" /> +12%
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Heatmap / Issue Map */}
                <GlassCard className="lg:col-span-2 min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-indigo-400" />
                            Issue Heatmap
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/20">Critical</span>
                            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20">High</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">Normal</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                        <MapContainer
                            center={[20.5937, 78.9629]} // Default center (India) - should be dynamic based on user city
                            zoom={5}
                            style={{ height: '100%', width: '100%', minHeight: '400px' }}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {issues.map(issue => (
                                issue.gps && issue.gps.lat && issue.gps.lng && (
                                    <Marker
                                        key={issue._id}
                                        position={[issue.gps.lat, issue.gps.lng]}
                                    >
                                        <Popup>
                                            <div className="text-gray-900">
                                                <strong>{issue.title}</strong><br />
                                                Status: {issue.status}<br />
                                                Priority: {issue.priority}
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                </GlassCard>

                {/* Priority Issues List */}
                <GlassCard className="min-h-[500px] flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Priority Attention
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {priorityIssues.length > 0 ? (
                            priorityIssues.map(issue => (
                                <div key={issue._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${issue.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {issue.priority}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-white font-medium mb-1 group-hover:text-indigo-300 transition-colors">{issue.title}</h4>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{issue.description}</p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">{issue.city || 'Unknown City'}</span>
                                        <span className={`px-2 py-0.5 rounded capitalize ${issue.status === 'resolved' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'
                                            }`}>{issue.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No high priority issues found.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
