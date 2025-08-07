import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { leadsService } from '@/lib/api/leads/leadsService';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check if it's an Excel file
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      console.log('🔄 Starting bulk upload process...');
      const result = await leadsService.uploadBulkLeads(file);
      console.log('✅ Bulk upload result:', result);
      
      // Ensure we have a proper result object
      if (result && typeof result === 'object') {
        setUploadResult({
          success: Boolean(result.success),
          message: result.message || 'Upload completed',
          count: result.count
        });
        
        // Call onSuccess even if the result format is different but upload worked
        if (result.success && onSuccess) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000); // Reduced timeout for better UX
        }
      } else {
        // Fallback: if we get here without error, assume success
        setUploadResult({
          success: true,
          message: 'Upload completed successfully',
          count: undefined
        });
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Better error message handling
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('401') || error.message.includes('Authentication')) {
          errorMessage = 'Authentication failed. Please login again and try uploading.';
        } else if (error.message.includes('403') || error.message.includes('permission')) {
          errorMessage = 'You don\'t have permission to upload leads. Please contact your administrator.';
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = 'File is too large. Please reduce the file size and try again.';
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Invalid file format or data. Please check your Excel file and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setUploadResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the template file from public folder
    const link = document.createElement('a');
    link.href = '/Leads Bulk.xlsx';
    link.download = 'Leads_Bulk_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Leads</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Template Download Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Download Template
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Download the Excel template to format your leads data correctly.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-file"
              />
              <label
                htmlFor="bulk-upload-file"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to select Excel file or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  Supports .xlsx and .xls files
                </span>
              </label>
            </div>

            {file && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mb-6 p-4 rounded-lg border ${
              uploadResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                  </p>
                  <p className={`text-sm ${
                    uploadResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.success && uploadResult.count && (
                    <p className="text-sm text-green-600 mt-1">
                      {uploadResult.count} leads processed successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Leads'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
