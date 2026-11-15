const fs=require('fs');const vm=require('vm');const assert=require('assert');
const src=fs.readFileSync(__dirname+'/../google-apps-script/Code.gs','utf8');
const folderId='10qytscu6v9hxoqTLKuNcfqvbfkvB31P6';
let cacheData=new Map();let changedPermissions=0;
function fakeFile(id,name,mime,t){return {
  getId:()=>id,getName:()=>name,getMimeType:()=>mime,
  getDateCreated:()=>new Date(Date.UTC(2026,9,19,0,t,0)),
  getLastUpdated:()=>new Date(Date.UTC(2026,9,20,0,t,0)),
  getSize:()=>1024,getResourceKey:()=>id==='IMG000'?'RK222':'',
  setSharing:()=>{changedPermissions++;}
}}
const photos=Array.from({length:33},(_,i)=>fakeFile('IMG'+String(i).padStart(3,'0'),`photo-${String(i).padStart(3,'0')}.jpg`,'image/jpeg',i));
const other=[fakeFile('V001','family-video.mp4','video/mp4',40),fakeFile('V002','sea.mp4','video/mp4',41),fakeFile('IGNORE','text.txt','text/plain',42),fakeFile('HEIC','photo-late.heic','application/octet-stream',43)];
function iter(arr){let i=0;return {hasNext:()=>i<arr.length,next:()=>arr[i++]};}
const nested={getId:()=> 'F2', getName:()=> 'Family',getFiles:()=>iter(other),getFolders:()=>iter([])};
const folder={getId:()=>folderId,getName:()=> 'Flip 60',getFiles:()=>iter(photos),getFolders:()=>iter([nested])};
const mock={
  DriveApp:{getFolderById:id=>{assert.equal(id,folderId);return folder;}},
  CacheService:{getScriptCache:()=>({get:k=>cacheData.get(k)||null,put:(k,v)=>cacheData.set(k,v),remove:k=>cacheData.delete(k)})},
  ContentService:{MimeType:{JAVASCRIPT:'JAVASCRIPT',JSON:'JSON'},createTextOutput:t=>({text:t,setMimeType(m){this.mime=m;return this;}})},
  Date,Logger:{log(){}}
};
const cx=vm.createContext(mock);vm.runInContext(src,cx);
function parse(payload){const v=payload.text;return JSON.parse(v.startsWith('{')?v:v.slice(v.indexOf('(')+1,v.lastIndexOf(')')));}
let raw=cx.doGet({parameter:{mode:'feed'}});let feed=parse(raw);
assert.equal(raw.mime,'JSON');assert.equal(feed.ok,true);assert.equal(feed.folderId,folderId);
assert.equal(feed.count,36);assert.equal(feed.imageCount,34);assert.equal(feed.videoCount,2);
assert.equal(feed.items[0].id,'IMG000');assert.equal(feed.items[33].id,'V001');
assert(feed.items.find(x=>x.id==='HEIC').image.includes('thumbnail'));
assert(feed.items.find(x=>x.id==='IMG000').image.includes('resourcekey=RK222'));
assert.equal(feed.items.find(x=>x.id==='V001').videoUrl,'');
assert(feed.items.find(x=>x.id==='V001').previewUrl.endsWith('/preview'));
assert.equal(changedPermissions,0);
assert.equal(cx.testFlip60(),36);
let cb=cx.doGet({parameter:{mode:'feed',callback:'myCallback_52'}});
assert.equal(cb.mime,'JAVASCRIPT');assert.equal(parse(cb).count,36);
assert(cb.text.startsWith('myCallback_52('));
let malformed=cx.doGet({parameter:{callback:'evil);alert(document.cookie);//'}});
assert.equal(parse(malformed).ok,false);
let health=parse(cx.doGet({parameter:{mode:'health'}}));
assert.equal(health.count,36);assert.equal(health.imageCount,34);assert.equal(health.photoPreviewTest.length,3);
assert.equal(health.items,undefined);assert.equal(changedPermissions,0);
// A large folder must not cap the reel to the first 10/14 photos; test 300.
photos.push(...Array.from({length:280},(_,i)=>fakeFile('EXTRA'+i,'extra-'+i+'.jpg','image/jpeg',i+55)));
const huge=parse(cx.doGet({parameter:{mode:'feed',refresh:'1'}}));
assert.equal(huge.count,316);
const hugeFromCache=parse(cx.doGet({parameter:{mode:'feed'}}));
assert.equal(hugeFromCache.count,316);
assert.equal(huge.items[huge.items.length-1].id,'EXTRA279');
console.log(JSON.stringify({result:'PASS',total:feed.count,images:feed.imageCount,videos:feed.videoCount,largeFolder:huge.count,recursion:true,stableOrder:true,jsonp:true,callbackValidation:true,health:true,readOnly:true}));
