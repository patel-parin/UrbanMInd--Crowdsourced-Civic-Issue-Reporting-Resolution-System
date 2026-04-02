import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { issueService } from '../../api/services/issueService';
import Loader from '../../components/common/Loader';
import { MapPin, Navigation } from 'lucide-react';
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
    critical: createIcon('#ef4444'),
};

const getMarkerIcon = (issue) => {
    if (issue.priority === 'critical') return statusIcons.critical;
    return statusIcons[issue.status] || createIcon('#6b7280');
};

// Map controller
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, zoom || 12);
        }
    }, [center, zoom, map]);
    return null;
};

const MapView = () => {
    const { user } = useAuth();
    const userCity = user?.city || '';
    const cityCoords = getCityCoords(userCity);

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([cityCoords.lat, cityCoords.lng]);
    const [mapZoom, setMapZoom] = useState(cityCoords.zoom || 12);

    useEffect(() => {
        const fetchIssues = async () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter([lat, lng]);
                    setMapZoom(13);

                    try {
                        const data = await issueService.getAll({ lat, lng });
                        setIssues(data);
                    } catch (error) {
                        console.error('Failed to fetch issues:', error);
                    } finally {
                        setLoading(false);
                    }
                },
                async () => {
                    // Fallback to city center
                    setMapCenter([cityCoords.lat, cityCoords.lng]);
                    setMapZoom(cityCoords.zoom || 12);
                    try {
                        const data = await issueService.getAll();
                        setIssues(data);
                    } catch (error) {
                        console.error('Failed to fetch issues:', error);
                    } finally {
                        setLoading(false);
                    }
                },
                { timeout: 5000, maximumAge: 60000 }
            );
        };

        fetchIssues();
    }, []);

    if (loading && !mapCenter) {
        return (
            <div className="flex items-center justify-center h-[75vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-1">
                        Issue Map
                    </h1>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-indigo-400" />
                        {userCity ? `All issues in ${userCity}` : 'All issues in your area'}
                    </p>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Reported</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Assigned</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> In Progress</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Resolved</span>
                </div>
            </div>

            <div className="h-[75vh] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    className="h-full w-full"
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapController center={mapCenter} zoom={mapZoom} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {issues.map((issue) => (
                        issue.gps && issue.gps.lat && issue.gps.lng && (
                            <Marker
                                key={issue._id}
                                position={[issue.gps.lat, issue.gps.lng]}
                                icon={getMarkerIcon(issue)}
                            >
                                <Popup>
                                    <div style={{ minWidth: '200px', fontFamily: 'system-ui' }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#1e293b' }}>{issue.title}</h3>
                                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{issue.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                textTransform: 'uppercase',
                                                background: issue.status === 'resolved' ? '#dcfce7' : issue.status === 'reported' ? '#ffedd5' : '#dbeafe',
                                                color: issue.status === 'resolved' ? '#166534' : issue.status === 'reported' ? '#9a3412' : '#1e40af',
                                            }}>
                                                {issue.status?.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>👍 {issue.upvotes || 0}</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📍 {issue.gps.address || issue.city || 'Unknown'}
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
            </div>
        </div>
    );
};

export default MapView;
