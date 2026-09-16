// src/pages/manager/Delivery/UPISettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaQrcode, FaUpload, FaSave, FaTrash, FaCheckCircle, FaCopy, FaDownload, FaInfoCircle } from 'react-icons/fa';
import { MdQrCodeScanner } from 'react-icons/md';
import Swal from 'sweetalert2';
import { getShopById, updateShopUPI, getShops } from '../../../service/shopService';

const UPISettings = () => {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = localStorage.getItem('role') || user?.role;
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';

  // ---------- Load Initial Data ----------
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const shopList = await getShops();
          setShops(shopList || []);
          if (shopList && shopList.length > 0) {
            const initialShop = shopList[0];
            setSelectedShopId(initialShop.id);
            setShop(initialShop);
            setUpiId(initialShop.upi_id || '');
          }
        } else {
          const shopId = user?.shop_id || user?.shop?.id || user?.shop;
          if (!shopId) {
            setShop(null);
            setLoading(false);
            return;
          }
          const data = await getShopById(shopId);
          setShop(data);
          setSelectedShopId(data.id);
          setUpiId(data.upi_id || '');
        }
      } catch (err) {
        console.error('Failed to load shop/UPI data:', err);
        Swal.fire('Error', 'Could not load shop UPI data', 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAdmin]);

  // ---------- Switch Shop (Admin only) ----------
  const handleShopChange = async (newShopId) => {
    setSelectedShopId(newShopId);
    setQrFile(null);
    setQrPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const found = shops.find((s) => String(s.id) === String(newShopId));
    if (found) {
      setShop(found);
      setUpiId(found.upi_id || '');
    } else {
      try {
        const fresh = await getShopById(newShopId);
        setShop(fresh);
        setUpiId(fresh.upi_id || '');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ---------- File Pick (Admin only) ----------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid file', 'Please select an image file (JPG, PNG, WEBP)', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File too large', 'Please use an image smaller than 5 MB', 'warning');
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setQrFile(null);
    setQrPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- Copy UPI ID ----------
  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- Save (Admin only) ----------
  const handleSave = async () => {
    if (!shop?.id) {
      Swal.fire('Error', 'Shop not selected. Please refresh.', 'error');
      return;
    }
    if (!upiId.trim() && !qrFile) {
      Swal.fire('Nothing to save', 'Please enter a UPI ID or upload a QR image.', 'info');
      return;
    }

    setSaving(true);
    try {
      const payload = { upi_id: upiId.trim() };
      if (qrFile) payload.upi_qr_image = qrFile;
      const updated = await updateShopUPI(shop.id, payload);

      setShop(updated);
      setUpiId(updated.upi_id || '');
      setQrFile(null);
      setQrPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Update shop in shops list if admin
      setShops((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
      );

      Swal.fire({
        icon: 'success',
        title: 'UPI Settings Saved!',
        text: `UPI details for "${updated.name}" have been updated.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.detail || err.response?.data?.error || 'Failed to save UPI settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- dynamic QR url ----------
  const dynamicQRUrl = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=${encodeURIComponent(shop?.name || 'Shop')}%26cu=INR`
    : null;

  const currentQRDisplay = qrPreview || shop?.upi_qr_image || dynamicQRUrl;

  // ---------- render ----------
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="text-muted mt-2">Loading UPI Settings...</p>
      </div>
    );
  }

  if (!shop && !isAdmin) {
    return (
      <div className="alert alert-warning d-flex align-items-center gap-2">
        <FaInfoCircle size={20} />
        <div>
          <strong>Shop data could not be loaded.</strong> Please ensure your account is assigned to an active shop.
        </div>
      </div>
    );
  }

  return (
    <div className="upi-settings-page" style={{ maxWidth: '780px' }}>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <MdQrCodeScanner size={24} className="text-warning" />
              UPI Payment Settings
            </h5>
            {isAdmin ? (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                Admin Mode: Full Edit Access
              </span>
            ) : (
              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill">
                Manager: View Only
              </span>
            )}
          </div>
          <p className="text-muted small mb-0 mt-1">
            {isAdmin
              ? 'Configure shop UPI IDs and QR codes for payment collection across orders and delivery.'
              : 'View your shop\'s UPI payment details and QR code used for customer and delivery payments.'}
          </p>
        </div>

        <div className="card-body p-4">
          {/* Admin Shop Selector */}
          {isAdmin && (
            <div className="mb-4 p-3 bg-light rounded border">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-shop text-warning"></i> Select Shop to Configure
              </label>
              <select
                className="form-select form-select-lg"
                value={selectedShopId || ''}
                onChange={(e) => handleShopChange(e.target.value)}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.shop_code ? `(${s.shop_code})` : ''}
                  </option>
                ))}
              </select>
              {shops.length === 0 && (
                <div className="form-text text-danger">No shops available. Please create a shop first.</div>
              )}
            </div>
          )}

          {/* Manager View-Only Notice */}
          {!isAdmin && (
            <div className="alert alert-info border-info d-flex align-items-start gap-2 mb-4 shadow-sm">
              <FaInfoCircle className="text-info mt-1 flex-shrink-0" size={18} />
              <div>
                <strong className="d-block">View-Only Mode</strong>
                <span>
                  As a store manager, you can view, copy, and display your shop's UPI QR code. Only the <strong>Super Admin</strong> can change or update payment details. Contact your administrator for changes.
                </span>
              </div>
            </div>
          )}

          {shop ? (
            <>
              {/* Shop Info Header */}
              <div className="d-flex align-items-center justify-content-between p-3 mb-4 rounded border bg-white shadow-xs">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{shop.name}</h6>
                  <small className="text-muted">
                    {shop.shop_code && <span className="me-2">Code: {shop.shop_code}</span>}
                    {shop.phone && <span>Phone: {shop.phone}</span>}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`badge ${shop.is_active ? 'bg-success' : 'bg-danger'}`}>
                    {shop.is_active ? 'Shop Active' : 'Shop Inactive'}
                  </span>
                </div>
              </div>

              {/* UPI ID Field */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <FaQrcode className="me-2 text-primary" />
                  UPI ID (Virtual Payment Address)
                </label>
                {isAdmin ? (
                  <>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="e.g. yourshop@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <div className="form-text">
                      This UPI ID is used by delivery boys and walk-in customers to pay directly to your account.
                    </div>
                  </>
                ) : (
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control bg-light fw-bold"
                      readOnly
                      value={upiId || 'Not configured'}
                    />
                    {upiId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={handleCopyUpi}
                        title="Copy UPI ID"
                      >
                        {copied ? <FaCheckCircle className="text-success" /> : <FaCopy />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* QR Image Upload Section (Admin Only) */}
              {isAdmin && (
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    <FaUpload className="me-2 text-success" />
                    Upload Custom UPI QR Code Image
                  </label>

                  <div
                    className="border rounded p-4 text-center"
                    style={{
                      background: '#f9fafb',
                      borderStyle: 'dashed',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {qrPreview ? (
                      <div>
                        <img
                          src={qrPreview}
                          alt="New QR Preview"
                          style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                        <p className="text-success small mt-2 mb-0">
                          <FaCheckCircle className="me-1" />
                          New QR ready to upload — click "Save UPI Settings" below to apply
                        </p>
                      </div>
                    ) : (
                      <>
                        <FaUpload size={28} className="text-muted mb-2" />
                        <p className="mb-1 fw-semibold text-muted">Click or drag image to upload custom QR</p>
                        <p className="text-muted small mb-0">JPG, PNG, WEBP · Max 5 MB</p>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleFileChange}
                  />

                  {qrFile && (
                    <button
                      className="btn btn-sm btn-outline-danger mt-2 d-flex align-items-center gap-1"
                      onClick={handleRemoveFile}
                    >
                      <FaTrash /> Remove selected file
                    </button>
                  )}
                </div>
              )}

              {/* Current QR Code Display */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between">
                  <span>
                    <MdQrCodeScanner className="me-2 text-warning" />
                    Current Active QR Code
                  </span>
                  {currentQRDisplay && (
                    <a
                      href={currentQRDisplay}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-link text-decoration-none p-0"
                    >
                      <FaDownload className="me-1" /> Open / Download
                    </a>
                  )}
                </label>

                <div
                  className="border rounded p-4 text-center d-flex flex-column align-items-center shadow-xs"
                  style={{ background: '#fff' }}
                >
                  {currentQRDisplay ? (
                    <>
                      <div className="p-2 border rounded bg-white shadow-sm mb-3">
                        <img
                          src={currentQRDisplay}
                          alt="Shop UPI QR"
                          style={{
                            height: '240px',
                            width: '240px',
                            borderRadius: '8px',
                            objectFit: 'contain',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      {shop.upi_qr_image && !qrPreview && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                          <FaCheckCircle className="me-1" /> Custom Shop QR Code
                        </span>
                      )}

                      {!shop.upi_qr_image && !qrPreview && upiId && (
                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-3 py-2 rounded-pill">
                          ⚠️ Auto-generated from UPI ID ({upiId})
                        </span>
                      )}

                      <p className="text-muted small mt-2 mb-0">
                        Scan with Google Pay, PhonePe, Paytm, or any UPI app to pay
                      </p>
                    </>
                  ) : (
                    <div className="py-4 text-muted">
                      <MdQrCodeScanner size={40} className="text-muted mb-2 opacity-50" />
                      <p className="mb-0">Enter a UPI ID or upload a QR code above to generate a QR preview.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button (Admin Only) */}
              {isAdmin && (
                <button
                  className="btn btn-warning btn-lg fw-bold d-flex align-items-center gap-2 shadow-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Saving UPI Settings...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save UPI Settings
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="alert alert-warning">
              Please select a valid shop.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UPISettings;
