export const PAYMENT_TRANSFER_INFO = {
  qrImage: '/anhqr.jpg',
  bankName: 'TECOMBANK',
  accountName: 'TRUONG VAN HUNG',
  accountNumber: '19029674067037',
  depositAmount: 500000
};

export const buildTransferContent = (bookingId) => {
  const shortId = String(bookingId || '').slice(-6).toUpperCase();
  return `APLUS ${shortId}`;
};
