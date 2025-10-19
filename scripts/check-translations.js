#!/usr/bin/env node

/**
 * Translation Checker Script
 *
 * ეს სკრიპტი ამოწმებს ყველა თარგმანს და აჩვენებს:
 * - რა key-ები არის ინგლისურში მაგრამ არ არის ქართულსა და რუსულში
 * - სტატისტიკას თითოეული namespace-ისთვის
 * - დეტალურ რეპორტს აკლიელი თარგმანების შესახებ
 */

const fs = require('fs');
const path = require('path');

// ფერების კონფიგურაცია console output-ისთვის
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const translationsDir = path.join(__dirname, '../src/i18n/translations');

// ფუნქცია რომელიც ბრუნავს ობიექტის ყველა key-ს (ნესტირებული ინკლუზიური)
function getAllKeys(obj, prefix = '') {
  let keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      // თუ ობიექტია, რეკურსიულად მივიღოთ მისი key-ები
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      // თუ არ არის ობიექტი, დავამატოთ key
      keys.push(fullKey);
    }
  }

  return keys;
}

// ფუნქცია რომელიც ტვირთავს namespace ფაილს
function loadNamespace(lang, namespace) {
  try {
    const filePath = path.join(translationsDir, lang, `${namespace}.ts`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    // წავიკითხოთ ფაილი
    const content = fs.readFileSync(filePath, 'utf-8');

    // გავაკეთოთ eval რომ მივიღოთ ობიექტი (უსაფრთხო იმიტომ რომ ჩვენივე ფაილებია)
    // წავშალოთ export default და დავაბრუნოთ მხოლოდ ობიექტი
    const objectContent = content
      .replace(/export\s+default\s+/, '')
      .replace(/;?\s*$/, '');

    // eslint-disable-next-line no-eval
    return eval(`(${objectContent})`);
  } catch (error) {
    console.error(`${colors.red}Error loading ${lang}/${namespace}: ${error.message}${colors.reset}`);
    return null;
  }
}

// ფუნქცია რომელიც ტვირთავს index.ts ფაილს
function loadIndexFile(lang) {
  try {
    const filePath = path.join(translationsDir, lang, 'index.ts');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // გავაკეთოთ მარტივი parsing რომ ავიცილოთ თავიდან import-ები და მივიღოთ export default ობიექტი
    const exportMatch = content.match(/export\s+default\s+\{([\s\S]+)\};?\s*$/);

    if (!exportMatch) {
      return null;
    }

    // დავაბრუნოთ ობიექტი
    const objectContent = `{${exportMatch[1]}}`;

    // ეს რთულია, უბრალოდ ვნახოთ inline ობიექტები
    return content;
  } catch (error) {
    console.error(`${colors.red}Error loading ${lang}/index.ts: ${error.message}${colors.reset}`);
    return null;
  }
}

// მთავარი ფუნქცია რომელიც ამოწმებს ყველა namespace-ს
function checkAllTranslations() {
  console.log(`\n${colors.bold}${colors.cyan}==========================================`);
  console.log(`  თარგმანების შემოწმება`);
  console.log(`==========================================${colors.reset}\n`);

  // ავიღოთ ყველა namespace ინგლისური translations საქაღალდიდან
  const enDir = path.join(translationsDir, 'en');
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.ts'));

  const namespaces = files.map(f => f.replace('.ts', '')).filter(n => n !== 'index');

  console.log(`${colors.blue}ნაპოვნია ${namespaces.length} namespace:${colors.reset}`);
  console.log(namespaces.map(n => `  - ${n}`).join('\n'));
  console.log('');

  let totalEnKeys = 0;
  let totalKaMissing = 0;
  let totalRuMissing = 0;

  const report = {};

  // შევამოწმოთ თითოეული namespace
  for (const namespace of namespaces) {
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bold}Namespace: ${namespace}${colors.reset}`);
    console.log('');

    const enData = loadNamespace('en', namespace);
    const kaData = loadNamespace('ka', namespace);
    const ruData = loadNamespace('ru', namespace);

    if (!enData) {
      console.log(`${colors.red}✗ ინგლისური ფაილი ვერ ჩაიტვირთა${colors.reset}\n`);
      continue;
    }

    const enKeys = getAllKeys(enData);
    const kaKeys = kaData ? getAllKeys(kaData) : [];
    const ruKeys = ruData ? getAllKeys(ruData) : [];

    totalEnKeys += enKeys.length;

    const kaMissing = enKeys.filter(key => !kaKeys.includes(key));
    const ruMissing = enKeys.filter(key => !ruKeys.includes(key));

    totalKaMissing += kaMissing.length;
    totalRuMissing += ruMissing.length;

    report[namespace] = {
      total: enKeys.length,
      kaMissing: kaMissing.length,
      ruMissing: ruMissing.length,
      kaMissingKeys: kaMissing,
      ruMissingKeys: ruMissing
    };

    // სტატისტიკა
    console.log(`${colors.cyan}სტატისტიკა:${colors.reset}`);
    console.log(`  ინგლისური keys: ${enKeys.length}`);
    console.log(`  ქართული keys: ${kaKeys.length}`);
    console.log(`  რუსული keys: ${ruKeys.length}`);
    console.log('');

    // ქართული აკლიელი keys
    if (kaMissing.length > 0) {
      console.log(`${colors.red}✗ ქართულად აკლია ${kaMissing.length} key:${colors.reset}`);
      kaMissing.slice(0, 10).forEach(key => {
        console.log(`  ${colors.red}→${colors.reset} ${key}`);
      });
      if (kaMissing.length > 10) {
        console.log(`  ${colors.yellow}... და კიდევ ${kaMissing.length - 10} key${colors.reset}`);
      }
      console.log('');
    } else {
      console.log(`${colors.green}✓ ქართული თარგმანი სრული${colors.reset}\n`);
    }

    // რუსული აკლიელი keys
    if (ruMissing.length > 0) {
      console.log(`${colors.red}✗ რუსულად აკლია ${ruMissing.length} key:${colors.reset}`);
      ruMissing.slice(0, 10).forEach(key => {
        console.log(`  ${colors.red}→${colors.reset} ${key}`);
      });
      if (ruMissing.length > 10) {
        console.log(`  ${colors.yellow}... და კიდევ ${ruMissing.length - 10} key${colors.reset}`);
      }
      console.log('');
    } else {
      console.log(`${colors.green}✓ რუსული თარგმანი სრული${colors.reset}\n`);
    }
  }

  // საერთო რეზიუმე
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}საერთო რეზიუმე${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}სულ ინგლისური keys:${colors.reset} ${totalEnKeys}`);
  console.log(`${colors.red}ქართულად აკლია:${colors.reset} ${totalKaMissing} (${((totalKaMissing / totalEnKeys) * 100).toFixed(1)}%)`);
  console.log(`${colors.red}რუსულად აკლია:${colors.reset} ${totalRuMissing} (${((totalRuMissing / totalEnKeys) * 100).toFixed(1)}%)`);
  console.log('');

  // პროგრესის ბარი
  const kaProgress = Math.round(((totalEnKeys - totalKaMissing) / totalEnKeys) * 100);
  const ruProgress = Math.round(((totalEnKeys - totalRuMissing) / totalEnKeys) * 100);

  console.log(`${colors.green}ქართული პროგრესი: ${'█'.repeat(Math.floor(kaProgress / 2))}${' '.repeat(50 - Math.floor(kaProgress / 2))} ${kaProgress}%${colors.reset}`);
  console.log(`${colors.green}რუსული პროგრესი: ${'█'.repeat(Math.floor(ruProgress / 2))}${' '.repeat(50 - Math.floor(ruProgress / 2))} ${ruProgress}%${colors.reset}`);
  console.log('');

  // დეტალური რეპორტის შენახვა
  const reportPath = path.join(__dirname, '../translation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.green}✓ დეტალური რეპორტი შენახულია: ${reportPath}${colors.reset}`);
  console.log('');

  // დასკვნა
  if (totalKaMissing === 0 && totalRuMissing === 0) {
    console.log(`${colors.bold}${colors.green}🎉 შესანიშნავია! ყველა თარგმანი სრულია!${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.bold}${colors.yellow}⚠️  თარგმანის სამუშაო საჭიროა${colors.reset}\n`);
    return 1;
  }
}

// სკრიპტის გაშვება
if (require.main === module) {
  const exitCode = checkAllTranslations();
  process.exit(exitCode);
}

module.exports = { checkAllTranslations, getAllKeys };
