const nock = require('nock');
const disputes = require('../bot/commands/disputes');

describe('Disputes Command', () => {
  const ctx = {
    message: { text: '/disputes' },
    reply: jest.fn(),
  };

  beforeEach(() => {
    ctx.reply.mockClear();
    nock.cleanAll();

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/oauth2/token')
      .reply(200, { access_token: 'mock-token' });

    nock('https://api-m.sandbox.paypal.com')
      .get('/v1/customer/disputes?dispute_state=OPEN')
      .reply(200, { items: [{ dispute_id: 'DSPT-XYZ' }] });

    nock('https://api-m.sandbox.paypal.com')
      .get('/v1/customer/disputes/DSPT-XYZ')
      .reply(200);

    nock('https://api-m.sandbox.paypal.com')
      .post('/v1/customer/disputes/DSPT-XYZ/accept-claim')
      .reply(204);
  });

  it('should resolve a dispute', async () => {
    await disputes(ctx);
    expect(ctx.reply).toHaveBeenCalledWith('Accepted dispute DSPT-XYZ');
  });
});