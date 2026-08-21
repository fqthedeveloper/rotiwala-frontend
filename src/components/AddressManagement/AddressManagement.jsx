// frontend/src/components/AddressManagement/AddressManagement.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaStarHalfAlt,
  FaMapMarkerAlt,
  FaSearch,
} from 'react-icons/fa';
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  useLoadScript,
} from '@react-google-maps/api';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../service/api';
import './AddressManagement.css';

const libraries = ['places'];

// Default map center (Delhi)
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '10px',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    address: '',
    latitude: '',
    longitude: '',
    is_default: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // ----- Google Map state -----
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapMarker, setMapMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // ----- Load addresses -----
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // When editing, update map center and marker
  useEffect(() => {
    if (editingAddress && isLoaded) {
      const lat = parseFloat(editingAddress.latitude);
      const lng = parseFloat(editingAddress.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setMapMarker({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
      }
    }
  }, [editingAddress, isLoaded]);

  // When form opens for new address, try to get user location
  useEffect(() => {
    if (showForm && !editingAddress && isLoaded) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setMapCenter({ lat: latitude, lng: longitude });
            setMapMarker({ lat: latitude, lng: longitude });
            setFormData((prev) => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
          },
          () => {
            // Fallback to default
            setMapCenter(DEFAULT_CENTER);
            setMapMarker(null);
          }
        );
      } else {
        setMapCenter(DEFAULT_CENTER);
      }
    }
  }, [showForm, editingAddress, isLoaded]);

  // ----- Handlers -----
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapMarker({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    // Optionally reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapMarker({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    reverseGeocode(lat, lng);
  };

  // Reverse geocode to fill address field
  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formatted = results[0].formatted_address;
        setFormData((prev) => ({
          ...prev,
          address: formatted,
        }));
      }
    });
  };

  // When place is selected from autocomplete
  const onPlaceSelected = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMapMarker({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || '',
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        label: formData.label,
        address: formData.address,
        latitude: Number(Number(formData.latitude).toFixed(6)),
        longitude: Number(Number(formData.longitude).toFixed(6)),
        is_default: formData.is_default,
    };
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        Swal.fire('Updated', 'Address updated successfully', 'success');
      } else {
        await createAddress(payload);
        Swal.fire('Added', 'Address added successfully', 'success');
      }
      resetForm();
      loadAddresses();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.detail || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      address: '',
      latitude: '',
      longitude: '',
      is_default: false,
    });
    setMapMarker(null);
    setMapCenter(DEFAULT_CENTER);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || 'Home',
      address: address.address || '',
      latitude: address.latitude?.toString() || '',
      longitude: address.longitude?.toString() || '',
      is_default: address.is_default || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (address) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: `"${address.label}" will be removed`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAddress(address.id);
      Swal.fire('Deleted', 'Address removed', 'success');
      loadAddresses();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (address) => {
    try {
      await setDefaultAddress(address.id);
      Swal.fire('Default Set', `${address.label} is now your default address`, 'success');
      loadAddresses();
    } catch (error) {
      Swal.fire('Error', 'Failed to set default', 'error');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Error', 'Geolocation not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setMapMarker({ lat: latitude, lng: longitude });
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        reverseGeocode(latitude, longitude);
      },
      () => Swal.fire('Error', 'Unable to get location', 'error'),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ----- Render helpers -----
  if (loading) {
    return (
      <div className="address-management text-center py-4">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading addresses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="address-management">
      <div className="address-header">
        <h4>
          <FaMapMarkerAlt className="me-2" />
          My Delivery Addresses
        </h4>
        <button
          className="btn btn-add"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <FaPlus /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="no-addresses">
          <p>You don't have any saved addresses.</p>
          <button className="btn btn-outline-warning" onClick={() => setShowForm(true)}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              className={`address-card ${addr.is_default ? 'default' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="address-info">
                <div className="address-label">
                  <FaHome className="me-1" />
                  <strong>{addr.label}</strong>
                  {addr.is_default && (
                    <span className="default-badge">
                      <FaStar /> Default
                    </span>
                  )}
                </div>
                <div className="address-text">{addr.address}</div>
                <div className="address-coords">
                  Lat: {addr.latitude}, Lng: {addr.longitude}
                </div>
              </div>
              <div className="address-actions">
                {!addr.is_default && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleSetDefault(addr)}
                  >
                    <FaStarHalfAlt /> Set Default
                  </button>
                )}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleEdit(addr)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(addr)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============================================================
          Address Form with Google Map
          ============================================================ */}
      {showForm && (
        <div className="address-form-overlay">
          <div className="address-form-modal">
            <div className="modal-header">
              <h5>{editingAddress ? 'Edit Address' : 'Add New Address'}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => resetForm()}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Label (e.g. Home, Work)</label>
                <input
                  type="text"
                  className="form-control"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Full Address</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Type or pick from map"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={getCurrentLocation}
                  >
                    Locate Me
                  </button>
                </div>

                {/* Google Maps Place Autocomplete (search) */}
                {isLoaded && (
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={onPlaceSelected}
                    className="w-100"
                  >
                    <input
                      type="text"
                      placeholder="Search for a place..."
                      className="form-control mb-2"
                    />
                  </Autocomplete>
                )}

                {/* The Map */}
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    options={options}
                    onClick={handleMapClick}
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    {mapMarker && (
                      <Marker
                        position={mapMarker}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="map-loading">Loading map...</div>
                )}

                <div className="row mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </div>
                </div>
                <small className="text-muted">
                  Drag the marker or click on the map to set location.
                </small>
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  id="setDefaultCheck"
                />
                <label className="form-check-label" htmlFor="setDefaultCheck">
                  Set as default address
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => resetForm()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingAddress
                    ? 'Update Address'
                    : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}