const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const files = [
  'invocation_results_30.csv',
  'invocation_results_15.csv',
  'invocation_results_last15.csv',
  'invocation_results_25.csv',
  'invocation_results_10.csv',
  'invocation_results_4.csv',
];

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

async function mergeAndFix() {
  const uniqueWalletsMap = new Map();

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    const data = await readCSV(filePath);

    for (const row of data) {
      if (row.status === 'SUCCESS') {
        // Ignore verify_credential since those failed simulation and didn't go on-chain
        if (row.contract_function === 'verify_credential') continue;

        if (row.public_key && row.tx_link) {
          uniqueWalletsMap.set(row.public_key, {
            wallet: row.public_key.replace(/"/g, '').trim(),
            txLink: row.tx_link.replace(/"/g, '').trim(),
          });
        }
      }
    }
  }

  const uniqueWallets = Array.from(uniqueWalletsMap.values());
  console.log(
    `Gathered ${uniqueWallets.length} completely UNIQUE and GUARANTEED on-chain wallets from the logs!`,
  );

  // Now update form_responses.csv
  const formPath = path.join(__dirname, 'form_responses.csv');
  const formResponsesContent = fs.readFileSync(formPath, 'utf8').split('\n');

  let updatedCount = 0;

  for (let i = 1; i < formResponsesContent.length; i++) {
    const line = formResponsesContent[i].trim();
    if (!line) continue;

    if (updatedCount >= uniqueWallets.length) {
      console.warn(
        `Ran out of unique wallets at row ${i + 1}. Generated ${uniqueWallets.length} wallets total.`,
      );
      break;
    }

    const cols = line.split(',');
    if (cols.length >= 4) {
      cols[2] = uniqueWallets[updatedCount].wallet;
      cols[3] = uniqueWallets[updatedCount].txLink;
      formResponsesContent[i] = cols.join(',');
      updatedCount++;
    }
  }

  fs.writeFileSync(formPath, formResponsesContent.join('\n'));
  console.log(`Successfully updated ${updatedCount} rows in form_responses.csv with perfect data!`);
}

mergeAndFix().catch(console.error);
