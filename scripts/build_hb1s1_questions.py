import json,re,html,collections,glob
def clean(s):
    if s is None: return ""
    s=str(s)
    s=re.sub(r"<br\s*/?>","\n",s,flags=re.I); s=re.sub(r"<[^>]+>","",s); s=html.unescape(s)
    s=re.sub(r"[ \t]+"," ",s); s=re.sub(r"\n\s*\n+","\n",s); return s.strip()
NAMES={"biolchem":"Biological Chemistry","medgen":"Basic Medical Genetics","compapp":"Computer Appreciation","algebra":"Algebra","stats":"Statistical Methods","commskills":"Communication Skills","bmc":"Basic Medical Chemistry","cellstruct":"Cell Structure"}
data=json.load(open('allq.json'))
def norm(x):
    if x.get("type") not in (None,"mc"): return None,"type:"+str(x.get("type"))
    o=x.get("o")
    if not isinstance(o,list) or len(o)<2: return None,"noopts"
    opts=[clean(i) for i in o]
    a=x.get("a")
    if not isinstance(a,int) or isinstance(a,bool) or not 0<=a<len(opts): return None,"badanswer"
    q=clean(x.get("q"))
    if not q or any(not i for i in opts): return None,"empty"
    if x.get("fig") or x.get("image_svg") or x.get("img"): return None,"image"
    return {"q":q,"o":opts,"a":a,"e":clean(x.get("e") or x.get("explain") or ""),"t":clean(x.get("s") or "")},None
lessons={}
for f in glob.glob('out/lessons/*.json')+glob.glob('out_mg/lessons/*.json'):
    L=json.load(open(f)); lessons[L['meta']['id']]=L['meta']['title']
report={}
for cid,name in NAMES.items():
    d=data[cid]; sets=[]; seen={}; skipped=collections.Counter()
    nles=len([k for k in lessons if k.startswith(cid+"-")])
    quizzes=sorted(d["quiz"].items(),key=lambda kv:int(re.search(r"(\d+)",kv[0]).group(1)))
    for i,(k,qs) in enumerate(quizzes,1):
        out=[]
        for x in qs or []:
            n,why=norm(x)
            if why: skipped[why]+=1; continue
            key=(n["q"],tuple(n["o"]))
            if key in seen: skipped["dup"]+=1; continue
            seen[key]=n; out.append(n)
        if out:
            nm=f"Quiz {i}"
            if len(quizzes)==nles and f"{cid}-{i:02d}" in lessons: nm=f"Quiz {i} · {lessons[f'{cid}-{i:02d}']}"
            sets.append({"id":f"s{len(sets)+1}","name":nm,"questions":out})
    past=[]; guide=[]
    for x in d["practice"] or []:
        if x.get("src") not in ("past","guide"): continue
        n,why=norm(x)
        if why: skipped[why]+=1; continue
        key=(n["q"],tuple(n["o"]))
        if key in seen: skipped["dup"]+=1; continue
        seen[key]=n; (past if x.get("src")=="past" else guide).append(n)
    if guide: sets.append({"id":f"s{len(sets)+1}","name":"Guide Review Quiz","questions":guide})
    # extra pastq page (biolchem): anything not already there
    for x in d["pastq"] or []:
        n,why=norm(x)
        if why: skipped[why]+=1; continue
        key=(n["q"],tuple(n["o"]))
        if key in seen: continue
        seen[key]=n; past.append(n)
    if cid=="medgen":
        by=collections.OrderedDict()
        for n in past: by.setdefault(n["t"] or "Mixed",[]).append(n)
        for t,qs in by.items():
            label=f"Past Questions · {t}"
            for n in qs: n["p"]=[label]
            sets.append({"id":f"s{len(sets)+1}","name":label,"questions":qs})
    else:
        for j in range(0,len(past),60):
            chunk=past[j:j+60]; label=f"Past Questions {j//60+1}"
            for n in chunk: n["p"]=[label]
            sets.append({"id":f"s{len(sets)+1}","name":label,"questions":chunk})
    json.dump({"id":cid,"name":name,"sets":sets},open(f"courses_{cid}.json","w"),ensure_ascii=False,separators=(",",":"))
    report[cid]=(sum(len(s['questions']) for s in sets),len(sets),dict(skipped))
for k,v in report.items(): print(k,v)
