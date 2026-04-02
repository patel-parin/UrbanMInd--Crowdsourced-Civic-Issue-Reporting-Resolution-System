import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, ArrowRight, MapPin, Activity, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { dashboardService } from '../../api/services/dashboardService';
import { issueService } from '../../api/services/issueService';
import { useAuth } from '../../context/AuthContext';
import { getCityCoords } from '../../utils/cityCoordinates';

// Custom marker icons
const createIcon = (color) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        width: 22px; height: 22px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
    "><div style="width: 5px; height: 5px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22]
});

const statusIcons = {
    reported: createIcon('#f97316'),
    assigned: createIcon('#3b82f6'),
    in_progress: createIcon('#6366f1'),
    resolved: createIcon('#22c55e'),
    fund_approval_pending: createIcon('#f59e0b'),
    critical: createIcon('#ef4444'),
};

const getMarkerIcon = (issue) => {
    if (issue.priority === 'critical') return statusIcons.critical;
    return statusIcons[issue.status] || createIcon('#6b7280');
};

// Map controller
const RecenterMap = ({ location, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (location && location[0] && location[1]) {
            map.setView(location, zoom || 12);
        }
    }, [location, zoom, map]);
    return null;
};

const CitizenDashboard = () => {
    const { user } = useAuth();
    const userCity = user?.city || '';
    const cityCoords = getCityCoords(userCity);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
    });

    const [recentIssues, setRecentIssues] = useState([]);
    const [nearbyIssues, setNearbyIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState([cityCoords.lat, cityCoords.lng]);
    const [mapZoom, setMapZoom] = useState(cityCoords.zoom || 12);
    const [cityPulse, setCityPulse] = useState({ criticalIssues: 0, activeCitizens: 0, totalIssues: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for stats and my issues (independent of location)
                const [statsData, issuesData] = await Promise.all([
                    dashboardService.getStats(),
                    issueService.getMyIssues({ limit: 5 })
                ]);

                setStats(statsData);
                setRecentIssues(issuesData);

                // Get user location and then fetch map issues
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setUserLocation([lat, lng]);
                        setMapZoom(13);

                        try {
                            const mapIssues = await issueService.getAll({ lat, lng });
                            setNearbyIssues(mapIssues);
                            updateCityPulse(mapIssues);
                        } catch (err) {
                            console.error("Failed to fetch map issues", err);
                        }
                    },
                    async () => {
                        // Fallback to city center
                        setUserLocation([cityCoords.lat, cityCoords.lng]);
                        setMapZoom(cityCoords.zoom || 12);
                        try {
                            const mapIssues = await issueService.getAll();
                            setNearbyIssues(mapIssues);
                            updateCityPulse(mapIssues);
                        } catch (err) {
                            console.error("Failed to fetch map issues", err);
                        }
                    }
                );

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateCityPulse = (issues) => {
        const criticalCount = issues.filter(i => i.priority === 'critical').length;
        const uniqueReporters = new Set(issues.map(i => i.userId?._id || i.userId)).size;

        setCityPulse({
            criticalIssues: criticalCount,
            activeCitizens: uniqueReporters,
            totalIssues: issues.length
        });
    };

    if (loading) {
        return (
            <div className="p-8 w-full h-full flex items-center justify-center min-h-[500px]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 w-full min-h-screen animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">Welcome back, Citizen</p>
                </div>
                <Link to="/citizen/report">
                    <Button
                        icon={Plus}
                        className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 border-none"
                    >
                        Report Issue
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="group hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Reports</p>
                            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="group hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-400 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Pending</p>
                            <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="group hover:border-green-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Resolved</p>
                            <h3 className="text-3xl font-bold text-white">{stats.resolved}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live City Map */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-[400px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 z-10 relative">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-400" />
                                Live City Issues
                            </h3>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center gap-1 text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
                                <span className="flex items-center gap-1 text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Reported</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 relative z-0 min-h-[300px]">
                            {userLocation && (
                                <MapContainer
                                    center={userLocation}
                                    zoom={mapZoom}
                                    className="h-full w-full"
                                    style={{ height: '100%', width: '100%', minHeight: '300px' }}
                                >
                                    <RecenterMap location={userLocation} zoom={mapZoom} />
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {nearbyIssues.map(issue => (
                                        issue.gps && issue.gps.lat && issue.gps.lng && (
                                            <Marker
                                                key={issue._id}
                                                position={[issue.gps.lat, issue.gps.lng]}
                                                icon={getMarkerIcon(issue)}
                                            >
                                                <Popup>
                                                    <div style={{ minWidth: '180px', fontFamily: 'system-ui' }}>
                                                        <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>{issue.title}</h3>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                            <span style={{ padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', background: '#dbeafe', color: '#1e40af' }}>
                                                                {issue.status?.replace(/_/g, ' ')}
                                                            </span>
                                                            <span style={{ color: '#6b7280' }}>👍 {issue.upvotes || 0}</span>
                                                        </div>
                                                        <a href={`/citizen/issue/${issue._id}`} style={{ display: 'block', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#4f46e5', marginTop: '6px', borderTop: '1px solid #e5e7eb', paddingTop: '4px' }}>
                                                            View Details →
                                                        </a>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )
                                    ))}
                                </MapContainer>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* City Stats Widget */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            City Pulse
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-300 text-sm">Critical Issues</span>
                                </div>
                                <span className="text-white font-bold">{cityPulse.criticalIssues}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-300 text-sm">Active Citizens</span>
                                </div>
                                <span className="text-white font-bold">{cityPulse.activeCitizens}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-300 text-sm">Total Issues</span>
                                </div>
                                <span className="text-white font-bold">{cityPulse.totalIssues}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-xs text-gray-500">Data updated in real-time</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Recent Reports List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Your Recent Reports</h2>
                    <Link to="/citizen/history" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 group">
                        View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid gap-4">
                    {recentIssues.length === 0 && (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-gray-400">No recent reports found.</p>
                            <Link to="/citizen/report" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                                Create your first report
                            </Link>
                        </div>
                    )}

                    {recentIssues.map((issue, index) => (
                        <motion.div
                            key={issue._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard hover className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">{issue.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                            <span className="capitalize">{issue.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pl-16 md:pl-0">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${issue.status === 'resolved'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                            : issue.status === 'pending' || issue.status === 'reported'
                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                            }`}
                                    >
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
