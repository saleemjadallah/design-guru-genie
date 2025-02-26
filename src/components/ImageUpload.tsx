
import { useState, useCallback } from "react";
import { Upload } from "lucide-react";

export const ImageUpload = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) =>
        file.type.startsWith("image/")
      );

      if (imageFile) {
        onImageUpload(imageFile);
      }
    },
    [onImageUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFile = files.find((file) =>
      file.type.startsWith("image/")
    );

    if (imageFile) {
      onImageUpload(imageFile);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-lg transition-colors ${
        isDragging
          ? "border-accent bg-accent/5"
          : "border-neutral-200 hover:border-accent/50"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <Upload
        className={`w-12 h-12 mb-4 ${
          isDragging ? "text-accent" : "text-neutral-400"
        }`}
      />
      <p className="mb-2 text-lg font-semibold text-neutral-700">
        Drop your design here
      </p>
      <p className="mb-4 text-sm text-neutral-500">
        or click to select a file
      </p>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/*"
      />
    </div>
  );
};
