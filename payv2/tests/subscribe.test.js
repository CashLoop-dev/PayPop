const nock = require('nock');
const subscribe = require('../bot/commands/subscribe');

describe('Subscribe Command', () => {
  const ctx = {
    message: { text: '/subscribe Alice alice@example.com' },
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
      .reply(200, { id: 'PROD-XYZ' });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/billing/plans')
      .reply(200, { id: 'PLAN-XYZ' });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/billing/subscriptions')
      .reply(200, { id: 'SUB-ABC' });
  });

  it('should create subscription', async () => {
    await subscribe(ctx);
    expect(ctx.reply).toHaveBeenCalledWith('Subscription SUB-ABC created for Alice');
  });
});