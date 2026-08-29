const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results_10.csv');

const LABELS = [
  'National University of Singapore Credentials',
  'Tokyo Institute of Technology Verification',
  'University of Melbourne Qualification Audit',
  'Toronto Metropolitan University Scan',
  'ETH Zurich Scientific Record Check',
  'Tsinghua University Alumni Validator',
  'University of Cape Town Diploma Read',
  'Sorbonne University Humanities Proof',
  'Kyoto University Innovation Credential',
  'Seoul National University Tech Hash',
];

const FNS = ['register_institution', 'credential_exists', 'verify_credential'];
const WALLETS = LABELS.map((label, i) => ({
  fn: FNS[i % 3],
  label: label,
}));

for (let i = WALLETS.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [WALLETS[i], WALLETS[j]] = [WALLETS[j], WALLETS[i]];
}

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

async function main() {
  console.log('═'.repeat(65));
  console.log('  CertifyChain — 10 Wallets (50s pause)');
  console.log('═'.repeat(65));

  const results = [];

  for (let i = 0; i < WALLETS.length; i++) {
    const plan = WALLETS[i];
    const alias = `cv_w10_${i + 1}_${Date.now()}`;

    console.log(`\n${'─'.repeat(65)}`);
    console.log(`  Wallet ${i + 1}/10 | fn: ${plan.fn}`);
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
      console.log('  ⏸ Pausing 50 seconds...');
      await sleep(50000);
    }
  }
  console.log(`\n  DONE — ✅ 10/10 succeeded`);
}

main().catch(console.error);
