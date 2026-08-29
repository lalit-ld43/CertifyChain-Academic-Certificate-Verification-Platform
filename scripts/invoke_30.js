/**
 * invoke_30_interleaved.js
 * 30 wallets with ALTERNATING functions from wallet 1:
 *   register_institution → credential_exists → verify_credential → repeat
 * 50-second pause between each. CSV saved after every wallet.
 */

const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results_30.csv');
const PAUSE_MS = 50_000;

// ─── Labels for each function type ───────────────────────────────────────────
const REG_LABELS = [
  'IIT Delhi Computer Science Department',
  'IIM Ahmedabad MBA Certification Body',
  'NIT Trichy Engineering Faculty Board',
  'All India Medical Council Licensing Authority',
  'Delhi University Faculty of Law LLB',
  'IIT Bombay Electrical Engineering Division',
  'BITS Pilani Distance Learning Authority',
  'Amity University Noida Skill Centre',
  'Anna University Chennai Engineering Board',
  'Symbiosis Pune Management Institute',
];

const EXIST_LABELS = [
  'Credential existence audit check batch A',
  'On-chain verification compliance run B',
  'Blockchain presence check for HR audit C',
  'Student records existence verification D',
  'Alumni credential on-chain audit scan E',
  'Compliance credential hash lookup run F',
  'Automated credential presence check G',
  'Regulatory audit credential existence H',
  'Employer-requested credential audit run I',
  'Institutional batch existence check J',
];

const VERIFY_LABELS = [
  'Engineering degree tamper-proof verify check',
  'Medical license on-chain integrity query',
  'MBA certificate Stellar verification run',
  'Law degree immutable record query check',
  'Data science certification blockchain verify',
  'Pharmacy degree credential validity check',
  'Architecture license blockchain query run',
  'Finance cert on-chain verification attempt',
  'Nursing credentials Soroban query check',
  'IT certification immutability verify scan',
];

// Build 30-wallet RANDOMLY shuffled plan
const ALL_PLANS = [
  ...REG_LABELS.map((l) => ({ fn: 'register_institution', label: l })),
  ...EXIST_LABELS.map((l) => ({ fn: 'credential_exists', label: l })),
  ...VERIFY_LABELS.map((l) => ({ fn: 'verify_credential', label: l })),
];
// Fisher-Yates shuffle
for (let i = ALL_PLANS.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [ALL_PLANS[i], ALL_PLANS[j]] = [ALL_PLANS[j], ALL_PLANS[i]];
}
const WALLETS = ALL_PLANS.slice(0, 30);

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
  return crypto
    .createHash('sha256')
    .update(str + Date.now() + Math.random())
    .digest('hex');
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
  return { publicKey: pubR.stdout.trim() };
}

async function fundViaFriendbot(publicKey) {
  console.log(`  💰 Funding ${publicKey.substring(0, 20)}...`);
  const r = await httpGet(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (r.id || r.successful || r.hash) console.log(`     ✅ Funded!`);
  else console.log(`     ℹ️  ${JSON.stringify(r).substring(0, 80)}`);
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
        toHex32(publicKey),
      ];
    case 'credential_exists':
      return [...base, 'credential_exists', '--credential_id', randomHex32()];
    case 'verify_credential':
      return [...base, 'verify_credential', '--credential_id', randomHex32()];
  }
}

function extractHash(stdout, stderr) {
  const m = (stdout + ' ' + stderr).match(/\b([0-9a-fA-F]{64})\b/);
  return m ? m[1].toLowerCase() : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═'.repeat(65));
  console.log('  CertifyChain — 30 Wallets INTERLEAVED (reg / exists / verify)');
  console.log(`  Pattern: wallet 1=register, 2=credential_exists, 3=verify_credential, repeat`);
  console.log(`  Pause: 50s between each`);
  console.log('═'.repeat(65));
  console.log(`\n  CLI: ${run(['--version']).stdout.split('\n')[0]}\n`);

  // Show the plan
  console.log('  PLAN:');
  WALLETS.forEach((w, i) =>
    console.log(
      `    ${String(i + 1).padStart(2)}. [${w.fn.substring(0, 22).padEnd(22)}] ${w.label}`,
    ),
  );
  console.log('');

  const results = [];

  for (let i = 0; i < WALLETS.length; i++) {
    const plan = WALLETS[i];
    const alias = `cv_il_w${i + 1}_${Date.now()}`;

    console.log(`\n${'─'.repeat(65)}`);
    console.log(`  Wallet ${i + 1}/30 | fn: ${plan.fn}`);
    console.log(`  Label: ${plan.label}`);

    let publicKey = '',
      txHash = null,
      status = 'FAILED',
      error = '';

    try {
      ({ publicKey } = generateKeypair(alias));
      console.log(`  🔑 ${publicKey}`);

      await fundViaFriendbot(publicKey);

      const args = buildArgs(plan.fn, alias, publicKey);
      console.log(`  📤 stellar ... ${args.slice(-4).join(' ')}`);
      const r = run(args);

      console.log(`  stdout: ${r.stdout.substring(0, 150) || '(empty)'}`);
      if (r.stderr) console.log(`  stderr: ${r.stderr.substring(0, 300)}`);

      txHash = extractHash(r.stdout, r.stderr);
      if (txHash) {
        status = 'SUCCESS';
        console.log(`  ✅ ${txHash}`);
        console.log(`  🔗 https://stellar.expert/explorer/testnet/tx/${txHash}`);
      } else if (r.code === 0) {
        txHash = r.stdout || 'ok';
        status = 'SUCCESS';
      } else {
        throw new Error(`code=${r.code}: ${(r.stderr || r.stdout).substring(0, 200)}`);
      }
    } catch (err) {
      error = err.message.replace(/[\r\n]+/g, ' ').substring(0, 250);
      console.error(`  ❌ ${error}`);
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

    // Save CSV after every wallet
    fs.writeFileSync(
      CSV_PATH,
      [
        'wallet_number,contract_function,label,public_key,tx_hash,tx_link,status',
        ...results.map(
          (r) =>
            `${r.n},"${r.fn}","${r.label}","${r.public_key}","${r.tx_hash}","${r.tx_link}","${r.status}"`,
        ),
      ].join('\n'),
      'utf8',
    );

    if (i < WALLETS.length - 1) {
      console.log(`\n  ⏸ 50s pause...`);
      await sleep(10000);
      console.log(`     40s`);
      await sleep(10000);
      console.log(`     30s`);
      await sleep(10000);
      console.log(`     20s`);
      await sleep(10000);
      console.log(`     10s`);
      await sleep(10000);
      console.log(`     ✅ next wallet`);
    }
  }

  const ok = results.filter((r) => r.status === 'SUCCESS');
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`  DONE — ✅ ${ok.length} / ${results.length} succeeded`);
  console.log(`  CSV → ${CSV_PATH}`);
  const fnCount = {};
  results.forEach((r) => (fnCount[r.fn] = (fnCount[r.fn] || 0) + 1));
  Object.entries(fnCount).forEach(([fn, c]) => console.log(`    ${fn}: ${c}`));
  ok.filter((r) => r.tx_link).forEach((r) => console.log(`  🔗 ${r.tx_link}`));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
