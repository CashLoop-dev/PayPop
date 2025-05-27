const nock = require('nock');
const fixinvoice = require('../bot/commands/fixinvoice');

describe('Fix Invoice Command', () => {
  const ctx = {
    message: { text: '/fixinvoice INV-OLD dana@example.com' },
    reply: jest.fn(),
  };

  beforeEach(() => {
    ctx.reply.mockClear();
    nock.cleanAll();

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/oauth2/token')
      .reply(200, { access_token: 'mock-token' });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/invoicing/invoices/INV-OLD/cancel')
      .reply(200);

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/invoicing/invoices')
      .reply(200, { id: 'INV-CORRECTED' });

    nock('https://api-m.sandbox.paypal.com')
      .post('/v2/invoicing/invoices/INV-CORRECTED/send')
      .reply(204);
  });

  it('should cancel and reissue invoice', async () => {
    await fixinvoice(ctx);
    expect(ctx.reply).toHaveBeenCalledWith('Old invoice INV-OLD canceled.\nNew invoice INV-CORRECTED sent.');
  });
});