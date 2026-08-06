import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Paste your Google Maps API Key here
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Strict Nashik City Boundary Box
const NASHIK_BOUNDS = {
  north: 20.1500,
  south: 19.8500,
  east: 73.9200,
  west: 73.6500,
};

const NASHIK_CENTER = { lat: 20.0081, lng: 73.7841 };

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
};

const mapOptions = {
  restriction: {
    latLngBounds: NASHIK_BOUNDS,
    strictBounds: true, // Prevents users from panning outside Nashik city
  },
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

const LocationPicker = ({ formData, setFormData, mapRef }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const localMapRef = useRef(null);

  // Validate initial lat/lng from props
  const initialLat = Number(formData.latitude);
  const initialLng = Number(formData.longitude);

  const hasValidCoords =
    initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng);

  const center = hasValidCoords
    ? { lat: initialLat, lng: initialLng }
    : NASHIK_CENTER;

  const [markerPosition, setMarkerPosition] = useState(
    hasValidCoords ? { lat: initialLat, lng: initialLng } : null
  );

  // Synchronize map center and marker when formData updates externally (e.g. "Use My Location")
  useEffect(() => {
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const newPos = { lat, lng };
      setMarkerPosition(newPos);
      if (localMapRef.current) {
        localMapRef.current.panTo(newPos);
      }
    } else {
      setMarkerPosition(null);
    }
  }, [formData.latitude, formData.longitude]);

  const onMapLoad = useCallback(
    (map) => {
      localMapRef.current = map;
      if (mapRef) {
        mapRef.current = map;
      }
    },
    [mapRef]
  );

  const handleMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7),
      }));
    },
    [setFormData]
  );

  if (loadError) {
    return (
      <div className="alert alert-danger text-center p-3">
        Failed to load Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded"
        style={{ height: '400px' }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Map...</span>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      options={mapOptions}
      onLoad={onMapLoad}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
};

export default LocationPicker;