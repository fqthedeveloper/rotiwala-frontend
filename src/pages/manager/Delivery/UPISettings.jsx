// src/pages/manager/Delivery/UPISettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaQrcode, FaUpload, FaSave, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { MdQrCodeScanner } from 'react-icons/md';
import Swal from 'sweetalert2';
import { getShopById, updateShopUPI } from '../../../service/shopService';

const UPISettings = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const fileInputRef = useRef();

  // ---------- load shop ----------
  useEffect(() => {
    const loadShop = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const shopId = user.shop_id || user.shop?.id || user.shop;
        if (!shopId) return;

        const data = await getShopById(shopId);
        setShop(data);
        setUpiId(data.upi_id || '');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Could not load shop data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, []);

  // ---------- file pick ----------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid file', 'Please select an image file (JPG, PNG, etc.)', 'warning');
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

  // ---------- save ----------
  const handleSave = async () => {
    if (!shop?.id) {
      Swal.fire('Error', 'Shop not loaded. Please refresh.', 'error');
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

      Swal.fire({
        icon: 'success',
        title: 'UPI Settings Saved!',
        text: 'Your shop UPI QR code and UPI ID have been updated.',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.detail || 'Failed to save UPI settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- dynamic QR url ----------
  const dynamicQRUrl = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=${encodeURIComponent(shop?.name || 'Shop')}%26cu=INR`
    : null;

  const currentQRDisplay = qrPreview || shop?.upi_qr_image || dynamicQRUrl;

  // ---------- render ----------
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="alert alert-warning">
        Shop data could not be loaded. Please make sure your account is linked to a shop.
      </div>
    );
  }

  return (
    <div className="upi-settings-page" style={{ maxWidth: '700px' }}>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <MdQrCodeScanner size={22} className="text-warning" />
            UPI Payment Settings — {shop.name}
          </h5>
          <p className="text-muted small mb-0 mt-1">
            Set your shop's UPI ID and upload a QR code image. Delivery boys will scan this to collect payments.
          </p>
        </div>

        <div className="card-body p-4">
          {/* UPI ID field */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              <FaQrcode className="me-2 text-primary" />
              UPI ID (Virtual Payment Address)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. yourshop@okhdfcbank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <div className="form-text">
              This is the UPI handle used to generate a dynamic QR code if no image is uploaded.
            </div>
          </div>

          {/* QR Image upload */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              <FaUpload className="me-2 text-success" />
              UPI QR Code Image
            </label>

            <div
              className="border rounded p-3 text-center"
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
                    New QR ready to upload — click Save to apply
                  </p>
                </div>
              ) : (
                <>
                  <FaUpload size={28} className="text-muted mb-2" />
                  <p className="mb-1 fw-semibold text-muted">Click to select QR image</p>
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

          {/* Current QR preview */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-muted">Current QR Preview</label>
            <div
              className="border rounded p-3 text-center"
              style={{ background: '#fff', maxWidth: '280px' }}
            >
              {currentQRDisplay ? (
                <>
                  <img
                    src={currentQRDisplay}
                    alt="Current UPI QR"
                    style={{ maxHeight: '220px', maxWidth: '220px', borderRadius: '6px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {!shop.upi_qr_image && !qrPreview && (
                    <p className="text-warning small mt-2 mb-0">
                      ⚠️ Auto-generated from UPI ID — upload a real QR for better quality
                    </p>
                  )}
                  {shop.upi_qr_image && !qrPreview && (
                    <p className="text-success small mt-2 mb-0">
                      <FaCheckCircle className="me-1" />Custom QR uploaded
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted small py-3 mb-0">
                  Enter a UPI ID above to see a preview
                </p>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            className="btn btn-warning fw-bold d-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save UPI Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UPISettings;
