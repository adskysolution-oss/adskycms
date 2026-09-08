/**
 * MLM Data Migration Script
 * --------------------------
 * SOURCE:  mongodb+srv://...sakhihub  (old DB)
 * TARGET:  mongodb+srv://...          (new/default DB)
 *
 * Steps:
 *  1. Connect to BOTH databases
 *  2. Clear all MLM collections from TARGET DB
 *  3. Copy all MLM collections from SOURCE (sakhihub) to TARGET
 *
 * Run:  node scripts/migrate-mlm.mjs
 */

import { MongoClient } from 'mongodb';

// ─── Connection Strings ───────────────────────────────────────────────────────
const SOURCE_URI =
  'mongodb+srv://adskys26_db_user:0E4WAzwn8C8I7yEd@cluster0.l4mm4jh.mongodb.net/sakhihub?retryWrites=true&w=majority&tls=true&appName=Cluster0';

const TARGET_URI =
  'mongodb+srv://adskys26_db_user:0E4WAzwn8C8I7yEd@cluster0.l4mm4jh.mongodb.net/?appName=Cluster0';

const SOURCE_DB_NAME = 'sakhihub';
const TARGET_DB_NAME = 'test'; // Atlas default db name when no /dbname in URI

// ─── MLM Collections to migrate ──────────────────────────────────────────────
const MLM_COLLECTIONS = [
  'mlmmembers',
  'mlmmatrixnodes',
  'mlmkycs',
  'mlmwallets',
  'mlmwallettransactions',
  'mlmrewards',
  'mlmwithdrawals',
  'mlmauditlogs',
  'mlmcms',
  'mlmfdapplications',
  'mlmgeneralconfigs',
  'mlmlevelconfigs',
  'mlmmarketings',
  'mlmnotifications',
  'mlmpendingregistrations',
  'mlmplacementhistories',
  'mlmplatformfeeconfigs',
  'mlmproducts',
  'mlmsponsorhistories',
  'mlmtrainings',
  'mlmshareconfigs',
];

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function migrate() {
  log('Connecting to SOURCE (sakhihub)...');
  const sourceClient = new MongoClient(SOURCE_URI);
  await sourceClient.connect();
  const sourceDb = sourceClient.db(SOURCE_DB_NAME);

  log(`Connecting to TARGET (${TARGET_DB_NAME})...`);
  const targetClient = new MongoClient(TARGET_URI);
  await targetClient.connect();
  const targetDb = targetClient.db(TARGET_DB_NAME);

  // Auto-detect all MLM collections in source
  const allSourceCollections = (await sourceDb.listCollections().toArray()).map(
    (c) => c.name
  );
  log(`SOURCE DB collections: ${allSourceCollections.join(', ')}`);

  const mlmInSource = allSourceCollections.filter(
    (name) =>
      name.toLowerCase().startsWith('mlm') ||
      MLM_COLLECTIONS.includes(name.toLowerCase())
  );

  if (mlmInSource.length === 0) {
    log('No MLM collections found in source DB. Exiting.');
    await sourceClient.close();
    await targetClient.close();
    return;
  }

  log(`\nMLM collections to migrate: ${mlmInSource.join(', ')}\n`);

  let totalCopied = 0;

  for (const collName of mlmInSource) {
    try {
      // DROP the entire collection from TARGET (removes data + indexes)
      const targetColl = targetDb.collection(collName);
      try {
        await targetDb.dropCollection(collName);
        log(`Dropped  [${collName}] from TARGET (data + indexes cleared)`);
      } catch (dropErr) {
        // Collection might not exist yet — that's fine
        if (dropErr.codeName !== 'NamespaceNotFound') {
          log(`   Warning: drop [${collName}] — ${dropErr.message}`);
        } else {
          log(`   [${collName}] did not exist in TARGET yet, skipping drop`);
        }
      }

      // Read from SOURCE
      const sourceColl = sourceDb.collection(collName);
      const docs = await sourceColl.find({}).toArray();

      if (docs.length === 0) {
        log(`   Source [${collName}] is empty, skipping insert.`);
        continue;
      }

      // Insert into TARGET (fresh collection, no index conflicts)
      const freshColl = targetDb.collection(collName);
      const insertResult = await freshColl.insertMany(docs, { ordered: false });
      log(`Copied  [${collName}] — ${insertResult.insertedCount} / ${docs.length} docs inserted`);
      totalCopied += insertResult.insertedCount;
    } catch (collErr) {
      log(`ERROR on [${collName}]: ${collErr.message}`);
    }
  }

  log(`\nMigration complete! Total docs copied: ${totalCopied}`);

  await sourceClient.close();
  await targetClient.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
