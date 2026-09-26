import JsBarcode from 'jsbarcode';

export function generateBarcodeDataUrl(value, format = "CODE128") {
  if (!value) return '';
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: format,
    width: 2,
    height: 60,
    displayValue: false,
    margin: 0
  });
  return canvas.toDataURL("image/png");
}
