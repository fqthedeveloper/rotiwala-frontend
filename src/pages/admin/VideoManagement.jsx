// src/pages/admin/VideoManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  getAdminVideos,
  updateVideoStatus,
  deleteVideo,
  submitVideo,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
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
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await getAdminVideos(filter);
      setVideos(res.data);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const openModal = (video = null) => {
    if (video) {
      setEditingId(video.id);
      setForm({
        title: video.title,
        description: video.description || '',
        video_type: video.video_type,
        youtube_url: video.youtube_url || '',
        video_file: null,
        poster: null,
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        video_type: 'upload',
        youtube_url: '',
        video_file: null,
        poster: null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      video_type: 'upload',
      youtube_url: '',
      video_file: null,
      poster: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (posterInputRef.current) posterInputRef.current.value = '';
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      // 🔥 Store the File object
      setForm((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    if (form.video_type === 'upload') {
      // 🔥 Check if a file is actually selected
      if (!form.video_file) {
        toast.error('Please select a video file');
        return;
      }
    }

    if (form.video_type === 'youtube' && !form.youtube_url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description || '');
      data.append('video_type', form.video_type);

      if (form.video_type === 'youtube') {
        data.append('youtube_url', form.youtube_url);
      } else {
        // 🔥 Append the File object
        if (form.video_file) {
          data.append('video_file', form.video_file);
        }
        if (form.poster) {
          data.append('poster', form.poster);
        }
      }

      // 🔥 Debug: Log FormData entries
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      await submitVideo(data);
      toast.success('Video submitted for review');
      closeModal();
      fetchVideos();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateVideoStatus(id, status);
      toast.success(`Video ${status}`);
      fetchVideos();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Video?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
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
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Video Management</h2>
        <button className="btn btn-orange" onClick={() => openModal()}>
          + Add New
        </button>
      </div>

      <div className="mb-3 d-flex gap-2 align-items-center">
        <label className="me-2">Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select w-auto"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <button className="btn btn-outline-secondary" onClick={fetchVideos}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No videos found.
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.title}</td>
                    <td>{v.video_type}</td>
                    <td>{v.submitted_by_name || 'Unknown'}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          v.status === 'approved'
                            ? 'success'
                            : v.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {v.status_display}
                      </span>
                    </td>
                    <td>
                      {v.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleStatusChange(v.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger me-1"
                            onClick={() => handleStatusChange(v.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === 'approved' && (
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => handleStatusChange(v.id, 'rejected')}
                        >
                          Reject
                        </button>
                      )}
                      {v.status === 'rejected' && (
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleStatusChange(v.id, 'approved')}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(v.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal – with encType added */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Video</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows="3"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Video Type *</label>
                    <select
                      className="form-select"
                      name="video_type"
                      value={form.video_type}
                      onChange={handleFormChange}
                    >
                      <option value="upload">Upload MP4</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                  {form.video_type === 'youtube' ? (
                    <div className="mb-3">
                      <label className="form-label">YouTube URL *</label>
                      <input
                        type="url"
                        className="form-control"
                        name="youtube_url"
                        value={form.youtube_url}
                        onChange={handleFormChange}
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Video File (MP4) *</label>
                        <input
                          type="file"
                          className="form-control"
                          name="video_file"
                          accept="video/mp4"
                          onChange={handleFormChange}
                          ref={fileInputRef}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Poster Image (optional)</label>
                        <input
                          type="file"
                          className="form-control"
                          name="poster"
                          accept="image/*"
                          onChange={handleFormChange}
                          ref={posterInputRef}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-orange" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;