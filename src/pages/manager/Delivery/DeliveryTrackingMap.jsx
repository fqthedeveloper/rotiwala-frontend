// frontend/src/components/manager/DeliveryTrackingMap.jsx

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaStore, FaUser } from 'react-icons/fa';

// Fix default marker icons (Vite compatible imports)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DeliveryTrackingMap = ({ shopLocation, boyLocation, customerLocation, boyName, orderNumber }) => {
  const mapRef = useRef(null);

  // Custom icons
  const boyIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3125/3125713.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const shopIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/263/263142.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const customerIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3125/3125714.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    if (mapRef.current && shopLocation && boyLocation && customerLocation) {
      const bounds = L.latLngBounds([
        [shopLocation.latitude, shopLocation.longitude],
        [boyLocation.latitude, boyLocation.longitude],
        [customerLocation.latitude, customerLocation.longitude],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [shopLocation, boyLocation, customerLocation]);

  // Graceful fallback if location is not available
  if (!boyLocation || !boyLocation.latitude) {
    return (
      <div className="no-location-box">
        <FaMapMarkerAlt size={48} className="text-muted mb-3" />
        <h6>Delivery boy's location is not available yet.</h6>
        <p className="text-muted">The delivery boy may have not enabled GPS tracking.</p>
      </div>
    );
  }

  const positions = [];
  if (shopLocation) positions.push([shopLocation.latitude, shopLocation.longitude]);
  if (boyLocation) positions.push([boyLocation.latitude, boyLocation.longitude]);
  if (customerLocation) positions.push([customerLocation.latitude, customerLocation.longitude]);

  return (
    <div className="tracking-map-wrapper">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {shopLocation && (
          <Marker position={[shopLocation.latitude, shopLocation.longitude]} icon={shopIcon}>
            <Popup>Shop: {shopLocation.name}</Popup>
          </Marker>
        )}
        {boyLocation && (
          <Marker position={[boyLocation.latitude, boyLocation.longitude]} icon={boyIcon}>
            <Popup>Delivery Boy: {boyName}</Popup>
          </Marker>
        )}
        {customerLocation && (
          <Marker position={[customerLocation.latitude, customerLocation.longitude]} icon={customerIcon}>
            <Popup>Delivery Location</Popup>
          </Marker>
        )}
        {positions.length > 1 && (
          <Polyline positions={positions} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryTrackingMap;