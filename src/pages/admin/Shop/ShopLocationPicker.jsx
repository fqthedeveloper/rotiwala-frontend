import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Inner marker component that reacts to clicks
const LocationMarker = ({ formData, setFormData }) => {
  const [position, setPosition] = useState(
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : null
  );

  // Keep marker in sync when formData changes (e.g., after "Use My Location")
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setPosition([Number(formData.latitude), Number(formData.longitude)]);
    } else {
      setPosition(null);
    }
  }, [formData.latitude, formData.longitude]);

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

  return position ? <Marker position={position} /> : null;
};

// Main component – receives formData, setFormData, and an optional mapRef
const LocationPicker = ({ formData, setFormData, mapRef }) => {
  // Default center: Nashik, India (as shown in your screenshot)
  const DEFAULT_CENTER = [20.0081, 73.7841]; // Nashik
  // Fallback if no coordinates are set
  const center =
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={13}
      whenCreated={mapRef}
      style={{ minHeight: '400px', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker formData={formData} setFormData={setFormData} />
    </MapContainer>
  );
};

export default LocationPicker;
