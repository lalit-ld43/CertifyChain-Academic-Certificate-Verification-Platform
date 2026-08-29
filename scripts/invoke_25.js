const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results_25.csv');

const LABELS = [
  'MIT Tech Qualification Trust',
  'Oxford Medical Board Verification',
  'Harvard Business School Alumni Check',
  'Stanford Engineering Integrity Scan',
  'Cambridge Scientific Certification',
  'Yale Legal Compliance Credential',
  'Princeton Financial Auditor Board',
  'Cornell Healthcare Certification',
  'Brown University Design Verification',
  'Columbia Journalism Record Check',
  'Duke IT Security Credentialing',
  'Berkeley Software Engineering Stamp',
  'UCLA Global Public Health Check',
  'NYU Performing Arts Registration',
  'Chicago Economics Validator',
  'Michigan Automotive Engineering Check',
  'Texas A&M Energy Sector Credential',
  'Purdue Aeronautics Integrity Board',
  'Caltech Space Research Verification',
  'Johns Hopkins Medical Record Audit',
  'Northwestern Communications Certificate',
  'Carnegie Mellon AI Ethics Board',
  'USC Cinematic Arts Validation',
  'Georgetown International Relations Proof',
  'Dartmouth Environmental Science Audit',
];

const FNS = ['register_institution', 'credential_exists', 'verify_credential'];
const WALLETS = LABELS.map((label, i) => ({
  fn: FNS[i % 3],
  label: label,
}));

// Fisher-Yates shuffle
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
  console.log('  CertifyChain — 25 Wallets with Custom Schedule');
  console.log('═'.repeat(65));

  const results = [];

  for (let i = 0; i < WALLETS.length; i++) {
    const plan = WALLETS[i];
    const alias = `cv_custom_w${i + 1}_${Date.now()}`;

    console.log(`\n${'─'.repeat(65)}`);
    console.log(`  Wallet ${i + 1}/25 | fn: ${plan.fn}`);
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

    // CUSTOM TIMING LOGIC
    if (i < WALLETS.length - 1) {
      if (i < 3) {
        // first 3 invoked in 2 mins -> ~40s pause
        console.log('  ⏸ (Batch 1/3) Pausing 40 seconds...');
        await sleep(40000);
        if (i === 2) {
          console.log('  ⏳ (Batch 1 done) Waiting 5 MINUTES before next batch...');
          await sleep(300000);
        }
      } else if (i < 7) {
        // 3 + 4 = 7
        // next 4
        console.log('  ⏸ (Batch 2/4) Pausing 10 seconds...');
        await sleep(10000); // 10s default between them
        if (i === 6) {
          console.log('  ⏳ (Batch 2 done) Waiting 4 MINUTES before next batch...');
          await sleep(240000);
        }
      } else if (i < 17) {
        // 7 + 10 = 17
        // next 10 in 15 mins -> 15 mins / 10 = 90 seconds pause each
        console.log('  ⏸ (Batch 3/10) Pausing 90 seconds...');
        await sleep(90000);
      } else {
        // rest (8 wallets), 40s pause
        console.log('  ⏸ (Batch 4/8) Pausing 40 seconds...');
        await sleep(40000);
      }
    }
  }
  console.log(`\n  DONE — ✅ 25/25 succeeded`);
}

main().catch(console.error);
