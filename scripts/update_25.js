const fs = require('fs');

function check() {
  let lines = [];
  if (fs.existsSync('scripts/invocation_results_25.csv')) {
    lines = fs
      .readFileSync('scripts/invocation_results_25.csv', 'utf8')
      .split('\n')
      .filter(Boolean);
  }

  if (lines.length >= 26) {
    console.log('Done generating 25 wallets! Updating form_responses.csv...');
    const inv = lines;
    const frm = fs.readFileSync('scripts/form_responses.csv', 'utf8').split('\n');

    let invIdx = 1;
    // Update rows 31 to 55 (index 31 to 55)
    for (let i = 31; i < frm.length && invIdx < inv.length; i++) {
      const c = frm[i].split(',');
      const ic = inv[invIdx].split('","');

      if (c.length >= 4 && ic.length >= 6 && inv[invIdx].includes('SUCCESS')) {
        // Strip out the quotes
        c[2] = ic[3].replace(/"/g, '');
        c[3] = ic[5].replace(/"/g, '');
        frm[i] = c.join(',');
        invIdx++;
      } else if (!inv[invIdx].includes('SUCCESS')) {
        invIdx++;
        i--;
      }
    }
    fs.writeFileSync('scripts/form_responses.csv', frm.join('\n'));
    console.log('Updated form_responses.csv with the 25 new custom-timed wallets successfully!');
  } else {
    console.log(
      'Waiting for 25 wallets to finish... current generated: ' + Math.max(0, lines.length - 1),
    );
    setTimeout(check, 60000);
  }
}

check();
