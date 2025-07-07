import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilePreviewModal from './components/FilePreviewModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


function App() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all uploaded files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/files');
      setFileList(res.data);
    } catch (err) {
      toast.error('Error fetching files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) return toast.warning('Please select a file');
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully!');
      setFile(null);
      fetchFiles();
    } catch (err) {
      toast.error('Error uploading file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download file
  const handleDownload = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/files/download/${id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileItem = fileList.find(f => f.id === id);
      link.href = url;
      link.download = fileItem?.filename || 'file';
      link.click();
      toast.success('File downloaded!');
    } catch (err) {
      toast.error('Error downloading file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/files/${id}`);
      toast.success('File deleted successfully!');
      fetchFiles();
    } catch (err) {
      toast.error('Failed to delete file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="app-container">
      <ToastContainer />
      <h2>Upload PDF or Image</h2>

      <div className="file-upload">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="upload-btn" onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <h3>Uploaded Files</h3>

      {loading && <p className="loading-text">Loading...</p>}

      {!loading && fileList.length === 0 && (
        <p>No files uploaded yet.</p>
      )}

      {!loading && fileList.length > 0 && (
        <table className="file-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Filename</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fileList.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.filename}</td>
                <td>
                  <button title="View" onClick={() => setPreviewFile(f)}>
                    <FaEye />
                  </button>
                  <button title="Download" onClick={() => handleDownload(f.id)}>
                    <FaDownload />
                  </button>
                  <button title="Delete" onClick={() => handleDelete(f.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

export default App;
