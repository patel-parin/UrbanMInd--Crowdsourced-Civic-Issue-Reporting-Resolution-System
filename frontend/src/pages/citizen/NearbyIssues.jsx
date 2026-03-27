import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Clock, AlertTriangle, Compass, Navigation } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';
import { useAuth } from '../../context/AuthContext';
import { getCityCoords } from '../../utils/cityCoordinates';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Custom marker icons
const createIcon = (color) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
    "><div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
});

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="
        width: 20px; height: 20px; border-radius: 50%;
        background: #6366f1; border: 4px solid white;
        box-shadow: 0 0 0 4px rgba(99,102,241,0.3), 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s ease-in-out infinite;
    "></div>
    <style>@keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.3), 0 2px 8px rgba(0,0,0,0.3); } 50% { box-shadow: 0 0 0 12px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.3); } }</style>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
});

const statusIcons = {
    reported: createIcon('#f97316'),
    assigned: createIcon('#3b82f6'),
    in_progress: createIcon('#6366f1'),
    resolved: createIcon('#22c55e'),
    fund_approval_pending: createIcon('#f59e0b'),
    under_contractor_survey: createIcon('#8b5cf6'),
};

const getMarkerIcon = (status) => statusIcons[status] || createIcon('#6b7280');

// Map controller component
const MapController = ({ center, zoom, bounds }) => {
    const map = useMap();
    const initialized = useRef(false);

    useEffect(() => {
        if (center && center[0] && center[1]) {
            if (bounds) {
                map.fitBounds([bounds.southWest, bounds.northEast]);
            } else {
                map.setView(center, zoom || 13);
            }
            initialized.current = true;
            
            // FIX: Force Leaflet to recalculate the map size after layout shifts
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [center, zoom, bounds, map]);

    return null;
};

const NearbyIssues = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(10);
    const [upvotedMap, setUpvotedMap] = useState({});
    const [mapReady, setMapReady] = useState(false);

    // Get city-based default center
    const userCity = user?.city || '';
    const cityCoords = getCityCoords(userCity);
    const defaultCenter = [cityCoords.lat, cityCoords.lng];

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation([lat, lng]);
                setMapReady(true);
                await fetchNearby(lat, lng, radius);
            },
            async () => {
                // Fallback to city center
                setUserLocation(defaultCenter);
                setMapReady(true);
                await fetchNearby(defaultCenter[0], defaultCenter[1], radius);
            },
            { timeout: 5000, maximumAge: 60000 }
        );
    }, []);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchNearby = async (lat, lng, r) => {
        try {
            setLoading(true);

            // fetch ALL issues (or large range)
            const data = await issueService.getNearby(lat, lng, 100);

            // FILTER BY RADIUS
            const filtered = data.filter(issue => {
                if (!issue.gps?.lat || !issue.gps?.lng) return false;

                const distance = getDistance(
                    lat,
                    lng,
                    issue.gps.lat,
                    issue.gps.lng
                );

                issue.distance = distance.toFixed(1); // add distance
                return distance <= r; 
            });

            setIssues(filtered);

        } catch (error) {
            console.error('Failed:', error);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (issueId) => {
        try {
            const result = await issueService.upvote(issueId);
            setIssues(prev => prev.map(i =>
                i._id === issueId ? { ...i, upvotes: result.upvotes } : i
            ));
            setUpvotedMap(prev => ({ ...prev, [issueId]: result.hasUpvoted }));
        } catch (error) {
            console.error('Failed to upvote:', error);
        }
    };

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (userLocation) {
            fetchNearby(userLocation[0], userLocation[1], newRadius);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            reported: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
            assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
            resolved: 'bg-green-500/20 text-green-400 border-green-500/20',
            fund_approval_pending: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    };

    const getZoom = (radius) => {
        if (radius <= 5) return 15;
        if (radius <= 10) return 13;
        if (radius <= 25) return 11;
        if (radius <= 50) return 10;
        return 8;
    };

    if (!mapReady) {
        return (
            <div className="flex items-center justify-center h-[75vh]">
                <div className="text-center">
                    <Loader size="lg" color="indigo" />
                    <p className="text-gray-400 mt-4">Detecting your location...</p>
                </div>
            </div>
        );
    }

    const mapCenter = userLocation || defaultCenter;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-2">
                        Nearby Issues
                    </h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-indigo-400" />
                        {userCity ? `Issues in ${userCity}` : 'Issues near your location'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">Radius:</span>
                    {[5, 10, 25, 50, 100].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRadiusChange(r)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${radius === r
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {r}km
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: '70vh' }}>
                {/* Map Container */}
                <div className="lg:col-span-3" style={{ minHeight: '500px' }}>
                    <GlassCard className="relative overflow-hidden p-0 h-[70vh] min-h-[500px] z-0">
                        {/* FIX: Removed the wrapper div, applied styles directly to MapContainer, removed the dynamic key */}
                        <MapContainer
                            center={mapCenter}
                            zoom={getZoom(radius)}
                            style={{ height: '100%', width: '100%', minHeight: '500px', zIndex: 0 }}
                        >
                            <MapController center={mapCenter} zoom={getZoom(radius)} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {/* Radius circle */}
                            {userLocation && (
                                <Circle
                                    center={userLocation}
                                    radius={radius * 1000}
                                    pathOptions={{
                                        color: '#818cf8',
                                        fillColor: '#6366f1',
                                        fillOpacity: 0.06,
                                        weight: 2,
                                        dashArray: '8, 8'
                                    }}
                                />
                            )}
                            {/* User location */}
                            {userLocation && (
                                <Marker position={userLocation} icon={userIcon}>
                                    <Popup>
                                        <div className="text-gray-900 font-medium text-center p-1">
                                            <span style={{ fontSize: '16px' }}>📍</span> Your Location
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {/* Issue markers */}
                            {issues.map(issue => (
                                issue.gps?.lat && issue.gps?.lng && (
                                    <Marker
                                        key={issue._id}
                                        position={[issue.gps.lat, issue.gps.lng]}
                                        icon={getMarkerIcon(issue.status)}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: '220px', fontFamily: 'system-ui' }}>
                                                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#1e293b' }}>{issue.title}</h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        background: issue.status === 'resolved' ? '#dcfce7' : issue.status === 'reported' ? '#ffedd5' : '#dbeafe',
                                                        color: issue.status === 'resolved' ? '#166534' : issue.status === 'reported' ? '#9a3412' : '#1e40af',
                                                    }}>
                                                        {issue.status?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{issue.distance} km</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                    👍 {issue.upvotes || 0} upvotes
                                                </div>
                                                <a href={`/citizen/issue/${issue._id}`} style={{
                                                    display: 'block', textAlign: 'center', fontSize: '12px',
                                                    fontWeight: 700, color: '#4f46e5', padding: '4px',
                                                    borderTop: '1px solid #e5e7eb', marginTop: '4px'
                                                }}>
                                                    View Details →
                                                </a>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                        
                        {/* Map legend overlay */}
                        <div className="absolute bottom-3 left-3 z-[1000] bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 pointer-events-none">
                            <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Reported</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Assigned</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> In Progress</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Resolved</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Issue List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: '70vh' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 font-medium">
                            {issues.length} issue{issues.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader color="indigo" /></div>
                    ) : issues.length === 0 ? (
                        <div className="text-center py-16">
                            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No issues found within {radius}km</p>
                            <p className="text-gray-500 text-sm mt-1">Try increasing the radius</p>
                        </div>
                    ) : (
                        issues.map((issue, index) => (
                            <motion.div
                                key={issue._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <Link to={`/citizen/issue/${issue._id}`}>
                                    <GlassCard hover className="p-4 group">
                                        <div className="flex gap-4">
                                            {issue.images?.length > 0 && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                                    <img
                                                        src={issue.images[0]?.startsWith('/uploads')
                                                            ? `${API_URL}${issue.images[0]}`
                                                            : issue.images[0]
                                                        }
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                                        {issue.title}
                                                    </h4>
                                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg shrink-0 border border-indigo-500/20">
                                                        {issue.distance} km
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(issue.status)}`}>
                                                        {issue.status?.replace(/_/g, ' ')}
                                                    </span>
                                                    {issue.priority && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${issue.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                                issue.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                    'bg-gray-500/10 text-gray-400'
                                                            }`}>
                                                            {issue.priority}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {issue.city || 'Unknown'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleUpvote(issue._id);
                                                        }}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${upvotedMap[issue._id]
                                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                                : 'bg-white/5 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400'
                                                            }`}
                                                    >
                                                        <ThumbsUp className={`w-3 h-3 ${upvotedMap[issue._id] ? 'fill-indigo-400' : ''}`} />
                                                        {issue.upvotes || 0}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbyIssues;