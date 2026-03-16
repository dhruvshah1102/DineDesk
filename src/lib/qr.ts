import QRCode from 'qrcode';

export async function generateAndUploadQR(tenantId: string, slug: string, tableNumber: number): Promise<string> {
  const url = process.env.NODE_ENV === 'production'
    ? `https://${slug}.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'menuflow.com'}/table/${tableNumber}`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/table/${tableNumber}?cafe=${slug}`;

  // Generate as a compact Data URL (no external storage needed)
  const dataUrl = await QRCode.toDataURL(url, {
    type: 'image/png',
    width: 400,
    margin: 2,
    color: { dark: '#111827', light: '#FFFFFF' }
  });

  return dataUrl;
}
