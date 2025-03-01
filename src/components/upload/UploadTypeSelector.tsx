
import { Button } from "@/components/ui/button";
import { Image, Images, Link } from "lucide-react";

interface UploadTypeSelectorProps {
  setUploadType: (type: "image" | "url" | "multi" | null) => void;
}

export const UploadTypeSelector = ({ setUploadType }: UploadTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 mb-8">
        Choose how you'd like to upload your design for analysis:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          onClick={() => setUploadType("image")}
          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(129, 140, 248, 0.9) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
            <Image
              className="w-12 h-12 text-white"
              aria-label="Upload image icon"
            />
          </div>
          <span className="text-xl font-bold text-white">Upload Image</span>
          <span className="text-sm text-white/90">
            Upload a screenshot or design file
          </span>
        </Button>

        <Button
          onClick={() => setUploadType("multi")}
          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(167, 139, 250, 0.9) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
            <Images
              className="w-12 h-12 text-white"
              aria-label="Multiple screenshots icon"
            />
          </div>
          <span className="text-xl font-bold text-white">Multiple Screenshots</span>
          <span className="text-sm text-white/90">
            Combine multiple screenshots into one
          </span>
        </Button>

        <Button
          onClick={() => setUploadType("url")}
          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, rgba(13, 148, 136, 0.9) 0%, rgba(94, 234, 212, 0.9) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
            <Link
              className="w-12 h-12 text-white"
              aria-label="Enter URL icon"
            />
          </div>
          <span className="text-xl font-bold text-white">Enter URL</span>
          <span className="text-sm text-white/90">
            Analyze a live website
          </span>
        </Button>
      </div>
    </div>
  );
};
