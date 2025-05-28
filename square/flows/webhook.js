const crypto = require('crypto');
function verifySquareWebhook(signatureKey, body, signatureHeader, notificationUrl) {
  const hmac = crypto.createHmac('sha1', signatureKey);
  hmac.update(notificationUrl + body);
  const hash = hmac.digest('base64');
  return hash === signatureHeader;
}
function squareWebhookHandler(signatureKey, notificationUrl) {
  return (req, res, next) => {
    const signature = req.headers['x-square-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    if (!verifySquareWebhook(signatureKey, rawBody, signature, notificationUrl)) {
      return res.status(401).send('Invalid signature');
    }
    next();
  };
}
module.exports = {
  verifySquareWebhook,
  squareWebhookHandler,
};
