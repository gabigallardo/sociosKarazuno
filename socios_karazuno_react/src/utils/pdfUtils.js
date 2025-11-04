import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- TÉCNICA 1 (Sin cambios) ---
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


// -----------------------------------------------------------------
// --- INICIO DE LA MODIFICACIÓN (TÉCNICA 2) ---
// -----------------------------------------------------------------

/**
 * TÉCNICA 2: "Fotografía" cualquier elemento HTML y lo guarda en un PDF.
 * @param {string} elementId - El 'id' del elemento HTML a descargar.
 * @param {string} fileName - El nombre del archivo PDF de salida (ej. "credencial.pdf").
 */
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
      
      // 1. Obtenemos las dimensiones en píxeles de nuestra imagen
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      
      // 2. Determinamos la orientación basándonos en las dimensiones del canvas
      const orientation = imgWidthPx > imgHeightPx ? 'landscape' : 'portrait';

      // 3. Definimos un ancho físico en milímetros (mm)
      const pdfWidthMm = 85.6; // Ancho de tarjeta de crédito
      
      // 4. Calculamos el alto en mm manteniendo la proporción
      const aspectRatio = imgHeightPx / imgWidthPx;
      const pdfHeightMm = pdfWidthMm * aspectRatio;

      // 5. Creamos el PDF usando la orientación y unidades correctas
      const doc = new jsPDF({
        orientation: orientation, // <-- Usamos la orientación calculada
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm] 
      });
      
      // 6. Añadimos la imagen para que ocupe el 100% del PDF
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);
      doc.save(fileName);
    });
};
