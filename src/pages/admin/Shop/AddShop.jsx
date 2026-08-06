import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createShop } from '../../../service/shopService';
import LocationPicker from './ShopLocationPicker';

const AddShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const mapRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    opening_time: '',
    closing_time: '',
    latitude: '',
    longitude: '',
    logo: null,
    banner: null,
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
      return;
    }
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        Swal.fire({
          icon: 'success',
          title: 'Location Found',
          text: 'Current location loaded successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        setGettingLocation(false);
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Location Error',
          text: 'Unable to fetch your location',
        });
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address', formData.address);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('opening_time', formData.opening_time);
      submitData.append('closing_time', formData.closing_time);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      submitData.append('is_active', formData.is_active ? 'true' : 'false');
      if (formData.logo) submitData.append('logo', formData.logo);
      if (formData.banner) submitData.append('banner', formData.banner);

      await createShop(submitData);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Shop Created Successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/admin/shops');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error?.response?.data?.detail || 'Unable to create shop',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Add Shop | Roti Wala';
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="mb-0">Add New Shop</h4>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/shops')}
                >
                  Back
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-name" className="form-label fw-semibold">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      id="shop-name"
                      name="name"
                      className="form-control"
                      autoComplete="organization"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-phone" className="form-label fw-semibold">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="shop-phone"
                      name="phone"
                      className="form-control"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="shop-address" className="form-label fw-semibold">
                      Address
                    </label>
                    <textarea
                      id="shop-address"
                      rows="4"
                      name="address"
                      className="form-control"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-email" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      id="shop-email"
                      name="email"
                      className="form-control"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="shop-opening-time" className="form-label fw-semibold">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      id="shop-opening-time"
                      name="opening_time"
                      className="form-control"
                      value={formData.opening_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="shop-closing-time" className="form-label fw-semibold">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      id="shop-closing-time"
                      name="closing_time"
                      className="form-control"
                      value={formData.closing_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-logo" className="form-label fw-semibold">
                      Shop Logo
                    </label>
                    <input
                      type="file"
                      id="shop-logo"
                      name="logo"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-banner" className="form-label fw-semibold">
                      Shop Banner
                    </label>
                    <input
                      type="file"
                      id="shop-banner"
                      name="banner"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>

                  {/* SHOP LOCATION CONTAINER */}
                  <div className="col-12 mb-4">
                    <div className="card border">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Shop Location</h6>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                        >
                          {gettingLocation ? 'Fetching...' : 'Use My Location'}
                        </button>
                      </div>

                      {/* Map rendered cleanly in its own block without overlapping UI elements */}
                      <div className="card-body p-0" style={{ height: '400px', width: '100%' }}>
                        <LocationPicker
                          formData={formData}
                          setFormData={setFormData}
                          mapRef={mapRef}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-latitude" className="form-label fw-semibold">
                      Latitude
                    </label>
                    <input
                      type="text"
                      id="shop-latitude"
                      className="form-control"
                      value={formData.latitude}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-longitude" className="form-label fw-semibold">
                      Longitude
                    </label>
                    <input
                      type="text"
                      id="shop-longitude"
                      className="form-control"
                      value={formData.longitude}
                      readOnly
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="shop-is-active"
                        className="form-check-input"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <label htmlFor="shop-is-active" className="form-check-label fw-semibold">
                        Active Shop
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-warning w-100 py-3 fw-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Creating Shop...
                        </>
                      ) : (
                        'Create Shop'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddShop;