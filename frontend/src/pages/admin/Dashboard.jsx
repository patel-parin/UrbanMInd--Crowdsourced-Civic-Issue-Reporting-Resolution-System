import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, Clock, Activity, ArrowUpRight, Map as MapIcon, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';
import { issueService } from '../../api/services/issueService';
import { useAuth } from '../../context/AuthContext';
import { getCityCoords } from '../../utils/cityCoordinates';

// Custom marker icons
const createIcon = (color) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        width: 24px; height: 24px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
    "><div style="width: 6px; height: 6px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
});

const statusIcons = {
    reported: createIcon('#f97316'),
    assigned: createIcon('#3b82f6'),
    in_progress: createIcon('#6366f1'),
    resolved: createIcon('#22c55e'),
    fund_approval_pending: createIcon('#f59e0b'),
    under_contractor_survey: createIcon('#8b5cf6'),
    critical: createIcon('#ef4444'),
};

const getMarkerIcon = (issue) => {
    if (issue.priority === 'critical') return statusIcons.critical;
    return statusIcons[issue.status] || createIcon('#6b7280');
};

// Map controller for city-scoped view
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, zoom || 12);
        }
    }, [center, zoom, map]);
    return null;
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        activeContractors: 0,
    });
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // City-scoped map center
    const adminCity = user?.city || '';
    const cityCoords = getCityCoords(adminCity);
    const mapCenter = [cityCoords.lat, cityCoords.lng];
    const mapZoom = cityCoords.zoom || 12;

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
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">
                        {adminCity ? `${adminCity} — Real-time overview` : 'Real-time overview of system performance'}
                    </p>
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
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* City-Scoped Issue Map */}
                <GlassCard className="lg:col-span-2 min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 z-10 relative">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-indigo-400" />
                            {adminCity ? `${adminCity} Issue Map` : 'Issue Heatmap'}
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/20">Critical</span>
                            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20">Reported</span>
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/20">Resolved</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 relative z-0" style={{ minHeight: '400px' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%', minHeight: '400px' }}
                        >
                            <MapController center={mapCenter} zoom={mapZoom} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {issues.map(issue => (
                                issue.gps && issue.gps.lat && issue.gps.lng && (
                                    <Marker
                                        key={issue._id}
                                        position={[issue.gps.lat, issue.gps.lng]}
                                        icon={getMarkerIcon(issue)}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: '200px', fontFamily: 'system-ui' }}>
                                                <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#1e293b' }}>{issue.title}</h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        background: issue.status === 'resolved' ? '#dcfce7' : '#dbeafe',
                                                        color: issue.status === 'resolved' ? '#166534' : '#1e40af',
                                                    }}>
                                                        {issue.status?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        background: issue.priority === 'critical' ? '#fee2e2' : issue.priority === 'high' ? '#ffedd5' : '#f3f4f6',
                                                        color: issue.priority === 'critical' ? '#991b1b' : issue.priority === 'high' ? '#9a3412' : '#374151',
                                                    }}>
                                                        {issue.priority}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                    {issue.gps?.address || issue.city || 'Unknown'}
                                                </div>
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
                                            }`}>{issue.status?.replace(/_/g, ' ')}</span>
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
