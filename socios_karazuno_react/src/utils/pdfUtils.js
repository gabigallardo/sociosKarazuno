import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const descargarCanvasComoPDF = (canvasId, fileName, pdfSize = [120, 120]) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`No se encontró el canvas con id: ${canvasId}`);
    return;
  }
  const imageData = canvas.toDataURL('image/png');
  const [ancho, alto] = pdfSize;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: pdfSize
  });
  const margen = 10;
  const imgAncho = ancho - (margen * 2);
  const imgAlto = alto - (margen * 2);
  doc.addImage(imageData, 'PNG', margen, margen, imgAncho, imgAlto);
  doc.save(fileName);
};

export const descargarElementoComoPDF = (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Elemento no encontrado con id: ${elementId}`);
    return;
  }

  html2canvas(input, { 
    useCORS: true,
    scale: 2 
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const orientation = imgWidthPx > imgHeightPx ? 'landscape' : 'portrait';
      const pdfWidthMm = 85.6; 
      const aspectRatio = imgHeightPx / imgWidthPx;
      const pdfHeightMm = pdfWidthMm * aspectRatio;

      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm] 
      });
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
      doc.save(fileName);
    });
};



export const generarReportePDF = (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Elemento no encontrado con id: ${elementId}`);
    return;
  }

  const originalOverflow = input.style.overflow;
  input.style.overflow = 'visible';

  html2canvas(input, {
    scale: 2.5, 
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = 210; 
    const pdfHeight = 297;
    
    const imgProps = canvas.width / canvas.height;
    const imgHeightInPdf = pdfWidth / imgProps;

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
    doc.save(fileName);

    input.style.overflow = originalOverflow;
  });
};