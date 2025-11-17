import { useState, useRef } from "react";
import api from "../api/client";

const UploadButton = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    const handleFileUpload = async (files, isFolder = false) => {
        if (!files || files.length === 0) return;
        
        setUploading(true);
        try {
            // For folder uploads, we need to handle the directory structure
            if (isFolder) {
                // Get the folder path from the first file's webkitRelativePath
                const folderPath = files[0].webkitRelativePath.split('/')[0];
                
                // Create a FormData object to send files
                const formData = new FormData();
                formData.append('folder_name', folderPath);
                
                // Add all files to FormData
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const relativePath = file.webkitRelativePath;
                    formData.append('files', file, relativePath);
                }
                
                const { data } = await api.post("/files/upload/folder", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                
                if (onUploadSuccess) {
                    onUploadSuccess(data.files || []);
                }
            } else {
                // Handle single file or multiple files
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
                
                const { data } = await api.post("/files/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                
                if (onUploadSuccess) {
                    onUploadSuccess(data.files || []);
                }
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Check if it's a folder by looking for webkitRelativePath
            const hasRelativePath = Array.from(e.dataTransfer.files).some(file => file.webkitRelativePath);
            handleFileUpload(e.dataTransfer.files, hasRelativePath);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files, false);
        }
    };

    const handleFolderInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files, true);
        }
    };

    return (
        <div className="relative">
            {/* Drag and Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    {/* Upload Icon */}
                    <div className="mx-auto bg-gray-700 rounded-full flex items-center justify-center" style={{width: '12px', height: '12px'}}>
                        <svg className="text-gray-400" style={{width: '6px', height: '6px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    
                    {/* Upload Text */}
                    <div>
                        <p className="text-sm font-medium text-white">
                            {uploading ? 'Uploading...' : 'Drag and drop files or folders here'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            or click to browse
                        </p>
                    </div>
                    
                    {/* Upload Buttons */}
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Select Files
                        </button>
                        <button
                            onClick={() => folderInputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Select Folder
                        </button>
                    </div>
                    
                    {/* Loading Indicator */}
                    {uploading && (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-400">Processing upload...</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Hidden File Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept="*/*"
            />
            <input
                ref={folderInputRef}
                type="file"
                multiple
                webkitdirectory="true"
                onChange={handleFolderInputChange}
                className="hidden"
            />
        </div>
    );
};

export default UploadButton;
