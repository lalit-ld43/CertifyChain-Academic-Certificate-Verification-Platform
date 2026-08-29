/**
 * invoke_contract.js  (v3 — correct stellar CLI v27 syntax)
 * -----------------------------------------------------------
 * 1. Generates 5 unique Stellar testnet keypairs via `stellar keys generate`
 * 2. Funds each via Friendbot
 * 3. Calls `register_institution` via `stellar contract invoke`
 * 4. Writes wallet public key + tx hash to scripts/invocation_results.csv
 */

const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Config ───────────────────────────────────────────────────────────────────
const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results.csv');

const INSTITUTIONS = [
  { keyAlias: 'certify_w1', description: 'MIT Computer Science Department Batch 2024' },
  { keyAlias: 'certify_w2', description: 'Stanford University Engineering Faculty' },
  { keyAlias: 'certify_w3', description: 'Harvard Medical School Credential Authority' },
  { keyAlias: 'certify_w4', description: 'Oxford Research Institute Data Sciences' },
  { keyAlias: 'certify_w5', description: 'Cambridge Blockchain DeFi Certification Hub' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch {
            resolve({ raw: d });
          }
        });
      })
      .on('error', reject);
  });
}

function descriptionToHex(desc) {
  return crypto.createHash('sha256').update(desc).digest('hex');
}

/** Run stellar CLI, return { stdout, stderr, code } */
function run(args) {
  const r = spawnSync('stellar', args, { encoding: 'utf8', timeout: 120_000 });
  return {
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    code: r.status ?? 1,
  };
}

// ─── Generate keypair using stellar CLI ───────────────────────────────────────
function generateKeypair(alias) {
  // Remove old key if exists
  run(['keys', 'rm', alias]);

  // Generate (no --no-fund flag in v27; fund separately via friendbot)
  const gen = run(['keys', 'generate', '--overwrite', alias]);
  if (gen.code !== 0) throw new Error(`keys generate failed: ${gen.stderr || gen.stdout}`);

  // Get public key
  const pubR = run(['keys', 'address', alias]);
  if (pubR.code !== 0) throw new Error(`keys address failed: ${pubR.stderr}`);
  const publicKey = pubR.stdout.trim();

  // Get secret key
  const secR = run(['keys', 'show', alias]);
  if (secR.code !== 0) throw new Error(`keys show failed: ${secR.stderr}`);
  const secretKey = secR.stdout.trim();

  return { publicKey, secretKey };
}

// ─── Fund via Friendbot ───────────────────────────────────────────────────────
async function fundViaFriendbot(publicKey) {
  console.log(`  💰 Funding ${publicKey.substring(0, 20)}... via Friendbot`);
  const result = await httpGet(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (result.id || result.successful || result.hash) {
    console.log(`     ✅ Funded!`);
  } else if (result.detail && result.detail.toLowerCase().includes('already')) {
    console.log(`     ℹ️  Already funded`);
  } else {
    console.log(`     ℹ️  Response: ${JSON.stringify(result).substring(0, 120)}`);
  }
  await sleep(7000); // wait for ledger close
}

// ─── Invoke register_institution ──────────────────────────────────────────────
function invokeContract(alias, publicKey, metadataHex) {
  console.log(`  🔬 Invoking register_institution...`);

  // stellar contract invoke uses --source-account (or --source) for the signer
  const args = [
    'contract',
    'invoke',
    '--id',
    CONTRACT_ID,
    '--source-account',
    alias,
    '--network',
    NETWORK,
    '--send',
    'yes',
    '--',
    'register_institution',
    '--institution',
    publicKey,
    '--metadata_hash',
    metadataHex,
  ];

  console.log(`  📤 stellar ${args.join(' ')}`);
  const r = run(args);
  console.log(`  stdout: ${r.stdout.substring(0, 400)}`);
  if (r.stderr) console.log(`  stderr: ${r.stderr.substring(0, 400)}`);

  if (r.code !== 0) {
    throw new Error(`invoke failed (code ${r.code}): ${(r.stderr || r.stdout).substring(0, 300)}`);
  }

  // Extract 64-char tx hash from stdout or stderr
  const combined = r.stdout + ' ' + r.stderr;
  const hashMatch = combined.match(/\b([0-9a-fA-F]{64})\b/);
  if (hashMatch) return hashMatch[1].toLowerCase();

  // If exit 0 but no hash, return the raw output as reference
  return r.stdout || 'success';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CertifyChain — 5 Wallet Invocations (stellar CLI v27)');
  console.log('  Contract:', CONTRACT_ID);
  console.log('═══════════════════════════════════════════════════════════\n');

  const verStr = run(['--version']);
  console.log(`  CLI: ${verStr.stdout.split('\n')[0]}\n`);

  const results = [];

  for (let i = 0; i < INSTITUTIONS.length; i++) {
    const inst = INSTITUTIONS[i];
    console.log(`\n─── Wallet ${i + 1} / ${INSTITUTIONS.length} ─────────────────────`);
    console.log(`  🏛️  ${inst.description}`);

    let publicKey = '',
      secretKey = '',
      txHash = null,
      status = 'FAILED',
      error = '';

    try {
      // 1. Generate
      console.log(`  🔑 Generating keypair [${inst.keyAlias}]...`);
      ({ publicKey, secretKey } = generateKeypair(inst.keyAlias));
      console.log(`  🔑 Public Key: ${publicKey}`);

      // 2. Fund
      await fundViaFriendbot(publicKey);

      // 3. Invoke
      const metadataHex = descriptionToHex(inst.description);
      console.log(`  📋 Metadata hash: ${metadataHex}`);
      txHash = invokeContract(inst.keyAlias, publicKey, metadataHex);
      status = 'SUCCESS';
      console.log(`  ✅ TX Hash: ${txHash}`);
    } catch (err) {
      error = err.message.replace(/[\r\n]+/g, ' ').substring(0, 250);
      console.error(`  ❌ Error: ${error}`);
    } finally {
      // Clean up key from CLI store
      run(['keys', 'rm', inst.keyAlias]);
    }

    results.push({
      n: i + 1,
      public_key: publicKey,
      secret_key: secretKey,
      description: inst.description,
      tx_hash: txHash ?? '',
      tx_link:
        txHash && txHash.length === 64
          ? `https://stellar.expert/explorer/testnet/tx/${txHash}`
          : '',
      status,
      error,
    });

    if (i < INSTITUTIONS.length - 1) {
      console.log(`\n  ⏸  Pausing 3s...\n`);
      await sleep(3000);
    }
  }

  // ─── CSV ────────────────────────────────────────────────────────────────────
  const csv = [
    'wallet_number,public_key,description,tx_hash,tx_link,status,error',
    ...results.map(
      (r) =>
        `${r.n},"${r.public_key}","${r.description}","${r.tx_hash}","${r.tx_link}","${r.status}","${r.error}"`,
    ),
  ].join('\n');
  fs.writeFileSync(CSV_PATH, csv, 'utf8');

  // ─── Summary ────────────────────────────────────────────────────────────────
  const ok = results.filter((r) => r.status === 'SUCCESS');
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(
    `  Total: ${results.length}  ✅ Success: ${ok.length}  ❌ Failed: ${results.length - ok.length}`,
  );
  console.log(`  CSV → ${CSV_PATH}\n`);
  results.forEach((r) => {
    const addr = r.public_key ? r.public_key.substring(0, 24) + '...' : 'N/A';
    const hash = r.tx_hash ? r.tx_hash.substring(0, 16) + '...' : 'N/A';
    console.log(`  ${r.status === 'SUCCESS' ? '✅' : '❌'} ${r.n}. ${addr} | ${hash}`);
  });
  if (ok.length) {
    console.log('\n  🔗 Stellar Expert links:');
    ok.forEach((r) => r.tx_link && console.log(`     ${r.tx_link}`));
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
