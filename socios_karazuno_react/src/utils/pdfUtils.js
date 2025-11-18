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
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);
      doc.save(fileName);
    });
};



export const generarReportePDF = (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Elemento no encontrado con id: ${elementId}`);
    return;
  }

  // Aseguramos que el fondo sea blanco y el texto legible antes de capturar
  html2canvas(input, {
    scale: 2.5, // Mayor escala = mayor calidad en el PDF
    useCORS: true, // Permite cargar imágenes externas
    backgroundColor: '#ffffff', // Fondo blanco forzado
    logging: false
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    
    // Medidas A4 en mm: 210 x 297
    const pdfWidth = 210; 
    const pdfHeight = 297;
    
    // Calculamos la altura proporcional de la imagen
    const imgProps = canvas.width / canvas.height;
    const imgHeightInPdf = pdfWidth / imgProps;

    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
    doc.save(fileName);
  });
};