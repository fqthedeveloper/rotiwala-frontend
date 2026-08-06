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

// Nashik City Geographical Bounding Box (Restricts map panning to Nashik only)
const NASHIK_BOUNDS = [
  [19.8500, 73.6500], // South-West corner
  [20.1500, 73.9200]  // North-East corner
];

// Map Resizer component to force recalculation of map tile rendering
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    // Trigger invalidateSize multiple times to fix rendering glitches in dynamic layouts/cards
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  return null;
};

// Component handling marker placement and user click interactions
const LocationMarker = ({ formData, setFormData }) => {
  const map = useMap();
  const [position, setPosition] = useState(
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : null
  );

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

  // Keep marker position and map center synced when latitude/longitude changes from external controls
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const newPos = [Number(formData.latitude), Number(formData.longitude)];
      setPosition(newPos);
      map.setView(newPos, map.getZoom());
    } else {
      setPosition(null);
    }
  }, [formData.latitude, formData.longitude, map]);

  return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ formData, setFormData, mapRef }) => {
  // Nashik Center Coordinates
  const NASHIK_CENTER = [20.0081, 73.7841];

  const center =
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : NASHIK_CENTER;

  return (
    <div className="w-100 position-relative" style={{ height: '400px', zIndex: 1 }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        minZoom={12}
        maxZoom={18}
        maxBounds={NASHIK_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
        scrollWheelZoom={true}
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker formData={formData} setFormData={setFormData} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;