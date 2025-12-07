import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/map.css';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ServiceCoverageMap = () => {
  // Default center (can be customized)
  const center = [40.7128, -74.0060]; // New York City coordinates
  const zoom = 10;

  // Sample service coverage locations
  const locations = [
    { position: [40.7128, -74.0060], name: 'New York City', description: 'Full service coverage' },
    { position: [40.7589, -73.9851], name: 'Manhattan', description: 'Premium services available' },
    { position: [40.6782, -73.9442], name: 'Brooklyn', description: 'All services available' },
    { position: [40.7282, -73.7949], name: 'Queens', description: 'Standard services' },
  ];

  return (
    <div className="coverage-map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker key={index} position={location.position}>
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <br />
                {location.description}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ServiceCoverageMap;

