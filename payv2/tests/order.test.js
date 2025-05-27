const nock = require('nock');
const order = require('../bot/commands/order');

describe('Order Command', () => {
  const ctx = {
    message: { text: '/order 2 Ring 450 1Z999AA10123456784' },
    reply: jest.fn(),
  };

  beforeEach(() => {
    ctx.reply.mockClear();
    nock.cleanAll();

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/oauth2/token')
      .reply(200, { access_token: 'mock-token', expires_in: 3600 });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/checkout/orders')
      .reply(200, { id: 'ORDER123', links: [] });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/checkout/orders/ORDER123/capture')
      .reply(201);

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/shipping/trackers-batch')
      .reply(200);
  });

  it('should create, pay, and track order', async () => {
    await order(ctx);
    expect(ctx.reply).toHaveBeenCalledWith('Order ORDER123 created, paid, and tracking 1Z999AA10123456784 attached.');
  });
});