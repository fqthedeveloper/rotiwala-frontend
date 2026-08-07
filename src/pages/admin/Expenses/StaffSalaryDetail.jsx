// frontend/src/pages/admin/Expenses/StaffSalaryDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaCashRegister,
  FaWallet,
  FaCalendarAlt,
  FaInfoCircle,
  FaPrint,
  FaFilePdf,
} from "react-icons/fa";
import { getStaffSalaryDetail } from "../../../service/expenseServices";
import { getStaffList } from "../../../service/expenseServices";

const StaffSalaryDetail = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(staffId);

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const list = await getStaffList();
        setStaffList(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchDetail(selectedStaff);
    }
  }, [selectedStaff]);

  const fetchDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStaffSalaryDetail(id);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load staff salary details.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeColor = (type) => {
    const colors = {
      MONTHLY: "#10b981",
      ADVANCE: "#f59e0b",
      BONUS: "#8b5cf6",
      DEDUCTION: "#ef4444",
      EMERGENCY: "#ec4899",
    };
    return colors[type] || "#6b7280";
  };

  const getPaymentMethodDisplay = (method) => {
    return method === "CASH" ? "💵 Cash" : "💳 Online";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Loading salary details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        No data found.
      </div>
    );
  }

  const { staff, total_paid, remaining, monthly_salary, records, monthly_breakdown } = data;

  return (
    <div className="staff-salary-detail">
      <style>{`
        .staff-salary-detail {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          color: #111827;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .page-header .left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .page-header .back-btn {
          background: none;
          border: none;
          font-size: 1.4rem;
          color: #475569;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
        }
        .page-header .back-btn:hover {
          background: #e2e8f0;
        }
        .page-header h1 {
          margin: 0;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
        }
        .page-header .staff-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .page-header .staff-selector select {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(15,23,42,0.12);
          background: #fff;
          font-size: 14px;
          outline: none;
          min-width: 200px;
        }
        .page-header .staff-selector select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .summary-card {
          background: #fff;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
        }
        .summary-card .label {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 8px;
        }
        .summary-card .value {
          font-size: 1.8rem;
          font-weight: 700;
        }
        .summary-card .value.positive {
          color: #10b981;
        }
        .summary-card .value.negative {
          color: #ef4444;
        }
        .summary-card .value.warning {
          color: #f59e0b;
        }

        .records-section {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          overflow: hidden;
          margin-top: 24px;
        }
        .records-section .section-header {
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          font-weight: 700;
          font-size: 1.1rem;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }
        th, td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
        }
        tr:hover td {
          background: rgba(14,165,233,0.04);
        }
        .payment-type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .method-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          background: #e2e8f0;
          display: inline-block;
        }
        .utr-code {
          font-family: monospace;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
        @media (max-width: 768px) {
          .staff-salary-detail { padding: 16px; }
          .page-header { flex-direction: column; align-items: stretch; }
          .page-header .staff-selector { flex-direction: column; align-items: stretch; }
          .page-header .staff-selector select { width: 100%; }
          .summary-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="left">
          <button className="back-btn" onClick={() => navigate("/admin/expenses/staff")}>
            <FaArrowLeft />
          </button>
          <h1>👨‍🍳 Staff Salary Details</h1>
        </div>
        <div className="staff-selector">
          <label style={{ fontWeight: 600 }}>Select Staff:</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.shop_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="label">Staff Name</div>
          <div className="value" style={{ fontSize: "1.4rem" }}>
            {staff.name}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            {staff.shop_name} • {staff.phone || "No phone"}
          </div>
        </div>
        <div className="summary-card">
          <div className="label">Monthly Salary</div>
          <div className="value">₹{Number(monthly_salary).toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Total Paid</div>
          <div className="value positive">₹{Number(total_paid).toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Remaining</div>
          <div className={`value ${remaining >= 0 ? "positive" : "negative"}`}>
            ₹{Number(remaining).toFixed(2)}
          </div>
          {remaining < 0 && (
            <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px" }}>
              ⚠️ Overpaid
            </div>
          )}
        </div>
        <div className="summary-card">
          <div className="label">Total Records</div>
          <div className="value">{records.length}</div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {monthly_breakdown && monthly_breakdown.length > 0 && (
        <div className="records-section" style={{ marginBottom: "24px" }}>
          <div className="section-header">📊 Monthly Breakdown</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {monthly_breakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.month)}</td>
                    <td>₹{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-section">
        <div className="section-header">📋 Payment History</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>UTR</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.payment_date)}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(record.amount).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className="payment-type-badge"
                        style={{
                          backgroundColor: getPaymentTypeColor(record.payment_type) + "20",
                          color: getPaymentTypeColor(record.payment_type),
                        }}
                      >
                        {record.payment_type_display}
                      </span>
                    </td>
                    <td>
                      <span className="method-badge">
                        {getPaymentMethodDisplay(record.payment_method)}
                      </span>
                    </td>
                    <td>
                      {record.utr_number ? (
                        <span className="utr-code">{record.utr_number}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSalaryDetail;