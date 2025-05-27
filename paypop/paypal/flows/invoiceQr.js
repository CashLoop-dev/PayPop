const QRCode = require('qrcode');

const generateInvoiceQr = async (invoiceUrl) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(invoiceUrl);
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error('Error generating QR code: ' + error.message);
    }
};

module.exports = {
    generateInvoiceQr,
};