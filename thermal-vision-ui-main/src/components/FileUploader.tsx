import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  variant?: "thermal" | "rgb";
}

export const FileUploader = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 5,
  className,
  variant = "thermal",
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
    onFileSelect(file);
  }, [maxSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const gradientClass = variant === "thermal" ? "gradient-thermal" : "gradient-rgb";
  const glowClass = variant === "thermal" ? "shadow-glow-thermal" : "shadow-glow-rgb";

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id="file-upload"
      />
      
      {!preview ? (
        <label
          htmlFor="file-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
            isDragging
              ? cn("border-primary bg-primary/5", glowClass)
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            error && "border-destructive"
          )}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className={cn("p-4 rounded-full mb-4", gradientClass)}>
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">
              {isDragging ? "Drop your image here" : "Drag & drop your image"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>PNG, JPG, WEBP up to {maxSize}MB</span>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative w-full rounded-xl overflow-hidden border border-border bg-card">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-contain bg-muted/30"
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={clearFile}
              className="rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
            <p className="text-sm font-medium truncate">{selectedFile?.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
