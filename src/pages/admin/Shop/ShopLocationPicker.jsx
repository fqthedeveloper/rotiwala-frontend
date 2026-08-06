import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Nashik City Geographical Bounding Box
const NASHIK_BOUNDS = [
  [19.8500, 73.6500], // South-West corner
  [20.1500, 73.9200]  // North-East corner
];

// Inner component to safely handle map initialization, boundaries, and click events
const MapHandler = ({ formData, setFormData }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  // Apply map restrictions and fix container sizing once map is mounted
  useEffect(() => {
    if (!map) return;

    // Set view bounds to strictly lock panning to Nashik city
    map.setMaxBounds(NASHIK_BOUNDS);
    map.setMinZoom(12);

    // Force map to recalculate its visible size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  // Click event listener to set marker & lat/lng
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7),
      }));
    },
  });

  // Keep marker position synced when formData changes
  useEffect(() => {
    if (!map) return;

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const newPos = [lat, lng];
      setPosition(newPos);
      map.panTo(newPos);
    } else {
      setPosition(null);
    }
  }, [formData.latitude, formData.longitude, map]);

  return position ? <Marker position={position} /> : null;
};

// Main Export Component
const LocationPicker = ({ formData, setFormData, mapRef }) => {
  // Nashik Default Coordinates
  const NASHIK_CENTER = [20.0081, 73.7841];

  const center =
    formData.latitude && formData.longitude && !isNaN(Number(formData.latitude))
      ? [Number(formData.latitude), Number(formData.longitude)]
      : NASHIK_CENTER;

  return (
    <>
      {/* Inline styles to guarantee Leaflet container layout */}
      <style>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          border-radius: 10px;
        }
      `}</style>

      <div
        style={{
          height: '400px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '10px'
        }}
      >
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapHandler formData={formData} setFormData={setFormData} />
        </MapContainer>
      </div>
    </>
  );
};

export default LocationPicker;