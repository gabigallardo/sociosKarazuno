

export const descargarCanvasComoPDF = async (canvasId, fileName, pdfSize = [120, 120]) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`No se encontró el canvas con id: ${canvasId}`);
    return;
  }

  // Importación dinámica
  const { default: jsPDF } = await import('jspdf');

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

export const descargarElementoComoPDF = async (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Elemento no encontrado con id: ${elementId}`);
    return;
  }

  // Importación dinámica paralela
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

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

export const generarReportePDF = async (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Elemento no encontrado con id: ${elementId}`);
    return;
  }

  // Importación dinámica paralela
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

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