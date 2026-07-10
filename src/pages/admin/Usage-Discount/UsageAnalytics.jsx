// src/pages/admin/Analytics/UsageAnalytics.js
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useLoading } from "../../../context/LoadingContext";
import { getUsageSummary, getUsageList } from "../../../service/discountService";
import api from "../../../service/api";
import "./UsageAnalytics.css";

const UsageAnalytics = () => {
  const { showLoading, hideLoading } = useLoading();

  // Get user role and shop from localStorage
  const userRole = localStorage.getItem("role") || "customer";
  const userShopId = localStorage.getItem("selected_shop") || "";

  // Filter state
  const [filters, setFilters] = useState({
    shop: userRole === "manager" ? userShopId : "",
    startDate: "",
    endDate: "",
    groupBy: "day",
    type: "all",
    orderType: "all",
  });

  // Data states
  const [shops, setShops] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch shops only if super_admin
  useEffect(() => {
    if (userRole === "super_admin") {
      const fetchShops = async () => {
        try {
          const res = await api.get("/shops/");
          setShops(res.data);
        } catch (error) {
          console.error("Failed to fetch shops", error);
        }
      };
      fetchShops();
    } else {
      // For manager, we might still want to show shop name but no dropdown
      // We can optionally fetch the shop details if needed
    }
  }, [userRole]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    showLoading("Loading analytics...", "warm", "md");
    try {
      const params = {
        shop: filters.shop || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        group_by: filters.groupBy,
      };
      const res = await getUsageSummary(params);
      setSummary(res.data.overall);
      setChartData(res.data.data);
      setInitialLoading(false);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    } finally {
      hideLoading();
    }
  }, [filters, showLoading, hideLoading]);

  // Fetch usage list
  const fetchUsageList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        shop: filters.shop || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        order_type: filters.orderType !== "all" ? filters.orderType : undefined,
        search: searchTerm || undefined,
      };
      const res = await getUsageList(params);
      setUsageList(res.data.results || res.data);
      setPagination((prev) => ({
        ...prev,
        total: res.data.count || res.data.length,
      }));
    } catch (error) {
      console.error("Failed to fetch usage list", error);
    } finally {
      setListLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, searchTerm]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchUsageList();
  }, [fetchUsageList]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Skeleton components (same as before)
  const SummarySkeleton = () => (
    <div className="row g-3 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-md-3 col-6">
          <div className="card stat-card p-3">
            <div className="skeleton skeleton-title mb-2" />
            <div className="skeleton skeleton-text" />
          </div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="row g-0 border-bottom py-2">
          {[...Array(9)].map((_, j) => (
            <div key={j} className="col">
              <div className="skeleton skeleton-text mx-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="analytics-wrapper">
      <div className="container-fluid">
        <div className="fade-in">
          <h1 className="display-6 fw-bold mb-4 text-dark">
            📊 Discount & Coupon Usage Analytics
          </h1>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-4 fade-in">
          <div className="row g-3 filters-row">
            {/* Shop dropdown - only for super_admin */}
            {userRole === "super_admin" && (
              <div className="col-md-2 col-6">
                <label className="form-label fw-semibold">Shop</label>
                <select
                  name="shop"
                  value={filters.shop}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All Shops</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* For managers, we display the shop name but no filter */}
            {userRole === "manager" && (
              <div className="col-md-2 col-6">
                <label className="form-label fw-semibold">Shop</label>
                <input
                  type="text"
                  className="form-control"
                  value={shops.find(s => s.id == userShopId)?.name || "My Shop"}
                  disabled
                />
              </div>
            )}
            <div className="col-md-2 col-6">
              <label className="form-label fw-semibold">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="col-md-2 col-6">
              <label className="form-label fw-semibold">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="col-md-2 col-6">
              <label className="form-label fw-semibold">Group By</label>
              <select
                name="groupBy"
                value={filters.groupBy}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div className="col-md-2 col-6">
              <label className="form-label fw-semibold">Usage Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="all">All</option>
                <option value="discount">Discounts</option>
                <option value="coupon">Coupons</option>
              </select>
            </div>
            <div className="col-md-2 col-6">
              <label className="form-label fw-semibold">Order Type</label>
              <select
                name="orderType"
                value={filters.orderType}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="walkin">Walk-In</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards (same as before) */}
        {initialLoading ? (
          <SummarySkeleton />
        ) : (
          summary && (
            <div className="row g-3 mb-4 fade-in">
              <div className="col-md-3 col-6">
                <div className="card stat-card p-3 border-start border-4 border-primary">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small fw-semibold">Total Usage Count</div>
                      <div className="h3 fw-bold mb-0">{summary.total_usage_count}</div>
                    </div>
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-bar-chart-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card stat-card p-3 border-start border-4 border-success">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small fw-semibold">Total Discount Amount</div>
                      <div className="h3 fw-bold text-success mb-0">{formatCurrency(summary.total_discount_amount)}</div>
                    </div>
                    <div className="stat-icon bg-success bg-opacity-10 text-success">
                      <i className="bi bi-currency-rupee"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card stat-card p-3 border-start border-4 border-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small fw-semibold">Discount Usage</div>
                      <div className="h4 fw-bold text-info mb-0">{summary.discount_usage_count}</div>
                      <div className="small text-muted">{formatCurrency(summary.discount_total_amount)}</div>
                    </div>
                    <div className="stat-icon bg-info bg-opacity-10 text-info">
                      <i className="bi bi-tags"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card stat-card p-3 border-start border-4 border-warning">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small fw-semibold">Coupon Usage</div>
                      <div className="h4 fw-bold text-warning mb-0">{summary.coupon_usage_count}</div>
                      <div className="small text-muted">{formatCurrency(summary.coupon_total_amount)}</div>
                    </div>
                    <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                      <i className="bi bi-ticket-perforated"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="glass-card p-4 mb-4 fade-in">
            <h5 className="fw-semibold text-dark mb-3">Usage Trend</h5>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{ fill: '#6c757d' }} />
                  <YAxis tick={{ fill: '#6c757d' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="discount_usage_count" name="Discount Count" fill="#8884d8" radius={[4, 4, 0, 0]} animationDuration={800} />
                  <Bar dataKey="coupon_usage_count" name="Coupon Count" fill="#82ca9d" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Usage List */}
        <div className="glass-card p-4 fade-in">
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
            <h5 className="fw-semibold text-dark mb-0">Usage Details</h5>
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <input
                type="text"
                placeholder="Search order # or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm"
                style={{ minWidth: "200px" }}
              />
              <button type="submit" className="btn btn-primary btn-sm btn-search">
                <i className="bi bi-search me-1"></i> Search
              </button>
            </form>
          </div>

          {listLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Shop</th>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Order Type</th>
                      <th className="text-end">Original</th>
                      <th className="text-end">Discount</th>
                      <th className="text-end">Final</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-4">
                          No usage records found.
                        </td>
                      </tr>
                    ) : (
                      usageList.map((item) => (
                        <tr key={item.id}>
                          <td >
                           <b className={`bgcolor ${item.type === "discount" ? "bg-primary" : "bg-warning"}`} text-white> {item.type} </b>
                          </td>
                          <td>{item.shop_name}</td>
                          <td><span className="font-monospace">{item.order_number}</span></td>
                          <td>{item.customer_name}</td>
                          <td className="text-capitalize">{item.order_type}</td>
                          <td className="text-end">{formatCurrency(item.original_amount)}</td>
                          <td className="text-end text-danger">-{formatCurrency(item.discount_amount)}</td>
                          <td className="text-end fw-semibold">{formatCurrency(item.final_amount)}</td>
                          <td>{format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="d-flex flex-wrap align-items-center justify-content-between mt-3">
                  <div className="small text-muted">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                  </div>
                  <div>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="page-btn me-2"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.pageSize >= pagination.total}
                      className="page-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageAnalytics;