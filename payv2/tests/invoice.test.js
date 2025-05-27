const nock = require('nock');
const invoice = require('../bot/commands/invoice');

describe('Invoice Command', () => {
  const ctx = {
    message: { text: '/invoice jane@example.com 3 100' },
    reply: jest.fn(),
  };

  beforeEach(() => {
    ctx.reply.mockClear();

    nock.cleanAll();

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/oauth2/token')
      .reply(200, { access_token: 'mock-token', expires_in: 3600 });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/invoicing/invoices')
      .reply(200, { id: 'INV2-XYZ' });

    nock('https://api-m.sandbox.paypal.com')
      .post(uri => uri.includes('/send'))
      .reply(204);

    nock('https://api-m.sandbox.paypal.com')
      .post(uri => uri.includes('/remind'))
      .reply(204);
  });

  it('should create, send, and remind an invoice', async () => {
    await invoice(ctx);
    expect(ctx.reply).toHaveBeenCalledWith('Invoice INV2-XYZ sent to jane@example.com');
  });
});