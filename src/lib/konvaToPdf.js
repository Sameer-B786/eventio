import Konva from 'konva';

export async function renderRecordToCanvas(record, templateJson, barcodeDataUrl) {
  return new Promise((resolve) => {
    const { canvas, elements } = templateJson;
    const stage = new Konva.Stage({
      container: document.createElement('div'),
      width: canvas.width,
      height: canvas.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Add background
    layer.add(new Konva.Rect({
      width: canvas.width,
      height: canvas.height,
      fill: canvas.backgroundColor || '#FFFFFF'
    }));

    let imagesToLoad = 0;
    let imagesLoaded = 0;

    const checkDone = () => {
      if (imagesLoaded === imagesToLoad) {
        layer.draw();
        resolve(stage);
      }
    };

    elements.forEach(element => {
      if (element.type === 'IMAGE' || element.type === 'DYNAMIC_IMAGE') {
        const src = record?.[element.fieldMapping] || element.src;
        if (src) {
          imagesToLoad++;
          const img = new window.Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const konvaImg = new Konva.Image({
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              image: img,
              cornerRadius: element.borderRadius || 0
            });
            layer.add(konvaImg);
            imagesLoaded++;
            checkDone();
          };
          img.onerror = () => {
            imagesLoaded++;
            checkDone();
          }
          img.src = src;
        }
      } else if (element.type === 'DYNAMIC_TEXT' || element.type === 'TEXT') {
        const textValue = record?.[element.fieldMapping] || element.text || '';
        const konvaText = new Konva.Text({
          x: element.x,
          y: element.y,
          text: textValue,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily || 'Arial',
          fill: element.fill || '#000000',
          align: element.align || 'left',
          width: element.width
        });
        layer.add(konvaText);
      } else if (element.type === 'DYNAMIC_BARCODE') {
        if (barcodeDataUrl) {
          imagesToLoad++;
          const img = new window.Image();
          img.onload = () => {
            const konvaImg = new Konva.Image({
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              image: img
            });
            layer.add(konvaImg);
            imagesLoaded++;
            checkDone();
          };
          img.onerror = () => {
            imagesLoaded++;
            checkDone();
          };
          img.src = barcodeDataUrl;
        }
      }
    });

    if (imagesToLoad === 0) {
      checkDone();
    }
  });
}
