/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const os = require('os');
const ts = require('typescript');
const Module = require('module');

const root = process.cwd();
const envRaw = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const getEnv = (k) => {
  const m = envRaw.match(new RegExp('^' + k + '\\s*=\\s*(.+)$', 'm'));
  return m ? m[1].trim() : undefined;
};

process.env.NEXT_PUBLIC_SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'healpoint-supabase-'));
console.log('tempDir', tempDir);

for (const rel of ['lib/data/supabase-client.ts', 'lib/data/mock-data.ts']) {
  const abs = path.join(root, rel);
  const source = fs.readFileSync(abs, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText;
  const outPath = path.join(tempDir, path.basename(rel).replace(/\.ts$/, '') + '.js');
  fs.writeFileSync(outPath, output);
  console.log('wrote', outPath);
}

console.log('files', fs.readdirSync(tempDir));

const mockDataPath = path.join(tempDir, 'mock-data.js');
const m = new Module(mockDataPath, module);
m.filename = mockDataPath;
m.paths = Module._nodeModulePaths(tempDir);
m._compile(fs.readFileSync(mockDataPath, 'utf8'), mockDataPath);

(async () => {
  try {
    const rows = await m.exports.getDoctors();
    console.log('getDoctors result:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('getDoctors error:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
