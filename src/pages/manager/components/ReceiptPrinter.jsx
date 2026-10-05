// frontend/src/components/ReceiptPrinter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPrint, 
  FaDownload, 
  FaTimes, 
  FaSpinner, 
  FaFilePdf, 
  FaFileAlt, 
  FaFileCode,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaWallet,
  FaUser,
  FaPhone,
  FaShoppingBag,
  FaMoneyBill,
  FaClock,
  FaQrcode,
  FaTruck
} from 'react-icons/fa';
import { generateReceipt, printReceipt, downloadReceiptPDF, downloadReceiptText } from '../../../service/orderService';
import Swal from 'sweetalert2';
import './CSS/ReceiptPrinter.css';

// Small top-right toast that doesn't block or dim the background
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const ReceiptPrinter = ({ orderId, orderType, onClose, onPrinted }) => {
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptText, setReceiptText] = useState('');
  const [error, setError] = useState(null);
  const [selectedBillType, setSelectedBillType] = useState('standard');
  const [showBillOptions, setShowBillOptions] = useState(false);
  const [userRole, setUserRole] = useState('manager');
  const receiptRef = useRef(null);

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'manager';
    setUserRole(role);
  }, []);

  // Load receipt data
  useEffect(() => {
    loadReceipt();
  }, [orderId, selectedBillType]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const data = await generateReceipt(orderId, selectedBillType);
      setReceiptData(data);
      setReceiptText(data.receipt_text);
      setError(null);
      if (onPrinted) {
        onPrinted(orderId);
      }
    } catch (err) {
      console.error('Load receipt error:', err);
      setError(err.message || 'Failed to load receipt');
      Swal.fire('Error', 'Failed to generate receipt', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Method 1: Print via WebUSB (Direct thermal printer)
  const printViaUSB = async (text) => {
    try {
      // Request USB device (common thermal printer vendor IDs)
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x0fe6 }, // Generic thermal
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star
        ]
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      // ESC/POS commands for thermal printer
      const encoder = new TextEncoder();
      const commands = [
        0x1B, 0x40,           // Initialize printer
        0x1B, 0x61, 0x01,     // Center align
        ...encoder.encode(text),
        0x0A, 0x0A, 0x0A,     // New lines
        0x1D, 0x56, 0x00,     // Partial cut
      ];

      await device.transferOut(1, new Uint8Array(commands));
      await device.close();

      return true;
    } catch (error) {
      console.error('USB Print Error:', error);
      return false;
    }
  };

  // Method 2: Print via server (Network printer)
  const printViaServer = async () => {
    try {
      const result = await printReceipt(orderId, {
        bill_type: selectedBillType,
        printer_ip: localStorage.getItem('printer_ip') || '192.168.1.100',
      });
      
      if (result.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Server Print Error:', error);
      return false;
    }
  };

  // Method 3: Print as PDF (fallback)
  const printAsPDF = () => {
    const printWindow = window.open('', '_blank', 'width=420,height=650');
    if (!printWindow) {
      Swal.fire('Error', 'Please allow popups for printing', 'error');
      return;
    }

    const styles = `
      body { 
        font-family: 'Courier New', monospace; 
        white-space: pre-wrap; 
        padding: 20px;
        margin: 0;
        background: white;
      }
      .receipt-container {
        max-width: 320px;
        margin: 0 auto;
      }
      .receipt-qr-box {
        text-align: center;
        margin-top: 15px;
        padding-top: 12px;
        border-top: 1px dashed #666;
      }
      .receipt-qr-box img {
        width: 140px;
        height: 140px;
        display: block;
        margin: 0 auto 6px;
      }
      .receipt-qr-title {
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .receipt-qr-sub {
        font-size: 10px;
        color: #555;
        margin-top: 3px;
      }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    `;

    const qrHtml = (receiptData?.is_delivery && receiptData?.qr_code) ? `
      <div class="receipt-qr-box">
        <img src="data:image/png;base64,${receiptData.qr_code}" alt="Delivery QR Code" />
        <div class="receipt-qr-title">DRIVER SCAN FOR DELIVERY PICKUP</div>
        ${receiptData?.parcel_number ? `<div class="receipt-qr-sub">Parcel: ${receiptData.parcel_number}</div>` : ''}
        ${receiptData?.delivery_address ? `<div class="receipt-qr-sub">Address: ${receiptData.delivery_address}</div>` : ''}
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${receiptData?.order_number || ''}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="receipt-container">
            <pre>${receiptText}</pre>
            ${qrHtml}
            <button class="no-print" onclick="window.print()" style="
              display: block;
              margin: 20px auto;
              padding: 10px 30px;
              background: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
            ">
              🖨️ Print
            </button>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Main print handler (Manager only)
  const handlePrint = async () => {
    if (printing) return;
    
    // Check if user is manager
    if (userRole !== 'manager' && userRole !== 'super_admin') {
      Toast.fire({ icon: 'error', title: 'Only managers can print receipts' });
      return;
    }

    setPrinting(true);

    try {
      let printed = false;

      // Try WebUSB first (if available)
      if ('usb' in navigator) {
        printed = await printViaUSB(receiptText);
      }

      // If USB failed or not available, try server
      if (!printed) {
        printed = await printViaServer();
      }

      // Final fallback: PDF
      if (!printed) {
        printAsPDF();
        printed = true;
      }

      if (printed) {
        if (onPrinted) onPrinted(orderId);
        Toast.fire({
          icon: 'success',
          title: 'Receipt Printed'
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      Toast.fire({ icon: 'error', title: 'Failed to print. Please try again.' });
    } finally {
      setPrinting(false);
    }
  };

const handleDownloadPDF = async () => {
  if (!receiptData?.order_number) {
    Toast.fire({ icon: 'error', title: 'Receipt data not available' });
    return;
  }

  setDownloading(true);
  try {
    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error('Please login again');
    }
    
    const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const url = `${baseURL}/orders/receipt/${orderId}/download/pdf/?bill_type=${selectedBillType}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Download failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `receipt_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    Toast.fire({
      icon: 'success',
      title: 'PDF Bill Downloaded'
    });
  } catch (error) {
    console.error('Download PDF error:', error);
    Toast.fire({ icon: 'error', title: error.message || 'Failed to download PDF' });
  } finally {
    setDownloading(false);
  }
};

// Download Text - Manager only
const handleDownloadText = async () => {
  if (userRole !== 'manager' && userRole !== 'super_admin') {
    Toast.fire({ icon: 'error', title: 'Only managers can download text receipts' });
    return;
  }

  if (!receiptData?.order_number) {
    Toast.fire({ icon: 'error', title: 'Receipt data not available' });
    return;
  }

  setDownloading(true);
  try {
    await downloadReceiptText(orderId, selectedBillType);
    Toast.fire({
      icon: 'success',
      title: 'Text Bill Downloaded'
    });
  } catch (error) {
    console.error('Download Text error:', error);
    Toast.fire({ icon: 'error', title: 'Failed to download text bill' });
  } finally {
    setDownloading(false);
  }
};

  // Copy receipt text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(receiptText).then(() => {
      Toast.fire({
        icon: 'success',
        title: 'Receipt Text Copied'
      });
    }).catch(() => {
      Toast.fire({ icon: 'error', title: 'Failed to copy text' });
    });
  };

  if (loading) {
    return (
      <div className="receipt-modal">
        <div className="receipt-content loading">
          <FaSpinner className="spinning" />
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-modal">
        <div className="receipt-content error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={onClose} className="btn-close-modal">Close</button>
        </div>
      </div>
    );
  }

  const isManager = userRole === 'manager' || userRole === 'super_admin';

  return (
    <div className="receipt-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="receipt-content" ref={receiptRef}>
        {/* Header */}
        <div className="receipt-header">
          <h3>🧾 Receipt Preview</h3>
          <button onClick={onClose} className="btn-close-modal">
            <FaTimes />
          </button>
        </div>

        {/* Order Info */}
        <div className="receipt-info">
          <div className="receipt-info-item">
            <span className="label">Order</span>
            <span className="value">#{receiptData?.order_number}</span>
          </div>
          <div className="receipt-info-item">
            <span className="label">Mode</span>
            <span className={`value type-badge ${receiptData?.is_delivery ? "delivery" : "pickup"}`}>
              {receiptData?.is_delivery ? "DELIVERY" : (receiptData?.order_type === "walkin" ? "WALK-IN" : "ONLINE PICKUP")}
            </span>
          </div>
          <div className="receipt-info-item">
            <span className="label">Date</span>
            <span className="value date-val">
              {receiptData?.ordered_at || "-"}
            </span>
          </div>
          <div className="receipt-info-item">
            <span className="label">Amount</span>
            <span className="value amount">₹{receiptData?.total_amount}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="receipt-customer-info">
          <div className="customer-detail">
            <FaUser className="icon" />
            <span>{receiptData?.customer_name}</span>
          </div>
          <div className="customer-detail">
            <FaPhone className="icon" />
            <span>{receiptData?.customer_phone}</span>
          </div>
          <div className="customer-detail">
            <FaMoneyBill className="icon" />
            <span>{receiptData?.payment_method?.toUpperCase()} - {receiptData?.payment_status?.toUpperCase()}</span>
          </div>
        </div>

        {/* Delivery Address Banner */}
        {receiptData?.is_delivery && receiptData?.delivery_address && (
          <div className="receipt-delivery-info">
            <FaTruck className="icon" />
            <div className="delivery-text">
              <strong>Delivery Address:</strong> {receiptData.delivery_address}
              {receiptData?.delivery_fee > 0 && (
                <span className="delivery-fee-badge"> • Delivery Fee: ₹{Number(receiptData.delivery_fee).toFixed(2)}</span>
              )}
            </div>
          </div>
        )}

        {/* Bill Type Selector */}
        <div className="bill-type-section">
          <button 
            className="bill-type-toggle"
            onClick={() => setShowBillOptions(!showBillOptions)}
          >
            <FaClipboardList /> Bill Type: {selectedBillType.charAt(0).toUpperCase() + selectedBillType.slice(1)}
            {showBillOptions ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {/* Receipt Text */}
        <div className="receipt-text-container">
          <pre className="receipt-text">{receiptText}</pre>
          {receiptData?.is_delivery && receiptData?.qr_code && (
            <div className="receipt-qr-card">
              <div className="receipt-qr-header">
                <FaQrcode className="qr-icon" />
                <span>Driver Delivery QR Code</span>
              </div>
              <div className="receipt-qr-body">
                <img 
                  src={`data:image/png;base64,${receiptData.qr_code}`} 
                  alt="Delivery QR Code" 
                  className="receipt-qr-image" 
                />
                <div className="receipt-qr-instructions">
                  <p className="qr-inst-bold">Scan to Take Out for Delivery</p>
                  <p className="qr-inst-sub">Driver opens the mobile app, selects scan QR on the deliveries screen, and scans this code.</p>
                  {receiptData?.parcel_number && (
                    <div className="qr-parcel-tag">
                      <strong>Parcel No:</strong> {receiptData.parcel_number}
                    </div>
                  )}
                  {receiptData?.delivery_address && (
                    <div className="qr-address-tag">
                      <strong>Address:</strong> {receiptData.delivery_address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download Options */}
        <div className="download-options">
          <div className="download-section-title">
            <FaDownload /> Download Options
          </div>
          <div className="download-buttons">
            {/* PDF Download - Available for everyone */}
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="btn-download-pdf"
            >
              {downloading ? <FaSpinner className="spinning" /> : <FaFilePdf />}
              PDF Bill
            </button>

            {/* Manager-only options */}
            {isManager && (
              <>
                <button 
                  onClick={handlePrint} 
                  disabled={printing}
                  className="btn-download-print"
                >
                  {printing ? <FaSpinner className="spinning" /> : <FaPrint />}
                  Print Receipt
                </button>
                <button 
                  onClick={handleDownloadText} 
                  disabled={downloading}
                  className="btn-download-text"
                >
                  {downloading ? <FaSpinner className="spinning" /> : <FaFileAlt />}
                  Text Bill
                </button>
                <button 
                  onClick={handleCopyText} 
                  className="btn-download-copy"
                >
                  <FaFileCode /> Copy
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manager Badge */}
        {isManager && (
          <div className="manager-badge">
            <span>🔑 Manager Mode - Full Access</span>
          </div>
        )}

        {/* Close Button */}
        <div className="receipt-footer">
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrinter;