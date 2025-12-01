import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const IssueMap = ({ lat, lng, title }) => {
  const markerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />

      <Marker position={[lat, lng]} icon={markerIcon}>
        <Popup>{title || "Issue Location"}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default IssueMap;
