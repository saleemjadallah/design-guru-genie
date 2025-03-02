
import { UploadBackground } from "./UploadBackground";
import { UploadHeader } from "./UploadHeader";
import { UploadOptions } from "./UploadOptions";
import { UploadProvider } from "./UploadContext";

export const UploadSection = () => {
  return (
    <UploadProvider>
      <UploadBackground>
        <UploadHeader />
        <UploadOptions />
      </UploadBackground>
    </UploadProvider>
  );
};
