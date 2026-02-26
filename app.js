// v3.4.3 Full — IndexedDB (surat & ttd), Checkbox+Lainnya (A), QR PDF bottom-right
(function(){
  const $ = s=>document.querySelector(s);
  const STORE = 'aula_rkb_bookings_v3_4_3_full';
  const STORE_OLD = 'aula_rkb_bookings_v3_4_2_full';
  const LOGO_KEY = 'aula_rkb_logo_dataurl_v343';
  const RUANGAN_KODE = 'RKB';
  const LEMBAGA_KODE = 'SMADTBS';
  $('#kdisp').textContent = STORE;

  // ===== IndexedDB helpers =====
  const DB_NAME = 'aula_rkb_db_v343';
  const DB_VERSION = 1;
  let dbPromise = null;
  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = ()=>{
        const db = req.result;
        if(!db.objectStoreNames.contains('attachments')) db.createObjectStore('attachments');
        if(!db.objectStoreNames.contains('signatures')) db.createObjectStore('signatures');
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
    });
    return dbPromise;
  }
  async function idbPut(store,key,val){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(val,key); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error); }); }
  async function idbGet(store,key){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readonly'); const rq=tx.objectStore(store).get(key); rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>rej(rq.error); }); }
  async function idbDelete(store,key){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error); }); }

  // ===== QR (offline) — injected from qrcode_js
  // Minimal QRCode generator (MIT) - adapted short version
var QRCode;(function(){function QR8(d){this.mode=4;this.data=d;this.bytes=[];for(var i=0;i<d.length;i++)this.bytes.push(d.charCodeAt(i));}
QR8.prototype={getLength:function(){return this.bytes.length},write:function(buf){for(var i=0;i<this.bytes.length;i++)buf.put(this.bytes[i],8)}};
function BitBuf(){this.buffer=[];this.length=0}
BitBuf.prototype={put:function(num,len){for(var i=0;i<len;i++)this.putBit(((num>>(len-i-1))&1)==1)},putBit:function(bit){if(this.length==this.buffer.length*8)this.buffer.push(0);if(bit)this.buffer[this.length>>3]|=(0x80>>(this.length%8));this.length++}};
function gexp(n){while(n<0)n+=255;while(n>=256)n-=255;return EXP_TABLE[n]}
function glog(n){if(n<1)throw new Error('glog');return LOG_TABLE[n]}
var EXP_TABLE=new Array(256);var LOG_TABLE=new Array(256);for(var i=0;i<8;i++){EXP_TABLE[i]=1<<i}for(var i=8;i<256;i++){EXP_TABLE[i]=EXP_TABLE[i-4]^EXP_TABLE[i-5]^EXP_TABLE[i-6]^EXP_TABLE[i-8]}for(var i=0;i<256;i++){LOG_TABLE[EXP_TABLE[i]]=i}
function Poly(num,shift){var offset=0;while(offset<num.length&&num[offset]==0)offset++;this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++)this.num[i]=num[i+offset]}
Poly.prototype={get:function(i){return this.num[i]},getLength:function(){return this.num.length},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++)for(var j=0;j<e.getLength();j++)num[i+j]^=gexp(glog(this.get(i))+glog(e.get(j)));return new Poly(num,0)},mod:function(e){if(this.getLength()-e.getLength()<0)return this;var ratio=glog(this.get(0))-glog(e.get(0));var num=this.num.slice(0);for(var i=0;i<e.getLength();i++)num[i]^=gexp(glog(e.get(i))+ratio);return new Poly(num,0).mod(e)}};
function ecPoly(s){var a=new Poly([1],0);for(var i=0;i<s;i++)a=a.multiply(new Poly([1,gexp(i)],0));return a}
function QRCode(t,e){this.typeNumber=t;this.errorCorrectLevel=e;this.modules=null;this.moduleCount=0;this.dataList=[]}
QRCode.prototype={addData:function(d){this.dataList.push(new QR8(d))},isDark:function(r,c){return this.modules[r][c]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(this.getBestMaskPattern())},getBestMaskPattern:function(){return 0},makeImpl:function(mask){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var r=0;r<this.moduleCount;r++){this.modules[r]=new Array(this.moduleCount);for(var c=0;c<this.moduleCount;c++)this.modules[r][c]=null}setupPos(0,0,this);setupPos(this.moduleCount-7,0,this);setupPos(0,this.moduleCount-7,this);setupTiming(this);this.mapData(this.createData(this.typeNumber,this.errorCorrectLevel),mask)},mapData:function(data,mask){var inc=-1;var row=this.moduleCount-1;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(data.length>0){dark=((data[0]>>(7))&1)==1;data[0]<<=1;if((data.bitLength--)==0){data.shift();}}if(maskPattern(mask,row,col-c))dark=!dark;this.modules[row][col-c]=dark}}row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break}}}},createData:function(typeNumber,ecl){var rs=getRSBlocks(typeNumber,ecl);var buffer=new BitBuf();for(var i=0;i<this.dataList.length;i++){var d=this.dataList[i];buffer.put(4,4);buffer.put(d.getLength(),8);d.write(buffer)}var totalData=0;for(var r=0;r<rs.length;r++)totalData+=rs[r].dataCount;if(buffer.length+4<=totalData*8)buffer.put(0,4);while(buffer.length%8!=0)buffer.putBit(false);var data=new Array(totalData);for(var i=0;i<data.length;i++)data[i]=0;for(var i=0;i<buffer.length;i++){data[i>>3]|=((buffer.buffer[i>>3]>>(7-i%8))&1)<<(7-i%8)}var dc=[];var ec=[];var offset=0;var maxDc=0;var maxEc=0;for(var r=0;r<rs.length;r++){var dcCount=rs[r].dataCount;var ecCount=rs[r].totalCount-dcCount;maxDc=Math.max(maxDc,dcCount);maxEc=Math.max(maxEc,ecCount);dc[r]=new Array(dcCount);for(var i=0;i<dcCount;i++)dc[r][i]=data[i+offset];offset+=dcCount;var rsPoly=ecPoly(ecCount);var raw=new Poly(dc[r],0);var mod=raw.mod(rsPoly);ec[r]=new Array(ecCount);for(var i=0;i<ecCount;i++){var modIndex=i+mod.getLength()-ecCount;ec[r][i]=(modIndex>=0)?mod.get(modIndex):0}}var total=0;for(var r=0;r<rs.length;r++)total+=rs[r].totalCount;var data2=new Array(total);var index=0;for(var i=0;i<maxDc;i++)for(var r=0;r<rs.length;r++)if(i<dc[r].length)data2[index++]=dc[r][i];for(var i=0;i<maxEc;i++)for(var r=0;r<rs.length;r++)if(i<ec[r].length)data2[index++]=ec[r][i];var bb=new ByteArray(data2);return bb}};
function ByteArray(bytes){this.bytes=bytes;this.ptr=0;this.bitLength=bytes.length*8}ByteArray.prototype={shift:function(){this.bytes.shift();this.ptr++}};
function setupPos(row,col,q){for(var r=-1;r<=7;r++){if(row+r<=-1||q.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||q.moduleCount<=col+c)continue;var v=(0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4);q.modules[row+r][col+c]=v}}}
function setupTiming(q){for(var r=8;r<q.moduleCount-8;r++){if(q.modules[r][6]!=null)continue;q.modules[r][6]=(r%2==0)}for(var c=8;c<q.moduleCount-8;c++){if(q.modules[6][c]!=null)continue;q.modules[6][c]=(c%2==0)}}
function maskPattern(m,r,c){if(m==0)return (r+c)%2==0;return false}
function getRSBlocks(t,e){var table={1:[{totalCount:26,dataCount:19},{totalCount:26,dataCount:16},{totalCount:26,dataCount:13},{totalCount:26,dataCount:9}],2:[{totalCount:44,dataCount:34},{totalCount:44,dataCount:28},{totalCount:44,dataCount:22},{totalCount:44,dataCount:16}],3:[{totalCount:70,dataCount:55},{totalCount:70,dataCount:44},{totalCount:35,dataCount:17},{totalCount:35,dataCount:13}]};return table[t]?[table[t][1]]:[table[1][1]]}
window._makeQR=function(text,size){try{var qr=new QRCode(2,1);qr.addData(text);qr.make();var count=qr.getModuleCount();var scale=Math.max(2,Math.floor(size/count));var c=document.createElement('canvas');c.width=c.height=count*scale;var cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);cx.fillStyle='#000';for(var r=0;r<count;r++)for(var col=0;col<count;col++)if(qr.isDark(r,col))cx.fillRect(col*scale,r*scale,scale,scale);return c.toDataURL('image/png');}catch(e){console.error(e);return null}}
})();


  // ===== Utils =====
  function showToast(text){ const t=$('#toast'); t.textContent=text; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),1500); }
  function todayStr(){ const d=new Date(); const tz = new Date(d.getTime()-d.getTimezoneOffset()*60000); return tz.toISOString().slice(0,10); }
  $('#tanggalPengajuan').value = todayStr();
  function load(){ try{ return JSON.parse(localStorage.getItem(STORE)) || []; }catch{ return []; } }
  function save(list){ localStorage.setItem(STORE, JSON.stringify(list)); }
  function clearFilters(){ $('#searchBox').value=''; $('#filterTanggal').value=''; }
  function toMin(t){ const [h,m]=(t||'').split(':').map(Number); return (h||0)*60+(m||0); }
  function overlap(a1,a2,b1,b2){ return Math.max(a1,b1) < Math.min(a2,b2); }
  function dataURLtoBlob(dataUrl){ const [meta,b64]=dataUrl.split(','); const mime=(meta.match(/data:(.*?);base64/)||[])[1]||'application/octet-stream'; const bin=atob(b64); const u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); return new Blob([u8],{type:mime}); }
  async function blobToDataURL(blob){ return await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(blob); }); }
  async function toJPEGDataUrl(src){ return await new Promise(res=>{ const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const cx=c.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,c.width,c.height); cx.drawImage(img,0,0); res(c.toDataURL('image/jpeg',0.92)); }; img.src=src; }); }

  // ===== Fasilitas (checkbox + Lainnya - opsi A) =====
  (function initFasilitas(){ const cb=$('#fasilitasLainnyaCbx'), tx=$('#fasilitasLainnyaTxt'); if(!cb||!tx) return; tx.disabled=!cb.checked; cb.addEventListener('change',()=>{ tx.disabled=!cb.checked; if(!cb.checked) tx.value=''; }); })();
  function getSelectedFasilitas(){ const vals=Array.from(document.querySelectorAll('#fasilitasGroup input[type="checkbox"]:checked')).map(x=>x.value); if(!vals.includes('__LAINNYA__')) return vals; const txt=$('#fasilitasLainnyaTxt').value.trim(); return vals.filter(v=>v!=='__LAINNYA__').concat(txt? [txt]:[]); }

  // ===== Global state for current upload surat (ref only) =====
  let suratRef = null;

  // ===== Upload Surat -> IndexedDB =====
  const suratFile = $('#suratFile'); const suratInfo=$('#suratInfo');
  suratFile.addEventListener('change', async ()=>{
    const f = suratFile.files && suratFile.files[0];
    if(!f){ suratRef=null; suratInfo.textContent='Belum ada file.'; return; }
    // Batasi masuk akal, mis. 25MB
    if(f.size > 25*1024*1024){ suratRef=null; suratFile.value=''; suratInfo.textContent='Ukuran file >25MB.'; return; }
    const refId = 'att_'+crypto.randomUUID();
    await idbPut('attachments', refId, { name:f.name, type:f.type, size:f.size, blob:f });
    suratRef = refId;
    suratInfo.textContent = `Tersimpan: ${f.name} (${Math.round(f.size/1024)} KB)`;
  });
  $('#clearSurat').addEventListener('click', async ()=>{ if(suratRef) await idbDelete('attachments', suratRef); suratRef=null; suratFile.value=''; suratInfo.textContent='Belum ada file.'; });

  // ===== Form & Validation =====
  const form=$('#bookingForm'); const editId=$('#editId'); const tanggalPengajuan=$('#tanggalPengajuan'); const namaPeminjam=$('#namaPeminjam'); const unitLembaga=$('#unitLembaga'); const kegiatan=$('#kegiatan'); const jumlahPeserta=$('#jumlahPeserta'); const tanggalPenggunaan=$('#tanggalPenggunaan'); const waktuMulai=$('#waktuMulai'); const waktuSelesai=$('#waktuSelesai'); const kontak=$('#kontak'); const catatan=$('#catatan'); const msg=$('#msg');
  function validate(data, list){ msg.className='msg hidden'; const errs=[]; if(!data.tanggalPengajuan) errs.push('Tanggal pengajuan wajib diisi.'); if(!data.namaPeminjam) errs.push('Nama peminjam wajib diisi.'); if(!data.unitLembaga) errs.push('Unit/Lembaga wajib diisi.'); if(!data.kegiatan) errs.push('Kegiatan/Acara wajib diisi.'); if(!(data.jumlahPeserta>0)) errs.push('Jumlah peserta harus > 0.'); if(!data.tanggalPenggunaan) errs.push('Tanggal penggunaan wajib diisi.'); if(!data.waktuMulai||!data.waktuSelesai) errs.push('Waktu mulai & selesai wajib diisi.'); if(toMin(data.waktuMulai)>=toMin(data.waktuSelesai)) errs.push('Waktu selesai harus lebih besar dari waktu mulai.'); const s=toMin(data.waktuMulai), e=toMin(data.waktuSelesai); const bentrok=list.filter(x=> x.tanggalPenggunaan===data.tanggalPenggunaan && x.id!==data.id && overlap(s,e,toMin(x.waktuMulai),toMin(x.waktuSelesai))); if(bentrok.length) errs.push('Bentrok jadwal: '+bentrok.map(b=>`${b.namaPeminjam} (${b.waktuMulai}–${b.waktuSelesai})`).join(', ')); if(errs.length){ msg.textContent=errs.join('\n'); msg.className='msg error'; return false; } return true; }
  function getFormData(){ return { id: editId.value || crypto.randomUUID(), noSurat:'', tanggalPengajuan: tanggalPengajuan.value, namaPeminjam: namaPeminjam.value.trim(), unitLembaga: unitLembaga.value.trim(), kegiatan: kegiatan.value.trim(), jumlahPeserta: parseInt(jumlahPeserta.value||'0',10), tanggalPenggunaan: tanggalPenggunaan.value, waktuMulai: waktuMulai.value, waktuSelesai: waktuSelesai.value, fasilitas: getSelectedFasilitas(), kontak: kontak.value.trim(), catatan: catatan.value.trim(), status:'Diajukan', suratRef: suratRef||null, ttdRef: null }; }
  function resetFasilitas(){ document.querySelectorAll('#fasilitasGroup input[type="checkbox"]').forEach(cb=>cb.checked=false); const t=$('#fasilitasLainnyaTxt'); const c=$('#fasilitasLainnyaCbx'); if(t&&c){ t.value=''; t.disabled=true; c.checked=false; } }

  form.addEventListener('submit', (e)=>{ e.preventDefault(); const list=load(); const data=getFormData(); if(!validate(data,list)) return; const idx=list.findIndex(x=>x.id===data.id); if(idx>=0){ const keep={ noSurat:list[idx].noSurat, status:list[idx].status, ttdRef:list[idx].ttdRef }; list[idx]={...list[idx], ...data, ...keep}; } else { list.push(data); } save(list); showToast('Data berhasil disimpan'); form.reset(); $('#tanggalPengajuan').value=todayStr(); resetFasilitas(); suratRef=null; $('#suratFile').value=''; $('#suratInfo').textContent='Belum ada file.'; clearFilters(); render(); });

  // ===== Daftar & Aksi =====
  const tableBody=$('#bookingTable tbody'); const searchBox=$('#searchBox'); const filterTanggal=$('#filterTanggal');
  searchBox.addEventListener('input', ()=>render()); filterTanggal.addEventListener('change', ()=>render()); $('#resetFilterBtn').addEventListener('click', ()=>{ clearFilters(); render(); });

  async function buildSuratCell(x){ if(!x.suratRef) return '-'; const att = await idbGet('attachments', x.suratRef); if(!att||!att.blob) return '-'; const url = URL.createObjectURL(att.blob); const safe=(att.name||'surat').replace(/[^A-Za-z0-9_.-]/g,'_'); return `<a class="link-btn" href="${url}" download="${safe}">Unduh</a>`; }

  async function render(){ const list=load(); const q=(searchBox.value||'').toLowerCase(); const f=filterTanggal.value||''; const filtered=list.filter(x=>{ const hay=[x.noSurat,x.namaPeminjam,x.unitLembaga,x.kegiatan,(x.fasilitas||[]).join(' '),x.kontak,x.catatan].join(' ').toLowerCase(); const passQ=!q||hay.includes(q); const passD=!f||x.tanggalPenggunaan===f; return passQ&&passD; }).sort((a,b)=> (a.tanggalPenggunaan+a.waktuMulai).localeCompare(b.tanggalPenggunaan+b.waktuMulai)); tableBody.innerHTML=''; for(let i=0;i<filtered.length;i++){ const x=filtered[i]; const tr=document.createElement('tr'); const suratCell=await buildSuratCell(x); tr.innerHTML=`<td>${i+1}</td><td>${x.noSurat||'-'}</td><td>${x.tanggalPengajuan||''}</td><td>${x.namaPeminjam||''}</td><td>${x.unitLembaga||''}</td><td>${x.kegiatan||''}</td><td>${x.jumlahPeserta||''}</td><td>${x.tanggalPenggunaan||''}</td><td>${x.waktuMulai||''}</td><td>${x.waktuSelesai||''}</td><td>${(x.fasilitas||[]).join(', ')||'-'}</td><td>${x.kontak||''}</td><td>${suratCell}</td><td><span class="badge ${x.status==='Disetujui'?'success':x.status==='Ditolak'?'danger':'warning'}">${x.status}</span></td><td><div class="action-btn"><button data-act="approve" data-id="${x.id}">Setujui</button><button data-act="reject" class="secondary" data-id="${x.id}">Tolak</button><button data-act="edit" class="secondary" data-id="${x.id}">Edit</button><button data-act="ttd" class="secondary" data-id="${x.id}">TTD</button><button data-act="print" data-id="${x.id}">Cetak Bukti</button><button data-act="delete" style="background:#7f1d1d" data-id="${x.id}">Hapus</button></div></td>`; tableBody.appendChild(tr); } }

  tableBody.addEventListener('click', async (e)=>{ const btn=e.target.closest('button'); if(!btn) return; const id=btn.getAttribute('data-id'); const act=btn.getAttribute('data-act'); let list=load(); const idx=list.findIndex(x=>x.id===id); if(idx<0) return; const x=list[idx]; if(act==='delete'){ if(confirm('Hapus peminjaman ini?')){ if(x.suratRef) await idbDelete('attachments', x.suratRef); if(x.ttdRef) await idbDelete('signatures', x.ttdRef); list.splice(idx,1); save(list); render(); } }
    if(act==='edit'){ editId.value=x.id; tanggalPengajuan.value=x.tanggalPengajuan; namaPeminjam.value=x.namaPeminjam; unitLembaga.value=x.unitLembaga; kegiatan.value=x.kegiatan; jumlahPeserta.value=x.jumlahPeserta; tanggalPenggunaan.value=x.tanggalPenggunaan; waktuMulai.value=x.waktuMulai; waktuSelesai.value=x.waktuSelesai; kontak.value=x.kontak; catatan.value=x.catatan; // fasilitas
      document.querySelectorAll('#fasilitasGroup input[type="checkbox"]').forEach(cb=>cb.checked=false); const defaults=new Set(Array.from(document.querySelectorAll('#fasilitasGroup input[type="checkbox"]')).map(cb=>cb.value).filter(v=>v!=='__LAINNYA__')); let lain=''; (x.fasilitas||[]).forEach(it=>{ const el=Array.from(document.querySelectorAll('#fasilitasGroup input[type="checkbox"]')).find(a=>a.value===it); if(el&&el.value!=='__LAINNYA__') el.checked=true; else if(!defaults.has(it)) lain=it; }); const cbl=$('#fasilitasLainnyaCbx'), txl=$('#fasilitasLainnyaTxt'); if(lain){ cbl.checked=true; txl.disabled=false; txl.value=lain; } else { cbl.checked=false; txl.disabled=true; txl.value=''; }
      // surat info dari ref
      suratRef = x.suratRef || null; if(suratRef){ const att = await idbGet('attachments', suratRef); suratInfo.textContent = att? (`Terpilih: ${att.name} (${Math.round((att.size||0)/1024)} KB)`) : 'Belum ada file.'; } else { suratInfo.textContent='Belum ada file.'; }
      window.scrollTo({top:0,behavior:'smooth'}); }
    if(act==='approve'){ list[idx].status='Disetujui'; if(!list[idx].noSurat){ const year=(x.tanggalPengajuan||'').slice(0,4)||String(new Date().getFullYear()); const count=list.filter(r=> r.status==='Disetujui' && (r.tanggalPengajuan||'').startsWith(year)).length; list[idx].noSurat = `${RUANGAN_KODE}-${String(count+1).padStart(4,'0')}/${LEMBAGA_KODE}`; } save(list); render(); }
    if(act==='reject'){ list[idx].status='Ditolak'; save(list); render(); }
    if(act==='ttd'){ openTtd(id); }
    if(act==='print'){ await cetakBukti(x); }
  });

  // ===== TTD Pad -> IndexedDB =====
  const ttdModal=$('#ttdModal'); const ttdCanvas=$('#ttdCanvas'); const ctx=ttdCanvas.getContext('2d'); ctx.lineWidth=2; ctx.strokeStyle='#0b1020'; let drawing=false,last=null, currentTtdForId=null;
  function getPos(e){ const r=ttdCanvas.getBoundingClientRect(); const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; return {x,y}; }
  function start(e){ e.preventDefault(); drawing=true; last=getPos(e); }
  function move(e){ if(!drawing) return; const p=getPos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p; e.preventDefault(); }
  function end(){ drawing=false; last=null; }
  ttdCanvas.addEventListener('mousedown',start); ttdCanvas.addEventListener('mousemove',move); window.addEventListener('mouseup',end); ttdCanvas.addEventListener('touchstart',start,{passive:false}); ttdCanvas.addEventListener('touchmove',move,{passive:false}); ttdCanvas.addEventListener('touchend',end);
  $('#clearTtd').addEventListener('click', ()=> ctx.clearRect(0,0,ttdCanvas.width,ttdCanvas.height));
  function openTtd(id){ currentTtdForId=id; ctx.clearRect(0,0,ttdCanvas.width,ttdCanvas.height); const list=load(); const x=list.find(r=>r.id===id); if(x&&x.ttdRef){ idbGet('signatures', x.ttdRef).then(sig=>{ if(sig&&sig.blob){ blobToDataURL(sig.blob).then(d=>{ const img=new Image(); img.onload=()=>ctx.drawImage(img,0,0,ttdCanvas.width,ttdCanvas.height); img.src=d; }); } }); } ttdModal.classList.remove('hidden'); }
  $('#closeTtd').addEventListener('click', ()=> ttdModal.classList.add('hidden'));
  $('#saveTtd').addEventListener('click', async ()=>{ if(!currentTtdForId) return; const dataUrl=ttdCanvas.toDataURL('image/png'); const blob=dataURLtoBlob(dataUrl); const refId='sig_'+crypto.randomUUID(); await idbPut('signatures', refId, { type:'image/png', blob }); const list=load(); const i=list.findIndex(x=>x.id===currentTtdForId); if(i>=0){ if(list[i].ttdRef) await idbDelete('signatures', list[i].ttdRef); list[i].ttdRef=refId; save(list); render(); } ttdModal.classList.add('hidden'); showToast('TTD disimpan'); });

  // ===== Export =====
  $('#exportCsvBtn').addEventListener('click', ()=>{ const list=load(); const header=['no_surat','tanggal_pengajuan','nama_peminjam','unit_lembaga','kegiatan','jumlah_peserta','tanggal_penggunaan','waktu_mulai','waktu_selesai','fasilitas','kontak','status','surat_ref','ttd_ref','catatan']; const rows=[header.join(',')].concat(list.map(x=>[ x.noSurat||'', x.tanggalPengajuan||'', '"'+(x.namaPeminjam||'').replaceAll('"','""')+'"', '"'+(x.unitLembaga||'').replaceAll('"','""')+'"', '"'+(x.kegiatan||'').replaceAll('"','""')+'"', x.jumlahPeserta||'', x.tanggalPenggunaan||'', x.waktuMulai||'', x.waktuSelesai||'', '"'+((x.fasilitas||[]).join('; ').replaceAll('"','""'))+'"', '"'+(x.kontak||'').replaceAll('"','""')+'"', x.status||'', x.suratRef||'', x.ttdRef||'', '"'+(x.catatan||'').replaceAll('"','""')+'"' ].join(','))); const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='peminjaman_aula_rkb_v343.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });
  $('#exportExcelBtn').addEventListener('click', ()=>{ const list=load(); const esc=s=>(s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); const rows=list.map(x=>'<tr>' + '<td>'+esc(x.noSurat||'')+'</td><td>'+esc(x.tanggalPengajuan||'')+'</td><td>'+esc(x.namaPeminjam||'')+'</td><td>'+esc(x.unitLembaga||'')+'</td>' + '<td>'+esc(x.kegiatan||'')+'</td><td>'+esc(x.jumlahPeserta||'')+'</td><td>'+esc(x.tanggalPenggunaan||'')+'</td><td>'+esc(x.waktuMulai||'')+'</td>' + '<td>'+esc(x.waktuSelesai||'')+'</td><td>'+esc((x.fasilitas||[]).join('; '))+'</td><td>'+esc(x.kontak||'')+'</td><td>'+esc(x.status||'')+'</td><td>'+esc(x.suratRef||'')+'</td><td>'+esc(x.ttdRef||'')+'</td><td>'+esc(x.catatan||'')+'</td>' + '</tr>').join(''); const html='<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr><th>No. Surat</th><th>Tanggal Pengajuan</th><th>Nama Peminjam</th><th>Unit/Lembaga</th><th>Kegiatan</th><th>Jumlah Peserta</th><th>Tanggal Penggunaan</th><th>Waktu Mulai</th><th>Waktu Selesai</th><th>Fasilitas</th><th>Kontak</th><th>Status</th><th>Surat Ref</th><th>TTD Ref</th><th>Catatan</th></tr></thead><tbody>'+rows+'</tbody></table></body></html>'; const blob=new Blob([html],{type:'application/vnd.ms-excel'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='peminjaman_aula_rkb_v343.xls'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });

  // ===== Settings (logo) =====
  const logoImg=$('#logoSekolah'); const openSettings=$('#openSettings'); const settingsPanel=$('#settingsPanel'); const closeSettings=$('#closeSettings'); const logoInput=$('#logoInput'); const logoPreview=$('#logoPreview'); const saveLogoBtn=$('#saveLogoBtn'); const resetLogoBtn=$('#resetLogoBtn');
  openSettings.addEventListener('click', ()=>{ settingsPanel.classList.remove('hidden'); const d=localStorage.getItem(LOGO_KEY); if(d){ logoPreview.src=d; } else { logoPreview.src='logo.png'; } });
  closeSettings.addEventListener('click', ()=> settingsPanel.classList.add('hidden'));
  resetLogoBtn.addEventListener('click', ()=>{ localStorage.removeItem(LOGO_KEY); logoImg.src='logo.png'; logoPreview.src='logo.png'; alert('Logo direset ke logo.png'); });
  saveLogoBtn.addEventListener('click', ()=>{ const f=logoInput.files && logoInput.files[0]; if(!f){ alert('Pilih file logo.'); return;} const r=new FileReader(); r.onload=()=>{ localStorage.setItem(LOGO_KEY,r.result); logoImg.src=r.result; logoPreview.src=r.result; alert('Logo disimpan.'); }; r.readAsDataURL(f); });

  // ===== PDF builder (logo + text + TTD + QR) =====
  function dataUrlToU8(dataUrl){ const b64=dataUrl.split(',')[1]; const bin=atob(b64); const u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); return u8; }
  async function cetakBukti(x){
    // images
    const logoSrc = logoImg.src; const logoJPEG = await toJPEGDataUrl(logoSrc); const logoU8 = dataUrlToU8(logoJPEG);
    let ttdU8 = null; if(x.ttdRef){ const sig = await idbGet('signatures', x.ttdRef); if(sig&&sig.blob){ const ttdDataUrl = await blobToDataURL(sig.blob); const ttdJPEG = await toJPEGDataUrl(ttdDataUrl); ttdU8 = dataUrlToU8(ttdJPEG); } }
    const payload = `${x.noSurat||'-'} | ${x.namaPeminjam} | ${x.tanggalPenggunaan} | ${x.waktuMulai}-${x.waktuSelesai}`;
    const qrPng = window._makeQR(payload,120); const qrJPEG = qrPng? await toJPEGDataUrl(qrPng): null; const qrU8 = qrJPEG? dataUrlToU8(qrJPEG): null;

    function imgObj(id,w,h,len){ return `${id} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${len} >>\nstream\n`; }
    function esc(s){ return (s||'').replace(/[()\\]/g, m=> ({'(':'\\(',')':"\\)", '\\':'\\\\'}[m])); }
    let pdf='%PDF-1.4\n'; const xref=[]; function off(){ return new TextEncoder().encode(pdf).length; } function put(txt){ xref.push(off()); pdf+=txt; }
    put('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    put('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    let resFonts='/Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>'; let xobj=''; let id=5; const bins=[];
    if(logoU8){ xobj+=` /ImL ${id} 0 R`; put(imgObj(id,300,300,logoU8.length)); bins.push(logoU8); pdf+='\nendstream\nendobj\n'; id++; }
    if(ttdU8){ xobj+=` /ImS ${id} 0 R`; put(imgObj(id,600,200,ttdU8.length)); bins.push(ttdU8); pdf+='\nendstream\nendobj\n'; id++; }
    if(qrU8){ xobj+=` /ImQ ${id} 0 R`; put(imgObj(id,120,120,qrU8.length)); bins.push(qrU8); pdf+='\nendstream\nendobj\n'; id++; }
    const resources=`<< ${resFonts} ${xobj?('/XObject <<'+xobj+' >>'):''} >>`;
    let content=''; const title = x.noSurat? `Bukti Peminjaman — No. ${x.noSurat}` : 'Bukti Peminjaman';
    content += 'BT /F1 16 Tf 50 800 Td ('+esc(title)+') Tj ET\n';
    content += 'BT /F1 12 Tf 50 780 Td ('+esc('SMADTBS - Aula RKB')+') Tj ET\n';
    let y=760; function line(t){ content+=`BT /F1 12 Tf 50 ${y} Td (${esc(t)}) Tj ET\n`; y-=18; }
    line('Nama Peminjam : '+x.namaPeminjam);
    line('Unit/Lembaga  : '+x.unitLembaga);
    line('Kegiatan/Acara: '+x.kegiatan);
    line('Jumlah Peserta: '+x.jumlahPeserta);
    line('Tanggal Pakai : '+x.tanggalPenggunaan);
    line('Waktu         : '+x.waktuMulai+' s.d. '+x.waktuSelesai);
    line('Fasilitas     : '+((x.fasilitas||[]).join('; ')||'-'));
    line('Kontak        : '+x.kontak);
    if(x.catatan) line('Catatan       : '+x.catatan);
    if(x.suratRef){ line('Surat         : Tersimpan di sistem'); }
    if(logoU8) content += 'q 100 0 0 100 460 720 cm /ImL Do Q\n';
    if(ttdU8){ content += 'BT /F1 12 Tf 400 160 Td (Tanda Tangan Peminjam) Tj ET\n'; content += 'q 200 0 0 70 380 90 cm /ImS Do Q\n'; }
    if(qrU8){ content += 'BT /F1 10 Tf 450 80 Td (QR Verifikasi) Tj ET\n'; content += 'q 100 0 0 100 480 90 cm /ImQ Do Q\n'; }
    const cont=`4 0 obj\n<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}endstream\nendobj\n`;
    put(cont);
    put(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources ${resources} /Contents 4 0 R >>\nendobj\n`);
    const head=new TextEncoder().encode(pdf); let size=head.length; const parts=[head]; bins.forEach(b=>{ parts.push(b); size+=b.length; }); const xrefPos=size; let xrefStr='xref\n0 '+(1+xref.length)+'\n0000000000 65535 f \n'; for(const n of xref) xrefStr+= (String(n).padStart(10,'0')+' 00000 n \n'); const trailer=`trailer\n<< /Size ${1+xref.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`; const blob=new Blob(parts.concat([new TextEncoder().encode(xrefStr), new TextEncoder().encode(trailer)]),{type:'application/pdf'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(x.noSurat? x.noSurat.replace(/\W+/g,'_'):'Bukti_Peminjaman')+'.pdf'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  // ===== Migrasi dari 3.4.2 (sekali jalan) =====
  (async function migrate342To343(){ const FLAG='aula_rkb_migrated_to_idb_v343'; if(localStorage.getItem(FLAG)==='1') return; const oldListRaw = localStorage.getItem(STORE_OLD); if(!oldListRaw){ localStorage.setItem(FLAG,'1'); return; } const oldList = JSON.parse(oldListRaw||'[]'); if(!Array.isArray(oldList) || !oldList.length){ localStorage.setItem(FLAG,'1'); return; } const newList = load(); // gabungkan aman
    for(const rec of oldList){ const x={...rec}; // Surat (DataURL -> IndexedDB)
      if(x.surat && x.surat.dataUrl){ try{ const blob=dataURLtoBlob(x.surat.dataUrl); const attId='att_'+crypto.randomUUID(); await idbPut('attachments', attId, { name:x.surat.name||'surat', type:x.surat.type||blob.type||'application/octet-stream', size:blob.size, blob }); x.suratRef=attId; }catch(e){ console.error('Migrate surat fail', e); } delete x.surat; }
      // TTD (DataURL -> IndexedDB)
      if(x.ttdPeminjam){ try{ const blob=dataURLtoBlob(x.ttdPeminjam); const sigId='sig_'+crypto.randomUUID(); await idbPut('signatures', sigId, { type:'image/png', blob }); x.ttdRef=sigId; }catch(e){ console.error('Migrate ttd fail', e); } delete x.ttdPeminjam; }
      // simpan ke STORE baru (hindari duplikat id)
      if(!newList.find(r=>r.id===x.id)) newList.push(x);
    }
    save(newList); localStorage.setItem(FLAG,'1'); console.log('Migrasi dari 3.4.2 ke 3.4.3 selesai.'); })();

  // ===== Init render =====
  clearFilters(); render();
})();
