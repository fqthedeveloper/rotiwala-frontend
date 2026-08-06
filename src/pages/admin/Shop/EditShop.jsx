import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getShop, updateShop } from '../../../service/shopService';
import LocationPicker from './ShopLocationPicker';

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    logo: null,        // will hold new File if user uploads
    banner: null,      // will hold new File if user uploads
    is_active: true,
  });

  // Load shop data
  useEffect(() => {
    const loadShop = async () => {
      try {
        const data = await getShop(id);
        // Keep existing logo/banner URLs as strings, but we don't use them directly.
        // We'll only send new files if the user selects them.
        setFormData({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          opening_time: data.opening_time || '',
          closing_time: data.closing_time || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          logo: null,   // reset; we'll only append if a new file is chosen
          banner: null, // reset
          is_active: data.is_active ?? true,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load shop',
        });
      }
    };
    loadShop();
    document.title = 'Edit Shop | Roti Wala';
  }, [id]);

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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        Swal.fire({
          icon: 'success',
          title: 'Location Updated',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Location Error',
          text: 'Unable to fetch your location',
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();

      // Append scalar fields only if they have a value
      const scalarFields = ['name', 'address', 'phone', 'email', 'opening_time', 'closing_time', 'latitude', 'longitude'];
      scalarFields.forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Append is_active as a string
      submitData.append('is_active', formData.is_active ? 'true' : 'false');

      // Append files only if a new file was selected
      if (formData.logo && formData.logo instanceof File) {
        submitData.append('logo', formData.logo);
      }
      if (formData.banner && formData.banner instanceof File) {
        submitData.append('banner', formData.banner);
      }

      await updateShop(id, submitData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Shop Updated Successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/admin/shops');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.detail || 'Failed To Update Shop',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Edit Shop</h4>
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
                    <label htmlFor="shop-name" className="form-label">Shop Name</label>
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
                    <label htmlFor="shop-phone" className="form-label">Phone Number</label>
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
                    <label htmlFor="shop-address" className="form-label">Address</label>
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
                    <label htmlFor="shop-email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="shop-email"
                      name="email"
                      className="form-control"
                      autoComplete="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="shop-opening-time" className="form-label">Opening Time</label>
                    <input
                      type="time"
                      id="shop-opening-time"
                      name="opening_time"
                      className="form-control"
                      value={formData.opening_time || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="shop-closing-time" className="form-label">Closing Time</label>
                    <input
                      type="time"
                      id="shop-closing-time"
                      name="closing_time"
                      className="form-control"
                      value={formData.closing_time || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label htmlFor="shop-logo" className="form-label">Shop Logo</label>
                    <input
                      type="file"
                      id="shop-logo"
                      name="logo"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <small className="text-muted">Leave empty to keep current logo.</small>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label htmlFor="shop-banner" className="form-label">Shop Banner</label>
                    <input
                      type="file"
                      id="shop-banner"
                      name="banner"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <small className="text-muted">Leave empty to keep current banner.</small>
                  </div>
                </div>

                <div className="card mb-4 border">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Shop Location</h6>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={getCurrentLocation}
                    >
                      Use Current Location
                    </button>
                  </div>
                  <div className="card-body p-0" style={{ height: '400px', width: '100%' }}>
                    <LocationPicker
                      formData={formData}
                      setFormData={setFormData}
                      mapRef={mapRef}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-latitude" className="form-label">Latitude</label>
                    <input
                      type="text"
                      id="shop-latitude"
                      className="form-control"
                      value={formData.latitude || ''}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="shop-longitude" className="form-label">Longitude</label>
                    <input
                      type="text"
                      id="shop-longitude"
                      className="form-control"
                      value={formData.longitude || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    id="shop-is-active"
                    className="form-check-input"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label htmlFor="shop-is-active" className="form-check-label">Active Shop</label>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Updating Shop...' : 'Update Shop'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShop;