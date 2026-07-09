// frontend/src/components/ReceiptPrinter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPrint, FaDownload, FaTimes, FaSpinner } from 'react-icons/fa';
import { generateReceipt, printReceipt } from '../../../service/orderService';
import Swal from 'sweetalert2';
import './CSS/ReceiptPrinter.css';

const ReceiptPrinter = ({ orderId, orderType, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptText, setReceiptText] = useState('');
  const [error, setError] = useState(null);
  const receiptRef = useRef(null);

  // Load receipt data
  useEffect(() => {
    loadReceipt();
  }, [orderId]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const data = await generateReceipt(orderId);
      setReceiptData(data);
      setReceiptText(data.receipt_text);
      setError(null);
    } catch (err) {
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
        printer_type: 'escpos',
        printer_ip: localStorage.getItem('printer_ip') || '192.168.1.100',
      });
      
      if (!result.success && result.receipt_text) {
        // Fallback: use receipt text
        return result.receipt_text;
      }
      return result.success;
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

  // Main print handler
  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);

    try {
      let printed = false;

      // Try WebUSB first (if available)
      if ('usb' in navigator) {
        printed = await printViaUSB(receiptText);
      }

      // If USB failed or not available, try server
      if (!printed) {
        const result = await printViaServer();
        if (result === true) {
          printed = true;
        } else if (typeof result === 'string') {
          // Server returned fallback text
          setReceiptText(result);
          printAsPDF();
          printed = true;
        }
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
        onClose?.();
      }
    } catch (error) {
      console.error('Print error:', error);
      Swal.fire('Error', 'Failed to print. Please try again.', 'error');
    } finally {
      setPrinting(false);
    }
  };

  // Download receipt as text
  const downloadReceipt = () => {
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${receiptData?.order_number || 'order'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="receipt-modal" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
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
          <span className="order-number">Order: #{receiptData?.order_number}</span>
          <span className="order-type">{receiptData?.order_type?.toUpperCase()}</span>
          <span className="order-date">{receiptData?.ordered_at}</span>
        </div>

        {/* Receipt Text */}
        <div className="receipt-text-container">
          <pre className="receipt-text">{receiptText}</pre>
        </div>

        {/* Actions */}
        <div className="receipt-actions">
          <button 
            onClick={handlePrint} 
            disabled={printing}
            className="btn-print"
          >
            {printing ? <FaSpinner className="spinning" /> : <FaPrint />}
            {printing ? 'Printing...' : 'Print Receipt'}
          </button>
          
          <button 
            onClick={downloadReceipt}
            className="btn-download"
          >
            <FaDownload /> Download
          </button>
        </div>

        {/* Printer Settings (optional) */}
        <div className="printer-settings">
          <small>
            Printer IP: 
            <input 
              type="text" 
              defaultValue={localStorage.getItem('printer_ip') || '192.168.1.100'}
              onChange={(e) => localStorage.setItem('printer_ip', e.target.value)}
              placeholder="192.168.1.100"
              className="printer-ip-input"
            />
          </small>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrinter;