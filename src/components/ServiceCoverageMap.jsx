import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/map.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ServiceCoverageMap = () => {

  const center = [23.8103, 90.4125]; 


  const zoom = 7; 

  
  const locations = 
  
  
  [
    { position: [23.8103, 90.4125], name: 'Dhaka', description: 'Full service coverage - Capital city' },
    { position: [24.8949, 91.8687], name: 'Sylhet', description: 'All decoration services available' },
    { position: [22.3569, 91.7832], name: 'Chittagong', description: 'Premium services available' },
    { position: [24.3745, 88.6042], name: 'Rajshahi', description: 'Standard and premium services' },
  ];

  return (
    <div className="coverage-map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '400px',
          
          width: '100%',
          
          
          borderRadius: 'var(--radius-lg)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => 
        
        
        (
          <Marker key={index} position={location.position}>
            <Popup>
              <div>
                <strong>
                  
                  {location.name}
                  
                  
                  </strong>
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

