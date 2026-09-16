// frontend/src/pages/manager/Delivery/DeliveryTrackingMap.jsx

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Helper to validate lat/lng coordinates
const isValidCoord = (lat, lng) => {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  return (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180 &&
    !(numLat === 0 && numLng === 0)
  );
};

// Check if coordinates are emulator default mock location outside India (e.g. USA / longitude < 0)
const isOutsideIndia = (lat, lng) => {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  return numLng < 60 || numLng > 100 || numLat < 6 || numLat > 40;
};

// Child controller component that reliably controls Leaflet map view
function MapController({ points, defaultCenter }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (points && points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 15, { animate: true });
      } else {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
      }
    } else if (defaultCenter) {
      map.setView(defaultCenter, 14);
    }
  }, [map, points, defaultCenter]);

  return null;
}

const DeliveryTrackingMap = ({ shopLocation, boyLocation, customerLocation, boyName, orderNumber }) => {
  // Parse and sanitize shop coordinate
  const shopCoord = useMemo(() => {
    if (isValidCoord(shopLocation?.latitude, shopLocation?.longitude)) {
      return [parseFloat(shopLocation.latitude), parseFloat(shopLocation.longitude)];
    }
    return null;
  }, [shopLocation]);

  // Parse and sanitize delivery boy coordinate
  const boyCoord = useMemo(() => {
    if (isValidCoord(boyLocation?.latitude, boyLocation?.longitude)) {
      const lat = parseFloat(boyLocation.latitude);
      const lng = parseFloat(boyLocation.longitude);
      // If emulator set USA coordinates (e.g. Mountain View CA -122), fallback to shop
      if (isOutsideIndia(lat, lng) && shopCoord) {
        return shopCoord;
      }
      return [lat, lng];
    }
    // If rider has no GPS yet, fallback to shop location
    if (shopCoord) return shopCoord;
    return null;
  }, [boyLocation, shopCoord]);

  // Parse and sanitize customer coordinate
  const customerCoord = useMemo(() => {
    if (isValidCoord(customerLocation?.latitude, customerLocation?.longitude)) {
      return [parseFloat(customerLocation.latitude), parseFloat(customerLocation.longitude)];
    }
    return null;
  }, [customerLocation]);

  // Valid points to fit in map bounds
  const validPoints = useMemo(() => {
    const pts = [];
    if (shopCoord) pts.push(shopCoord);
    if (boyCoord) pts.push(boyCoord);
    if (customerCoord) pts.push(customerCoord);
    return pts;
  }, [shopCoord, boyCoord, customerCoord]);

  // Fallback center: boy, shop, customer, or Nashik
  const center = useMemo(() => {
    if (boyCoord) return boyCoord;
    if (shopCoord) return shopCoord;
    if (customerCoord) return customerCoord;
    return [19.9975, 73.7898];
  }, [boyCoord, shopCoord, customerCoord]);

  // Radar pulse icon for Delivery Rider
  const riderIcon = useMemo(() => {
    return L.divIcon({
      className: 'dm-rider-marker-wrapper',
      html: `
        <div class="dm-radar-pulse">
          <div class="dm-radar-ring"></div>
          <div class="dm-radar-ring delay"></div>
          <div class="dm-rider-dot">
            <span class="dm-rider-emoji">🏍️</span>
          </div>
          <div class="dm-rider-label">${boyName || 'Rider'}</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
    });
  }, [boyName]);

  // Badge icon for Shop
  const shopIcon = useMemo(() => {
    return L.divIcon({
      className: 'dm-shop-marker-wrapper',
      html: `
        <div class="dm-shop-badge">
          <span class="dm-shop-emoji">🏪</span>
          <div class="dm-marker-label">${shopLocation?.name || 'Shop'}</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, [shopLocation]);

  // Destination pin for Customer
  const destIcon = useMemo(() => {
    return L.divIcon({
      className: 'dm-dest-marker-wrapper',
      html: `
        <div class="dm-customer-badge">
          <span class="dm-customer-emoji">📍</span>
          <div class="dm-marker-label">Delivery Destination</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, []);

  // Fallback if completely no coordinates exist
  if (!shopCoord && !boyCoord && !customerCoord) {
    return (
      <div className="no-location-box text-center py-4 bg-light rounded border p-4">
        <FaMapMarkerAlt size={48} className="text-muted mb-3" />
        <h6 className="fw-bold">Location coordinates not available yet</h6>
        <p className="text-muted small mb-0">
          The delivery boy's device hasn't shared GPS location, and the order has no geocoded address.
        </p>
      </div>
    );
  }

  // Polyline route between Shop -> Rider -> Customer
  const polylineCoords = useMemo(() => {
    const route = [];
    if (shopCoord) route.push(shopCoord);
    if (boyCoord && (!shopCoord || boyCoord[0] !== shopCoord[0] || boyCoord[1] !== shopCoord[1])) {
      route.push(boyCoord);
    }
    if (customerCoord) route.push(customerCoord);
    return route;
  }, [shopCoord, boyCoord, customerCoord]);

  return (
    <div
      className="tracking-map-wrapper position-relative"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Live Radar Tracker Badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
            boxShadow: '0 0 10px #22c55e',
          }}
        />
        <span>Rider Radar Live</span>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '420px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController points={validPoints} defaultCenter={center} />

        {shopCoord && (
          <Marker position={shopCoord} icon={shopIcon}>
            <Popup>
              <strong>🏪 {shopLocation?.name || 'Shop'}</strong>
              <br />
              <small>Pickup Point</small>
            </Popup>
          </Marker>
        )}

        {boyCoord && (
          <Marker position={boyCoord} icon={riderIcon}>
            <Popup>
              <strong>🏍️ {boyName || 'Delivery Rider'}</strong>
              <br />
              <small>Live Rider Location</small>
            </Popup>
          </Marker>
        )}

        {customerCoord && (
          <Marker position={customerCoord} icon={destIcon}>
            <Popup>
              <strong>📍 Delivery Destination</strong>
              <br />
              <small>{customerLocation?.address || 'Customer Address'}</small>
            </Popup>
          </Marker>
        )}

        {polylineCoords.length >= 2 && (
          <Polyline
            positions={polylineCoords}
            color="#2563eb"
            weight={4}
            opacity={0.7}
            dashArray="6, 8"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryTrackingMap;