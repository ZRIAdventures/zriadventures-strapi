const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(relativePath, globals) {
  const context = { module: { exports: {} }, ...globals };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'), context);
  return context.module.exports;
}
const lifecyclePath = 'src/api/v2-order/content-types/v2-order/lifecycles.js';
const log = { info() {}, warn() {}, error() {}, debug() {} };

test('saving email delivery timestamps does not retrigger payment fulfillment', async () => {
  let calls = 0;
  const hooks = load(lifecyclePath, { strapi: { log }, fetch: async () => { calls++; } });
  await hooks.afterUpdate({ state: { previousPaymentStatus: 'SUCCESS' }, result: { paymentStatus: 'SUCCESS', receiptSentAt: new Date().toISOString(), internalEmailStatus: 'SENT' } });
  assert.equal(calls, 0);
});

test('a paid order triggers the authenticated frontend callback with its previous state', async () => {
  let request;
  const hooks = load(lifecyclePath, {
    strapi: { log },
    process: { env: { APP_BASE_URL: 'https://example.test', INTERNAL_API_SECRET: 'test-only' } },
    fetch: async (url, options) => { request = { url, ...options }; return { json: async () => ({ message: 'Order processed' }) }; },
  });
  await hooks.afterUpdate({ state: { previousPaymentStatus: 'PENDING' }, result: { orderId: 'test-order', paymentStatus: 'SUCCESS' } });
  assert.equal(request.url, 'https://example.test/api/strapi/update-order?previousPaymentStatus=PENDING');
  assert.equal(request.headers.Authorization, 'Bearer test-only');
  assert.equal(JSON.parse(request.body).paymentStatus, 'SUCCESS');
});

test('numeric row updates resolve the document before comparing payment status', async () => {
  const hooks = load(lifecyclePath, { strapi: {
    log,
    db: { query: () => ({ findOne: async ({ where }) => { assert.equal(where.id, 42); return { documentId: 'order-document' }; } }) },
    documents: () => ({ findOne: async ({ documentId }) => { assert.equal(documentId, 'order-document'); return { paymentStatus: 'PENDING' }; } }),
  } });
  const event = { params: { where: { id: 42 }, data: { paymentStatus: 'SUCCESS' } } };
  await hooks.beforeUpdate(event);
  assert.equal(event.state.previousPaymentStatus, 'PENDING');
});

test('default role setup grants catalog access without exposing subscribers or customer orders', async () => {
  const grants = [];
  const app = load('src/index.js', {});
  await app.bootstrap({ strapi: { log, query: uid => uid.endsWith('.role') ? {
    findOne: async ({ where }) => ({ id: where.type }),
  } : {
    findOne: async ({ where }) => ({ id: where.action, enabled: false }),
    update: async ({ where }) => { grants.push(where.id); },
  } } });
  assert.ok(grants.some(action => action === 'api::experience.experience.find'));
  assert.ok(grants.every(action => !/newsletter-subscriber|v2-order|api::order\./.test(action)));
});
