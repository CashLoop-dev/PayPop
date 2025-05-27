const nock = require('nock');
const products = require('../bot/commands/products');

describe('Products Command', () => {
  const ctx = {
    message: { text: '/products WoodenTray' },
    reply: jest.fn(),
  };

  beforeEach(() => {
    ctx.reply.mockClear();
    nock.cleanAll();

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/oauth2/token')
      .reply(200, { access_token: 'mock-token' });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/catalogs/products')
      .reply(200, { id: 'PROD-WALNUT' });

    nock('https://api-m.sandbox.paypal.com')
      .get('/v1/catalogs/products/PROD-WALNUT')
      .reply(200, { id: 'PROD-WALNUT', name: 'Walnut Tray' });
  });

  it('should create and show product', async () => {
    await products(ctx);
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('Created + Fetched Product: PROD-WALNUT'));
  });
});