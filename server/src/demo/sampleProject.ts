// Built-in Demo Project for Hackathon Judges & 1-Click Evaluation
// Contains real source files, stated requirements/claims, and verifiable bug reproductions.

export interface VirtualFile {
  path: string;
  content: string;
  linesOfCode: number;
}

export interface DemoProjectDef {
  name: string;
  description: string;
  repoUrl: string;
  branch: string;
  primaryLanguage: string;
  framework: string;
  files: VirtualFile[];
  requirementsDoc: string;
  reproductionSuites: Array<{
    id: string;
    bugTitle: string;
    targetFile: string;
    scriptContent: string;
    expectedExitCode: number;
  }>;
}

export const EVALIPIE_SAMPLE_PROJECT: DemoProjectDef = {
  name: 'fintech-vault-transfer-service',
  description: 'Production Microservice for Wallet Transfers, Order Invoices, and Checkout Discount Calculations',
  repoUrl: 'https://github.com/evalipie-benchmark/fintech-vault-transfer-service',
  branch: 'main',
  primaryLanguage: 'JavaScript / Node.js',
  framework: 'Express.js',
  requirementsDoc: `# Requirements Specification: Fintech Vault & Transfer Service

## Requirement 1: Atomic Balance Debiting & Overdraft Protection
The balance debiting engine MUST guarantee atomic execution and absolute overdraft protection. 
Under no circumstances may concurrent debit transactions permit a customer balance to drop below ₹0.
If multiple debit calls arrive simultaneously, all subsequent operations exceeding available balance must be rejected.

## Requirement 2: Strict Authorization & IDOR Protection on Order Invoices
Customer invoices and order records contain sensitive personal identifiable information (PII) and financial metadata.
The invoice API endpoint (/api/orders/:id) MUST strictly authenticate the requesting caller and guarantee that only 
the verified owner of the order or an authorized system auditor can view the record. Unauthorized cross-tenant reads must return 403 Forbidden.

## Requirement 3: Idempotent Coupon Discount Validation
Promotional discounts and coupons MUST be strictly validated before order checkout.
The coupon engine MUST guarantee idempotency: the same promo code cannot be stacked or applied more than once per cart.
Furthermore, the final payable cart total MUST never evaluate to a negative currency amount.
`,
  files: [
    {
      path: 'package.json',
      linesOfCode: 24,
      content: JSON.stringify({
        name: 'fintech-vault-transfer-service',
        version: '1.2.0',
        description: 'Fintech Wallet and Order Management API',
        main: 'src/index.js',
        scripts: {
          test: 'jest --ci',
          start: 'node src/index.js'
        },
        dependencies: {
          express: '^4.19.2',
          dotenv: '^16.4.5',
          cors: '^2.8.5'
        },
        devDependencies: {
          jest: '^29.7.0'
        }
      }, null, 2)
    },
    {
      path: 'src/accountService.js',
      linesOfCode: 52,
      content: `// Account Balance Service - Handles customer wallet deposits & debits
const memoryBalances = new Map([
  ['acc_101', 1000],
  ['acc_102', 5000],
  ['acc_103', 250]
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Debits money from user balance.
 * Stated Claim: "Guarantees atomic overdraft protection against concurrent debits."
 */
async function debitBalance(accountId, amount) {
  if (amount <= 0) {
    throw new Error('Debit amount must be greater than zero');
  }

  const currentBalance = memoryBalances.get(accountId) || 0;

  // SIMULATED LATENCY (Database/Network read lag)
  // BUG: Non-atomic read-modify-write without row locking or redis mutex
  await sleep(25);

  if (currentBalance < amount) {
    throw new Error('Insufficient funds: balance ' + currentBalance + ' is lower than requested ' + amount);
  }

  // Latency between check and write window allows race condition
  await sleep(10);
  const latest = memoryBalances.get(accountId) || 0;
  const newBalance = latest - amount;
  memoryBalances.set(accountId, newBalance);

  return {
    accountId,
    previousBalance: currentBalance,
    debitedAmount: amount,
    newBalance
  };
}

function getBalance(accountId) {
  return memoryBalances.get(accountId) || 0;
}

function resetBalance(accountId, amount) {
  memoryBalances.set(accountId, amount);
}

module.exports = { debitBalance, getBalance, resetBalance };
`
    },
    {
      path: 'src/orderController.js',
      linesOfCode: 48,
      content: `// Order & Invoice Controller
const ordersDatabase = new Map([
  ['ord_901', { id: 'ord_901', customerId: 'cust_alpha', total: 2499, item: 'boAt Rockerz Headphones', pii: 'Address: Flat 4B, Indiranagar' }],
  ['ord_902', { id: 'ord_902', customerId: 'cust_beta', total: 49999, item: 'MacBook Air M2', pii: 'Address: House 12, Koramangala' }]
]);

/**
 * Fetch Order Invoice by ID
 * Stated Claim: "Strict authentication & IDOR authorization protection."
 */
function getOrderInvoice(req, res) {
  const orderId = req.params.id;
  const order = ordersDatabase.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // BUG: Missing authorization check! Does NOT verify if req.user.id === order.customerId
  // Allows any authenticated or unauthenticated user to inspect arbitrary invoices (IDOR)
  return res.status(200).json({
    success: true,
    order
  });
}

module.exports = { getOrderInvoice, ordersDatabase };
`
    },
    {
      path: 'src/couponService.js',
      linesOfCode: 45,
      content: `// Checkout Coupon & Discount Calculation Engine
const VALID_COUPONS = new Map([
  ['SAVE50', { code: 'SAVE50', discount: 50, minTotal: 50 }],
  ['FLAT200', { code: 'FLAT200', discount: 200, minTotal: 500 }]
]);

/**
 * Calculates final payable cart total.
 * Stated Claim: "Idempotent coupon application and total never drops below ₹0."
 */
function calculateCartTotal(cartItemsTotal, appliedCoupons) {
  let discountTotal = 0;

  // BUG: Iterates without checking set deduplication or negative floor limit
  for (const code of appliedCoupons) {
    const coupon = VALID_COUPONS.get(code);
    if (coupon) {
      discountTotal += coupon.discount;
    }
  }

  // BUG: If discountTotal exceeds cartItemsTotal, finalAmount becomes negative!
  const finalAmount = cartItemsTotal - discountTotal;
  return {
    subtotal: cartItemsTotal,
    discount: discountTotal,
    finalAmount // Can be negative (e.g. 40 - 100 = -60)
  };
}

module.exports = { calculateCartTotal, VALID_COUPONS };
`
    },
    {
      path: 'tests/accountService.test.js',
      linesOfCode: 35,
      content: `const { debitBalance, getBalance, resetBalance } = require('../src/accountService');

describe('Account Service Unit Checks', () => {
  beforeEach(() => {
    resetBalance('acc_test', 500);
  });

  test('Single sequential debit updates balance correctly', async () => {
    const res = await debitBalance('acc_test', 200);
    expect(res.newBalance).toBe(300);
    expect(getBalance('acc_test')).toBe(300);
  });

  test('Rejects debit when single amount exceeds balance', async () => {
    await expect(debitBalance('acc_test', 9999)).rejects.toThrow('Insufficient funds');
  });
});
`
    }
  ],
  reproductionSuites: [
    {
      id: 'repro-race-condition-overdraft',
      bugTitle: 'Concurrent Overdraft Race Condition in debitBalance()',
      targetFile: 'src/accountService.js',
      expectedExitCode: 1,
      scriptContent: `const { debitBalance, resetBalance, getBalance } = require('./src/accountService');

async function testRaceCondition() {
  console.log('[EVALIPIE SANDBOX] Initializing isolated concurrent balance test...');
  const accountId = 'acc_repro_' + Date.now();
  resetBalance(accountId, 1000);
  console.log('[EVALIPIE SANDBOX] Starting account balance: ₹1000');
  console.log('[EVALIPIE SANDBOX] Dispatching 2 simultaneous debit calls of ₹600 each...');

  // Dispatched simultaneously
  const p1 = debitBalance(accountId, 600);
  const p2 = debitBalance(accountId, 600);

  const results = await Promise.allSettled([p1, p2]);
  const finalBalance = getBalance(accountId);

  console.log('[EVALIPIE SANDBOX] Debit 1 result: ' + results[0].status);
  console.log('[EVALIPIE SANDBOX] Debit 2 result: ' + results[1].status);
  console.log('[EVALIPIE SANDBOX] Recorded Final Balance: ₹' + finalBalance);

  if (finalBalance < 0) {
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] CRITICAL: Overdraft protection failed!');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "guarantees zero-balance overdraft protection".');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Reality: Balance dropped to ₹' + finalBalance + ' due to unhandled race condition.');
    process.exit(1); // Non-zero exit code confirms bug reproduction!
  } else {
    console.log('[EVALIPIE] No overdraft observed.');
    process.exit(0);
  }
}

testRaceCondition().catch((err) => {
  console.error('[EVALIPIE ERROR]', err);
  process.exit(2);
});
`
    },
    {
      id: 'repro-idor-unauthorized-invoice',
      bugTitle: 'Insecure Direct Object Reference (IDOR) on /api/orders/:id',
      targetFile: 'src/orderController.js',
      expectedExitCode: 1,
      scriptContent: `const { getOrderInvoice } = require('./src/orderController');

function testIdor() {
  console.log('[EVALIPIE SANDBOX] Initializing IDOR access control check on order invoices...');
  
  // Simulating an unauthorized user (cust_attacker) requesting invoice of ord_902 (owned by cust_beta)
  const req = {
    params: { id: 'ord_902' },
    user: { id: 'cust_attacker', role: 'CUSTOMER' }
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (payload) => {
      responseData = payload;
      return res;
    }
  };

  getOrderInvoice(req, res);

  console.log('[EVALIPIE SANDBOX] Simulated caller: cust_attacker');
  console.log('[EVALIPIE SANDBOX] Requested order owner: ' + responseData?.order?.customerId);
  console.log('[EVALIPIE SANDBOX] Response status code: ' + statusCode);

  if (statusCode === 200 && responseData?.order?.customerId === 'cust_beta') {
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] HIGH SEVERITY: IDOR Vulnerability Verified!');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "strictly authenticate the requesting caller and guarantee owner-only access".');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Reality: Caller cust_attacker accessed private order invoice containing PII without restriction.');
    process.exit(1);
  } else {
    console.log('[EVALIPIE] Access rejected.');
    process.exit(0);
  }
}

testIdor();
`
    },
    {
      id: 'repro-negative-cart-coupon-stacking',
      bugTitle: 'Stackable Discount Causing Negative Cart Checkout Total',
      targetFile: 'src/couponService.js',
      expectedExitCode: 1,
      scriptContent: `const { calculateCartTotal } = require('./src/couponService');

function testNegativeCart() {
  console.log('[EVALIPIE SANDBOX] Testing coupon stackability and negative checkout total boundary...');
  
  const cartSubtotal = 75; // ₹75 cart
  const appliedCoupons = ['SAVE50', 'SAVE50']; // Double coupon stacked

  console.log('[EVALIPIE SANDBOX] Cart Subtotal: ₹' + cartSubtotal);
  console.log('[EVALIPIE SANDBOX] Applied Coupons: ' + JSON.stringify(appliedCoupons));

  const result = calculateCartTotal(cartSubtotal, appliedCoupons);
  console.log('[EVALIPIE SANDBOX] Total Discount Computed: ₹' + result.discount);
  console.log('[EVALIPIE SANDBOX] Calculated Final Amount: ₹' + result.finalAmount);

  if (result.finalAmount < 0) {
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] MEDIUM SEVERITY: Negative Cart Total Verified!');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "same promo code cannot be stacked and cart total must never drop below ₹0".');
    console.error('[EVALIPIE REPRODUCTION CONFIRMED] Reality: Cart evaluated to ₹' + result.finalAmount + ', allowing fraudulent negative transactions.');
    process.exit(1);
  } else {
    console.log('[EVALIPIE] Boundary check passed.');
    process.exit(0);
  }
}

testNegativeCart();
`
    }
  ]
};
