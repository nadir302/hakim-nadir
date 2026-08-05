declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    width?: number;
    height?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
  const QRCode: {
    toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
    toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeToDataURLOptions): Promise<unknown>;
    toString(text: string, options?: unknown): Promise<string>;
  };
  export default QRCode;
}