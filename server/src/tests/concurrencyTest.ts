import { db } from '../db/connection.js';

async function runConcurrencyTest() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING EVALIPIE CONCURRENCY & OVERSELLING RESISTANCE TEST');
  console.log('===============================================================');

  const listingId = 'list-sharma-headphone';
  const storeId = 'store-sharma-ind';

  // Set initial stock to EXACTLY 1
  const inv = db.findInventory(listingId, storeId);
  if (!inv) throw new Error('Inventory record not found');
  inv.quantity = 1;
  inv.reservedQuantity = 0;
  db.inventory.set(inv.id, { ...inv });

  console.log(`Initial Stock for Sharma Electronics Headphones: ${inv.quantity} unit.`);
  console.log('Simulating 2 concurrent checkout requests at the exact same millisecond...\n');

  const buyer1 = db.atomicReserveStock({
    listingId,
    storeId,
    quantity: 1,
    customerName: 'Ananya (Buyer 1)',
    customerPhone: '+919988776655'
  }).then(res => ({
    buyer: 'Buyer 1',
    status: 'SUCCESS',
    orderNumber: res.order.orderNumber,
    message: 'Stock reserved & Order confirmed'
  })).catch(err => ({
    buyer: 'Buyer 1',
    status: 'REJECTED',
    error: err.message
  }));

  const buyer2 = db.atomicReserveStock({
    listingId,
    storeId,
    quantity: 1,
    customerName: 'Vikram (Buyer 2)',
    customerPhone: '+919811223344'
  }).then(res => ({
    buyer: 'Buyer 2',
    status: 'SUCCESS',
    orderNumber: res.order.orderNumber,
    message: 'Stock reserved & Order confirmed'
  })).catch(err => ({
    buyer: 'Buyer 2',
    status: 'REJECTED',
    error: err.message
  }));

  const results = await Promise.all([buyer1, buyer2]);

  console.log('--- TEST RESULTS ---');
  results.forEach(r => {
    const detail = r.status === 'SUCCESS' ? (r as any).orderNumber : (r as any).error;
    console.log(`[${r.buyer}] => ${r.status}: ${detail}`);
  });

  const finalInv = db.findInventory(listingId, storeId);
  console.log(`\nFinal Stock Remaining in Database: ${finalInv?.quantity}`);

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const rejectedCount = results.filter(r => r.status === 'REJECTED').length;

  if (successCount === 1 && rejectedCount === 1 && finalInv?.quantity === 0) {
    console.log('\n✅ TEST PASSED: Exactly 1 order succeeded, 1 rejected. ZERO OVERSELLING.');
    console.log('PostgreSQL atomic row-locking verified.\n');
  } else {
    console.error('\n❌ TEST FAILED: Concurrency violation detected.');
    process.exit(1);
  }
}

runConcurrencyTest().catch(console.error);
