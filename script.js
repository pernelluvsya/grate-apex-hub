(function(){
  "use strict";
  var HUBS = ["biochemistry","physiology","anatomy","behavioural","entomology"];
  var META = {
    biochemistry:{name:"Biochemistry",icon:"🧪",desc:"Metabolism, enzymes, and the pathways that keep cells running."},
    physiology:{name:"Physiology",icon:"🫀",desc:"How the body's systems work, from single cells to whole organs."},
    anatomy:{name:"Anatomy",icon:"🩻",desc:"Structures, regions, and how the body is put together."},
    behavioural:{name:"Behavioural Science",icon:"🧠",desc:"Psychology, behaviour, and the mind behind medicine."},
    entomology:{name:"Entomology",icon:"🦟",desc:"Insects, vectors, and the essentials of medical entomology."}
  };
  var WEEK_GOAL = 150, MASTER_ANS = 80, MASTER_ACC = 70;
  var EXAM_DATE = "2026-08-17"; // update this each exam cycle
  var SPRINT_START_DATE = "2026-05-23"; // fixed start of the exam sprint countdown
  var RANKS = [[0,"Fresher"],[3,"Riser"],[6,"Scholar"],[10,"Sharp"],[16,"Elite"],[25,"Apex Scholar"],[40,"Apex"]];
  var BADGES = [
    {id:"first",e:"👣",t:"First Steps",d:"Answer 1 question"},
    {id:"dedicated",e:"📆",t:"Dedicated",d:"3-day streak"},
    {id:"onfire",e:"🔥",t:"On Fire",d:"7-day streak"},
    {id:"century",e:"💯",t:"Century",d:"100 answered"},
    {id:"grinder",e:"⚙️",t:"Grinder",d:"500 answered"},
    {id:"perfect",e:"🎯",t:"Flawless",d:"100% on a quiz"},
    {id:"sharp",e:"🎓",t:"Sharpshooter",d:"90%+ on a quiz"},
    {id:"explorer",e:"🧭",t:"Explorer",d:"Open all 5 hubs"},
    {id:"weekly",e:"🏆",t:"Challenger",d:"Beat a weekly goal"},
    {id:"nightowl",e:"🦉",t:"Night Owl",d:"Study after midnight"},
    {id:"earlybird",e:"🐦",t:"Early Bird",d:"Study before 6am"},
    {id:"master",e:"👑",t:"Subject Master",d:"Master any subject"},
    {id:"quiz10",e:"📚",t:"Bookworm",d:"Finish 10 quizzes"},
    {id:"quiz25",e:"🎬",t:"Quiz Machine",d:"Finish 25 quizzes"},
    {id:"streak14",e:"🗓️",t:"Fortnight",d:"14-day streak"},
    {id:"streak30",e:"💎",t:"Unbreakable",d:"30-day streak"},
    {id:"marathon",e:"🏃",t:"Marathoner",d:"1000 answered"},
    {id:"perfect5",e:"✨",t:"Perfectionist",d:"5 perfect quizzes"},
    {id:"lvl5",e:"⭐",t:"Rising Star",d:"Reach Level 5"},
    {id:"lvl10",e:"🌟",t:"High Flyer",d:"Reach Level 10"},
    {id:"apex",e:"🦅",t:"Apex Reached",d:"Hit the Apex rank"},
    {id:"wellrounded",e:"🌍",t:"Well Rounded",d:"Answer in all 5 subjects"},
    {id:"grandmaster",e:"🎖️",t:"Grand Master",d:"Master all 5 subjects"},
    {id:"weekgrind",e:"🔋",t:"Weekly Grinder",d:"300 answered in a week"},
    {id:"sprint30",e:"🏁",t:"Halfway Hero",d:"Reach day 30 of your sprint"},
    {id:"weekend",e:"🌤️",t:"Weekend Warrior",d:"Study on a weekend"}
  ];

  function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function weekStartStr(){ var d=new Date(); var day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }

  var KEY="gaHubProgress_v2", mem=null;
  function blank(){ var s={}; HUBS.forEach(function(k){ s[k]={answered:0,correct:0,quizzes:0,opens:0,best:0,topics:{}}; });
    return {v:2,subjects:s,xp:0,days:{},badges:{},leaderboard:[],lastHub:null,theme:"light",weekStart:weekStartStr(),weekAns:0,perfects:0,startDate:todayStr(),profile:{name:"",focus:"",goal:""},mascotHidden:false}; }
  function load(){ if(mem) return mem; try{ var r=localStorage.getItem(KEY); mem=r?JSON.parse(r):blank(); }catch(e){ mem=blank(); }
    // migrate/guard
    if(!mem.subjects) mem=blank();
    HUBS.forEach(function(k){ if(!mem.subjects[k]) mem.subjects[k]={answered:0,correct:0,quizzes:0,opens:0,best:0,topics:{}}; });
    if(mem.weekStart!==weekStartStr()){ mem.weekStart=weekStartStr(); mem.weekAns=0; }
    if(!mem.startDate) mem.startDate=todayStr();
    if(!mem.profile) mem.profile={name:"",focus:"",goal:""};
    if(typeof mem.perfects!=="number") mem.perfects=0;
    return mem; }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(mem)); }catch(e){} }

  /* ================================================================
     Google sign-in (Firebase Auth) + progress sync (Firestore)
     ----------------------------------------------------------------
     See firebase-init.js for one-time setup (create a Firebase project,
     enable Google as a sign-in provider, turn on Firestore, publish the
     security rules). This file just calls the small API that module
     exposes on window.GAFirebase — it doesn't talk to Google directly.
     ================================================================ */
  var SYNC_MODE_KEY = "gaHubSyncMode";
  var gUser=null, gSyncTimer=null;

  /* sync mode: "local" (never touch the cloud), "cloud" (cloud is the
     source of truth — asks before overwriting either side), or "hybrid"
     (auto-merges progress across devices, keeping the further-along side
     of each subject instead of discarding one wholesale). Defaults to
     hybrid — the safest choice for anyone who might use more than one
     device. */
  function getSyncMode(){ try{ return localStorage.getItem(SYNC_MODE_KEY) || "hybrid"; }catch(e){ return "hybrid"; } }
  function setSyncMode(m){ try{ localStorage.setItem(SYNC_MODE_KEY, m); }catch(e){} }

  function mergeProgress(a, b){
    var out = blank();
    HUBS.forEach(function(k){
      var sa=a.subjects[k], sb=b.subjects[k];
      out.subjects[k] = (sa.answered >= sb.answered) ? sa : sb;
    });
    out.xp = Math.max(a.xp||0, b.xp||0);
    out.badges = {};
    var badgeIds={};
    Object.keys(a.badges||{}).forEach(function(id){ badgeIds[id]=1; });
    Object.keys(b.badges||{}).forEach(function(id){ badgeIds[id]=1; });
    Object.keys(badgeIds).forEach(function(id){
      var ta=(a.badges||{})[id], tb=(b.badges||{})[id];
      out.badges[id] = (ta && tb) ? Math.min(ta,tb) : (ta || tb);
    });
    out.days = {};
    var dayKeys={};
    Object.keys(a.days||{}).forEach(function(dk){ dayKeys[dk]=1; });
    Object.keys(b.days||{}).forEach(function(dk){ dayKeys[dk]=1; });
    Object.keys(dayKeys).forEach(function(dk){ out.days[dk]=Math.max((a.days||{})[dk]||0,(b.days||{})[dk]||0); });
    if(a.weekStart===b.weekStart){ out.weekStart=a.weekStart; out.weekAns=Math.max(a.weekAns||0,b.weekAns||0); }
    else { var newer=(a.weekStart>b.weekStart)?a:b; out.weekStart=newer.weekStart; out.weekAns=newer.weekAns||0; }
    var lb=(a.leaderboard||[]).concat(b.leaderboard||[]);
    var seen={}, dedup=[];
    lb.forEach(function(x){ var key=x.subject+"|"+x.ts+"|"+x.correct+"|"+x.total; if(!seen[key]){ seen[key]=1; dedup.push(x); } });
    dedup.sort(function(x,y){ return y.pct-x.pct || y.correct-x.correct; });
    out.leaderboard = dedup.slice(0,25);
    out.lastHub = a.lastHub || b.lastHub || null;
    out.theme = a.theme || b.theme || "light";
    out.perfects = Math.max(a.perfects||0, b.perfects||0);
    out.startDate = (a.startDate && b.startDate) ? (a.startDate < b.startDate ? a.startDate : b.startDate) : (a.startDate || b.startDate || todayStr());
    out.profile = (a.profile && a.profile.name) ? a.profile : (b.profile && b.profile.name ? b.profile : (a.profile || b.profile));
    out.mascotHidden = !!a.mascotHidden;
    out.goldenCelebrated = !!(a.goldenCelebrated || b.goldenCelebrated);
    out.updatedAt = Date.now();
    return out;
  }

  function cloudConnected(){ return !!gUser; }

  function setGoogleBtn(state){
    var b=document.getElementById("googleBtn"); if(!b) return;
    if(state==="signedin" && gUser){
      b.innerHTML = gUser.picture ? '<img src="'+gUser.picture+'" alt="" style="width:22px;height:22px;border-radius:50%;display:block">' : "☁️✅";
      b.title = "Synced as "+(gUser.email||"your Google account")+" — click to sign out";
    } else if(state==="connecting"){
      b.innerHTML="⏳"; b.title="Connecting to Google…";
    } else {
      b.innerHTML="☁️"; b.title="Sign in with Google to back up your progress";
    }
  }

  function googleSignIn(){
    if(!window.GAFirebase || !window.GAFirebase.configured){ toast("Google sign-in isn't configured yet."); return; }
    setGoogleBtn("connecting");
    window.GAFirebase.signIn().catch(function(err){
      console.warn("Sign-in failed:", err);
      setGoogleBtn(gUser ? "signedin" : "signedout");
      if(err && err.code==="auth/popup-closed-by-user") return; // they just cancelled — no need to toast
      toast("Google sign-in didn't complete.");
    });
    // success is handled by the onAuthChange listener below, which fires
    // automatically once Firebase confirms the new session
  }

  function googleSignOut(){
    if(window.GAFirebase) window.GAFirebase.signOutUser();
    toast("Signed out of Google — your progress stays saved on this device.");
    // onAuthChange will clear gUser and update the button automatically
  }

  // Fires once on load with the restored session (if any — this is what
  // lets students stay signed in across visits with zero popups), and
  // again on every future sign-in/out.
  var onboardDecided=false;
  function maybeShowOnboard(){
    if(onboardDecided) return; onboardDecided=true;
    var d=load(); if(!d.profile || !d.profile.name) showOnboard();
  }

  function initFirebaseAuth(){
    if(!window.GAFirebase){ console.warn("Firebase module didn't load — Google sign-in unavailable."); maybeShowOnboard(); return; }
    var b=document.getElementById("googleBtn"); if(b) b.disabled=false;
    window.GAFirebase.onAuthChange(function(user){
      if(user){ gUser=user; setGoogleBtn("signedin");
        var d=load();
        if((!d.profile || !d.profile.name) && user.name){
          d.profile = d.profile || {};
          d.profile.name = user.name.split(" ")[0] || user.name;
          save(); renderAll();
        }
        performSync(); scheduleClassPush(); }
      else { gUser=null; clearTimeout(gSyncTimer); setGoogleBtn("signedout"); }
      maybeShowOnboard();
    });
  }

  function scheduleCloudUpload(){
    if(!cloudConnected() || !navigator.onLine || getSyncMode()==="local" || !window.GAFirebase) return;
    clearTimeout(gSyncTimer);
    gSyncTimer=setTimeout(function(){
      window.GAFirebase.setProgress(gUser.uid, mem).catch(function(err){ console.warn("Cloud sync failed", err); });
    }, 2000);
  }

  function adoptCloudData(cloudData){
    mem=cloudData; save(); renderAll(); renderLeaderboard();
    toast("☁️ Progress restored from your Google account.");
  }

  function openCloudChoice(cloudData, localData){
    var modal=document.getElementById("cloudModal"); if(!modal) return;
    document.getElementById("cloudModalText").textContent =
      "Found a different save in your Google account. Use the cloud version, or keep what's on this device? (Keeping this device overwrites the cloud save.)";
    modal.classList.add("show");
    document.getElementById("cloudUseCloud").onclick=function(){ modal.classList.remove("show"); adoptCloudData(cloudData); };
    document.getElementById("cloudUseLocal").onclick=function(){
      modal.classList.remove("show");
      window.GAFirebase.setProgress(gUser.uid, localData)
        .then(function(){ toast("☁️ This device's progress is now the cloud save."); })
        .catch(function(err){ console.warn("Cloud sync failed", err); });
    };
  }

  function performSync(){
    var mode=getSyncMode();
    if(mode==="local" || !cloudConnected() || !window.GAFirebase) return;
    var d=load();
    window.GAFirebase.getProgress(gUser.uid).then(function(cloudData){
      if(!cloudData || !cloudData.subjects){
        window.GAFirebase.setProgress(gUser.uid, d)
          .then(function(){ toast("☁️ Progress backed up to Google."); })
          .catch(function(err){ console.warn("Cloud sync failed", err); });
        return;
      }
      var localBlank = d.xp===0 && totals().ans===0;
      if(localBlank){ adoptCloudData(cloudData); return; }
      var same = JSON.stringify(cloudData.subjects)===JSON.stringify(d.subjects) && cloudData.xp===d.xp;
      if(same) return;
      if(mode==="hybrid"){
        var merged=mergeProgress(d, cloudData);
        mem=merged; save(); renderAll(); renderLeaderboard();
        window.GAFirebase.setProgress(gUser.uid, merged)
          .then(function(){ toast("🔀 Merged progress from Google + this device."); })
          .catch(function(err){ console.warn("Cloud sync failed", err); });
      } else {
        openCloudChoice(cloudData, d);
      }
    }).catch(function(err){
      console.warn("Sync failed:", err);
      toast("Couldn't reach the cloud — will retry on your next change.");
    });
  }

  var gClassPushTimer=null;
  function scheduleClassPush(){
    if(!cloudConnected() || !navigator.onLine || !window.GAFirebase || !window.GAFirebase.configured) return;
    clearTimeout(gClassPushTimer);
    gClassPushTimer=setTimeout(function(){
      var d=load(), T=totals(), r=rankFor(d.xp);
      var displayName=(d.profile&&d.profile.name)||gUser.name||"Student";
      window.GAFirebase.pushScore(gUser.uid, {
        name:displayName, xp:d.xp, level:r.lvl, title:r.title,
        totalAnswered:T.ans, avgAccuracy:T.acc||0, streak:streak()
      }).catch(function(err){ console.warn("Class leaderboard push failed:", err); });
    }, 2500);
  }

  function renderClassLeaderboard(){
    var el=document.getElementById("classLbList"); if(!el) return;
    if(!window.GAFirebase || !window.GAFirebase.configured){
      el.innerHTML='<div class="empty">Class leaderboard isn\'t set up yet.</div>'; return;
    }
    el.innerHTML='<div class="empty">Loading…</div>';
    window.GAFirebase.fetchLeaderboard(50).then(function(list){
      if(!list.length){ el.innerHTML='<div class="empty">No one\'s on the board yet — be the first!</div>'; return; }
      el.innerHTML=list.map(function(x,i){
        return '<div class="lb-row"><div class="lb-rank">'+(i+1)+'</div><div class="lb-mid"><div class="t">'+esc(x.name||"Student")+'</div><div class="s">Level '+(x.level||1)+' · '+esc(x.title||"")+' · '+(x.avgAccuracy||0)+'% avg</div></div><div class="lb-pct">'+(x.xp||0)+' XP</div></div>';
      }).join("");
    }).catch(function(err){
      console.warn("Class leaderboard fetch failed:", err);
      el.innerHTML='<div class="empty">Couldn\'t load the class leaderboard. Check your connection.</div>';
    });
  }

  var _rawSave = save;
  save = function(){ mem.updatedAt=Date.now(); _rawSave(); scheduleCloudUpload(); scheduleClassPush(); };

  /* ---------- derived ---------- */
  function totals(){ var d=load(),a=0,c=0; HUBS.forEach(function(k){ a+=d.subjects[k].answered; c+=d.subjects[k].correct; });
    return {ans:a,cor:c,acc:a?Math.round(c/a*100):null}; }
  function rankFor(xp){ var lvl=1+Math.floor(xp/150); var title=RANKS[0][1];
    for(var i=0;i<RANKS.length;i++){ if(lvl>=RANKS[i][0]||RANKS[i][0]===0){ if(lvl>=RANKS[i][0]) title=RANKS[i][1]; } }
    for(var j=RANKS.length-1;j>=0;j--){ if(lvl>=RANKS[j][0]){ title=RANKS[j][1]; break; } }
    var into=xp-(lvl-1)*150; return {lvl:lvl,title:title,into:into,need:150,pct:Math.round(into/150*100)}; }
  function streak(){ var d=load(), days=d.days, t=todayStr();
    var cur=new Date(t+"T00:00:00"), s=0, dayMs=86400000;
    if(!days[t]){ cur=new Date(cur.getTime()-dayMs); }
    while(true){ var key=cur.getFullYear()+"-"+String(cur.getMonth()+1).padStart(2,"0")+"-"+String(cur.getDate()).padStart(2,"0");
      if(days[key]){ s++; cur=new Date(cur.getTime()-dayMs); } else break; }
    return s; }
  function markToday(){ var d=load(),t=todayStr(); d.days[t]=(d.days[t]||0)+1; }
  function sprint(){ var start=new Date(SPRINT_START_DATE+"T00:00:00"); var end=new Date(EXAM_DATE+"T00:00:00"); var now=new Date(todayStr()+"T00:00:00");
    var totalDays=Math.max(1,Math.round((end-start)/86400000));
    var elapsed=Math.max(0,Math.round((now-start)/86400000));
    var left=Math.round((end-now)/86400000);
    return { dayNum:Math.min(totalDays,elapsed+1), totalDays:totalDays, left:left, elapsed:elapsed, pct:Math.min(100,Math.max(0,Math.round(elapsed/totalDays*100))), started:now>=end }; }

  /* ---------- badges + toast ---------- */
  function toast(msg,dur){ var el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show");
    clearTimeout(el._t); el._t=setTimeout(function(){ el.classList.remove("show"); }, dur||2600); }
  function grant(id){ var d=load(); if(d.badges[id]) return false; var b=BADGES.filter(function(x){return x.id===id;})[0];
    d.badges[id]=Date.now(); save(); if(b) toast("🏅 Badge unlocked: "+b.t); return true; }
  function checkGolden(){ var d=load(); var all=Object.keys(d.badges).length>=BADGES.length;
    document.documentElement.setAttribute("data-golden", all?"1":"0");
    if(all && !d.goldenCelebrated){ d.goldenCelebrated=true; save();
      setTimeout(function(){ confetti(); chime(); toast("🏆 All achievements unlocked — GOLDEN status! ✨", 6500); }, 500); } }
  function checkBadges(){ var d=load(), T=totals(); var h=new Date().getHours();
    if(T.ans>=1) grant("first");
    if(T.ans>=100) grant("century");
    if(T.ans>=500) grant("grinder");
    var st=streak(); if(st>=3) grant("dedicated"); if(st>=7) grant("onfire");
    if(HUBS.every(function(k){return d.subjects[k].opens>0;})) grant("explorer");
    if(h>=0&&h<5) grant("nightowl"); if(h>=4&&h<6) grant("earlybird");
    if(HUBS.some(function(k){var s=d.subjects[k];return s.answered>=MASTER_ANS && (s.correct/s.answered*100)>=MASTER_ACC;})) grant("master");
    var quizzes=0; HUBS.forEach(function(k){ quizzes+=d.subjects[k].quizzes; });
    if(quizzes>=10) grant("quiz10"); if(quizzes>=25) grant("quiz25");
    if(st>=14) grant("streak14"); if(st>=30) grant("streak30");
    if(T.ans>=1000) grant("marathon");
    if((d.perfects||0)>=5) grant("perfect5");
    var lvl=rankFor(d.xp).lvl; if(lvl>=5) grant("lvl5"); if(lvl>=10) grant("lvl10");
    if(rankFor(d.xp).title==="Apex") grant("apex");
    if(HUBS.every(function(k){return d.subjects[k].answered>0;})) grant("wellrounded");
    if(HUBS.every(function(k){var s=d.subjects[k];return s.answered>=MASTER_ANS && (s.correct/s.answered*100)>=MASTER_ACC;})) grant("grandmaster");
    if((d.weekAns||0)>=300) grant("weekgrind");
    if(sprint().elapsed>=30) grant("sprint30");
    var dow=new Date().getDay(); if(dow===0||dow===6) grant("weekend");
    checkGolden();
  }

  /* ---------- confetti + sound ---------- */
  var actx=null;
  function chime(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended")actx.resume();
    [523,659,784,1047].forEach(function(f,i){ var o=actx.createOscillator(),g=actx.createGain(); o.type="triangle"; o.frequency.value=f;
      o.connect(g); g.connect(actx.destination); var t=actx.currentTime+i*0.09; g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.22,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.28); o.start(t); o.stop(t+0.3); }); }catch(e){} }
  function confetti(){ var cv=document.getElementById("confetti"); cv.style.display="block";
    var ctx=cv.getContext("2d"); cv.width=innerWidth; cv.height=innerHeight;
    var cols=["#ffd34d","#10b981","#f43f5e","#3b82f6","#a855f7","#f59e0b","#ffffff"];
    var P=[]; for(var i=0;i<150;i++){ P.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*0.4,
      r:4+Math.random()*6,c:cols[i%cols.length],vy:2+Math.random()*4,vx:-2+Math.random()*4,rot:Math.random()*6,vr:-0.2+Math.random()*0.4}); }
    var t0=Date.now();
    (function frame(){ ctx.clearRect(0,0,cv.width,cv.height); var alive=false;
      P.forEach(function(p){ p.y+=p.vy; p.x+=p.vx; p.rot+=p.vr; if(p.y<cv.height+20)alive=true;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6); ctx.restore(); });
      if(alive && Date.now()-t0<3500) requestAnimationFrame(frame); else { ctx.clearRect(0,0,cv.width,cv.height); cv.style.display="none"; }
    })(); }

  /* ---------- record events ---------- */
  function recordOpen(key){ var d=load(); var oldXp=d.xp; d.subjects[key].opens++; d.lastHub=key; d.xp+=5; markToday(); save(); maybeLevelUp(oldXp,d.xp); checkBadges(); renderAll(); }
  function recordQuiz(key, p){ if(!key||!META[key]) return; var d=load(), s=d.subjects[key];
    var total=+p.total||+p.answered||0, correct=+p.correct||0, answered=+p.answered||total||0;
    if(answered<=0) return;
    var pct=total?Math.round(correct/total*100):Math.round(correct/answered*100);
    s.answered+=answered; s.correct+=correct; s.quizzes++; if(pct>s.best)s.best=pct;
    if(p.topicStats){ for(var tk in p.topicStats){ var ts=p.topicStats[tk]||{}; if(!s.topics[tk])s.topics[tk]={answered:0,correct:0};
      s.topics[tk].answered+=(+ts.answered||+ts.total||0); s.topics[tk].correct+=(+ts.correct||0); } }
    var oldXp=d.xp; d.xp += answered*2 + correct*3 + 15 + (pct===100?40:0);
    d.weekAns += answered;
    d.leaderboard.push({subject:key,title:p.title||META[key].name,pct:pct,correct:correct,total:total||answered,ts:Date.now()});
    d.leaderboard.sort(function(a,b){ return b.pct-a.pct || b.correct-a.correct; });
    if(d.leaderboard.length>25) d.leaderboard.length=25;
    if(pct===100) d.perfects=(d.perfects||0)+1;
    markToday(); save();
    maybeLevelUp(oldXp,d.xp);
    if(pct>=90) grant("sharp");
    if(pct===100){ grant("perfect"); confetti(); chime(); toast("💯 Perfect score!"); }
    if(d.weekAns>=WEEK_GOAL) grant("weekly");
    checkBadges(); renderAll(); }

  /* ---------- greeting / facts / onboarding / level-up / recap ---------- */
  var sessionStart = null;
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function maybeLevelUp(oldXp,newXp){ var ol=rankFor(oldXp), nl=rankFor(newXp);
    if(nl.lvl>ol.lvl){ setTimeout(function(){ confetti(); chime();
      toast(nl.title!==ol.title ? ("⬆️ New rank: "+nl.title+" — Level "+nl.lvl+"!") : ("⬆️ Level up! Apex Level "+nl.lvl), 4200); }, 400); } }
  var FACTS=[
    "Your body makes about 2 million red blood cells every single second.",
    "The liver carries out over 500 distinct functions.",
    "Enzymes can speed up reactions by a factor of up to a billion.",
    "The femur is the longest and strongest bone in the human body.",
    "Some nerve impulses travel at over 100 metres per second.",
    "Your heart beats roughly 100,000 times a day.",
    "The small intestine is about 6 metres long.",
    "Mosquitoes track hosts partly by sensing the CO₂ you breathe out.",
    "Only female mosquitoes bite — they need blood to develop their eggs.",
    "The brain uses about 20% of your body's energy at rest.",
    "You recycle roughly your own body weight in ATP every day.",
    "Each haemoglobin molecule can carry up to four oxygen molecules.",
    "Bone is constantly remodelled — a near-new skeleton every decade.",
    "The cornea has no blood supply; it takes oxygen straight from the air.",
    "Dopamine drives motivation and reward, not just pleasure.",
    "The kidneys filter your entire blood volume around 30 times a day.",
    "Glycolysis happens in the cytoplasm; the Krebs cycle in mitochondria.",
    "Anopheles mosquitoes are the vectors that transmit human malaria.",
    "Classical conditioning was first shown through Pavlov's dogs.",
    "Neurons never touch — they signal across tiny gaps called synapses.",
    "Lice are wingless insects that live their whole life on a host.",
    "Skeletal muscle can produce force many times its own weight.",
    "The stomach lining renews every few days to survive its own acid.",
    "Stretched out, the DNA in one cell is about 2 metres long."
  ];
  function renderFact(){ var el=document.getElementById("factText"); if(!el) return;
    var dt=new Date(); var doy=Math.floor((dt-new Date(dt.getFullYear(),0,0))/86400000); el.textContent=FACTS[doy%FACTS.length]; }
  function renderGreeting(){ var el=document.getElementById("greeting"); if(!el) return; var d=load();
    var h=new Date().getHours(); var g=h<12?"Good morning":h<17?"Good afternoon":h<21?"Good evening":"Burning the midnight oil";
    var raw=(d.profile&&d.profile.name)?d.profile.name.trim():""; var name=raw?(/^(dr|doc)\b\.?/i.test(raw)?raw:"Doc "+raw):"there"; var st=streak(); var pill;
    if(st>=2) pill="🔥 "+st+"-day streak"; else if(totals().ans>0) pill=rankFor(d.xp).title; else pill="Let's begin";
    el.innerHTML=esc(g)+', <b>'+esc(name)+'</b> 👋 <span class="gpill">'+esc(pill)+'</span>'; }
  var OB_GOALS=["First class 🥇","Solid pass ✅","Master the material 🧠","Beat my best 📈"];
  var obFocus="", obGoal="";
  function buildOnboard(){
    var fc=document.getElementById("obFocus"); fc.innerHTML=HUBS.map(function(k){ return '<button class="ob-chip" data-f="'+k+'">'+META[k].icon+' '+META[k].name+'</button>'; }).join("");
    var gc=document.getElementById("obGoal"); gc.innerHTML=OB_GOALS.map(function(g,i){ return '<button class="ob-chip" data-g="'+i+'">'+g+'</button>'; }).join("");
    fc.querySelectorAll(".ob-chip").forEach(function(b){ b.onclick=function(){ fc.querySelectorAll(".ob-chip").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); obFocus=b.getAttribute("data-f"); }; });
    gc.querySelectorAll(".ob-chip").forEach(function(b){ b.onclick=function(){ gc.querySelectorAll(".ob-chip").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); obGoal=OB_GOALS[+b.getAttribute("data-g")]; }; });
    var nm=document.getElementById("obName"), guest=document.getElementById("obGuest"), gbtn=document.getElementById("obGoogle");
    nm.oninput=function(){ guest.disabled=nm.value.trim().length<1; };
    nm.addEventListener("keydown",function(e){ if(e.key==="Enter"&&!guest.disabled) guest.click(); });
    function saveOnboardProfile(name){ var d=load(); d.profile={ name:(name||"").trim().slice(0,24), focus:obFocus, goal:obGoal }; save(); }
    guest.onclick=function(){ saveOnboardProfile(nm.value);
      document.getElementById("onboard").classList.remove("show"); renderAll(); renderFact(); };
    gbtn.onclick=function(){
      if(!window.GAFirebase || !window.GAFirebase.configured){ toast("Google sign-in isn't configured yet — continue as a guest instead."); return; }
      saveOnboardProfile(nm.value); // keeps focus/goal + typed name (if any) even if the popup is cancelled
      document.getElementById("onboard").classList.remove("show"); renderAll(); renderFact();
      googleSignIn();
    };
  }
  function showOnboard(){ document.getElementById("onboard").classList.add("show"); setTimeout(function(){ var n=document.getElementById("obName"); if(n) n.focus(); },120); }

  /* ---------- rendering ---------- */
  function cardHTML(key){ var m=META[key]; return '<button class="card" data-hub="'+key+'" onclick="GA.open(\''+key+'\')" aria-label="Open '+m.name+' hub">'
    +'<div class="top"><span class="icon">'+m.icon+'</span><span class="kbd" data-kbd="'+key+'"></span></div>'
    +'<h2>'+m.name+' <span class="trophy" data-tro="'+key+'">🏆</span></h2>'
    +'<p>'+m.desc+'</p>'
    +'<div class="pbar"><div class="pfill" data-fill="'+key+'"></div></div>'
    +'<div class="cstat"><span data-stat="'+key+'">Not started</span></div>'
    +'</button>'; }
  function renderCards(){ var g=document.getElementById("cardGrid"); if(!g.dataset.built){ g.innerHTML=HUBS.map(cardHTML).join(""); g.dataset.built="1";
      HUBS.forEach(function(k,i){ g.querySelector('[data-kbd="'+k+'"]').textContent=(i+1); }); }
    var d=load();
    HUBS.forEach(function(k){ var s=d.subjects[k]; var acc=s.answered?Math.round(s.correct/s.answered*100):0;
      var statEl=g.querySelector('[data-stat="'+k+'"]'), fill=g.querySelector('[data-fill="'+k+'"]'), tro=g.querySelector('[data-tro="'+k+'"]');
      if(s.answered>0){ statEl.textContent="answered "+s.answered+" · avg "+acc+"%"; fill.style.width=acc+"%"; }
      else if(s.opens>0){ statEl.textContent="opened · no quiz yet"; fill.style.width="4%"; }
      else { statEl.textContent="Not started"; fill.style.width="0%"; }
      var mastered=s.answered>=MASTER_ANS && acc>=MASTER_ACC; tro.style.display=mastered?"inline":"none";
    }); }
  function renderCockpit(){ var d=load(), T=totals(), r=rankFor(d.xp);
    document.getElementById("stAns").textContent=T.ans;
    document.getElementById("stAvg").textContent=T.acc===null?"—":T.acc+"%";
    document.getElementById("stStreak").textContent=streak();
    document.getElementById("rankLvl").textContent=r.lvl;
    document.getElementById("rankTitle").textContent=r.title;
    document.getElementById("rankXp").textContent=d.xp+" XP · "+(r.need-r.into)+" to next";
    document.getElementById("rankRing").style.setProperty("--p", r.pct);
    var wp=Math.min(100,Math.round(d.weekAns/WEEK_GOAL*100));
    document.getElementById("wkFill").style.width=wp+"%";
    document.getElementById("wkTxt").textContent=d.weekAns+" / "+WEEK_GOAL+" this week"+(d.weekAns>=WEEK_GOAL?" ✅":"");
    var sp=sprint(); document.getElementById("spFill").style.width=sp.pct+"%";
    document.getElementById("spTxt").textContent = sp.started
      ? "🎓 Exam period is here — you've got this!"
      : sp.left+" day"+(sp.left===1?"":"s")+" until your exam · Day "+sp.dayNum+" of "+sp.totalDays;
  }
  function renderContinue(){ var d=load(), b=document.getElementById("continueBtn");
    if(d.lastHub&&META[d.lastHub]){ b.style.display="inline-flex"; document.getElementById("continueName").textContent=META[d.lastHub].name; }
    else b.style.display="none"; }
  function weakAreas(){ var d=load(), areas=[];
    HUBS.forEach(function(k){ var s=d.subjects[k];
      var tks=Object.keys(s.topics||{}).filter(function(t){ return s.topics[t].answered>=3; });
      if(tks.length){ tks.forEach(function(t){ var ts=s.topics[t]; areas.push({name:META[k].name+" · "+t, acc:Math.round(ts.correct/ts.answered*100)}); }); }
      else if(s.answered>=3){ areas.push({name:META[k].name, acc:Math.round(s.correct/s.answered*100)}); }
    });
    areas.sort(function(a,b){ return a.acc-b.acc; }); return areas; }
  function renderWeak(){ var el=document.getElementById("weakList"); var a=weakAreas();
    if(!a.length){ el.innerHTML='<div class="weak-empty">Finish a few quizzes and your weak spots will show up here.</div>'; return; }
    var weak=a.filter(function(x){ return x.acc<85; }).slice(0,4);
    if(!weak.length){ el.innerHTML='<div class="weak-empty">No weak spots right now — great work! 🎉</div>'; return; }
    el.innerHTML=weak.map(function(x){ return '<div class="weak-row"><div class="weak-mid"><div class="wn">'+x.name+'</div><div class="wbar"><div class="wfill" style="width:'+x.acc+'%"></div></div></div><div class="wpct">'+x.acc+'%</div></div>'; }).join(""); }
  function renderBadges(){ var d=load(), grid=document.getElementById("badgeGrid");
    grid.innerHTML=BADGES.map(function(b){ var on=d.badges[b.id]; return '<div class="bdg'+(on?" on":"")+'" title="'+b.d+'"><div class="e">'+b.e+'</div><div class="t">'+b.t+'</div><div class="d">'+b.d+'</div></div>'; }).join("");
    var n=Object.keys(d.badges).length; document.getElementById("badgeCount").textContent="· "+n+"/"+BADGES.length; }
  function renderMascot(){ var d=load(); if(d.mascotHidden){ document.getElementById("mascot").style.display="none"; return; }
    var st=streak(), T=totals(), r=rankFor(d.xp), h=new Date().getHours(); var pf=d.profile||{}; var msg;
    if(st>=7) msg="🔥 "+st+"-day streak! Unstoppable.";
    else if(st>=3) msg=st+" days strong — keep it rolling!";
    else if(T.ans===0 && pf.focus && META[pf.focus]) msg="Let's conquer "+META[pf.focus].name+" 💪";
    else if(T.ans===0) msg="Welcome! Tap a subject to start your climb.";
    else if(h>=22||h<5) msg="Late grind 🦉 — one more set?";
    else if(r.pct>=70) msg="Almost at rank "+(r.lvl+1)+"! A quiz will do it.";
    else if(pf.goal && T.ans>30) msg="Goal: "+pf.goal+". You're on track!";
    else msg="You're "+(r.need-r.into)+" XP from the next rank.";
    document.getElementById("mascotMsg").textContent=msg; document.getElementById("mascot").classList.remove("hide"); }
  function renderLeaderboard(){ var d=load(), el=document.getElementById("lbList");
    if(!d.leaderboard.length){ el.innerHTML='<div class="empty">No scores yet — finish a quiz to make the board.</div>'; return; }
    el.innerHTML=d.leaderboard.slice(0,8).map(function(x,i){ var dt=new Date(x.ts); var ds=(dt.getMonth()+1)+"/"+dt.getDate();
      return '<div class="lb-row"><div class="lb-rank">'+(i+1)+'</div><div class="lb-mid"><div class="t">'+(x.title||"")+'</div><div class="s">'+(META[x.subject]?META[x.subject].name:"")+' · '+x.correct+'/'+x.total+' · '+ds+'</div></div><div class="lb-pct">'+x.pct+'%</div></div>'; }).join(""); }
  function applyTheme(){ var d=load(); document.documentElement.setAttribute("data-theme", d.theme||"light");
    document.getElementById("themeBtn").textContent=(d.theme==="light")?"☀️":"🌙"; checkGolden(); }
  function renderAll(){ renderGreeting(); renderCards(); renderCockpit(); renderContinue(); renderWeak(); renderBadges(); renderMascot(); }

  /* ---------- hub open/close ---------- */
  var frame,loading;
  function open(key){ var d0=load(); sessionStart={ xp:d0.xp, ans:totals().ans, cor:totals().cor, ts:Date.now() }; loading.style.display="flex";
    try{
      document.getElementById("hubName").textContent=META[key].name;
      document.getElementById("landing").style.display="none"; document.getElementById("hubView").style.display="flex";
      document.getElementById("mascot").style.display="none";
      frame.onload=function(){ loading.style.display="none"; frame.onload=null; };
      frame.onerror=function(){ loading.style.display="none"; alert("Sorry, that hub could not be opened. Check your connection and try again."); };
      frame.removeAttribute("srcdoc");
      frame.src="hubs/"+key+".html";
      recordOpen(key); window.scrollTo(0,0);
    }catch(e){ loading.style.display="none"; console.error("Hub open failed:", e); alert("Sorry, that hub could not be opened ("+(e&&e.message?e.message:e)+"). Reload and try again."); } }
  function backToGrid(){ frame.srcdoc=""; frame.src="about:blank"; document.getElementById("hubView").style.display="none";
    document.getElementById("landing").style.display="block"; document.getElementById("hubName").textContent="";
    loading.style.display="none"; var d=load(); if(!d.mascotHidden) document.getElementById("mascot").style.display="flex";
    if(sessionStart){ var T=totals(); var ans=T.ans-sessionStart.ans, cor=T.cor-sessionStart.cor, xpg=d.xp-sessionStart.xp, mins=Math.round((Date.now()-sessionStart.ts)/60000);
      if(ans>0||mins>=1){ var acc=ans>0?Math.round(cor/ans*100)+"%":null; toast("📊 Session — "+(ans>0?ans+" answered · "+acc+" · ":"")+"+"+xpg+" XP"+(mins>=1?" · "+mins+" min":""), 4800); }
      sessionStart=null; }
    renderAll(); window.scrollTo(0,0); }
  function continueLast(){ var d=load(); if(d.lastHub) open(d.lastHub); }

  function closeModal(id){ document.getElementById(id).classList.remove("show"); }

  /* messages from embedded hubs */
  window.addEventListener("message", function(e){ var d=e.data; if(!d||!d.gaBridge) return;
    if(d.payload && d.payload.type==="grateApexQuizComplete") recordQuiz(d.subject, d.payload); });

  /* keyboard */
  document.addEventListener("keydown", function(e){
    if(document.getElementById("hubView").style.display==="flex"){ if(e.key==="Escape") backToGrid(); return; }
    if(document.querySelector(".modal-bg.show")){ if(e.key==="Escape") document.querySelectorAll(".modal-bg.show").forEach(function(m){ if(m.id!=="onboard") m.classList.remove("show"); }); return; }
    if(e.key>="1"&&e.key<="5"){ open(HUBS[+e.key-1]); }
    else if(e.key==="t"||e.key==="T"){ toggleTheme(); }
  });
  function toggleTheme(){ var d=load(); d.theme=(d.theme==="light")?"dark":"light"; save(); applyTheme(); }

  /* wire + init */
  window.GA={ open:open };
  window.backToGrid=backToGrid; window.continueLast=continueLast;
  window.closeModal=closeModal;
  function updateOnlineStatus(){
    var b=document.getElementById("offlineBanner"); if(!b) return;
    if(navigator.onLine){
      b.classList.remove("show");
      if(cloudConnected()) scheduleCloudUpload(); // retry anything that queued up while offline
      prefetchHubsForOffline(); // resume/retry warming the hub cache now that we're back online
    } else {
      b.classList.add("show");
    }
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  /* ---------- background hub prefetch (so every subject works offline,
     not just the ones already opened) ---------- */
  var gPrefetching=false;
  function prefetchHubsForOffline(){
    if(gPrefetching || !("serviceWorker" in navigator) || !window.caches || !navigator.onLine) return;
    if(navigator.connection && navigator.connection.saveData) return; // respect data saver mode
    gPrefetching=true;
    Promise.all(HUBS.map(function(key){
      return caches.match("hubs/"+key+".html").then(function(hit){ return hit ? null : key; });
    })).then(function(results){
      var toFetch=results.filter(Boolean);
      if(!toFetch.length){ gPrefetching=false; return; }
      toast("📥 Downloading hub content for offline use — happens once in the background.", 4000);
      var i=0;
      function next(){
        if(i>=toFetch.length){ gPrefetching=false; return; }
        var key=toFetch[i++];
        fetch("hubs/"+key+".html").catch(function(err){ console.warn("Prefetch failed for", key, err); }).then(function(){
          setTimeout(next, 500); // small gap between downloads — gentler on the connection than firing all at once
        });
      }
      next();
    }).catch(function(){ gPrefetching=false; });
  }

  function showUpdateBanner(worker){
    var b=document.getElementById("updateBanner"); if(!b) return;
    b.classList.add("show");
    document.getElementById("updateBtn").onclick=function(){ worker.postMessage("SKIP_WAITING"); };
  }
  function initServiceWorker(){
    if(!("serviceWorker" in navigator)) return;
    var reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange", function(){
      if(reloaded) return; reloaded=true; window.location.reload();
    });
    navigator.serviceWorker.register("sw.js").then(function(reg){
      if(reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);
      reg.addEventListener("updatefound", function(){
        var nw=reg.installing; if(!nw) return;
        nw.addEventListener("statechange", function(){
          if(nw.state==="installed" && navigator.serviceWorker.controller) showUpdateBanner(nw);
        });
      });
    }).catch(function(err){ console.warn("Service worker registration failed:", err); });
  }

  /* ---------- install prompt ---------- */
  var deferredInstallPrompt=null;
  function isStandalone(){ return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true; }
  function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; }
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); deferredInstallPrompt=e;
    var b=document.getElementById("installBtn"); if(b) b.style.display="inline-flex";
  });
  window.addEventListener("appinstalled", function(){
    deferredInstallPrompt=null;
    var b=document.getElementById("installBtn"); if(b) b.style.display="none";
    toast("📲 Installed! Find GrAte Apex Hub on your home screen.");
  });

  function renderSyncOptions(){
    var mode=getSyncMode();
    document.querySelectorAll(".sync-opt").forEach(function(b){ b.classList.toggle("sel", b.getAttribute("data-mode")===mode); });
  }
  function applySyncMode(newMode){
    setSyncMode(newMode);
    renderSyncOptions();
    if(newMode==="local"){
      toast("📱 Local-only mode — progress stays on this device.");
      return;
    }
    if(!cloudConnected()){
      closeModal("syncModal");
      googleSignIn();
      return;
    }
    toast(newMode==="hybrid" ? "🔀 Hybrid mode — merging progress…" : "☁️ Cloud mode — Google is now the source of truth.");
    performSync();
  }

  /* ---------- display name ---------- */
  function renderNameInput(){
    var inp=document.getElementById("nameInput"); if(!inp) return;
    var d=load(); inp.value=(d.profile&&d.profile.name)||"";
  }
  function saveName(){
    var inp=document.getElementById("nameInput"); if(!inp) return;
    var name=inp.value.trim().slice(0,24);
    if(!name){ toast("Enter a name first."); return; }
    var d=load(); d.profile=d.profile||{focus:"",goal:""}; d.profile.name=name; save(); renderAll();
    toast("👋 Name updated to "+name+".");
  }
  function openSettingsModal(){
    renderNameInput(); renderSyncOptions();
    document.getElementById("syncModal").classList.add("show");
  }

  /* ---------- reset progress ---------- */
  function resetProgress(){
    if(!confirm("Reset ALL progress on this device? Badges, XP, streaks, and quiz history will be permanently deleted. This can't be undone.")) return;
    if(cloudConnected() && !confirm("You're signed in to Google — the next sync will overwrite your cloud save with this blank progress too. Continue?")) return;
    mem=blank(); save(); closeModal("badgeModal"); renderAll(); renderLeaderboard();
    toast("🗑️ Progress reset.");
  }

  document.addEventListener("DOMContentLoaded", function(){
    initServiceWorker();
    frame=document.getElementById("hubFrame"); loading=document.getElementById("loading");
    load(); applyTheme(); renderAll(); renderLeaderboard(); updateOnlineStatus();
    var installBtn=document.getElementById("installBtn");
    if(installBtn){
      if(isIOS() && !isStandalone()){ installBtn.style.display="inline-flex"; installBtn.title="Add to Home Screen"; }
      installBtn.onclick=function(){
        if(deferredInstallPrompt){
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then(function(){ deferredInstallPrompt=null; installBtn.style.display="none"; });
        } else if(isIOS()){
          toast("📲 Tap the Share icon, then \"Add to Home Screen\".", 5200);
        }
      };
    }
    var resetBtn=document.getElementById("resetProgressBtn");
    if(resetBtn) resetBtn.onclick=resetProgress;
    document.getElementById("themeBtn").onclick=toggleTheme;
    document.getElementById("lbBtn").onclick=function(){ renderLeaderboard(); document.getElementById("lbModal").classList.add("show"); };
    document.getElementById("classLbBtn").onclick=function(){ renderClassLeaderboard(); document.getElementById("classLbModal").classList.add("show"); };
    document.getElementById("badgeBtn").onclick=function(){ renderBadges(); document.getElementById("badgeModal").classList.add("show"); };
    document.getElementById("mascotFace").onclick=function(){ var m=document.getElementById("mascot"); m.classList.toggle("hide"); };
    var gBtn=document.getElementById("googleBtn");
    if(gBtn){ gBtn.onclick=function(){
      if(cloudConnected()){ if(confirm("Signed in as "+((gUser&&gUser.email)||"Google")+". Sign out and stop syncing?")) googleSignOut(); }
      else if(getSyncMode()==="local"){ openSettingsModal(); toast("You're in Local-only mode — pick Cloud or Hybrid to enable Google sign-in."); }
      else googleSignIn();
    }; }
    initFirebaseAuth();
    var syncBtn=document.getElementById("syncSettingsBtn");
    if(syncBtn){ syncBtn.onclick=openSettingsModal; }
    var nameSaveBtn=document.getElementById("nameSaveBtn");
    if(nameSaveBtn) nameSaveBtn.onclick=saveName;
    var nameInput=document.getElementById("nameInput");
    if(nameInput) nameInput.addEventListener("keydown", function(e){ if(e.key==="Enter") saveName(); });
    document.querySelectorAll(".sync-opt").forEach(function(b){ b.onclick=function(){ applySyncMode(b.getAttribute("data-mode")); }; });
    document.querySelectorAll(".modal-bg").forEach(function(bg){ bg.addEventListener("click",function(e){ if(e.target===bg && bg.id!=="onboard") bg.classList.remove("show"); }); });
    renderFact(); buildOnboard();
    setTimeout(maybeShowOnboard, 1200); // fallback if Firebase Auth never responds (offline, misconfigured, etc.)
    setTimeout(prefetchHubsForOffline, 3000); // let the app settle first, then quietly warm the hub cache
    if(!load().mascotHidden) setTimeout(renderMascot,600);
  });
})();
