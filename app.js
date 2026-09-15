(function(){
  "use strict";

  var CATS = [
    {code:'P',  label:'Political'},
    {code:'EC', label:'Economic'},
    {code:'S',  label:'Social'},
    {code:'T',  label:'Technological'},
    {code:'EN', label:'Environmental'},
    {code:'L',  label:'Legal'}
  ];

  var CAT_HEX = {P:'#6E56CF', EC:'#2568C7', S:'#C7397A', T:'#1B9C9C', EN:'#4C9A2A', L:'#B9791C'};
  // Export-only palette, matched to a specific Canva deck theme: light grey
  // ground, one primary blue for chrome/branding, soft pastel-vivid tones
  // per PESTEL category so they stay distinguishable without breaking theme.
  var EXPORT_CAT_HEX = {P:'#7B68C4', EC:'#4886DA', S:'#E0766C', T:'#2FA6A3', EN:'#5CB85C', L:'#DDA23A'};
  var CAT_ICON = {
    P:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="21" x2="5" y2="3"/><path d="M5 4 L18 4 L15 8 L18 12 L5 12"/></svg>',
    EC: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4" height="8"/><rect x="10" y="9" width="4" height="12"/><rect x="17" y="4" width="4" height="17"/></svg>',
    S:  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="9" r="6"/><circle cx="16" cy="11" r="4.5" opacity="0.75"/></svg>',
    T:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="15" x2="22" y2="15"/></svg>',
    EN: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 Q20 8 12 21 Q4 8 12 3 Z"/></svg>',
    L:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="7" x2="4" y2="13"/><line x1="20" y1="7" x2="20" y2="13"/><line x1="7" y1="21" x2="17" y2="21"/><circle cx="4" cy="14.5" r="2" fill="currentColor" stroke="none"/><circle cx="20" cy="14.5" r="2" fill="currentColor" stroke="none"/></svg>'
  };
  var LIGHT_PALETTE = {neg:'#C7453B', mid:'#9C978A', pos:'#2E9E5B'};
  var DARK_PALETTE  = {neg:'#E2695D', mid:'#8B8678', pos:'#57C783'};
  var EXPORT_BG='#F1F1F1', EXPORT_INK='#1A1A1A', EXPORT_DIM='#5C7A9E', EXPORT_LINE='#D6E3F2', EXPORT_CARD='#FFFFFF';
  var EXPORT_ACCENT='#4886DA', EXPORT_ACCENT_LIGHT='#D6E3F2';

  var SEED = [
    {category:'P',  text:'Proposed import tariff changes could raise component costs 8-12% next fiscal year.', impact:-3, link:'https://www.trade.gov/tariff-updates'},
    {category:'EC', text:'Forecast interest-rate cuts next quarter may ease consumer financing and lift demand.', impact:2, link:''},
    {category:'S',  text:'Core demographic shows growing preference for sustainable packaging over convenience.', impact:3, link:''},
    {category:'T',  text:'On-device AI features open a 12-18 month differentiation window before competitors catch up.', impact:4, link:''},
    {category:'EN', text:'Stricter emissions-reporting rules add compliance overhead for the manufacturing line.', impact:-2, link:'https://www.epa.gov/reporting-requirements'},
    {category:'L',  text:'Pending data-privacy legislation may force product changes within 12 months.', impact:-4, link:''}
  ];

  var NAME_POOL = ['Analyst','Strategist','Researcher','Planner','Reviewer'];
  var COLOR_POOL = ['#6E56CF','#2568C7','#C7397A','#1B9C9C','#4C9A2A','#B9791C','#D0455C','#3D7ADB'];
  var TABLE = 'pestel_notes';

  function uid(){ return Math.random().toString(36).slice(2,9); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function hexToRgb(hex){ hex=hex.replace('#',''); return [parseInt(hex.substring(0,2),16),parseInt(hex.substring(2,4),16),parseInt(hex.substring(4,6),16)]; }
  function rgbToHex(c){ return '#'+c.map(function(v){ return Math.round(clamp(v,0,255)).toString(16).padStart(2,'0'); }).join(''); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function impactColor(impact, pal){
    var t = clamp(impact,-5,5)/5;
    var neg=hexToRgb(pal.neg), mid=hexToRgb(pal.mid), pos=hexToRgb(pal.pos);
    var c;
    if(t<0){ c=mid.map(function(m,i){ return lerp(m,neg[i],-t); }); }
    else { c=mid.map(function(m,i){ return lerp(m,pos[i],t); }); }
    return rgbToHex(c);
  }
  function isDark(){
    var attr=document.documentElement.getAttribute('data-theme');
    if(attr==='dark') return true;
    if(attr==='light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function onScreenPalette(){ return isDark() ? DARK_PALETTE : LIGHT_PALETTE; }
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function normalizeUrl(url){
    url = (url||'').trim();
    if(!url) return '';
    if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }
  function linkDomain(url){
    try{ return new URL(url).hostname.replace(/^www\./,''); }
    catch(e){ return url; }
  }
  var LINK_ICON = '<svg class="link-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 10a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1-1"/></svg>';

  function rowToNote(row){
    return {
      id: row.id,
      category: row.category,
      text: row.text || '',
      impact: row.impact || 0,
      link: row.link || '',
      order: row.order_index || 0,
      author: {name: row.author_name || 'Someone', color: row.author_color || '#888'},
      updatedAt: row.updated_at
    };
  }
  function noteToRow(patch){
    var row = {};
    if('category' in patch) row.category = patch.category;
    if('text' in patch) row.text = patch.text;
    if('impact' in patch) row.impact = patch.impact;
    if('link' in patch) row.link = patch.link;
    if('order' in patch) row.order_index = patch.order;
    if(patch.author){ row.author_name = patch.author.name; row.author_color = patch.author.color; }
    return row;
  }

  // ---------------- state ----------------
  var sb = null, notesChannel = null, presenceChannel = null, connected = false;
  var previewMode = false, previewFileName = null;
  var notes = [];
  var draftText = {};
  var textTimers = {};
  var editingLinks = {};
  var viewMode = 'board';
  var myPeer = {
    id: localStorage.getItem('pestel-id') || uid(),
    name: localStorage.getItem('pestel-name') || (NAME_POOL[Math.floor(Math.random()*NAME_POOL.length)] + ' ' + Math.floor(Math.random()*90+10)),
    color: localStorage.getItem('pestel-color') || COLOR_POOL[Math.floor(Math.random()*COLOR_POOL.length)]
  };
  localStorage.setItem('pestel-id', myPeer.id);
  localStorage.setItem('pestel-color', myPeer.color);

  var board = document.getElementById('board');
  var toastEl = document.getElementById('toast');
  var statusBar = document.getElementById('statusBar');
  var toastTimer = null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.hidden = true; }, 2600);
  }
  function setStatus(msg, isError){
    statusBar.hidden = false;
    statusBar.classList.toggle('error', !!isError);
    statusBar.innerHTML = '<span class="status-dot"></span><span>'+escapeHtml(msg)+'</span>';
  }
  function setPreviewStatus(fileName){
    statusBar.hidden = false;
    statusBar.classList.add('error');
    statusBar.innerHTML =
      '<span class="status-dot"></span>' +
      '<span>Previewing "'+escapeHtml(fileName)+'" — not synced, and no one else can see this.</span>' +
      '<span class="status-actions">' +
        '<button class="status-btn" id="statusRestore">Restore to live board</button>' +
        '<button class="status-btn" id="statusReturn">Return to live board</button>' +
      '</span>';
  }

  function columnNotes(code){
    return notes.filter(function(n){ return n.category===code; })
      .sort(function(a,b){ return (a.order||0)-(b.order||0); });
  }

  // ---------------- render ----------------
  function autoGrow(el){
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  }

  function noteCardHtml(n, cat, pal, dndEnabled, showScaleControl){
    var text = draftText.hasOwnProperty(n.id) ? draftText[n.id] : (n.text||'');
    var impact = n.impact||0;
    var color = impactColor(impact, pal);
    var scoreText = (impact>0?'+':'') + impact;
    var author = n.author && n.author.name ? n.author.name : 'Someone';
    var footerHtml = showScaleControl===false ?
      '<div class="note-footer note-footer-compact">' +
        '<button class="note-del" data-id="'+n.id+'" aria-label="Delete factor">&times;</button>' +
      '</div>' :
      '<div class="note-footer">' +
        '<input type="range" class="note-slider" data-id="'+n.id+'" min="-5" max="5" step="1" value="'+impact+'" style="--thumb:'+color+'" aria-label="Impact, negative five to positive five">' +
        '<span class="note-score" style="color:'+color+'">'+scoreText+'</span>' +
        '<button class="note-del" data-id="'+n.id+'" aria-label="Delete factor">&times;</button>' +
      '</div>';
    var linkHtml;
    if(editingLinks[n.id]){
      linkHtml = '<div class="note-link-row">' +
          '<input type="url" class="note-link-input" data-id="'+n.id+'" placeholder="https://source…" value="'+escapeHtml(n.link||'')+'">' +
        '</div>';
    } else if(n.link){
      linkHtml = '<div class="note-link-row">' +
          '<a class="note-link-chip" href="'+escapeHtml(n.link)+'" target="_blank" rel="noopener noreferrer">'+LINK_ICON+'<span>'+escapeHtml(linkDomain(n.link))+'</span></a>' +
          '<button class="note-link-edit" data-id="'+n.id+'" aria-label="Edit source link">Edit</button>' +
          '<button class="note-link-remove" data-id="'+n.id+'" aria-label="Remove source link">&times;</button>' +
        '</div>';
    } else {
      linkHtml = '<button class="note-link-add" data-id="'+n.id+'">'+LINK_ICON+' Add source link</button>';
    }
    return '' +
      '<article class="note" draggable="'+(dndEnabled===false?'false':'true')+'" data-id="'+n.id+'" data-cat="'+cat.code+'">' +
        '<span class="note-accent" style="background:'+color+'"></span>' +
        '<textarea class="note-text" data-id="'+n.id+'" rows="1" placeholder="Describe the factor…" aria-label="'+cat.label+' factor">'+escapeHtml(text)+'</textarea>' +
        footerHtml +
        '<div class="note-link">'+linkHtml+'</div>' +
        '<div class="note-meta">'+escapeHtml(author)+'</div>' +
      '</article>';
  }

  function captureFocusInfo(){
    var active = document.activeElement;
    if(active && active.classList && active.classList.contains('note-text')){
      return {id: active.dataset.id, start: active.selectionStart, end: active.selectionEnd, field:'text'};
    }
    if(active && active.classList && active.classList.contains('note-link-input')){
      return {id: active.dataset.id, field:'link'};
    }
    return null;
  }
  function restoreFocusInfo(focusInfo){
    if(!focusInfo) return;
    if(focusInfo.field==='text'){
      var el = board.querySelector('.note-text[data-id="'+focusInfo.id+'"]');
      if(el){
        el.focus();
        try{ el.setSelectionRange(focusInfo.start, focusInfo.end); }catch(e){}
      }
    } else if(focusInfo.field==='link'){
      var linkEl = board.querySelector('.note-link-input[data-id="'+focusInfo.id+'"]');
      if(linkEl){ linkEl.focus(); var v=linkEl.value; linkEl.setSelectionRange(v.length, v.length); }
    }
  }

  var pendingRender = false;
  function isEditingField(){
    var active = document.activeElement;
    return !!(active && active.classList && (active.classList.contains('note-text') || active.classList.contains('note-link-input')));
  }
  function render(){
    // A full re-render tears down and rebuilds every textarea's DOM node.
    // Doing that while the user is mid-keystroke can drop the character
    // that was about to land in the node that just got replaced — this is
    // why typing felt like it couldn't keep up: every debounced save (and
    // every realtime echo, including of your own edits) was rebuilding the
    // whole board out from under you. Defer instead, and catch up the
    // instant focus actually leaves the field.
    if(isEditingField()){ pendingRender = true; return; }
    pendingRender = false;
    if(viewMode==='scale') renderScale(); else renderBoard();
  }
  function flushPendingRender(){
    requestAnimationFrame(function(){
      if(pendingRender && !isEditingField()) render();
    });
  }

  function renderBoard(){
    board.classList.remove('board-scale');
    var focusInfo = captureFocusInfo();
    var pal = onScreenPalette();
    var html = CATS.map(function(cat){
      var list = columnNotes(cat.code);
      var notesHtml = list.map(function(n){ return noteCardHtml(n, cat, pal, true); }).join('');
      var sum = list.reduce(function(a,n){ return a+(n.impact||0); }, 0);
      var sumLabel = (sum>0?'+':'') + sum;
      return '' +
        '<section class="column" data-cat="'+cat.code+'">' +
          '<header class="column-head">' +
            '<div class="column-head-title"><span class="col-icon" aria-hidden="true">'+CAT_ICON[cat.code]+'</span><h2>'+cat.label+'</h2></div>' +
            '<span class="column-count" title="Net impact across '+list.length+' factor'+(list.length===1?'':'s')+'">'+sumLabel+'</span>' +
          '</header>' +
          '<div class="notes" data-cat="'+cat.code+'">'+notesHtml+'</div>' +
          '<button class="add-note" data-cat="'+cat.code+'">+ Add factor</button>' +
        '</section>';
    }).join('');

    board.innerHTML = html;
    var textareas = board.querySelectorAll('.note-text');
    for(var i=0;i<textareas.length;i++){ autoGrow(textareas[i]); }
    restoreFocusInfo(focusInfo);
  }

  var AXIS_TOP = 22, LANE_H = 176, MIN_GAP = 3.4;

  function layoutLanes(list){
    var sorted = list.slice().sort(function(a,b){ return (a.impact||0)-(b.impact||0); });
    var laneLast = [];
    var placements = sorted.map(function(n){
      var impact = n.impact||0;
      var lane = 0;
      while(laneLast[lane]!==undefined && Math.abs(impact-laneLast[lane]) < MIN_GAP){ lane++; }
      laneLast[lane] = impact;
      return {note:n, lane:lane};
    });
    return {placements:placements, laneCount: laneLast.length};
  }

  // Fixed-height contexts (PNG/PPTX export) can't grow a row to fit more
  // vertical lanes the way the live DOM view can. Once a row runs out of
  // lanes, wrap: cycle back to lane 0 and nudge that note sideways near its
  // true scale position instead of ever hiding a factor.
  function layoutLanesWrapped(list, maxLanes){
    maxLanes = Math.max(1, maxLanes);
    var sorted = list.slice().sort(function(a,b){ return (a.impact||0)-(b.impact||0); });
    var laneLast = [];
    var placements = sorted.map(function(n){
      var impact = n.impact||0;
      var lane = 0;
      while(laneLast[lane]!==undefined && Math.abs(impact-laneLast[lane]) < MIN_GAP){ lane++; }
      laneLast[lane] = impact;
      // row: which vertical lane it prints in (wraps once lanes run out).
      // order: how many notes it collided with, in placement order — used
      // to jitter its X position on the axis so two close/equal values
      // never plot as the same dot, even when they land in different rows.
      return {note:n, row: lane % maxLanes, order: lane};
    });
    // crowded: true if ANY collision happened in this row. When it has,
    // every label in the row needs a narrow box — a note that got there
    // first (order 0) still sits close enough to a jittered neighbor that
    // its full-width label would swallow it regardless of the jitter.
    return {placements: placements, crowded: laneLast.length > 1};
  }
  // Keeps a wrapped point within half a scale-unit of its true value — a
  // note at -4 never drifts outside [-4.5, -3.5], however many wrap.
  var JITTER_BAND = [0.5, -0.5, 0.25, -0.25, 0.4, -0.4, 0.15, -0.15];
  function jitterValueOffset(wrap){
    if(wrap<=0) return 0;
    if(wrap-1 < JITTER_BAND.length) return JITTER_BAND[wrap-1];
    var dir = wrap%2===0 ? -1 : 1;
    return dir * (0.5 / (2 + Math.floor((wrap-JITTER_BAND.length)/2)));
  }

  function renderScale(){
    board.classList.add('board-scale');
    var focusInfo = captureFocusInfo();
    var pal = onScreenPalette();

    var rowsHtml = CATS.map(function(cat){
      var list = columnNotes(cat.code);
      var sum = list.reduce(function(a,n){ return a+(n.impact||0); }, 0);
      var sumLabel = (sum>0?'+':'') + sum;
      var netColor = impactColor(sum, pal);

      var layout = layoutLanes(list);
      var laneCount = Math.max(1, layout.laneCount);
      var trackHeight = AXIS_TOP + 14 + laneCount*LANE_H + 10;

      var cardsHtml = layout.placements.map(function(p){
        var n = p.note, impact = n.impact||0;
        var leftPct = 50 + (clamp(impact,-5,5)/5)*44;
        var anchor = leftPct<38 ? 'anchor-left' : (leftPct>62 ? 'anchor-right' : 'anchor-center');
        var top = AXIS_TOP + 22 + p.lane*LANE_H;
        var color = impactColor(impact, pal);
        return '' +
          '<div class="scale-stem" data-id="'+n.id+'" style="left:'+leftPct+'%;top:'+AXIS_TOP+'px;height:'+(top-AXIS_TOP)+'px;--chip:'+color+'"></div>' +
          '<span class="scale-stem-dot" data-id="'+n.id+'" style="left:'+leftPct+'%;top:'+AXIS_TOP+'px;--chip:'+color+'"></span>' +
          '<div class="scale-card '+anchor+'" data-id="'+n.id+'" data-lane="'+p.lane+'" data-track-cat="'+cat.code+'" style="left:'+leftPct+'%;top:'+top+'px">' +
            noteCardHtml(n, cat, pal, false, false) +
          '</div>';
      }).join('');

      return '' +
        '<div class="scale-row" data-cat="'+cat.code+'">' +
          '<div class="scale-track" style="height:'+trackHeight+'px">' +
            '<div class="scale-axis" style="top:'+AXIS_TOP+'px"></div>' +
            '<span class="scale-tick scale-tick-neg" style="top:'+AXIS_TOP+'px">−5</span>' +
            '<span class="scale-tick scale-tick-pos" style="top:'+AXIS_TOP+'px">+5</span>' +
            '<div class="scale-topic" style="top:'+AXIS_TOP+'px">' +
              '<span class="scale-cat-badge" style="background:'+netColor+'" title="'+cat.label+'" aria-hidden="true">'+CAT_ICON[cat.code]+'</span>' +
              '<span class="scale-cat-name">'+cat.label+'</span>' +
              '<span class="scale-net" style="color:'+netColor+'">'+sumLabel+'</span>' +
            '</div>' +
            '<button class="scale-add" data-cat="'+cat.code+'" title="Add a '+cat.label+' factor">+</button>' +
            cardsHtml +
          '</div>' +
        '</div>';
    }).join('');

    board.innerHTML = '<div class="scale-rows">'+rowsHtml+'</div>';

    var textareas = board.querySelectorAll('.note-text');
    for(var i=0;i<textareas.length;i++){ autoGrow(textareas[i]); }
    layoutScaleHeights();
    restoreFocusInfo(focusInfo);
  }

  function layoutScaleHeights(){
    var GAP = 16;
    var rows = board.querySelectorAll('.scale-row');
    for(var r=0;r<rows.length;r++){
      var track = rows[r].querySelector('.scale-track');
      var cards = track ? track.querySelectorAll('.scale-card') : [];
      if(!cards.length) continue;
      var laneHeights = {};
      for(var i=0;i<cards.length;i++){
        var lane = parseInt(cards[i].dataset.lane,10)||0;
        var h = cards[i].offsetHeight;
        if(!laneHeights[lane] || h>laneHeights[lane]) laneHeights[lane]=h;
      }
      var laneCount = 0;
      for(var key in laneHeights) laneCount = Math.max(laneCount, parseInt(key,10)+1);
      var laneTop = [];
      var cum = AXIS_TOP + 22;
      for(var lane2=0; lane2<laneCount; lane2++){
        laneTop[lane2] = cum;
        cum += (laneHeights[lane2]||0) + GAP;
      }
      for(var j=0;j<cards.length;j++){
        var c = cards[j];
        var laneIdx = parseInt(c.dataset.lane,10)||0;
        var top = laneTop[laneIdx];
        c.style.top = top+'px';
        var stem = track.querySelector('.scale-stem[data-id="'+c.dataset.id+'"]');
        if(stem) stem.style.height = (top-AXIS_TOP)+'px';
      }
      track.style.height = (cum - GAP + 16)+'px';
    }
  }

  function renderPeers(state){
    var wrap = document.getElementById('peers');
    var others = [];
    for(var key in state){
      if(key===myPeer.id) continue;
      var entries = state[key];
      if(entries && entries.length) others.push(entries[0]);
    }
    others = others.slice(0,6);
    wrap.innerHTML = others.map(function(p){
      var name = p.name || 'Someone';
      var color = p.color || '#999';
      var initial = name.trim().charAt(0).toUpperCase() || '?';
      return '<span class="peer-avatar" style="background:'+color+'" title="'+escapeHtml(name)+'">'+initial+'</span>';
    }).join('');
  }

  // ---------------- writes ----------------
  function writeNote(id, patch){
    var n = notes.find(function(x){ return x.id===id; });
    if(n) Object.assign(n, patch);
    render();
    if(!sb || previewMode) return;
    sb.from(TABLE).update(noteToRow(patch)).eq('id', id).then(function(res){
      if(res.error) toast('Could not save change.');
    });
  }

  function addNote(catCode){
    var list = columnNotes(catCode);
    var order = list.length ? Math.max.apply(null, list.map(function(n){ return n.order||0; }))+1 : 0;
    var base = {category:catCode, text:'', impact:0, link:'', order:order, author:{name:myPeer.name,color:myPeer.color}};
    if(!sb || previewMode){
      base.id = 'local-'+uid();
      notes.push(base);
      render();
      focusNoteText(base.id);
      return;
    }
    sb.from(TABLE).insert(noteToRow(base)).select().single().then(function(res){
      if(res.error){ toast('Could not add factor — try again.'); return; }
      var note = rowToNote(res.data);
      if(!notes.some(function(n){ return n.id===note.id; })){ notes.push(note); }
      render();
      focusNoteText(note.id);
    });
  }
  function focusNoteText(id){
    requestAnimationFrame(function(){
      var el = board.querySelector('.note-text[data-id="'+id+'"]');
      if(el) el.focus();
    });
  }

  function deleteNote(id){
    notes = notes.filter(function(n){ return n.id!==id; });
    render();
    if(!sb || previewMode) return;
    sb.from(TABLE).delete().eq('id', id).then(function(res){
      if(res.error) toast('Could not delete — try again.');
    });
  }

  function handleTextInput(el){
    var id = el.dataset.id;
    draftText[id] = el.value;
    autoGrow(el);
    clearTimeout(textTimers[id]);
    textTimers[id] = setTimeout(function(){
      writeNote(id, {text: draftText[id]});
      delete draftText[id];
      delete textTimers[id];
    }, 550);
  }
  function flushText(id){
    if(draftText.hasOwnProperty(id)){
      clearTimeout(textTimers[id]);
      writeNote(id, {text: draftText[id]});
      delete draftText[id];
      delete textTimers[id];
    }
  }
  function commitLink(id, value){
    if(!editingLinks[id]) return;
    delete editingLinks[id];
    writeNote(id, {link: normalizeUrl(value)});
  }
  function startLinkEdit(id){
    editingLinks[id] = true;
    render();
    requestAnimationFrame(function(){
      var el = board.querySelector('.note-link-input[data-id="'+id+'"]');
      if(el){ el.focus(); el.select(); }
    });
  }

  // ---------------- drag & drop ----------------
  var dragId = null;
  board.addEventListener('dragstart', function(e){
    var note = e.target.closest ? e.target.closest('.note') : null;
    if(!note) return;
    dragId = note.dataset.id;
    note.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try{ e.dataTransfer.setData('text/plain', dragId); }catch(err){}
  });
  board.addEventListener('dragend', function(){
    var dragging = board.querySelector('.note.dragging');
    if(dragging) dragging.classList.remove('dragging');
    var cols = board.querySelectorAll('.column');
    for(var i=0;i<cols.length;i++) cols[i].classList.remove('drag-over');
    dragId = null;
  });
  board.addEventListener('dragover', function(e){
    var col = e.target.closest ? e.target.closest('.column') : null;
    if(!col) return;
    e.preventDefault();
    var cols = board.querySelectorAll('.column');
    for(var i=0;i<cols.length;i++) cols[i].classList.toggle('drag-over', cols[i]===col);
  });
  board.addEventListener('drop', function(e){
    var container = e.target.closest ? e.target.closest('.notes') : null;
    if(!container || !dragId) return;
    e.preventDefault();
    var targetCat = container.dataset.cat;
    var id = dragId;
    var siblings = Array.prototype.slice.call(container.querySelectorAll('.note')).filter(function(el){ return el.dataset.id!==id; });
    var y = e.clientY;
    var insertBeforeId = null;
    for(var i=0;i<siblings.length;i++){
      var box = siblings[i].getBoundingClientRect();
      if(y < box.top + box.height/2){ insertBeforeId = siblings[i].dataset.id; break; }
    }
    var list = columnNotes(targetCat).filter(function(n){ return n.id!==id; });
    var idx = insertBeforeId ? list.findIndex(function(n){ return n.id===insertBeforeId; }) : list.length;
    if(idx<0) idx = list.length;
    var orderedIds = list.map(function(n){ return n.id; });
    orderedIds.splice(idx, 0, id);

    orderedIds.forEach(function(nid, i){
      var orig = notes.find(function(n){ return n.id===nid; });
      if(!orig) return;
      var patch = {};
      if(nid===id && orig.category!==targetCat) patch.category = targetCat;
      if((orig.order||0)!==i) patch.order = i;
      if(Object.keys(patch).length) writeNote(nid, patch);
    });

    var cols = board.querySelectorAll('.column');
    for(var j=0;j<cols.length;j++) cols[j].classList.remove('drag-over');
  });

  // ---------------- scale-view pointer drag ----------------
  var scaleDrag = null;

  function impactFromClientX(trackEl, clientX){
    var rect = trackEl.getBoundingClientRect();
    var pct = ((clientX-rect.left)/rect.width)*100;
    return clamp(Math.round(((pct-50)/44)*5), -5, 5);
  }

  function moveScaleElements(id, impact, pal){
    var leftPct = 50 + (clamp(impact,-5,5)/5)*44;
    var color = impactColor(impact, pal);
    var card = board.querySelector('.scale-card[data-id="'+id+'"]');
    var stem = board.querySelector('.scale-stem[data-id="'+id+'"]');
    var dot = board.querySelector('.scale-stem-dot[data-id="'+id+'"]');
    if(card){
      card.style.left = leftPct+'%';
      card.classList.remove('anchor-left','anchor-right','anchor-center');
      card.classList.add(leftPct<38 ? 'anchor-left' : (leftPct>62 ? 'anchor-right' : 'anchor-center'));
      var slider = card.querySelector('.note-slider');
      var score = card.querySelector('.note-score');
      var accent = card.querySelector('.note-accent');
      if(slider){ slider.value = impact; slider.style.setProperty('--thumb', color); }
      if(score){ score.textContent = (impact>0?'+':'')+impact; score.style.color = color; }
      if(accent) accent.style.background = color;
    }
    if(stem){ stem.style.left = leftPct+'%'; stem.style.setProperty('--chip', color); }
    if(dot){ dot.style.left = leftPct+'%'; dot.style.setProperty('--chip', color); }
  }

  board.addEventListener('pointerdown', function(e){
    if(viewMode!=='scale') return;
    var accent = e.target.closest('.note-accent');
    if(!accent) return;
    var cardWrap = accent.closest('.scale-card');
    var track = cardWrap ? cardWrap.closest('.scale-track') : null;
    if(!cardWrap || !track) return;
    scaleDrag = {id: cardWrap.dataset.id, track: track};
    cardWrap.classList.add('scale-dragging');
    try{ accent.setPointerCapture(e.pointerId); }catch(err){}
    e.preventDefault();
  });
  board.addEventListener('pointermove', function(e){
    if(!scaleDrag) return;
    var impact = impactFromClientX(scaleDrag.track, e.clientX);
    scaleDrag.impact = impact;
    moveScaleElements(scaleDrag.id, impact, onScreenPalette());
  });
  function endScaleDrag(){
    if(!scaleDrag) return;
    var id = scaleDrag.id, impact = scaleDrag.impact;
    var cardWrap = board.querySelector('.scale-card[data-id="'+id+'"]');
    if(cardWrap) cardWrap.classList.remove('scale-dragging');
    scaleDrag = null;
    if(impact!==undefined) writeNote(id, {impact:impact});
  }
  board.addEventListener('pointerup', endScaleDrag);
  board.addEventListener('pointercancel', endScaleDrag);

  // ---------------- delegated events ----------------
  board.addEventListener('input', function(e){
    if(e.target.matches('.note-text')) handleTextInput(e.target);
    if(e.target.matches('.note-slider')){
      var val = parseInt(e.target.value,10);
      var color = impactColor(val, onScreenPalette());
      e.target.style.setProperty('--thumb', color);
      var scoreEl = e.target.parentElement.querySelector('.note-score');
      if(scoreEl){ scoreEl.textContent = (val>0?'+':'')+val; scoreEl.style.color = color; }
      var accentEl = e.target.closest('.note').querySelector('.note-accent');
      if(accentEl) accentEl.style.background = color;
    }
  });
  board.addEventListener('change', function(e){
    if(e.target.matches('.note-slider')){
      writeNote(e.target.dataset.id, {impact: parseInt(e.target.value,10)});
    }
  });
  board.addEventListener('focusout', function(e){
    if(e.target.matches('.note-text')) flushText(e.target.dataset.id);
    if(e.target.matches('.note-link-input')) commitLink(e.target.dataset.id, e.target.value);
    flushPendingRender();
  });
  board.addEventListener('keydown', function(e){
    if(e.target.matches('.note-link-input')){
      if(e.key==='Enter'){ e.preventDefault(); e.target.blur(); }
      if(e.key==='Escape'){ e.preventDefault(); delete editingLinks[e.target.dataset.id]; render(); }
    }
  });
  board.addEventListener('click', function(e){
    var del = e.target.closest('.note-del');
    if(del){ deleteNote(del.dataset.id); return; }
    var add = e.target.closest('.add-note');
    if(add){ addNote(add.dataset.cat); return; }
    var linkAdd = e.target.closest('.note-link-add');
    if(linkAdd){ startLinkEdit(linkAdd.dataset.id); return; }
    var linkEdit = e.target.closest('.note-link-edit');
    if(linkEdit){ startLinkEdit(linkEdit.dataset.id); return; }
    var linkRemove = e.target.closest('.note-link-remove');
    if(linkRemove){ writeNote(linkRemove.dataset.id, {link:''}); return; }
    var scaleAdd = e.target.closest('.scale-add');
    if(scaleAdd){ addNote(scaleAdd.dataset.cat); return; }
  });

  var viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      viewMode = btn.dataset.view;
      viewButtons.forEach(function(b){
        var active = b.dataset.view===viewMode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      render();
    });
  });

  // ---------------- export ----------------
  var RATIOS = {
    widescreen: {w:1920,h:1080,cols:6,rows:1,label:'Widescreen',hint:'1920×1080 · Canva presentation'},
    square:     {w:1080,h:1080,cols:3,rows:2,label:'Square',hint:'1080×1080 · Canva social post'},
    a4:         {w:1240,h:1754,cols:2,rows:3,label:'A4 portrait',hint:'1240×1754 · printable report page'}
  };
  var selectedRatio = 'widescreen';
  var selectedLayout = 'grid';

  var layoutToggle = document.getElementById('layoutToggle');
  layoutToggle.addEventListener('click', function(e){
    var btn = e.target.closest('.layout-opt');
    if(!btn) return;
    selectedLayout = btn.dataset.layout;
    Array.prototype.forEach.call(layoutToggle.querySelectorAll('.layout-opt'), function(el){
      el.classList.toggle('active', el.dataset.layout===selectedLayout);
    });
  });
  function setLayoutButtons(){
    Array.prototype.forEach.call(layoutToggle.querySelectorAll('.layout-opt'), function(el){
      el.classList.toggle('active', el.dataset.layout===selectedLayout);
    });
  }

  var customW = 1600, customH = 900;

  var ratioList = document.getElementById('ratioList');
  ratioList.innerHTML = Object.keys(RATIOS).map(function(key){
    var r = RATIOS[key];
    return '<label class="ratio-opt'+(key===selectedRatio?' active':'')+'" data-key="'+key+'">' +
      '<input type="radio" name="ratio" value="'+key+'" '+(key===selectedRatio?'checked':'')+'>' +
      '<span><strong>'+r.label+'</strong><span>'+r.hint+'</span></span>' +
    '</label>';
  }).join('') +
    '<label class="ratio-opt" data-key="custom">' +
      '<input type="radio" name="ratio" value="custom">' +
      '<span>' +
        '<strong>Custom size</strong>' +
        '<span class="custom-dims">' +
          '<input type="number" id="customW" min="200" max="4000" step="10" value="'+customW+'" aria-label="Custom width in pixels">' +
          '<span aria-hidden="true">×</span>' +
          '<input type="number" id="customH" min="200" max="4000" step="10" value="'+customH+'" aria-label="Custom height in pixels">' +
          '<span aria-hidden="true">px</span>' +
        '</span>' +
      '</span>' +
    '</label>';

  ratioList.addEventListener('change', function(e){
    if(e.target.name==='ratio'){
      selectedRatio = e.target.value;
      Array.prototype.forEach.call(ratioList.querySelectorAll('.ratio-opt'), function(el){
        el.classList.toggle('active', el.dataset.key===selectedRatio);
      });
    }
  });

  function selectCustomRatio(){
    selectedRatio = 'custom';
    var radio = ratioList.querySelector('input[value="custom"]');
    if(radio) radio.checked = true;
    Array.prototype.forEach.call(ratioList.querySelectorAll('.ratio-opt'), function(el){
      el.classList.toggle('active', el.dataset.key==='custom');
    });
  }
  var customWInput = document.getElementById('customW');
  var customHInput = document.getElementById('customH');
  customWInput.addEventListener('input', function(){
    customW = clamp(parseInt(customWInput.value,10)||customW, 200, 4000);
    selectCustomRatio();
  });
  customHInput.addEventListener('input', function(){
    customH = clamp(parseInt(customHInput.value,10)||customH, 200, 4000);
    selectCustomRatio();
  });

  var overlay = document.getElementById('exportOverlay');
  document.getElementById('exportOpen').addEventListener('click', function(){
    selectedLayout = viewMode==='scale' ? 'scale' : 'grid';
    setLayoutButtons();
    overlay.hidden = false;
  });
  document.getElementById('exportClose').addEventListener('click', function(){ overlay.hidden = true; });
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.hidden = true; });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !overlay.hidden) overlay.hidden = true; });

  function triggerDownload(filename, blob){
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    toast('Saved ' + filename);
  }

  function iconDataUri(code, hex){
    var svg = CAT_ICON[code].replace(/currentColor/g, hex);
    // Standalone SVG (as an <img> src) requires the xmlns declaration or
    // the browser silently refuses to decode it — inline HTML doesn't need
    // it, which is why this only breaks when used as an image source.
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  function loadIconBundle(hex, pngSize){
    var codes = CATS.map(function(c){ return c.code; });
    return Promise.all(codes.map(function(code){
      return new Promise(function(resolve){
        var img = new Image();
        img.onload = function(){
          var c = document.createElement('canvas');
          c.width = pngSize; c.height = pngSize;
          c.getContext('2d').drawImage(img, 0, 0, pngSize, pngSize);
          resolve({code:code, img:img, png:c.toDataURL('image/png')});
        };
        img.onerror = function(){ resolve({code:code, img:null, png:null}); };
        img.src = iconDataUri(code, hex);
      });
    })).then(function(list){
      var map = {};
      list.forEach(function(item){ map[item.code] = item; });
      return map;
    });
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function wrapText(ctx,text,maxWidth,maxLines){
    var words = (text||'(empty)').split(/\s+/).filter(Boolean);
    if(!words.length) words=['(empty)'];
    var lines = [], cur = '';
    for(var i=0;i<words.length;i++){
      var test = cur ? cur+' '+words[i] : words[i];
      if(ctx.measureText(test).width > maxWidth && cur){
        lines.push(cur);
        cur = words[i];
        if(lines.length===maxLines) break;
      } else {
        cur = test;
      }
    }
    if(lines.length<maxLines && cur) lines.push(cur);
    if(lines.length>=maxLines){
      lines.length = maxLines;
      var last = lines[maxLines-1];
      while(ctx.measureText(last+'…').width>maxWidth && last.length>1){ last = last.slice(0,-1); }
      lines[maxLines-1] = last+'…';
    }
    return lines;
  }

  function drawCell(ctx, cat, x, y, w, h, icons){
    roundRect(ctx,x,y,w,h,10); ctx.fillStyle=EXPORT_CARD; ctx.fill();
    ctx.strokeStyle=EXPORT_LINE; ctx.lineWidth=1; roundRect(ctx,x,y,w,h,10); ctx.stroke();

    var headH = h*0.105;
    ctx.save();
    roundRect(ctx,x,y,w,h,10); ctx.clip();
    ctx.fillStyle = EXPORT_CAT_HEX[cat.code]; ctx.fillRect(x,y,w,headH);
    ctx.restore();

    var icon = icons && icons[cat.code] && icons[cat.code].img;
    var iconSize = Math.min(headH*0.52, 26);
    var labelX = x+w*0.045;
    if(icon){
      ctx.drawImage(icon, labelX, y+(headH-iconSize)/2, iconSize, iconSize);
      labelX += iconSize + 8;
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 ' + Math.round(headH*0.46) + 'px "Work Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(cat.label.toUpperCase(), labelX, y+headH/2);

    var list = columnNotes(cat.code);
    var innerX = x + w*0.045, innerW = w*0.91;
    var cy = y + headH + h*0.03;
    var maxBottom = y + h - h*0.03;
    var fontPx = clamp(Math.round(h*0.052), 11, 24);
    var lineH = fontPx*1.32;

    ctx.textBaseline = 'alphabetic';
    for(var i=0;i<list.length;i++){
      var n = list[i];
      ctx.font = fontPx + 'px "Work Sans", sans-serif';
      var lines = wrapText(ctx, n.text, innerW-22, 3);
      var linkLineH = n.link ? lineH*0.78 : 0;
      var noteH = 12 + lines.length*lineH + linkLineH + 14;
      if(cy + noteH > maxBottom){
        var remaining = list.length - i;
        if(remaining>0){
          ctx.fillStyle = EXPORT_DIM;
          ctx.font = 'italic ' + clamp(Math.round(h*0.04), 10, 18) + 'px "Work Sans", sans-serif';
          ctx.fillText('+'+remaining+' more', innerX, maxBottom-6);
        }
        break;
      }
      var color = impactColor(n.impact||0, LIGHT_PALETTE);
      ctx.fillStyle = color; roundRect(ctx,innerX,cy,4,noteH,2); ctx.fill();
      ctx.fillStyle = '#FBFAF7'; roundRect(ctx,innerX+9,cy,innerW-9,noteH,8); ctx.fill();
      ctx.strokeStyle = EXPORT_LINE; roundRect(ctx,innerX+9,cy,innerW-9,noteH,8); ctx.stroke();
      ctx.fillStyle = EXPORT_INK;
      ctx.font = fontPx + 'px "Work Sans", sans-serif';
      for(var li=0; li<lines.length; li++){
        ctx.fillText(lines[li], innerX+20, cy+18+li*lineH);
      }
      if(n.link){
        ctx.fillStyle = EXPORT_DIM;
        ctx.font = Math.round(fontPx*0.78) + 'px "IBM Plex Mono", monospace';
        ctx.fillText('↗ ' + linkDomain(n.link), innerX+20, cy+18+lines.length*lineH+linkLineH*0.7);
      }
      var scoreText = (n.impact>0?'+':'') + (n.impact||0);
      ctx.fillStyle = color;
      ctx.font = '700 ' + clamp(Math.round(h*0.038), 10, 20) + 'px "IBM Plex Mono", monospace';
      ctx.fillText(scoreText, innerX+innerW-9-ctx.measureText(scoreText).width, cy+noteH-9);
      cy += noteH + h*0.022;
    }
  }

  function drawScaleRow(ctx, cat, x, y, w, h, icons){
    roundRect(ctx,x,y,w,h,10); ctx.fillStyle=EXPORT_CARD; ctx.fill();
    ctx.strokeStyle=EXPORT_LINE; ctx.lineWidth=1; roundRect(ctx,x,y,w,h,10); ctx.stroke();

    var padX = w*0.02, padY = h*0.09;
    var list = columnNotes(cat.code);
    var sum = list.reduce(function(a,n){ return a+(n.impact||0); }, 0);
    var sumLabel = (sum>0?'+':'') + sum;
    var netColor = impactColor(sum, LIGHT_PALETTE);

    var badgeR = clamp(h*0.09, 9, 20);
    var badgeCx = x + padX + badgeR, badgeCy = y + padY + badgeR;
    ctx.beginPath(); ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI*2); ctx.fillStyle = netColor; ctx.fill();
    var icon = icons && icons[cat.code] && icons[cat.code].img;
    if(icon){
      var isz = badgeR*1.15;
      ctx.drawImage(icon, badgeCx-isz/2, badgeCy-isz/2, isz, isz);
    }

    var nameFont = clamp(Math.round(h*0.095), 12, 22);
    var scoreFont = clamp(Math.round(h*0.07), 9, 15);
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 ' + nameFont + 'px "Work Sans", sans-serif';
    var nameWidth = ctx.measureText(cat.label).width;
    var textY1 = badgeCy + badgeR + nameFont*0.95;
    ctx.fillStyle = EXPORT_INK;
    ctx.fillText(cat.label, x+padX, textY1);
    ctx.font = '600 ' + scoreFont + 'px "IBM Plex Mono", monospace';
    var scoreWidth = ctx.measureText('net '+sumLabel).width;
    var textY2 = textY1 + scoreFont*1.5;
    ctx.fillStyle = netColor;
    ctx.fillText('net ' + sumLabel, x+padX, textY2);

    var labelW = clamp(Math.max(badgeR*2+10, nameWidth+2, scoreWidth+2) + padX, 80, w*0.3);
    var axisY = Math.max(textY2 + h*0.09, y + padY + badgeR*2 + h*0.06);
    var axisX0 = x + labelW, axisX1 = x + w - padX;

    var tickFont = clamp(Math.round(h*0.055), 8, 13);
    ctx.strokeStyle = EXPORT_LINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(axisX0, axisY); ctx.lineTo(axisX1, axisY); ctx.stroke();
    ctx.fillStyle = EXPORT_DIM;
    ctx.font = tickFont + 'px "IBM Plex Mono", monospace';
    ctx.fillText('−5', axisX0-4, axisY-tickFont*0.8);
    ctx.textAlign = 'right';
    ctx.fillText('+5', axisX1+4, axisY-tickFont*0.8);
    ctx.textAlign = 'left';

    var labelFont = clamp(Math.round(h*0.058), 9, 15);
    var laneStep = Math.max(labelFont*2.6, h*0.15);
    var maxBottom = y + h - h*0.04;
    var maxLanes = Math.max(1, Math.floor((maxBottom - (axisY+h*0.13)) / laneStep));
    var unitPx = (axisX1-axisX0)/10;

    var scaleLayout = layoutLanesWrapped(list, maxLanes);
    scaleLayout.placements.forEach(function(p){
      var n = p.note, impact = n.impact||0;
      var plottedImpact = clamp(impact + jitterValueOffset(p.order), -5, 5);
      var px = axisX0 + ((plottedImpact+5)/10) * (axisX1-axisX0);
      var color = impactColor(impact, LIGHT_PALETTE);
      var labelY = axisY + h*0.13 + p.row*laneStep;

      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, axisY); ctx.lineTo(px, labelY-labelFont*0.9); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, axisY, 4, 0, Math.PI*2); ctx.fill();

      ctx.font = labelFont + 'px "Work Sans", sans-serif';
      ctx.fillStyle = EXPORT_INK;
      ctx.textAlign = 'center';
      var maxW = scaleLayout.crowded ? clamp(unitPx*0.9, 40, 120) : clamp(w*0.16, 90, 240);
      var line = wrapText(ctx, n.text, maxW, 1)[0];
      ctx.fillText(line, Math.max(axisX0+maxW/2, Math.min(px, axisX1-maxW/2)), labelY);
      ctx.textAlign = 'left';
    });
  }

  function resolveRatio(){
    if(selectedRatio==='custom'){
      var aspect = customW/customH;
      var cols, rows;
      if(aspect>=1.6){ cols=6; rows=1; } else if(aspect>=0.8){ cols=3; rows=2; } else { cols=2; rows=3; }
      return {w:customW, h:customH, cols:cols, rows:rows};
    }
    return RATIOS[selectedRatio];
  }

  function drawPngExport(r, icons, layoutName){
    var canvas = document.createElement('canvas');
    canvas.width = r.w; canvas.height = r.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = EXPORT_BG; ctx.fillRect(0,0,r.w,r.h);

    // A single scale reference (shorter of the two dimensions) keeps the
    // header proportioned consistently across every aspect ratio — using
    // canvas height alone blew this up for a tall A4 canvas and drove the
    // dot-grid decoration straight through the title text.
    var pad = Math.min(r.w, r.h) * 0.03;

    // top-left dot grid, positioned first so everything below it is laid
    // out from its actual measured bottom edge — never a fixed fraction
    // that can collide depending on aspect ratio.
    var dotR = pad*0.14, dotGap = pad*0.85;
    ctx.fillStyle = EXPORT_ACCENT;
    for(var dr=0; dr<2; dr++){
      for(var dc=0; dc<4; dc++){
        ctx.beginPath();
        ctx.arc(pad+dc*dotGap, pad*0.5+dr*dotGap, dotR, 0, Math.PI*2);
        ctx.fill();
      }
    }
    var dotGridBottom = pad*0.5 + dotGap + dotR;

    var sq = pad*1.1;
    ctx.fillRect(r.w-pad-sq, pad*0.4, sq, sq);

    var titleFontPx = pad*2.3;
    ctx.fillStyle = EXPORT_ACCENT;
    ctx.font = '800 ' + Math.round(titleFontPx) + 'px "Work Sans", sans-serif';
    ctx.textBaseline = 'alphabetic';
    var titleY = dotGridBottom + titleFontPx*0.95;
    ctx.fillText('PESTEL ANALYSIS', pad, titleY);
    var titleW = ctx.measureText('PESTEL ANALYSIS').width;
    var dividerY = titleY + pad*0.35, dividerH = pad*0.14;
    ctx.fillRect(pad, dividerY, Math.min(titleW, r.w*0.14), dividerH);

    ctx.fillStyle = EXPORT_DIM;
    ctx.font = '600 ' + Math.round(pad*1.1) + 'px "Work Sans", sans-serif';
    var dateY = dividerY + dividerH + pad*0.9;
    ctx.fillText(new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}), pad, dateY);

    var gridTop = dateY + pad*0.8, gridW = r.w-pad*2, gridH = r.h-gridTop-pad;

    if(layoutName==='scale'){
      var totalH = r.h*0.065;
      var rowGap = r.h*0.012;
      var rowsAreaH = gridH - totalH;
      var rowH = (rowsAreaH - rowGap*5)/6;
      CATS.forEach(function(cat,i){
        var y = gridTop + i*(rowH+rowGap);
        drawScaleRow(ctx, cat, pad, y, gridW, rowH, icons);
      });

      var total = notes.reduce(function(a,n){ return a+(n.impact||0); }, 0);
      var totalLabel = (total>0?'+':'') + total;
      var totalColor = impactColor(total, LIGHT_PALETTE);
      var totalCx = pad + gridW/2, totalCy = gridTop + rowsAreaH + totalH*0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = EXPORT_DIM;
      ctx.font = '600 ' + Math.round(totalH*0.24) + 'px "IBM Plex Mono", monospace';
      ctx.fillText('TOTAL EFFECT', totalCx, totalCy - totalH*0.14);
      ctx.fillStyle = totalColor;
      ctx.font = '700 ' + Math.round(totalH*0.52) + 'px "IBM Plex Mono", monospace';
      ctx.fillText(totalLabel, totalCx, totalCy + totalH*0.32);
      ctx.textAlign = 'left';
    } else {
      var gap = r.w*0.013;
      var cellW = (gridW - gap*(r.cols-1))/r.cols;
      var cellH = (gridH - gap*(r.rows-1))/r.rows;
      CATS.forEach(function(cat,i){
        var col = i % r.cols, row = Math.floor(i/r.cols);
        var x = pad + col*(cellW+gap), y = gridTop + row*(cellH+gap);
        drawCell(ctx, cat, x, y, cellW, cellH, icons);
      });
    }

    return canvas;
  }

  function exportPNG(){
    loadIconBundle('#FFFFFF', 72).then(function(icons){
      var r = resolveRatio();
      var sizeTag = selectedRatio==='custom' ? ('custom-'+r.w+'x'+r.h) : selectedRatio;
      var layouts = selectedLayout==='both' ? ['grid','scale'] : [selectedLayout];
      layouts.forEach(function(layoutName, i){
        var canvas = drawPngExport(r, icons, layoutName);
        setTimeout(function(){
          canvas.toBlob(function(blob){
            triggerDownload('pestel-board-'+layoutName+'-'+sizeTag+'.png', blob);
          }, 'image/png');
        }, i*300);
      });
    }).catch(function(){ toast('Could not prepare the export.'); });
  }

  function buildGridSlide(slide, rt, rrt, icons){
    var left=0.4, right=0.4, top=1.12, bottom=7.5-0.3, gap=0.16;
    var colW = (13.333-left-right-gap*5)/6;
    var charsPerLine = Math.max(10, Math.floor((colW-0.24)/0.065));

    CATS.forEach(function(cat,i){
      var x = left + i*(colW+gap);
      slide.addShape(rrt, {x:x,y:top,w:colW,h:0.4,fill:{color:EXPORT_CAT_HEX[cat.code].replace('#','')},line:{type:'none'}});
      var ic = icons && icons[cat.code];
      var iconSz = 0.2, labelX = x+0.06, labelW = colW-0.12;
      if(ic && ic.png){
        slide.addImage({data:ic.png, x:x+0.06, y:top+(0.4-iconSz)/2, w:iconSz, h:iconSz});
        labelX = x+0.06+iconSz+0.05; labelW = colW-0.12-iconSz-0.05;
      }
      slide.addText(cat.label.toUpperCase(), {x:labelX,y:top,w:labelW,h:0.4,fontFace:'Arial',fontSize:10.5,bold:true,color:'FFFFFF',valign:'middle',shrinkText:true});

      var cy = top+0.4+0.09;
      var list = columnNotes(cat.code);
      for(var j=0;j<list.length;j++){
        var n = list[j];
        var color = impactColor(n.impact||0, LIGHT_PALETTE).replace('#','');
        var estLines = Math.max(1, Math.ceil(((n.text||'').length||6)/charsPerLine));
        var linkH = n.link ? 0.16 : 0;
        var h = Math.min(0.32+estLines*0.22+linkH, bottom-cy-0.32);
        if(cy+0.35 > bottom){
          var remaining = list.length-j;
          if(remaining>0){
            slide.addText('+'+remaining+' more', {x:x+0.05,y:bottom-0.26,w:colW-0.1,h:0.24,fontFace:'Arial',italic:true,fontSize:8.5,color:EXPORT_DIM.replace('#','')});
          }
          break;
        }
        slide.addShape(rt, {x:x,y:cy,w:colW,h:h,fill:{color:'FFFFFF'},line:{color:EXPORT_LINE.replace('#',''),width:0.75}});
        slide.addShape(rt, {x:x,y:cy,w:0.045,h:h,fill:{color:color},line:{type:'none'}});
        slide.addText(n.text||'(empty)', {x:x+0.1,y:cy+0.03,w:colW-0.2,h:h-linkH-0.06,fontFace:'Arial',fontSize:9,color:EXPORT_INK.replace('#',''),valign:'top',shrinkText:true});
        if(n.link){
          slide.addText('↗ ' + linkDomain(n.link), {x:x+0.1,y:cy+h-0.19,w:colW-0.55,h:0.16,fontFace:'Courier New',fontSize:7,color:EXPORT_DIM.replace('#',''),valign:'top'});
        }
        var scoreText = (n.impact>0?'+':'') + (n.impact||0);
        slide.addText(scoreText, {x:x+colW-0.5,y:cy+h-0.22,w:0.42,h:0.2,fontFace:'Courier New',fontSize:8,bold:true,color:color,align:'right'});
        cy += h+0.08;
      }
    });
  }

  function buildScaleSlide(slide, pres, rt, icons){
    var left=0.4, right=0.4, top=1.1, slideBottom=7.5-0.25, rowGap=0.1, totalH=0.42;
    var bottom = slideBottom - totalH;
    var rowH = (bottom-top-rowGap*5)/6;
    var labelW = 1.7;
    var axisX0 = left+labelW, axisX1 = 13.333-right;
    var ellipseType = pres.ShapeType && pres.ShapeType.ellipse ? pres.ShapeType.ellipse : 'ellipse';
    var badgeSz = 0.26;
    var laneStep = 0.2;
    var unitIn = (axisX1-axisX0)/10;

    CATS.forEach(function(cat,i){
      var y = top + i*(rowH+rowGap);
      var axisY = y + badgeSz + 0.12;
      var maxLanes = Math.max(1, Math.floor(((y+rowH-0.1) - axisY - 0.06) / laneStep));
      var list = columnNotes(cat.code);
      var sum = list.reduce(function(a,n){ return a+(n.impact||0); }, 0);
      var sumLabel = (sum>0?'+':'')+sum;
      var netColor = impactColor(sum, LIGHT_PALETTE).replace('#','');

      slide.addShape(ellipseType, {x:left,y:y,w:badgeSz,h:badgeSz,fill:{color:netColor},line:{type:'none'}});
      var ic = icons && icons[cat.code];
      if(ic && ic.png){
        var isz = badgeSz*0.56;
        slide.addImage({data:ic.png, x:left+(badgeSz-isz)/2, y:y+(badgeSz-isz)/2, w:isz, h:isz});
      }
      var textX = left+badgeSz+0.09, textW = labelW-badgeSz-0.15;
      slide.addText(cat.label, {x:textX,y:y-0.02,w:textW,h:0.19,fontFace:'Georgia',fontSize:10,bold:true,color:EXPORT_INK.replace('#',''),shrinkText:true});
      slide.addText('net '+sumLabel, {x:textX,y:y+0.14,w:textW,h:0.16,fontFace:'Courier New',fontSize:7.5,color:netColor,shrinkText:true});

      slide.addShape(rt, {x:axisX0,y:axisY,w:axisX1-axisX0,h:0.012,fill:{color:EXPORT_LINE.replace('#','')},line:{type:'none'}});
      slide.addText('−5', {x:axisX0-0.32,y:axisY-0.2,w:0.3,h:0.16,fontFace:'Courier New',fontSize:7,color:EXPORT_DIM.replace('#',''),align:'right'});
      slide.addText('+5', {x:axisX1+0.02,y:axisY-0.2,w:0.3,h:0.16,fontFace:'Courier New',fontSize:7,color:EXPORT_DIM.replace('#','')});

      var scaleLayout = layoutLanesWrapped(list, maxLanes);
      scaleLayout.placements.forEach(function(p){
        var n = p.note, impact = n.impact||0;
        var plottedImpact = clamp(impact + jitterValueOffset(p.order), -5, 5);
        var px = axisX0 + ((plottedImpact+5)/10) * (axisX1-axisX0);
        var color = impactColor(impact, LIGHT_PALETTE).replace('#','');
        var labelY = axisY + 0.1 + p.row*laneStep;

        slide.addShape(rt, {x:px-0.006,y:axisY,w:0.012,h:labelY-axisY,fill:{color:color},line:{type:'none'}});
        slide.addShape(ellipseType, {x:px-0.04,y:axisY-0.04,w:0.08,h:0.08,fill:{color:color},line:{type:'none'}});
        var label = (n.text||'(empty)');
        var cap = scaleLayout.crowded ? 20 : 32;
        if(label.length>cap) label = label.slice(0,cap-1)+'…';
        var lw = scaleLayout.crowded ? clamp(unitIn*0.9, 0.5, 1.0) : 1.8;
        slide.addText(label, {x:px-lw/2,y:labelY,w:lw,h:0.17,fontFace:'Arial',fontSize:7.5,color:EXPORT_INK.replace('#',''),align:'center',shrinkText:true});
      });
    });

    var total = notes.reduce(function(a,n){ return a+(n.impact||0); }, 0);
    var totalLabel = (total>0?'+':'') + total;
    var totalColor = impactColor(total, LIGHT_PALETTE).replace('#','');
    slide.addShape(rt, {x:left,y:bottom+0.06,w:13.333-left-right,h:0.01,fill:{color:EXPORT_LINE.replace('#','')},line:{type:'none'}});
    slide.addText('TOTAL EFFECT', {x:0,y:bottom+0.12,w:13.333,h:0.14,fontFace:'Courier New',fontSize:8,color:EXPORT_DIM.replace('#',''),align:'center'});
    slide.addText(totalLabel, {x:0,y:bottom+0.24,w:13.333,h:0.3,fontFace:'Courier New',bold:true,fontSize:18,color:totalColor,align:'center'});
  }

  function addPptxSlide(pres, icons, layoutName, subtitle){
    var slide = pres.addSlide();
    slide.background = {color: EXPORT_BG.replace('#','')};

    var rt = pres.ShapeType && pres.ShapeType.rect ? pres.ShapeType.rect : 'rect';
    var rrt = pres.ShapeType && pres.ShapeType.roundRect ? pres.ShapeType.roundRect : rt;
    var ellipseType0 = pres.ShapeType && pres.ShapeType.ellipse ? pres.ShapeType.ellipse : 'ellipse';

    // top-left dot grid, kept small and strictly above the title (it used
    // to sit at the same y as the title text and print straight through
    // it) + top-right accent square, matching the deck frame
    for(var dr=0; dr<2; dr++){
      for(var dc=0; dc<4; dc++){
        slide.addShape(ellipseType0, {x:0.4+dc*0.1, y:0.13+dr*0.1, w:0.035, h:0.035, fill:{color:EXPORT_ACCENT.replace('#','')}, line:{type:'none'}});
      }
    }
    slide.addShape(rt, {x:12.55, y:0.2, w:0.38, h:0.38, fill:{color:EXPORT_ACCENT.replace('#','')}, line:{type:'none'}});

    var title = 'PESTEL ANALYSIS' + (subtitle ? ' — ' + subtitle : '');
    slide.addText(title, {x:0.4,y:0.36,w:10,h:0.36,fontFace:'Arial',fontSize:22,bold:true,color:EXPORT_ACCENT.replace('#','')});
    slide.addShape(rt, {x:0.42,y:0.72,w:1.4,h:0.025,fill:{color:EXPORT_ACCENT.replace('#','')},line:{type:'none'}});
    slide.addText(new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}), {x:0.4,y:0.78,w:6,h:0.2,fontFace:'Arial',fontSize:9.5,color:EXPORT_DIM.replace('#','')});

    if(layoutName==='scale'){
      buildScaleSlide(slide, pres, rt, icons);
    } else {
      buildGridSlide(slide, rt, rrt, icons);
    }
  }

  function exportPPTX(){
    if(typeof PptxGenJS === 'undefined'){ toast('Export library failed to load — check your connection.'); return; }
    loadIconBundle('#FFFFFF', 72).then(function(icons){
      try{
        var pres = new PptxGenJS();
        pres.defineLayout({name:'PESTEL', width:13.333, height:7.5});
        pres.layout = 'PESTEL';

        if(selectedLayout==='both'){
          addPptxSlide(pres, icons, 'grid', 'Board Grid');
          addPptxSlide(pres, icons, 'scale', 'Scale Axis');
        } else {
          addPptxSlide(pres, icons, selectedLayout, null);
        }

        pres.writeFile({fileName:'pestel-board-'+selectedLayout+'.pptx'}).catch(function(){ toast('Could not generate the PPTX file.'); });
      }catch(err){
        toast('Could not generate the PPTX file.');
      }
    }).catch(function(){ toast('Could not prepare the export.'); });
  }

  function exportPDF(){
    if(!window.jspdf || !window.jspdf.jsPDF){ toast('PDF library failed to load — check your connection.'); return; }
    loadIconBundle('#FFFFFF', 72).then(function(icons){
      try{
        var r = RATIOS.a4;
        var pdf = new window.jspdf.jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
        var layouts = selectedLayout==='both' ? ['grid','scale'] : [selectedLayout];
        layouts.forEach(function(layoutName, i){
          var canvas = drawPngExport(r, icons, layoutName);
          if(i>0) pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
        });
        pdf.save('pestel-board-'+selectedLayout+'-a4.pdf');
      }catch(err){
        toast('Could not generate the PDF file.');
      }
    }).catch(function(){ toast('Could not prepare the export.'); });
  }

  document.getElementById('exportPng').addEventListener('click', exportPNG);
  document.getElementById('exportPdf').addEventListener('click', exportPDF);
  document.getElementById('exportPptx').addEventListener('click', exportPPTX);

  // ---------------- identity ----------------
  var youDot = document.getElementById('youDot');
  var youName = document.getElementById('youName');
  youDot.style.background = myPeer.color;
  youName.value = myPeer.name;
  youName.addEventListener('change', function(){
    myPeer.name = youName.value.trim() || myPeer.name;
    youName.value = myPeer.name;
    localStorage.setItem('pestel-name', myPeer.name);
    if(presenceChannel) presenceChannel.track({name:myPeer.name, color:myPeer.color});
    render();
  });

  // ---------------- Supabase bootstrap ----------------
  function loadLocalDemo(){
    notes = SEED.map(function(n,i){ return Object.assign({id:'local-'+i, order:i, author:{name:myPeer.name,color:myPeer.color}}, n); });
    render();
  }

  function regrowVisibleTextareas(){
    var textareas = board.querySelectorAll('.note-text');
    for(var i=0;i<textareas.length;i++){ autoGrow(textareas[i]); }
  }

  function init(){
    render();

    // The webfont (Work Sans) can still be swapping in when autoGrow first
    // measures scrollHeight, sizing the textarea off fallback-font metrics
    // — then the real font loads, text reflows, and the box is now too
    // short with no re-measure, clipping the last line. Re-measure once
    // fonts have actually settled.
    if(window.document.fonts && document.fonts.ready){
      document.fonts.ready.then(regrowVisibleTextareas);
    }

    if(window.PESTEL_SNAPSHOT){
      notes = window.PESTEL_SNAPSHOT;
      setStatus('Viewing a saved snapshot — changes stay on this device only.', true);
      render();
      return;
    }

    var cfg = window.PESTEL_CONFIG || {};
    var missing = !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY ||
      cfg.SUPABASE_URL.indexOf('YOUR_SUPABASE') === 0 || cfg.SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') === 0;

    if(missing || typeof supabase === 'undefined'){
      setStatus('Not connected to Supabase — showing a local demo. Fill in config.js to enable live sync.', true);
      loadLocalDemo();
      return;
    }

    sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    sb.from(TABLE).select('*').then(function(res){
      if(res.error){
        setStatus('Could not reach Supabase (' + res.error.message + ') — showing a local demo.', true);
        loadLocalDemo();
        return;
      }
      if(res.data.length === 0){
        var seedRows = SEED.map(function(n,i){
          return Object.assign(noteToRow(n), {order_index:i, author_name:myPeer.name, author_color:myPeer.color});
        });
        sb.from(TABLE).insert(seedRows).select().then(function(seedRes){
          notes = (seedRes.data||[]).map(rowToNote);
          render();
        });
      } else {
        notes = res.data.map(rowToNote);
        render();
      }
      setStatus('Live — synced with everyone on this link.');
      subscribeRealtime();
      subscribePresence();
    });
  }

  function subscribeRealtime(){
    notesChannel = sb.channel('pestel_notes_changes')
      .on('postgres_changes', {event:'*', schema:'public', table:TABLE}, function(payload){
        if(payload.eventType === 'INSERT'){
          var n = rowToNote(payload.new);
          if(!notes.some(function(x){ return x.id===n.id; })) notes.push(n);
        } else if(payload.eventType === 'UPDATE'){
          var idx = notes.findIndex(function(x){ return x.id===payload.new.id; });
          if(idx>=0) notes[idx] = rowToNote(payload.new);
        } else if(payload.eventType === 'DELETE'){
          notes = notes.filter(function(x){ return x.id!==payload.old.id; });
        }
        render();
      })
      .subscribe(function(status){
        if(status === 'SUBSCRIBED'){ connected = true; }
        if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'){
          connected = false;
          setStatus('Connection lost — trying to reconnect…', true);
        }
      });
  }

  function subscribePresence(){
    presenceChannel = sb.channel('pestel_presence', {config:{presence:{key: myPeer.id}}});
    presenceChannel.on('presence', {event:'sync'}, function(){
      renderPeers(presenceChannel.presenceState());
    });
    presenceChannel.subscribe(function(status){
      if(status === 'SUBSCRIBED'){
        presenceChannel.track({name: myPeer.name, color: myPeer.color});
      }
    });
  }

  // ---------------- save / load a local .html snapshot ----------------
  function buildSnapshotHtml(){
    return Promise.all([
      fetch('style.css').then(function(r){ return r.text(); }),
      fetch('app.js').then(function(r){ return r.text(); }),
      fetch(document.location.pathname || 'index.html').then(function(r){ return r.text(); })
    ]).then(function(parts){
      var css = parts[0], js = parts[1], html = parts[2];
      html = html.replace('<link rel="stylesheet" href="style.css">', '<style>'+css+'</style>');
      html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js[^"]*"><\/script>\s*/, '');
      html = html.replace('<script src="config.js"></script>', '<script>window.PESTEL_SNAPSHOT = '+JSON.stringify(notes)+';</script>');
      html = html.replace('<script src="app.js"></script>', '<script>'+js+'</script>');
      return html;
    });
  }

  document.getElementById('saveSnapshot').addEventListener('click', function(){
    if(location.protocol==='file:'){
      toast('Save needs the page served over http(s) — open it via the live site or a local dev server, not a double-clicked file.');
      return;
    }
    buildSnapshotHtml().then(function(html){
      var stamp = new Date().toISOString().slice(0,10);
      triggerDownload('pestel-board-'+stamp+'.html', new Blob([html], {type:'text/html'}));
    }).catch(function(){
      toast('Could not build the save file — try a hard refresh first.');
    });
  });

  var loadInput = document.getElementById('loadSnapshotInput');
  document.getElementById('loadSnapshot').addEventListener('click', function(){ loadInput.click(); });
  loadInput.addEventListener('change', function(e){
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      var match = String(reader.result).match(/window\.PESTEL_SNAPSHOT\s*=\s*(\[[\s\S]*?\]);/);
      if(!match){ toast('That doesn\'t look like a saved board file.'); return; }
      var loaded;
      try{ loaded = JSON.parse(match[1]); }catch(err){ toast('Could not read that file.'); return; }
      if(notesChannel){ notesChannel.unsubscribe(); notesChannel = null; }
      if(presenceChannel){ presenceChannel.unsubscribe(); presenceChannel = null; }
      previewMode = true;
      previewFileName = file.name;
      notes = loaded;
      setPreviewStatus(file.name);
      render();
    };
    reader.onerror = function(){ toast('Could not read that file.'); };
    reader.readAsText(file);
  });

  function returnToLiveBoard(){
    previewMode = false;
    previewFileName = null;
    if(!sb){
      loadLocalDemo();
      return;
    }
    sb.from(TABLE).select('*').then(function(res){
      notes = (res.data||[]).map(rowToNote);
      render();
      setStatus('Live — synced with everyone on this link.');
      subscribeRealtime();
      subscribePresence();
    });
  }

  function restoreToLiveBoard(){
    if(!sb){ toast('Not connected to Supabase — nothing to restore to.'); return; }
    var count = notes.length;
    var ok = window.confirm(
      'Replace the live board with "'+previewFileName+'"?\n\n' +
      'This deletes all '+count+' factor(s) currently on the shared board for ' +
      'everyone and replaces them with the ones from this file. This cannot be undone.'
    );
    if(!ok) return;
    var restoreNotes = notes.slice();
    var ZERO_UUID = '00000000-0000-0000-0000-000000000000';
    sb.from(TABLE).delete().neq('id', ZERO_UUID).then(function(delRes){
      if(delRes.error){ toast('Could not clear the live board — restore cancelled.'); return; }
      var rows = restoreNotes.map(function(n, i){
        return Object.assign(noteToRow(n), {order_index: n.order||i});
      });
      if(!rows.length){
        previewMode = false; previewFileName = null;
        notes = [];
        setStatus('Live — synced with everyone on this link.');
        subscribeRealtime(); subscribePresence();
        toast('Restored an empty board.');
        return;
      }
      sb.from(TABLE).insert(rows).select().then(function(insRes){
        if(insRes.error){ toast('Restore failed while writing the backup — the live board may be partially cleared.'); return; }
        previewMode = false;
        previewFileName = null;
        notes = (insRes.data||[]).map(rowToNote);
        render();
        setStatus('Live — synced with everyone on this link.');
        subscribeRealtime();
        subscribePresence();
        toast('Restored ' + rows.length + ' factor(s) to the live board.');
      });
    });
  }

  statusBar.addEventListener('click', function(e){
    if(e.target.id==='statusReturn') returnToLiveBoard();
    if(e.target.id==='statusRestore') restoreToLiveBoard();
  });

  init();
})();
