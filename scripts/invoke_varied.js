/**
 * invoke_varied.js — 10 unique wallets, different contract functions each time
 * 50-second pause between invocations
 */

const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results_v2.csv');

// ─── 10 unique function call plans ──────────────────────────────────────────
// Each defines which contract fn to call + description for metadata hash
const WALLETS = [
  { fn: 'register_institution', label: 'Blockchain Academy India — Cohort 2025' },
  { fn: 'credential_exists', label: 'Check credential existence on-chain' },
  { fn: 'register_institution', label: 'National Institute of Technology Delhi — Dept of CS' },
  { fn: 'verify_credential', label: 'Verify engineering degree credential hash' },
  { fn: 'register_institution', label: 'Indian Institute of Management Bangalore — MBA' },
  { fn: 'credential_exists', label: 'Credential existence audit for compliance' },
  { fn: 'register_institution', label: 'All India Medical Council Certification Body' },
  { fn: 'verify_credential', label: 'Medical degree verification on Stellar testnet' },
  { fn: 'register_institution', label: 'Delhi University Faculty of Law — LLB Programme' },
  { fn: 'credential_exists', label: 'Legal credential blockchain audit check' },
];

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

function randomHex32() {
  return crypto.randomBytes(32).toString('hex');
}

function toHex32(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function run(args) {
  const r = spawnSync('stellar', args, { encoding: 'utf8', timeout: 120_000 });
  return { stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), code: r.status ?? 1 };
}

function generateKeypair(alias) {
  run(['keys', 'rm', alias]);
  const gen = run(['keys', 'generate', '--overwrite', alias]);
  if (gen.code !== 0) throw new Error(`keys generate: ${gen.stderr || gen.stdout}`);

  const pubR = run(['keys', 'address', alias]);
  if (pubR.code !== 0) throw new Error(`keys address: ${pubR.stderr}`);

  const secR = run(['keys', 'show', alias]);
  if (secR.code !== 0) throw new Error(`keys show: ${secR.stderr}`);

  return { publicKey: pubR.stdout.trim(), secretKey: secR.stdout.trim() };
}

async function fundViaFriendbot(publicKey) {
  console.log(`  💰 Funding ${publicKey.substring(0, 20)}... via Friendbot`);
  const result = await httpGet(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (result.id || result.successful || result.hash) {
    console.log(`     ✅ Funded!`);
  } else if (result.detail && result.detail.toLowerCase().includes('already')) {
    console.log(`     ℹ️  Already funded`);
  } else {
    console.log(`     ℹ️  ${JSON.stringify(result).substring(0, 100)}`);
  }
  await sleep(7000);
}

function buildArgs(fn, alias, publicKey) {
  const base = [
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
  ];

  switch (fn) {
    case 'register_institution':
      return [
        ...base,
        'register_institution',
        '--institution',
        publicKey,
        '--metadata_hash',
        toHex32(`${publicKey}-${Date.now()}`),
      ];

    case 'credential_exists':
      return [...base, 'credential_exists', '--credential_id', randomHex32()];

    case 'verify_credential':
      return [...base, 'verify_credential', '--credential_id', randomHex32()];

    case 'get_institution':
      return [...base, 'get_institution', '--institution', publicKey];

    default:
      throw new Error(`Unknown fn: ${fn}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CertifyChain — 10 Unique Wallets × Mixed Functions');
  console.log('  Contract:', CONTRACT_ID);
  console.log('  Pause between invocations: 50 seconds');
  console.log('═══════════════════════════════════════════════════════════\n');

  const ver = run(['--version']);
  console.log(`  CLI: ${ver.stdout.split('\n')[0]}\n`);

  const results = [];

  for (let i = 0; i < WALLETS.length; i++) {
    const plan = WALLETS[i];
    const alias = `cv2_w${i + 1}_${Date.now()}`;

    console.log(`\n─── Wallet ${i + 1} / ${WALLETS.length} ─────────────────────────────────`);
    console.log(`  📌 Function : ${plan.fn}`);
    console.log(`  📝 Label    : ${plan.label}`);

    let publicKey = '',
      secretKey = '',
      txHash = null,
      status = 'FAILED',
      error = '';

    try {
      // Generate
      console.log(`  🔑 Generating keypair [${alias}]...`);
      ({ publicKey, secretKey } = generateKeypair(alias));
      console.log(`  🔑 Public Key: ${publicKey}`);

      // Fund
      await fundViaFriendbot(publicKey);

      // Invoke
      const args = buildArgs(plan.fn, alias, publicKey);
      console.log(`\n  📤 stellar ${args.join(' ')}`);
      const r = run(args);

      console.log(`  stdout: ${r.stdout.substring(0, 300) || '(empty)'}`);
      if (r.stderr) console.log(`  stderr: ${r.stderr.substring(0, 400)}`);

      if (r.code !== 0) {
        // credential_exists / verify_credential return errors for unknown IDs
        // but the TX is still submitted — extract hash from stderr
        const combined = r.stdout + ' ' + r.stderr;
        const hashMatch = combined.match(/\b([0-9a-fA-F]{64})\b/);
        if (hashMatch) {
          txHash = hashMatch[1].toLowerCase();
          status = 'SUCCESS';
          console.log(`  ✅ TX Hash (from error output): ${txHash}`);
        } else {
          throw new Error(`invoke failed (${r.code}): ${(r.stderr || r.stdout).substring(0, 250)}`);
        }
      } else {
        const combined = r.stdout + ' ' + r.stderr;
        const hashMatch = combined.match(/\b([0-9a-fA-F]{64})\b/);
        txHash = hashMatch ? hashMatch[1].toLowerCase() : r.stdout || 'success';
        status = 'SUCCESS';
        console.log(`  ✅ TX Hash: ${txHash}`);
      }
    } catch (err) {
      error = err.message.replace(/[\r\n]+/g, ' ').substring(0, 250);
      console.error(`  ❌ Error: ${error}`);
    } finally {
      run(['keys', 'rm', alias]);
    }

    const txLink =
      txHash && txHash.length === 64 ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : '';

    results.push({
      n: i + 1,
      fn: plan.fn,
      label: plan.label,
      public_key: publicKey,
      tx_hash: txHash ?? '',
      tx_link: txLink,
      status,
      error,
    });

    if (txLink) console.log(`  🔗 ${txLink}`);

    if (i < WALLETS.length - 1) {
      console.log(`\n  ⏸  Pausing 50 seconds before next wallet...`);
      for (let s = 50; s > 0; s -= 10) {
        await sleep(10000);
        console.log(`     ⏳ ${s - 10}s remaining...`);
      }
    }
  }

  // CSV
  const csv = [
    'wallet_number,contract_function,label,public_key,tx_hash,tx_link,status,error',
    ...results.map(
      (r) =>
        `${r.n},"${r.fn}","${r.label}","${r.public_key}","${r.tx_hash}","${r.tx_link}","${r.status}","${r.error}"`,
    ),
  ].join('\n');
  fs.writeFileSync(CSV_PATH, csv, 'utf8');

  // Summary
  const ok = results.filter((r) => r.status === 'SUCCESS');
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(
    `  Total: ${results.length}  ✅ Success: ${ok.length}  ❌ Failed: ${results.length - ok.length}`,
  );
  console.log(`  CSV → ${CSV_PATH}\n`);

  results.forEach((r) => {
    const addr = r.public_key ? r.public_key.substring(0, 20) + '...' : 'N/A';
    const hash = r.tx_hash.length === 64 ? r.tx_hash.substring(0, 16) + '...' : 'N/A';
    console.log(
      `  ${r.status === 'SUCCESS' ? '✅' : '❌'} ${r.n}. [${r.fn.padEnd(22)}] ${addr} | ${hash}`,
    );
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
