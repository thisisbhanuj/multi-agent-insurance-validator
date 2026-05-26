"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Car, IdCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  icon: "dl" | "claim" | "car";
  accept: string;
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

const iconMap = {
  dl: IdCard,
  claim: FileText,
  car: Car,
};

export function FileUpload({
  label,
  icon,
  accept,
  onFileSelect,
  file,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const Icon = iconMap[icon];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer hover:border-primary/50",
        isDragging && "border-primary border-2 bg-primary/5",
        file && "border-green-500/50 bg-green-500/5"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="text-muted-foreground" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="sr-only"
          />
          {file ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <FileText className="size-5" />
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-full">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 rounded-full bg-muted">
                <Upload className="size-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Drop file here or click to upload
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, or PDF
              </span>
            </div>
          )}
        </label>
      </CardContent>
    </Card>
  );
}
