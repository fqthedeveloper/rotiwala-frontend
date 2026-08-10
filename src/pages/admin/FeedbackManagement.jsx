// src/pages/admin/FeedbackManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAdminFeedback, updateFeedback } from '../../service/contactService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  FaSearch,
  FaReply,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';

const FeedbackManagement = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, resolved, unresolved
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isManager = user?.role === 'manager';

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'resolved') params.resolved = true;
      else if (filter === 'unresolved') params.resolved = false;
      const data = await getAdminFeedback(params);
      setFeedbacks(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.admin_reply || '');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    setSubmitting(true);
    try {
      await updateFeedback(selectedFeedback.id, {
        admin_reply: replyText,
        is_resolved: true, // auto-resolve when replying
      });
      toast.success('Reply sent and feedback resolved');
      setSelectedFeedback(null);
      setReplyText('');
      fetchFeedbacks();
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResolved = async (feedback) => {
    try {
      await updateFeedback(feedback.id, {
        is_resolved: !feedback.is_resolved,
      });
      toast.success(`Feedback ${!feedback.is_resolved ? 'resolved' : 'reopened'}`);
      fetchFeedbacks();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return <div className="text-center py-5">Loading feedback...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2>📝 Feedback & Queries</h2>
        <div className="d-flex gap-2">
          <select
            className="form-select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={fetchFeedbacks}>
            <FaSearch /> Refresh
          </button>
        </div>
      </div>

      <div className="row g-4">
        {feedbacks.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No feedback found.</div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="col-lg-6 col-xl-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{fb.subject}</h5>
                    <span className={`badge ${fb.is_resolved ? 'bg-success' : 'bg-warning'}`}>
                      {fb.is_resolved ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                  <div className="small text-muted mb-3">
                    <div><FaUser className="me-1" /> {fb.name}</div>
                    <div><FaEnvelope className="me-1" /> {fb.email || 'N/A'}</div>
                    <div><FaPhone className="me-1" /> {fb.phone}</div>
                    <div><FaClock className="me-1" /> {formatDate(fb.created_at)}</div>
                  </div>
                  <p className="card-text">{fb.message}</p>
                  {fb.admin_reply && (
                    <div className="border-top pt-2 mt-2">
                      <small className="text-muted fw-bold">Reply:</small>
                      <p className="mb-0 small">{fb.admin_reply}</p>
                      {fb.resolved_by_name && (
                        <small className="text-muted">— Resolved by {fb.resolved_by_name}</small>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent border-0 d-flex gap-2 flex-wrap">
                  {!fb.is_resolved && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleReply(fb)}
                    >
                      <FaReply /> Reply
                    </button>
                  )}
                  <button
                    className={`btn btn-danger btn-sm ${fb.is_resolved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => toggleResolved(fb)}
                  >
                    {fb.is_resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedFeedback && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to {selectedFeedback.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedFeedback(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Original Message</label>
                  <div className="bg-light p-2 rounded">
                    <p className="mb-0">{selectedFeedback.message}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Your Reply</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedFeedback(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmitReply} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Reply & Resolve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;