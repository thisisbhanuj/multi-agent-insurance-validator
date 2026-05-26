"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Car, IdCard, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  description?: string;
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
  description,
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

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFileSelect(null);
    },
    [onFileSelect]
  );

  return (
    <Card
      className={cn(
        "card-glow gradient-border transition-all duration-300 cursor-pointer group",
        "hover:border-primary/30 bg-card/80",
        isDragging && "border-primary/50 bg-primary/5 scale-[1.02]",
        file && "border-success/30 bg-success/5"
      )}
    >
      <CardContent className="p-0">
        <label
          className="flex flex-col h-full cursor-pointer"
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

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center transition-colors",
                file ? "bg-success/10" : "bg-secondary"
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-colors",
                  file ? "text-success" : "text-muted-foreground"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">{label}</h4>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {file && (
              <button
                onClick={handleRemove}
                className="size-6 rounded-full bg-secondary hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Drop Zone */}
          <div
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-3 p-6 transition-all",
              "min-h-[140px]"
            )}
          >
            {file ? (
              <>
                <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="size-6 text-success" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "size-12 rounded-full flex items-center justify-center transition-all",
                    "bg-secondary group-hover:bg-primary/10",
                    isDragging && "bg-primary/20 scale-110"
                  )}
                >
                  <Upload
                    className={cn(
                      "size-5 transition-colors",
                      "text-muted-foreground group-hover:text-primary",
                      isDragging && "text-primary"
                    )}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    JPG, PNG, or PDF
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </CardContent>
    </Card>
  );
}
