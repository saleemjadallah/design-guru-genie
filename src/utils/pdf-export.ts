
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

export async function exportResultsAsPdf(elementId: string, filename: string = 'design-analysis-report.pdf') {
  try {
    toast({
      title: "Preparing PDF",
      description: "Please wait while we generate your report...",
    });

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.padding = '20px';
    clone.style.background = '#ffffff';
    clone.style.width = '794px'; // A4 width in pixels
    
    // Temporarily append to the document for rendering
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 1.5, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // If the content is longer than one page
    if (imgHeight > 297) { // A4 height in mm
      let heightLeft = imgHeight - 297;
      let position = -297;
      
      while (heightLeft > 0) {
        position -= 297;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
    }

    pdf.save(filename);

    toast({
      title: "PDF exported successfully",
      description: "Your design analysis report has been downloaded.",
    });
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast({
      title: "Export failed",
      description: "There was an error generating the PDF. Please try again.",
      variant: "destructive",
    });
  }
}
