const { Client, Environment } = require('square');
function getSquareClient() {
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  });
}
module.exports = { getSquareClient };
