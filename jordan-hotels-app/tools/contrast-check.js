const fs = require('fs');
const path = require('path');

function collectFiles(dir, exts = ['.js', '.jsx', '.css', '.html', '.ts', '.tsx']){
  const res = [];
  const list = fs.readdirSync(dir);
  for(const f of list){
    const p = path.join(dir,f);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) res.push(...collectFiles(p, exts));
    else if(exts.includes(path.extname(p))) res.push(p);
  }
  return res;
}

function extractHexes(text){
  const re = /#([0-9a-fA-F]{3,8})\b/g;
  const set = new Set();
  let m;
  while((m = re.exec(text))){
    const hex = m[0];
    // normalize 3->6
    let h = hex.slice(1);
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    if(h.length===6) set.add('#'+h.toLowerCase());
    if(h.length===8) set.add('#'+h.slice(0,6).toLowerCase());
  }
  return Array.from(set);
}

function hexToRgb(hex){
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function srgbToLin(c){
  const s = c/255;
  return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4);
}

function luminance(hex){
  const [r,g,b] = hexToRgb(hex);
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function contrast(hex1, hex2){
  const L1 = luminance(hex1);
  const L2 = luminance(hex2);
  const lighter = Math.max(L1,L2);
  const darker = Math.min(L1,L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// gather files
const root = path.resolve(__dirname, '..');
const files = [path.join(root, 'tailwind.config.js')];
try{ files.push(...collectFiles(path.join(root,'src'))); }catch(e){}

const hexes = new Set();
for(const f of files){
  try{
    const text = fs.readFileSync(f,'utf8');
    extractHexes(text).forEach(h=>hexes.add(h));
  }catch(e){}
}

const colors = Array.from(hexes).sort();
if(colors.length===0){
  console.log('No hex colors found to check.');
  process.exit(0);
}

const targets = {
  white: '#ffffff',
  black: '#000000',
  cream: '#f9f7f2',
  'cream-dark': '#2a2a2a'
};

console.log('Contrast report for discovered colors against common backgrounds:\n');
console.log('| Color | Against | Contrast | Pass AA (normal) | Pass AA (large) |');
console.log('|---|---:|---:|---:|---:|');
for(const c of colors){
  for(const [name, tgt] of Object.entries(targets)){
    const cr = contrast(c, tgt);
    const passNormal = cr>=4.5 ? 'YES' : 'no';
    const passLarge = cr>=3.0 ? 'YES' : 'no';
    console.log(`| ${c} | ${name} | ${cr.toFixed(2)} | ${passNormal} | ${passLarge} |`);
  }
}

console.log('\nSummary: Colors with contrast <4.5 against both white and black should be reviewed.');
