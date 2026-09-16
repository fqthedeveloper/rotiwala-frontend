// src/pages/admin/VideoManagement.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAdminVideos,
  updateVideoStatus,
  deleteVideo,
  submitVideo,
  getMediaUrl,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Video,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Upload,
  ExternalLink,
  X,
  Eye,
  Film
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import './ContentManagement.css';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState(''); // '' | 'pending' | 'approved' | 'rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'upload' | 'youtube'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => (window.innerWidth < 768 ? 'cards' : 'cards'));

  // Video Player Preview Modal
  const [previewVideo, setPreviewVideo] = useState(null);

  // Submit / Add Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_type: 'upload',
    youtube_url: '',
    video_file: null,
    poster: null,
  });
  const [videoFilePreview, setVideoFilePreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await getAdminVideos(filter);
      const data = res.data || [];
      const processed = (Array.isArray(data) ? data : []).map((v) => ({
        ...v,
        full_video_src: v.video_src ? getMediaUrl(v.video_src) : null,
        full_poster: v.poster ? getMediaUrl(v.poster) : null,
      }));
      setVideos(processed);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  // Stats
  const stats = useMemo(() => {
    const total = videos.length;
    const approved = videos.filter((v) => v.status === 'approved').length;
    const pending = videos.filter((v) => v.status === 'pending').length;
    const rejected = videos.filter((v) => v.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [videos]);

  // Filtered list
  const filteredVideos = useMemo(() => {
    let result = [...videos];
    if (typeFilter !== 'all') {
      result = result.filter((v) => v.video_type === typeFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(term) ||
          (v.description || '').toLowerCase().includes(term) ||
          (v.submitted_by_name || '').toLowerCase().includes(term)
      );
    }
    return result;
  }, [videos, typeFilter, searchTerm]);

  // Modal open/close
  const openModal = () => {
    setForm({
      title: '',
      description: '',
      video_type: 'upload',
      youtube_url: '',
      video_file: null,
      poster: null,
    });
    setVideoFilePreview(null);
    setPosterPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (posterInputRef.current) posterInputRef.current.value = '';
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setVideoFilePreview(null);
    setPosterPreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0] || null;
      setForm((prev) => ({ ...prev, [name]: file }));
      if (file) {
        if (name === 'video_file') setVideoFilePreview(URL.createObjectURL(file));
        if (name === 'poster') setPosterPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Video title is required');
      return;
    }
    if (form.video_type === 'upload' && !form.video_file) {
      toast.error('Please select an MP4 video file');
      return;
    }
    if (form.video_type === 'youtube' && !form.youtube_url.trim()) {
      toast.error('Please enter a YouTube video URL');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title.trim());
      data.append('description', form.description.trim());
      data.append('video_type', form.video_type);

      if (form.video_type === 'youtube') {
        data.append('youtube_url', form.youtube_url.trim());
      } else {
        if (form.video_file) data.append('video_file', form.video_file);
        if (form.poster) data.append('poster', form.poster);
      }

      await submitVideo(data);
      toast.success('Video submitted successfully!');
      closeModal();
      fetchVideos();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Video submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Change
  const handleStatusChange = async (id, status) => {
    try {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status, status_display: status } : v))
      );
      await updateVideoStatus(id, status);
      toast.success(`Video marked as ${status}`);
    } catch (error) {
      toast.error('Status update failed');
      fetchVideos();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Video?',
      text: 'This action will permanently delete this video from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteVideo(id);
        toast.success('Video deleted');
        fetchVideos();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="cnt-container">
      {/* Header */}
      <div className="cnt-header">
        <div className="cnt-title-row">
          <div>
            <h1 className="cnt-title">
              <Film className="text-warning" size={30} />
              Video Showcase Management
            </h1>
            <p className="cnt-subtitle">
              Upload and approve promotional videos &amp; customer features shown on the home page video slideshow.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="cnt-btn cnt-btn-primary" onClick={openModal}>
              <Plus size={18} /> Submit New Video
            </button>
            <button className="cnt-btn cnt-btn-outline" onClick={fetchVideos} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="cnt-stats-grid">
          <div className="cnt-stat-card" onClick={() => setFilter('')}>
            <div className="cnt-stat-icon total">
              <Film size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.total}</h4>
              <p>Total Videos</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilter('approved')}>
            <div className="cnt-stat-icon success">
              <CheckCircle2 size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.approved}</h4>
              <p>Approved &amp; Live</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilter('pending')}>
            <div className="cnt-stat-icon warning">
              <Clock size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.pending}</h4>
              <p>Pending Review</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilter('rejected')}>
            <div className="cnt-stat-icon danger">
              <XCircle size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.rejected}</h4>
              <p>Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="cnt-toolbar">
        <div className="cnt-search-row">
          <div className="cnt-search-box">
            <Search size={18} className="cnt-search-icon" />
            <input
              type="text"
              placeholder="Search by video title, description, or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cnt-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="cnt-view-toggle">
              <button
                className={`cnt-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button
                className={`cnt-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <List size={16} /> Table
              </button>
            </div>

            <select
              className="cm-sort-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Video Types</option>
              <option value="upload">MP4 Uploads</option>
              <option value="youtube">YouTube Embeds</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="cnt-filter-row">
          <div className="cnt-pills">
            <button
              className={`cnt-pill ${filter === '' ? 'active' : ''}`}
              onClick={() => setFilter('')}
            >
              All Statuses ({videos.length})
            </button>
            <button
              className={`cnt-pill ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              <Clock size={13} className="text-warning" /> Pending ({stats.pending})
            </button>
            <button
              className={`cnt-pill ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              <CheckCircle2 size={13} className="text-success" /> Approved ({stats.approved})
            </button>
            <button
              className={`cnt-pill ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              <XCircle size={13} className="text-danger" /> Rejected ({stats.rejected})
            </button>
          </div>
          <small className="text-muted fw-semibold">
            Showing {filteredVideos.length} of {videos.length}
          </small>
        </div>
      </div>

      {/* Videos List / Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="text-muted mt-2">Loading videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-xs p-4">
          <Video size={40} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-bold text-dark">No Videos Found</h5>
          <p className="text-muted small">No videos match your search or filter criteria.</p>
          <button className="btn btn-warning fw-bold px-4" onClick={openModal}>
            Submit a Video
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Video Grid View (Mobile & Desktop) */
        <motion.div
          className="cnt-cards-grid"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {filteredVideos.map((v) => {
            const isYouTube = v.video_type === 'youtube';
            const thumbnail = v.full_poster || v.poster || (isYouTube && v.thumbnail_url);

            return (
              <motion.div
                key={v.id}
                className="cnt-card-item"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -2 }}
              >
                <div>
                  {/* Thumbnail & Watch Preview Overlay */}
                  <div className="cnt-video-thumb-wrapper" onClick={() => setPreviewVideo(v)}>
                    {thumbnail ? (
                      <img src={thumbnail} alt={v.title} />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-muted">
                        <Video size={36} />
                      </div>
                    )}
                    <div className="cnt-play-overlay">
                      <div className="cnt-play-btn-circle">
                        <Play size={20} className="fill-white ms-1" />
                      </div>
                    </div>
                    <span className="cnt-video-type-badge d-flex align-items-center gap-1">
                      {isYouTube ? <FaYoutube size={14} className="text-danger" /> : <Film size={14} />}
                      {isYouTube ? 'YouTube' : 'MP4'}
                    </span>
                  </div>

                  {/* Video Info Header */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h5 className="fw-bold text-dark mb-0 fs-6 line-clamp-1">{v.title}</h5>
                    <span className={`cnt-badge ${v.status}`}>
                      {v.status === 'approved' ? (
                        <>
                          <CheckCircle2 size={12} /> Approved
                        </>
                      ) : v.status === 'rejected' ? (
                        <>
                          <XCircle size={12} /> Rejected
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Pending
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-muted small mb-3 line-clamp-2" style={{ minHeight: '38px' }}>
                    {v.description || 'No description provided.'}
                  </p>

                  <div className="p-2 bg-light rounded text-muted small d-flex justify-content-between mb-3">
                    <span>By: {v.submitted_by_name || 'Staff'}</span>
                    <span>{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Video Card Action Bar */}
                <div className="cnt-card-actions">
                  <button
                    className="cnt-action-btn edit"
                    onClick={() => setPreviewVideo(v)}
                    title="Watch preview"
                  >
                    <Play size={14} /> Preview
                  </button>

                  {v.status !== 'approved' && (
                    <button
                      className="cnt-action-btn approve"
                      onClick={() => handleStatusChange(v.id, 'approved')}
                      title="Approve for home page"
                    >
                      Approve
                    </button>
                  )}

                  {v.status !== 'rejected' && (
                    <button
                      className="cnt-action-btn reject"
                      onClick={() => handleStatusChange(v.id, 'rejected')}
                      title="Reject video"
                    >
                      Reject
                    </button>
                  )}

                  <button
                    className="cnt-action-btn delete"
                    onClick={() => handleDelete(v.id)}
                    title="Delete video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Table View */
        <div className="cnt-table-card">
          <div className="cnt-table-responsive">
            <table className="cnt-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Type</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded bg-dark d-flex align-items-center justify-content-center text-warning"
                          style={{ width: '42px', height: '28px', cursor: 'pointer' }}
                          onClick={() => setPreviewVideo(v)}
                        >
                          <Play size={14} />
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block">{v.title}</span>
                          <small className="text-muted line-clamp-1">{v.description}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {v.video_type === 'youtube' ? 'YouTube' : 'MP4 File'}
                      </span>
                    </td>
                    <td>{v.submitted_by_name || 'Staff'}</td>
                    <td>
                      <span className={`cnt-badge ${v.status}`}>
                        {v.status_display || v.status}
                      </span>
                    </td>
                    <td>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setPreviewVideo(v)}
                          title="Preview"
                        >
                          <Play size={13} />
                        </button>
                        {v.status !== 'approved' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(v.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(v.id, 'rejected')}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= IN-MODAL VIDEO PLAYER PREVIEW ================= */}
      <AnimatePresence>
        {previewVideo && (
          <div className="cnt-modal-overlay" onClick={() => setPreviewVideo(null)}>
            <motion.div
              className="cnt-modal-panel"
              style={{ maxWidth: '780px' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cnt-modal-header">
                <h4 className="cnt-modal-title d-flex align-items-center gap-2">
                  <Play size={20} className="text-warning" /> {previewVideo.title}
                </h4>
                <button className="cnt-modal-close" onClick={() => setPreviewVideo(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-0">
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000' }}>
                  {previewVideo.video_type === 'youtube' ? (
                    <iframe
                      src={previewVideo.embed_url + '?autoplay=1&rel=0'}
                      title={previewVideo.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={previewVideo.full_video_src || previewVideo.video_file}
                      poster={previewVideo.full_poster}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              <div className="cnt-modal-body">
                <p className="text-dark fw-medium mb-3">{previewVideo.description || 'No description.'}</p>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className={`cnt-badge ${previewVideo.status}`}>
                      Status: {previewVideo.status}
                    </span>
                    <small className="text-muted">By {previewVideo.submitted_by_name || 'Staff'}</small>
                  </div>

                  <div className="d-flex gap-2">
                    {previewVideo.status !== 'approved' && (
                      <button
                        className="btn btn-success fw-bold"
                        onClick={() => {
                          handleStatusChange(previewVideo.id, 'approved');
                          setPreviewVideo(null);
                        }}
                      >
                        Approve Video
                      </button>
                    )}
                    {previewVideo.status !== 'rejected' && (
                      <button
                        className="btn btn-outline-warning fw-bold"
                        onClick={() => {
                          handleStatusChange(previewVideo.id, 'rejected');
                          setPreviewVideo(null);
                        }}
                      >
                        Reject Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= SUBMIT NEW VIDEO MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <div className="cnt-modal-overlay" onClick={closeModal}>
            <motion.div
              className="cnt-modal-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cnt-modal-header">
                <h4 className="cnt-modal-title d-flex align-items-center gap-2">
                  <Film size={22} className="text-warning" /> Submit New Showcase Video
                </h4>
                <button className="cnt-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="cnt-modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Video Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="e.g. Master Chef preparing fresh Rumali Rotis"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={2}
                      placeholder="Brief note about what this video showcases..."
                      value={form.description}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Video Type Tabs */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Video Source Type *</label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${
                          form.video_type === 'upload' ? 'btn-warning fw-bold' : 'btn-outline-secondary'
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, video_type: 'upload' }))}
                      >
                        <Upload size={16} /> Upload MP4 Video
                      </button>
                      <button
                        type="button"
                        className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${
                          form.video_type === 'youtube' ? 'btn-warning fw-bold' : 'btn-outline-secondary'
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, video_type: 'youtube' }))}
                      >
                        <FaYoutube size={16} /> YouTube Link
                      </button>
                    </div>
                  </div>

                  {/* Conditional inputs based on type */}
                  {form.video_type === 'youtube' ? (
                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark">YouTube Video URL *</label>
                      <input
                        type="url"
                        className="form-control form-control-lg"
                        name="youtube_url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={form.youtube_url}
                        onChange={handleFormChange}
                        required
                      />
                      <div className="form-text">Supports standard youtube.com or youtu.be watch links.</div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark">Select Video File (MP4) *</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/webm"
                          className="form-control"
                          name="video_file"
                          onChange={handleFormChange}
                          required
                        />
                        {videoFilePreview && (
                          <div className="mt-2 rounded bg-black overflow-hidden" style={{ maxHeight: '160px' }}>
                            <video src={videoFilePreview} controls style={{ width: '100%', maxHeight: '160px' }} />
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">Poster Image (Optional thumbnail)</label>
                        <input
                          ref={posterInputRef}
                          type="file"
                          accept="image/*"
                          className="form-control"
                          name="poster"
                          onChange={handleFormChange}
                        />
                        {posterPreview && (
                          <img
                            src={posterPreview}
                            alt="Poster Preview"
                            className="mt-2 rounded"
                            style={{ height: '70px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 border-top d-flex justify-content-end gap-2 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning fw-bold px-4" disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Submit Video'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoManagement;