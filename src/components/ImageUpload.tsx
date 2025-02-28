
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
        console.log("File dropped, calling onImageUpload with:", imageFile.name);
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
      console.log("File selected, calling onImageUpload with:", imageFile.name);
      onImageUpload(imageFile);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-80 p-8 border-2 border-dashed rounded-xl transition-all ${
        isDragging
          ? "border-accent bg-accent/5 scale-[1.02]"
          : "border-neutral-200 hover:border-accent/50 hover:bg-neutral-50"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <Upload
        className={`w-16 h-16 mb-6 ${
          isDragging ? "text-accent" : "text-neutral-400"
        }`}
      />
      <h3 className="text-2xl font-semibold mb-3 text-neutral-800">
        Drop your design here
      </h3>
      <p className="mb-6 text-neutral-600">
        or click to select a file from your computer
      </p>
      <button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors">
        Select File
      </button>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/*"
      />
    </div>
  );
};
