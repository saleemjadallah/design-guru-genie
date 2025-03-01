
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
      className={`relative flex flex-col items-center justify-center w-full h-80 p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out ${
        isDragging
          ? "border-accent bg-accent/5 scale-[1.02]"
          : "border-neutral-200 hover:border-accent/50 hover:bg-neutral-50"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      style={{
        background: isDragging 
          ? "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%)" 
          : "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)",
        boxShadow: isDragging ? "0 8px 30px rgba(79, 70, 229, 0.12)" : "none"
      }}
    >
      <div className={`relative w-20 h-20 mb-6 transition-transform ${isDragging ? "scale-110" : ""}`}>
        <div className="absolute inset-0 rounded-full bg-indigo-600/10 blur-md transform scale-110"></div>
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Upload
            className="w-10 h-10 text-white"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }}
          />
        </div>
      </div>
      
      <h3 className="text-2xl font-semibold mb-3 text-gray-800">
        Drop your design here
      </h3>
      <p className="mb-6 text-gray-600 text-center max-w-md">
        or click to select a file from your computer
      </p>
      <button 
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
      >
        Select File
      </button>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/*"
      />
      
      {/* Add subtle animated dots in the background */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-indigo-600" 
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};
