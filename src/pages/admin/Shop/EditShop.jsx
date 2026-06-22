import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Swal from "sweetalert2";

import { getShop, updateShop } from "../../../service/shopService";

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
  const [position, setPosition] = useState(null);

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

  return formData.latitude && formData.longitude ? (
    <Marker
      position={[Number(formData.latitude), Number(formData.longitude)]}
    />
  ) : null;
}

const EditShop = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadShop();
    document.title = "Edit Shop | Roti Wala";
  }, []);

  const loadShop = async () => {
    try {
      const data = await getShop(id);

      setFormData({
        ...data,
        logo: null,
        banner: null,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load shop",
      });
    }
  };

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

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData((prev) => ({
        ...prev,

        latitude: position.coords.latitude.toFixed(7),

        longitude: position.coords.longitude.toFixed(7),
      }));

      Swal.fire({
        icon: "success",
        title: "Location Updated",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      await updateShop(id, submitData);

      Swal.fire({
        icon: "success",

        title: "Success",

        text: "Shop Updated Successfully",

        timer: 2000,

        showConfirmButton: false,
      });

      navigate("/admin/shops");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed To Update Shop",
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
                    <label className="form-label">Shop Name</label>

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
                    <label className="form-label">Phone Number</label>

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
                    <label className="form-label">Address</label>

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
                    <label className="form-label">Email</label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Opening Time</label>

                    <input
                      type="time"
                      name="opening_time"
                      className="form-control"
                      value={formData.opening_time || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Closing Time</label>

                    <input
                      type="time"
                      name="closing_time"
                      className="form-control"
                      value={formData.closing_time || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label">Shop Logo</label>

                    <input
                      type="file"
                      name="logo"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label">Shop Banner</label>

                    <input
                      type="file"
                      name="banner"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Shop Location</h6>

                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={getCurrentLocation}
                    >
                      Use Current Location
                    </button>
                  </div>

                  <div className="card-body">
                    <MapContainer
                      center={[
                        formData.latitude ? Number(formData.latitude) : 20.5937,

                        formData.longitude
                          ? Number(formData.longitude)
                          : 78.9629,
                      ]}
                      zoom={13}
                      style={{
                        height: "400px",
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Latitude</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.latitude || ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Longitude</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.longitude || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />

                  <label className="form-check-label">Active Shop</label>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Updating Shop..." : "Update Shop"}
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
