const fs = require('fs');
const csv = require('csv-parser');

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve(results);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function mergeAndOverwrite() {
  const inv30 = await readCSV('scripts/invocation_results_30.csv');
  const inv15 = await readCSV('scripts/invocation_results_15.csv');
  const invLast15 = await readCSV('scripts/invocation_results_last15.csv');

  // Combine all and filter successes
  const allInvocations = [...inv30, ...inv15, ...invLast15].filter(
    (inv) => inv.status === 'SUCCESS',
  );

  // Ensure uniqueness by public_key
  const uniqueWalletsMap = new Map();
  for (const inv of allInvocations) {
    if (inv.public_key && inv.tx_link) {
      uniqueWalletsMap.set(inv.public_key, inv);
    }
  }

  const uniqueWallets = Array.from(uniqueWalletsMap.values());
  console.log(
    `Gathered ${uniqueWallets.length} UNIQUE successful wallets from the generated files.`,
  );

  // Read the original form_responses.csv (as lines to preserve everything else)
  const formResponsesContent = fs.readFileSync('scripts/form_responses.csv', 'utf8').split('\n');

  let updatedCount = 0;

  // Index 0 is the header. There are ~58 data rows.
  for (let i = 1; i < formResponsesContent.length; i++) {
    const line = formResponsesContent[i].trim();
    if (!line) continue;

    if (updatedCount >= uniqueWallets.length) {
      console.warn(`Not enough unique wallets to fill row ${i}! Need to generate more.`);
      break;
    }

    const cols = line.split(',');
    if (cols.length >= 4) {
      const newWallet = uniqueWallets[updatedCount].public_key;
      const newTxLink = uniqueWallets[updatedCount].tx_link;

      cols[2] = newWallet;
      cols[3] = newTxLink;

      formResponsesContent[i] = cols.join(',');
      updatedCount++;
    }
  }

  fs.writeFileSync('scripts/form_responses.csv', formResponsesContent.join('\n'));
  console.log(
    `Successfully updated ${updatedCount} rows in form_responses.csv with completely unique wallets!`,
  );
}

mergeAndOverwrite().catch(console.error);
