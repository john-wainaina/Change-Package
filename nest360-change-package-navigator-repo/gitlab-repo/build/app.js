(function(){
  "use strict";
  var DATA = JSON.parse(document.getElementById('appData').textContent);
  var MODULES = DATA.modules;
  var INTRO_STEPS = DATA.introSteps;
  var ADD_RESOURCES = DATA.additionalResources || [];
  var RESOURCE_LINKS = DATA.resourceLinks || {};
  var VERSION = DATA.version || "1.0";

  // Renders a single resource name as a clickable tag IFF a verified link
  // exists in RESOURCE_LINKS (sourced directly from the Change Package PDF's
  // own embedded hyperlinks). Internal targets (starting with "#/") navigate
  // in-app; external targets open in a new tab. Names with no verified link
  // render as plain (non-clickable) text, never a guessed URL.
  function resourceTag(name){
    var url = RESOURCE_LINKS[name];
    if(url && url.indexOf("#/") === 0){
      return '<a href="'+url+'" class="resource-tag resource-tag-internal" title="View in Additional Resources">'+esc(name)+' <span class="rt-icon">&#128196;</span></a>';
    }
    if(url){
      return '<a href="'+esc(url)+'" class="resource-tag resource-tag-link" target="_blank" rel="noopener noreferrer" title="Opens in a new tab">'+esc(name)+' <span class="rt-icon">&#8599;</span></a>';
    }
    return '<span class="resource-tag">'+esc(name)+'</span>';
  }

  function esc(s){
    if(s==null)return"";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function findMod(id){ return MODULES.find(function(m){ return m.id===id; })||null; }
  function findGap(mod,id){ if(!mod)return null; return mod.gaps.find(function(g){ return g.id===id; })||null; }

  // ───── MODULE ICONS (original line-icon set, one per clinical theme) ─────
  // CPAP: lungs + airway · KMC: heart with baby mark (skin-to-skin) ·
  // Hypothermia: thermometer · Phototherapy: sun/light · IPC: shield
  var ICON_PATHS = {
    cpap: '<line x1="12" y1="3" x2="12" y2="10"/><path d="M12 10c0 0-3 0-4 3"/><path d="M12 10c0 0 3 0 4 3"/><ellipse cx="7" cy="16" rx="3.1" ry="4.1"/><ellipse cx="17" cy="16" rx="3.1" ry="4.1"/>',
    kmc: '<circle cx="8.5" cy="9.2" r="3.9"/><circle cx="15.5" cy="9.2" r="3.9"/><path d="M4.6 12.2C4.6 12.2 12 20 12 20s7.4-7.8 7.4-7.8"/><circle cx="12" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>',
    hypothermia: '<rect x="10.1" y="3" width="3.8" height="11.5" rx="1.9"/><circle cx="12" cy="18" r="3.4"/><line x1="12" y1="14.5" x2="12" y2="16.8"/><line x1="15" y1="6.3" x2="13.3" y2="6.3"/><line x1="15" y1="9.3" x2="13.3" y2="9.3"/>',
    phototherapy: '<circle cx="12" cy="12" r="3.8"/><line x1="12" y1="2.2" x2="12" y2="5.2"/><line x1="12" y1="18.8" x2="12" y2="21.8"/><line x1="2.2" y1="12" x2="5.2" y2="12"/><line x1="18.8" y1="12" x2="21.8" y2="12"/><line x1="5" y1="5" x2="7.1" y2="7.1"/><line x1="16.9" y1="16.9" x2="19" y2="19"/><line x1="5" y1="19" x2="7.1" y2="16.9"/><line x1="16.9" y1="7.1" x2="19" y2="5"/>',
    ipc: '<path d="M12 3 L19 6 V11 C19 16 16 19.5 12 21 C8 19.5 5 16 5 11 V6 Z"/><path d="M9 12 L11 14.3 L15.3 9.7"/>'
  };
  function moduleIcon(modId, sizePx){
    var s = sizePx || 20;
    var paths = ICON_PATHS[modId] || '';
    return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';
  }

  // ───── ROUTING ─────
  function parseRoute(){
    var h=window.location.hash||"";
    if(h.indexOf("#/")===0){
      var parts=h.slice(2).split("/").filter(Boolean);
      var sec=parts[0]?decodeURIComponent(parts[0]):null;
      if(sec==="resources") return {view:"resources",module:null,gap:null};
      return {view:"main",module:sec,gap:parts[1]?decodeURIComponent(parts[1]):null};
    }
    var qs=new URLSearchParams(window.location.search);
    if(qs.get("view")==="resources") return {view:"resources",module:null,gap:null};
    if(qs.get("module")) return {view:"main",module:qs.get("module"),gap:qs.get("gap")||null};
    return {view:"home",module:null,gap:null};
  }
  function navigate(moduleId,gapId,opts){
    opts=opts||{};
    var hash;
    if(moduleId==null&&gapId===undefined&&opts.view==="resources") hash="#/resources";
    else if(moduleId==null) hash="#/";
    else hash="#/"+encodeURIComponent(moduleId)+(gapId?"/"+encodeURIComponent(gapId):"");
    if(window.location.hash===hash) render();
    else window.location.hash=hash;
    closeMobile();
    if(!opts.keepScroll) window.scrollTo({top:0,behavior:"instant"});
  }
  window.addEventListener("hashchange",render);

  // ───── SIDEBAR ─────
  var moduleNavEl=document.getElementById("moduleNav");
  function buildSidebar(activeModId,activeGapId,activeView){
    var html='<div class="sidebar-home" id="sidebarHome">&#8962; Home</div>';
    MODULES.forEach(function(mod){
      var isA=mod.id===activeModId;
      html+='<div class="module-toggle'+(isA?' active open':'')+(isA?' active':'')+'" data-mod="'+mod.id+'">';
      html+='<span class="mt-label"><span class="mt-icon">'+moduleIcon(mod.id,16)+'</span>'+esc(mod.short)+'</span><span class="chev">&#9656;</span></div>';
      html+='<div class="gap-list'+(isA?' open':'')+'" data-modlist="'+mod.id+'">';
      mod.gaps.forEach(function(g){
        var isG=isA&&g.id===activeGapId;
        html+='<div class="gap-item'+(isG?' active':'')+'" data-mod="'+mod.id+'" data-gap="'+g.id+'">'+esc(g.title)+'</div>';
      });
      html+='</div>';
    });
    html+='<div class="sidebar-divider"></div>';
    html+='<div class="sidebar-resources'+(activeView==='resources'?' active':'')+'" id="sidebarResources">&#128196; Additional Resources</div>';
    moduleNavEl.innerHTML=html;

    document.getElementById("sidebarHome").addEventListener("click",function(){ navigate(null,null); });
    document.getElementById("sidebarResources").addEventListener("click",function(){ navigate(null,null,{view:"resources"}); });
    moduleNavEl.querySelectorAll(".module-toggle").forEach(function(el){
      el.addEventListener("click",function(){
        var mid=el.getAttribute("data-mod");
        var list=moduleNavEl.querySelector('.gap-list[data-modlist="'+mid+'"]');
        if(mid===activeModId) { list.classList.toggle("open"); el.classList.toggle("open"); }
        else navigate(mid,null);
      });
    });
    moduleNavEl.querySelectorAll(".gap-item").forEach(function(el){
      el.addEventListener("click",function(){ navigate(el.getAttribute("data-mod"),el.getAttribute("data-gap")); });
    });
  }

  // ───── MOBILE ─────
  var sidebarEl=document.getElementById("sidebar");
  var overlayEl=document.getElementById("sidebarOverlay");
  document.getElementById("hamburgerBtn").addEventListener("click",function(){ sidebarEl.classList.add("open"); overlayEl.classList.add("show"); });
  overlayEl.addEventListener("click",closeMobile);
  function closeMobile(){ sidebarEl.classList.remove("open"); overlayEl.classList.remove("show"); }
  document.getElementById("brandHome").addEventListener("click",function(){ navigate(null,null); });

  // ───── RENDER DISPATCH ─────
  var contentEl=document.getElementById("content");
  function render(){
    var route=parseRoute();
    var mod=route.module?findMod(route.module):null;
    var gap=mod&&route.gap?findGap(mod,route.gap):null;
    var view=route.view;
    if(view==="resources"){ buildSidebar(null,null,"resources"); renderResources(); return; }
    buildSidebar(mod?mod.id:null,gap?gap.id:null,"main");
    if(mod&&gap) renderGap(mod,gap);
    else if(mod) renderModule(mod);
    else renderHome();
  }

  // ───── HOME ─────
  function renderHome(){
    var html='<div class="hero">';
    html+='<div class="hero-body"><div class="hero-eyebrow">NEST360 Quality Improvement</div>';
    html+='<h2>Change Package Navigator</h2>';
    html+='<p>Browse 255 tested change ideas across 60 coverage gaps in 5 neonatal care modules. Select a module to find common causes of low coverage, or search across all modules.</p>';
    html+='<div class="hero-meta"><span class="version-tag">Change Package v'+esc(VERSION)+'</span><span class="hero-meta-sep">&#183;</span><span>August 2025</span></div></div>';
    html+='</div>';

    html+='<div class="section-label">How to use this resource</div>';
    html+='<div class="steps-grid">';
    INTRO_STEPS.forEach(function(s){
      html+='<div class="step-card"><div class="step-num">'+esc(s[0])+'</div><p>'+esc(s[1])+'</p></div>';
    });
    html+='</div>';

    html+='<div class="section-label">Clinical modules</div>';
    html+='<div class="module-grid">';
    // Module accent colours stay strictly within NEST360's confirmed brand family
    // (navy + two tints, teal + one shade, gold) — no invented off-brand hues.
    var COLORS=["#094267","#0f8b8d","#c99a3c","#0a6668","#5f849c"];
    MODULES.forEach(function(mod,i){
      var ideaCount=mod.gaps.reduce(function(s,g){ return s+g.ideas.length; },0);
      var cq=mod.gaps.filter(function(g){ return g.gap_type==="Care quality"||g.category; }).length;
      html+='<div class="module-card" data-mod="'+mod.id+'" style="border-top-color:'+COLORS[i]+';">';
      html+='<div class="mc-icon" style="background:'+COLORS[i]+'22;color:'+COLORS[i]+'">'+moduleIcon(mod.id,22)+'</div>';
      html+='<h3>'+esc(mod.name)+'</h3>';
      html+='<div class="mc-stats">';
      html+='<span>'+mod.gaps.length+' gaps</span><span class="dot">&#183;</span><span>'+ideaCount+' change ideas</span>';
      html+='</div></div>';
    });
    html+='</div>';

    contentEl.innerHTML=html;
    contentEl.querySelectorAll(".module-card").forEach(function(el){
      el.addEventListener("click",function(){ navigate(el.getAttribute("data-mod"),null); });
    });
  }

  // ───── MODULE OVERVIEW ─────
  function renderModule(mod){
    var ideaCount=mod.gaps.reduce(function(s,g){ return s+g.ideas.length; },0);
    var html='<div class="breadcrumb"><a href="#/" data-nav-home>Home</a><span class="sep">&#9656;</span>'+esc(mod.name)+'</div>';
    html+='<div class="mod-header"><h2>'+esc(mod.name)+'</h2>';
    html+='<div class="mod-stats"><span class="stat-pill">'+mod.gaps.length+' gaps</span><span class="stat-pill">'+ideaCount+' change ideas</span>';
    html+='<button class="copy-link-btn" id="copyModuleLinkBtn">&#128279; Copy link to this module</button></div></div>';

    // Build filter chips for gap_type or IPC categories
    var types=[...new Set(mod.gaps.map(function(g){ return g.gap_type||g.category||"General"; }))].filter(Boolean);
    var hasFilter=types.length>1;
    if(hasFilter){
      html+='<div class="filter-bar" id="filterBar">';
      html+='<button class="filter-chip active" data-filter="all">All</button>';
      types.forEach(function(t){
        html+='<button class="filter-chip" data-filter="'+esc(t)+'">'+esc(t)+'</button>';
      });
      html+='</div>';
    }

    html+='<div class="gap-card-grid" id="gapCardGrid">';
    mod.gaps.forEach(function(g){
      var typeLabel=g.gap_type||g.category||"General";
      html+='<div class="gap-card" data-mod="'+mod.id+'" data-gap="'+g.id+'" data-type="'+esc(typeLabel)+'">';
      html+='<div class="gc-label">'+esc(typeLabel)+'</div>';
      html+='<h4>'+esc(g.title)+'</h4>';
      html+='<div class="gc-count">'+g.ideas.length+' change idea'+(g.ideas.length===1?'':'s')+'</div>';
      html+='</div>';
    });
    html+='</div>';

    contentEl.innerHTML=html;
    contentEl.querySelector('[data-nav-home]').addEventListener("click",function(e){ e.preventDefault(); navigate(null,null); });
    contentEl.querySelectorAll(".gap-card").forEach(function(el){
      el.addEventListener("click",function(){ navigate(el.getAttribute("data-mod"),el.getAttribute("data-gap")); });
    });
    document.getElementById("copyModuleLinkBtn").addEventListener("click",function(){
      var url=window.location.origin+window.location.pathname+"#/"+encodeURIComponent(mod.id);
      var btn=this;
      function done(){ btn.classList.add("copied"); btn.innerHTML="&#10003; Copied"; setTimeout(function(){ btn.classList.remove("copied"); btn.innerHTML="&#128279; Copy link to this module"; },1800); }
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(function(){ fb(url,done); });
      else fb(url,done);
    });

    if(hasFilter){
      contentEl.querySelectorAll(".filter-chip").forEach(function(btn){
        btn.addEventListener("click",function(){
          contentEl.querySelectorAll(".filter-chip").forEach(function(b){ b.classList.remove("active"); });
          btn.classList.add("active");
          var f=btn.getAttribute("data-filter");
          contentEl.querySelectorAll(".gap-card").forEach(function(card){
            if(f==="all"||card.getAttribute("data-type")===f) card.style.display="";
            else card.style.display="none";
          });
        });
      });
    }
  }

  // ───── GAP DETAIL ─────
  function renderGap(mod,g){
    var typeLabel=g.gap_type||g.category||"";
    var html='<div class="breadcrumb"><a href="#/" data-nav-home>Home</a><span class="sep">&#9656;</span>';
    html+='<a href="#/'+encodeURIComponent(mod.id)+'" data-nav-mod>'+esc(mod.name)+'</a><span class="sep">&#9656;</span>'+esc(g.title)+'</div>';

    html+='<div class="gap-detail-header">';
    html+='<div class="gdh-left">';
    if(typeLabel) html+='<div class="gd-type-badge">'+esc(typeLabel)+'</div>';
    html+='<h2>'+esc(g.title)+'</h2>';
    html+='<div class="gd-ideacount">'+g.ideas.length+' change idea'+(g.ideas.length===1?'':'s')+'</div>';
    html+='</div>';
    html+='<button class="copy-link-btn" id="copyLinkBtn">&#128279; Copy link</button></div>';

    if(g.resources&&g.resources.length){
      html+='<div class="gap-resources-box"><div class="grb-label">Resources for this gap:</div>';
      g.resources.forEach(function(r){ html+=resourceTag(r); });
      html+='</div>';
    }

    html+='<div class="idea-accordion" id="ideaAccordion">';
    g.ideas.forEach(function(idea,idx){
      html+='<div class="idea-item" id="idea-'+idx+'">';
      html+='<div class="idea-header" data-idx="'+idx+'">';
      html+='<div class="idea-header-left"><span class="idea-num">Idea '+(idx+1)+'</span><span class="idea-title-preview">'+esc(idea.idea)+'</span></div>';
      html+='<button class="idea-expand-btn"><span class="btn-chev">&#9656;</span> Open</button></div>';
      html+='<div class="idea-body">';
      html+='<div class="ib-field"><span class="ib-fl">Change idea</span><p class="ib-fv idea-main-text">'+esc(idea.idea)+'</p></div>';
      html+='<div class="ib-field"><span class="ib-fl">Rationale</span><p class="ib-fv">'+esc(idea.rationale)+'</p></div>';
      html+='<div class="ib-field"><span class="ib-fl">Process measure</span><p class="ib-fv">'+esc(idea.measure)+'</p></div>';
      if(idea.resources&&idea.resources.length){
        html+='<div class="ib-field"><span class="ib-fl">Resources</span><div>';
        idea.resources.forEach(function(r){ html+=resourceTag(r); });
        html+='</div></div>';
      }
      html+='</div></div>';
    });
    html+='</div>';

    contentEl.innerHTML=html;
    contentEl.querySelector('[data-nav-home]').addEventListener("click",function(e){ e.preventDefault(); navigate(null,null); });
    contentEl.querySelector('[data-nav-mod]').addEventListener("click",function(e){ e.preventDefault(); navigate(mod.id,null); });

    // Accordion
    function updateBtnText(item){
      var btn=item.querySelector('.idea-expand-btn');
      if(!btn) return;
      var isOpen=item.classList.contains('open');
      btn.innerHTML='<span class="btn-chev">&#9656;</span> '+(isOpen?'Close':'Open');
    }
    contentEl.querySelectorAll(".idea-header").forEach(function(hdr){
      hdr.addEventListener("click",function(){
        var item=hdr.closest(".idea-item");
        var wasOpen=item.classList.contains("open");
        contentEl.querySelectorAll(".idea-item.open").forEach(function(i){ i.classList.remove("open"); updateBtnText(i); });
        if(!wasOpen){ item.classList.add("open"); updateBtnText(item); }
      });
    });
    // Open first by default
    var first=contentEl.querySelector(".idea-item");
    if(first){ first.classList.add("open"); updateBtnText(first); }

    // Copy link
    document.getElementById("copyLinkBtn").addEventListener("click",function(){
      var url=window.location.origin+window.location.pathname+"#/"+encodeURIComponent(mod.id)+"/"+encodeURIComponent(g.id);
      var btn=this;
      function done(){ btn.classList.add("copied"); btn.innerHTML="&#10003; Copied"; setTimeout(function(){ btn.classList.remove("copied"); btn.innerHTML="&#128279; Copy link"; },1800); }
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(function(){ fb(url,done); });
      else fb(url,done);
    });
  }
  function fb(text,cb){ var ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); }catch(e){} document.body.removeChild(ta); if(cb)cb(); }

  // ───── ADDITIONAL RESOURCES ─────
  function renderResources(){
    var html='<div class="breadcrumb"><a href="#/" data-nav-home>Home</a><span class="sep">&#9656;</span>Additional Resources</div>';
    html+='<h2 class="res-title">Additional Resources</h2>';
    html+='<p class="res-intro">Supporting tools included in the NEST360 Change Package for facilitation of QI meetings and clinical skill assessment.</p>';
    ADD_RESOURCES.forEach(function(r){
      html+='<div class="res-card">';
      html+='<h3>'+esc(r.title)+'</h3>';
      html+='<p class="res-desc">'+esc(r.description)+'</p>';
      if(r.sections&&r.sections.length){
        html+='<div class="res-sections-label">Sections covered:</div><ul class="res-sections">';
        r.sections.forEach(function(s){ html+='<li>'+esc(s)+'</li>'; });
        html+='</ul>';
      }
      html+='</div>';
    });
    html+='<p class="res-note">The full text of these templates is available in the NEST360 Change Package PDF (August 2025).</p>';
    contentEl.innerHTML=html;
    contentEl.querySelector('[data-nav-home]').addEventListener("click",function(e){ e.preventDefault(); navigate(null,null); });
  }

  // ───── SEARCH ─────
  var searchInput=document.getElementById("searchInput");
  var searchResultsEl=document.getElementById("searchResults");
  var idx=[];
  MODULES.forEach(function(mod){
    mod.gaps.forEach(function(g){
      g.ideas.forEach(function(idea){
        idx.push({
          modId:mod.id,modName:mod.name,gapId:g.id,gapTitle:g.title,
          ideaText:idea.idea,rationale:idea.rationale,measure:idea.measure,
          hay:(mod.name+" "+g.title+" "+idea.idea+" "+idea.rationale+" "+idea.measure+" "+(idea.resources||[]).join(" ")+" "+(g.resources||[]).join(" ")).toLowerCase()
        });
      });
    });
  });
  function runSearch(q){
    q=q.trim().toLowerCase();
    if(q.length<2){ searchResultsEl.classList.remove("show"); searchResultsEl.innerHTML=""; return; }
    var terms=q.split(/\s+/).filter(Boolean);
    var matches=idx.filter(function(item){ return terms.every(function(t){ return item.hay.indexOf(t)!==-1; }); }).slice(0,20);
    var html="";
    if(!matches.length){ html='<div class="sr-empty">No matches found.</div>'; }
    else matches.forEach(function(m){
      html+='<div class="search-result-item" data-mod="'+m.modId+'" data-gap="'+m.gapId+'">';
      html+='<div class="sr-path">'+esc(m.modName)+'&#160;&#8250;&#160;'+esc(m.gapTitle)+'</div>';
      html+='<div class="sr-title">'+esc(m.ideaText)+'</div>';
      html+='<div class="sr-snippet">'+esc(m.rationale.slice(0,110))+(m.rationale.length>110?'…':'')+'</div></div>';
    });
    searchResultsEl.innerHTML=html;
    searchResultsEl.classList.add("show");
    searchResultsEl.querySelectorAll(".search-result-item").forEach(function(el){
      el.addEventListener("click",function(){ navigate(el.getAttribute("data-mod"),el.getAttribute("data-gap")); searchInput.value=""; searchResultsEl.classList.remove("show"); searchInput.blur(); });
    });
  }
  searchInput.addEventListener("input",function(){ runSearch(this.value); });
  searchInput.addEventListener("focus",function(){ if(this.value.trim().length>=2) searchResultsEl.classList.add("show"); });
  document.addEventListener("click",function(e){ if(!e.target.closest(".search-wrap")) searchResultsEl.classList.remove("show"); });

  // Show the iOS banner only when running as a local file on a mobile device
  (function(){
    var isLocalFile = window.location.protocol === 'file:';
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if(isLocalFile && isMobile){
      var b = document.getElementById('iosBanner');
      if(b) b.style.display = 'block';
    }
  })();

  render();
})();
