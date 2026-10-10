// Pulls the past-question papers that the first extraction missed (they use other layouts)
// out of the old hub files. Needs playwright. Output: ../extracted_questions/extra_past.json
// usage: node extract_past.js   (run from anywhere; paths below point at the old hub copy)
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const HUB='/home/claude/hub/grate-apex-hub-main';
const blobs=(file)=>{const h=fs.readFileSync(file,'utf8');const o={};for(const m of h.matchAll(/([A-Z0-9_]+_B64)\s*=\s*['"]([A-Za-z0-9+/=]+)['"]/g))o[m[1]]=m[2];return o;};
const dec=(b)=>Buffer.from(b,'base64').toString('utf8');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const out={biochemistry:[],anatomy:[]};
const page=async(html)=>{const p=await b.newPage();await p.route('**/*',r=>r.abort());await p.setContent(html,{waitUntil:'domcontentloaded'});return p;};
// Biochemistry: Past Questions 01-03 (three kinds of question in one paper)
const bio=blobs(`${HUB}/hubs/biochemistry.html`);
for(const [k,name] of [['QUIZ8A_HTML_B64','Past Questions 1'],['QUIZ8B_HTML_B64','Past Questions 2'],['QUIZ8C_HTML_B64','Past Questions 3']]){
  const p=await page(dec(bio[k]));
  const qs=await p.evaluate(()=>{
    const r=[];
    mcq.forEach(x=>r.push({q:x.q,options:x.o.map(o=>({text:o.t})),correct:x.c,explanation:x.e}));
    ar.forEach(x=>r.push({assertion:x.s1,reason:x.s2,options:AR_CODE.map(o=>({text:o.t})),correct:x.c,explanation:x.e}));
    mcomp.forEach(x=>{const opts=x.code===5?code5Options():code3Options();r.push({stem:x.stem,items:x.items,options:opts.map(o=>({text:o.t})),correct:x.c,explanation:x.e});});
    return r;});
  out.biochemistry.push({name,blob:k,questions:qs}); console.log('bio',name,qs.length); await p.close();
}
// Anatomy: Past Questions 01-04
for(const n of [1,2,3,4]){
  const f=`${HUB}/hubs/data/anatomy/PASTQ0${n}_B64.txt`;
  const p=await page(dec(fs.readFileSync(f,'utf8').trim()));
  const qs=await p.evaluate(()=>{
    const r=[];const add=(x)=>{if(x.fig||!x.o||!x.a)return;r.push({q:x.q,options:x.o,correct:x.a,explanation:x.e});};
    DATA.forEach(g=>{
      if(g.type==='tf'&&g.qs){g.qs.forEach(x=>r.push({q:x.q,options:['True','False'],correctIndex:x.a==='T'?0:1,explanation:x.e||''}));}
      else if(g.type==='match'&&g.items){const ks=Object.keys(g.legend).sort();g.items.forEach(x=>r.push({q:'Match to the correct term: '+x.q,options:ks.map(k=>g.legend[k]),correctIndex:ks.indexOf(x.a),explanation:x.e||''}));}
      else if(g.qs){if(g.type==='mcq')g.qs.forEach(add);}else add(g);});
    return r;});
  out.anatomy.push({name:`Past Questions ${n}`,blob:`PASTQ0${n}_B64`,questions:qs}); console.log('anatomy',n,qs.length); await p.close();
}
fs.writeFileSync(path.join(HUB,'extracted_questions','extra_past.json'),JSON.stringify(out));
await b.close();})();
