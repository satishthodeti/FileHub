import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import './FilePreviewModal.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreviewModal = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const isImage = file.mimetype.startsWith('image/');
  const isPDF = file.mimetype === 'application/pdf';

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/files/view/${file.id}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Failed to fetch preview:', err);
      }
    };

    fetchPreview();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{file.filename}</h3>

        {isImage && previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="preview-image"
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        )}

        {isPDF && previewUrl && (
          <Document
            file={previewUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading="Loading PDF..."
          >
            <Page pageNumber={1} />
            <p style={{ marginTop: '10px' }}>Page 1 of {numPages}</p>
          </Document>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal;
