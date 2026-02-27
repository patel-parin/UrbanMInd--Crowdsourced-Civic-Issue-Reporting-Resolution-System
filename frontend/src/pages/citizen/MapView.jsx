import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { issueService } from '../../api/services/issueService';
import Loader from '../../components/common/Loader';
import { MapPin } from 'lucide-react';

// Fix Leaflet default icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapView = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null); // Init as null to wait for location

    useEffect(() => {
        const fetchIssues = async () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);

                    try {
                        const data = await issueService.getAll({ lat, lng });
                        setIssues(data);
                    } catch (error) {
                        console.error('Failed to fetch issues:', error);
                    } finally {
                        setLoading(false);
                    }
                },
                async (error) => {
                    console.error("Error getting location", error);
                    // Default fallback
                    setUserLocation([20.5937, 78.9629]);
                    try {
                        const data = await issueService.getAll();
                        setIssues(data);
                    } catch (err) {
                        console.error('Failed to fetch issues:', err);
                    } finally {
                        setLoading(false);
                    }
                }
            );
        };

        fetchIssues();
    }, []);


    if (loading && !userLocation) {
        return (
            <div className="flex items-center justify-center h-[75vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="h-[80vh] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
            <MapContainer
                center={userLocation || [20.5937, 78.9629]}
                zoom={12}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                {userLocation && <RecenterAutomatically lat={userLocation[0]} lng={userLocation[1]} />}

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {issues.map((issue) => (
                    issue.gps && issue.gps.lat && issue.gps.lng && (
                        <Marker
                            key={issue._id}
                            position={[issue.gps.lat, issue.gps.lng]}
                        >
                            <Popup>
                                <div className="text-gray-900 min-w-[200px]">
                                    <h3 className="font-bold text-lg mb-1">{issue.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                issue.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {issue.gps.address || issue.location}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
