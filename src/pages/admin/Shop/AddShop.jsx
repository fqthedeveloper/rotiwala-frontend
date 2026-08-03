import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { createShop } from "../../../service/shopService";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ formData, setFormData }) {
  const [position, setPosition] = useState(
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : null,
  );

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setPosition([
        Number(formData.latitude),
        Number(formData.longitude),
      ]);
    }
  }, [formData.latitude, formData.longitude]);

  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;

      const lng = e.latlng.lng;

      setPosition([lat, lng]);

      setFormData((prev) => ({
        ...prev,

        latitude: lat.toFixed(7),

        longitude: lng.toFixed(7),
      }));
    },
  });

  return position ? <Marker position={position} /> : null;
}

const AddShop = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [gettingLocation, setGettingLocation] = useState(false);

  const [map, setMap] = useState(null);

  const [formData, setFormData] = useState({
    name: "",

    address: "",

    phone: "",

    email: "",

    opening_time: "",

    closing_time: "",

    latitude: "",

    longitude: "",

    logo: null,

    banner: null,

    is_active: true,
  });

  const defaultPosition = [20.5937, 78.9629];

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,

        [name]: files[0],
      });

      return;
    }

    setFormData({
      ...formData,

      [name]: type === "checkbox" ? checked : value,
    });
  };

  useEffect(() => {
    if (map) {
      map.invalidateSize();

      if (formData.latitude && formData.longitude) {
        map.setView([
          Number(formData.latitude),
          Number(formData.longitude),
        ]);
      }
    }
  }, [map, formData.latitude, formData.longitude]);

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
          icon: "success",

          title: "Location Found",

          text: "Current location loaded successfully",

          timer: 1500,

          showConfirmButton: false,
        });

        setGettingLocation(false);
      },

      () => {
        Swal.fire({
          icon: "error",

          title: "Location Error",

          text: "Unable to fetch your location",
        });

        setGettingLocation(false);
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const submitData = new FormData();

      submitData.append("name", formData.name);

      submitData.append("address", formData.address);

      submitData.append("phone", formData.phone);

      submitData.append("email", formData.email);

      submitData.append("opening_time", formData.opening_time);

      submitData.append("closing_time", formData.closing_time);

      submitData.append("latitude", formData.latitude);

      submitData.append("longitude", formData.longitude);

      submitData.append("is_active", formData.is_active);

      if (formData.logo) {
        submitData.append("logo", formData.logo);
      }

      if (formData.banner) {
        submitData.append("banner", formData.banner);
      }

      await createShop(submitData);

      await Swal.fire({
        icon: "success",

        title: "Success",

        text: "Shop Created Successfully",

        timer: 2000,

        showConfirmButton: false,
      });

      navigate("/admin/shops");
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",

        title: "Failed",

        text: error?.response?.data?.detail || "Unable to create shop",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Add Shop | Roti Wala";
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
                  onClick={() => navigate("/admin/shops")}
                >
                  Back
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Shop Name</label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Address</label>

                    <textarea
                      rows="4"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold">
                      Opening Time
                    </label>

                    <input
                      type="time"
                      name="opening_time"
                      className="form-control"
                      value={formData.opening_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold">
                      Closing Time
                    </label>

                    <input
                      type="time"
                      name="closing_time"
                      className="form-control"
                      value={formData.closing_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Shop Logo</label>

                    <input
                      type="file"
                      name="logo"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Shop Banner
                    </label>

                    <input
                      type="file"
                      name="banner"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <div className="card border">
                      <div className="card-header bg-light">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <h6 className="mb-0">Shop Location</h6>

                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                          >
                            {gettingLocation
                              ? "Fetching..."
                              : "Use My Location"}
                          </button>
                        </div>
                      </div>

                      <div className="card-body">
                        <MapContainer
                          center={
                            formData.latitude && formData.longitude
                              ? [
                                  Number(formData.latitude),
                                  Number(formData.longitude),
                                ]
                              : defaultPosition
                          }
                          zoom={13}
                          whenCreated={setMap}
                          style={{
                            minHeight: "400px",
                            width: "100%",
                            borderRadius: "10px",
                          }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                          <LocationMarker
                            formData={formData}
                            setFormData={setFormData}
                          />
                        </MapContainer>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Latitude</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.latitude}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Longitude</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.longitude}
                      readOnly
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />

                      <label className="form-check-label fw-semibold">
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
                        "Create Shop"
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
