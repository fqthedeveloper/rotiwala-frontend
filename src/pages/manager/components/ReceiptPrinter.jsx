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
  FaClock
} from 'react-icons/fa';
import { generateReceipt, printReceipt, downloadReceiptPDF, downloadReceiptText } from '../../../service/orderService';
import Swal from 'sweetalert2';
import './CSS/ReceiptPrinter.css';

const ReceiptPrinter = ({ orderId, orderType, onClose }) => {
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
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      Swal.fire('Error', 'Please allow popups for printing', 'error');
      return;
    }

    const styles = `
      body { 
        font-family: 'Courier New', monospace; 
        white-space: pre; 
        padding: 20px;
        margin: 0;
        background: white;
      }
      .receipt-container {
        max-width: 300px;
        margin: 0 auto;
      }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    `;

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
      Swal.fire('Error', 'Only managers can print receipts directly', 'error');
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
        Swal.fire({
          icon: 'success',
          title: 'Receipt Printed',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      Swal.fire('Error', 'Failed to print. Please try again.', 'error');
    } finally {
      setPrinting(false);
    }
  };

const handleDownloadPDF = async () => {
  if (!receiptData?.order_number) {
    Swal.fire('Error', 'Receipt data not available', 'error');
    return;
  }

  setDownloading(true);
  try {
    // Use the simple window.open method
    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error('Please login again');
    }
    
    const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const url = `${baseURL}/orders/receipt/${orderId}/download/pdf/?bill_type=${selectedBillType}`;
    
    // Use fetch to download with proper headers
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
    
    Swal.fire({
      icon: 'success',
      title: 'Download Started',
      text: 'Your PDF receipt is being downloaded',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Download PDF error:', error);
    Swal.fire('Error', error.message || 'Failed to download PDF. Please try again.', 'error');
  } finally {
    setDownloading(false);
  }
};

// Download Text - Manager only
const handleDownloadText = async () => {
  if (userRole !== 'manager' && userRole !== 'super_admin') {
    Swal.fire('Error', 'Only managers can download text receipts', 'error');
    return;
  }

  if (!receiptData?.order_number) {
    Swal.fire('Error', 'Receipt data not available', 'error');
    return;
  }

  setDownloading(true);
  try {
    await downloadReceiptText(orderId, selectedBillType);
    Swal.fire({
      icon: 'success',
      title: 'Download Started',
      text: 'Your text receipt is being downloaded',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Download Text error:', error);
    Swal.fire('Error', 'Failed to download text. Please try again.', 'error');
  } finally {
    setDownloading(false);
  }
};

  // Copy receipt text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(receiptText).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Receipt text copied to clipboard',
        timer: 1500,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire('Error', 'Failed to copy text', 'error');
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
            <span className="label">Type</span>
            <span className={`value type-badge ${receiptData?.order_type}`}>
              {receiptData?.order_type?.toUpperCase()}
            </span>
          </div>
         <span className="value">
            {receiptData?.ordered_at &&
              new Date(receiptData.ordered_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              })}
          </span>
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