import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Alert } from './alert';

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'drag-drop' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  uploadText?: string;
  dropText?: string;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      accept,
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 10,
      disabled = false,
      label,
      hint,
      error,
      onChange,
      onError,
      variant = 'default',
      size = 'md',
      uploadText = 'Upload files',
      dropText = 'Drop files here',
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        handleFiles(selectedFiles);
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      []
    );

    const handleFiles = useCallback(
      (newFiles: File[]) => {
        // Check max files
        if (files.length + newFiles.length > maxFiles) {
          const error = `Maximum ${maxFiles} files allowed`;
          setUploadError(error);
          onError?.(error);
          return;
        }

        // Check file size
        const oversizedFiles = newFiles.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
          const error = `File size exceeds ${formatFileSize(maxSize)}`;
          setUploadError(error);
          onError?.(error);
          return;
        }

        // Check file type
        if (accept) {
          const invalidFiles = newFiles.filter(file => !file.type.match(accept));
          if (invalidFiles.length > 0) {
            const error = 'Invalid file type';
            setUploadError(error);
            onError?.(error);
            return;
          }
        }

        const updatedFiles = multiple ? [...files, ...newFiles] : [newFiles[0]];
        setFiles(updatedFiles);
        setUploadError(null);
        onChange?.(updatedFiles);
      },
      [files, maxFiles, maxSize, multiple, accept, onChange, onError]
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
      },
      [handleFiles]
    );

    const handleRemoveFile = useCallback(
      (index: number) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
        onChange?.(updatedFiles);
      },
      [files, onChange]
    );

    const handleClick = useCallback(() => {
      if (disabled) return;
      fileInputRef.current?.click();
    }, [disabled]);

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const getFileIcon = (file: File): React.ReactNode => {
      if (file.type.startsWith('image/')) {
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      }
      if (file.type.startsWith('application/pdf')) {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      return <FileText className="h-5 w-5 text-secondary-500" />;
    };

    const sizes = {
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    const variants = {
      default: cn(
        'border-2 border-dashed border-secondary-300 bg-secondary-50',
        isDragging && 'border-primary-500 bg-primary-50'
      ),
      drag-drop: cn(
        'border-2 border-dashed border-secondary-300 bg-white',
        isDragging && 'border-primary-500 bg-primary-50'
      ),
      button: '',
    };

    const renderFileList = () => (
      <div className="mt-4 space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center gap-3 p-2 bg-secondary-50 rounded-lg"
          >
            <div className="flex-shrink-0">{getFileIcon(file)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-secondary-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(index)}
              className="p-1 text-secondary-400 hover:text-red-500"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}

        {variant === 'button' ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled}
            className={cn(error && 'border-red-500', className)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            {uploadText}
          </Button>
        ) : (
          <div
            className={cn(
              'rounded-lg transition-all duration-200',
              variants[variant],
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500 bg-red-50',
              className
            )}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={cn('text-center', sizes[size])}>
              <Upload className="h-8 w-8 mx-auto text-secondary-400 mb-2" />
              <p className="text-sm font-medium text-secondary-700">
                {uploadText}
              </p>
              <p className="text-xs text-secondary-500 mt-1">{dropText}</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="sr-only"
          aria-hidden="true"
        />

        {renderFileList()}

        {uploadError && (
          <Alert variant="error" className="mt-2" onClose={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && !uploadError && (
          <p className="mt-2 text-sm text-secondary-500">{hint}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export { FileUpload };
