/**
 * FLIP60 — LIVE READ-ONLY PHOTO + VIDEO REEL (standalone Google Apps Script)
 * Folder: https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6
 *
 * Deploy once as a WEB APP: Execute as Me; Who has access: Anyone.
 * Only metadata of media in this album is published. No uploads, changes to
 * sharing settings, or connections to Don's Still On Fire code are made.
 *
 * Endpoints after deployment:
 *   /exec?mode=health          JSON diagnostic, counts and folder ID
 *   /exec?mode=feed            JSON data
 *   /exec?mode=feed&callback=fn   JSONP for cross-domain Vercel website
 *
 * IMPORTANT: The media files ALSO need sharing rights allowing visitors to
 * view the images/videos. The Apps Script's access is not passed to guests'
 * browsers. Check thumbnail load as a signed-out visitor before sharing.
 */
var FLIP60_FOLDER_ID = '10qytscu6v9hxoqTLKuNcfqvbfkvB31P6';
var FLIP60_FEED_VERSION = '3.0.0';
var FLIP60_CACHE_SECONDS = 75;

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = String(p.callback || '');
  var mode = p.mode === 'health' ? 'health' : 'feed';
  if (callback && !/^[a-zA-Z_$][\w$]{0,90}$/.test(callback)) {
    return toResponse_({ok:false, error:'Invalid callback name'}, '');
  }
  try {
    var payload = collectMedia_(p.refresh === '1');
    if (mode === 'health') {
      payload = {
        ok: true,
        version: payload.version,
        folderId: payload.folderId,
        folderName: payload.folderName,
        generatedAt: payload.generatedAt,
        count: payload.count,
        imageCount: payload.imageCount,
        videoCount: payload.videoCount,
        sort:payload.sort,
        photoPreviewTest: payload.items.filter(function(item){return item.type==='image';}).slice(0,3).map(function(item){return {name:item.name, image:item.image, originalUrl:item.originalUrl};}),
        note:'The feed can list the files, but public thumbnail access must be checked separately in a signed-out browser.'
      };
    }
    return toResponse_(payload, callback);
  } catch (err) {
    return toResponse_({ok:false,version:FLIP60_FEED_VERSION,folderId:FLIP60_FOLDER_ID,
      error:String(err && err.message || err),generatedAt:new Date().toISOString(),
      count:0,imageCount:0,videoCount:0,items:[]},callback);
  }
}

function collectMedia_(forceRefresh) {
  var cache = null, cacheKey = 'flip60_media_v3_'+FLIP60_FOLDER_ID;
  try {cache = CacheService.getScriptCache();} catch(ignore) {}
  if (cache && !forceRefresh) {
    try {
      var cached=cache.get(cacheKey);
      if(cached) return JSON.parse(cached);
      var n=Number(cache.get(cacheKey+'_parts')||0);
      if(n>0&&n<=40){
        var chunks=[];
        for(var i=0;i<n;i++){
          var part=cache.get(cacheKey+'_part_'+i);
          if(!part){chunks=[];break;}
          chunks.push(part);
        }
        if(chunks.length===n)return JSON.parse(chunks.join(''));
      }
    }catch(ignore){}
  }
  var root = DriveApp.getFolderById(FLIP60_FOLDER_ID);
  var items = [], seenFolders = {}, seenFiles = {};
  function addFolder(folder, folderName) {
    var folderId = folder.getId();
    if (seenFolders[folderId]) return;
    seenFolders[folderId] = true;
    var files = folder.getFiles();
    while(files.hasNext()) {
      var file = files.next(), id = file.getId();
      if (seenFiles[id]) continue;
      var name = String(file.getName() || 'Untitled');
      var mime = String(file.getMimeType() || '').toLowerCase();
      var isImage = /^image\//.test(mime) || /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i.test(name);
      var isVideo = /^video\//.test(mime) || /\.(mp4|mov|m4v|webm|avi|mkv|3gp)$/i.test(name);
      if (!isImage && !isVideo) continue;
      seenFiles[id] = true;
      var key = ''; try {key = file.getResourceKey() || '';} catch(ignore){}
      var keyQuery = key ? '&resourcekey='+encodeURIComponent(key) : '';
      var keyPreview = key ? '?resourcekey='+encodeURIComponent(key) : '';
      var thumb = 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w2400'+keyQuery;
      var view = 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'+keyPreview;
      var preview = 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview'+keyPreview;
      var created = '', updated = '';
      try {created = file.getDateCreated().toISOString();}catch(ignore){}
      try {updated = file.getLastUpdated().toISOString();}catch(ignore){}
      var size = 0;try {size=file.getSize();}catch(ignore){}
      items.push({
        id:id, fileId:id, type:isVideo?'video':'image', name:name,
        caption:name.replace(/\.[^.]+$/, '').replace(/[_-]+/g,' ').trim(),
        mimeType:mime,
        thumbnailUrl:thumb, image:thumb, posterUrl:thumb,
        originalUrl:view, previewUrl:preview,
        // Drive preview is playable after user interaction; it is NOT a direct MP4 URL.
        videoUrl:'', createdAt:created, updatedAt:updated,
        path:folderName, size:size
      });
    }
    var childFolders = folder.getFolders();
    while(childFolders.hasNext()) {
      var child = childFolders.next();
      addFolder(child, folderName+' / '+child.getName());
    }
  }
  addFolder(root,root.getName());
  // Stable chronological order, including all photos/videos in subfolders.
  // Never shuffle, never slice to 10 or 14 items.
  items.sort(function(a,b) {
    var diff = (a.createdAt||'').localeCompare(b.createdAt||'');
    if (diff) return diff;
    diff = a.name.localeCompare(b.name);
    return diff || a.id.localeCompare(b.id);
  });
  var imageCount=0,videoCount=0;
  items.forEach(function(item){if(item.type==='video')videoCount++;else imageCount++;});
  var data = {ok:true,version:FLIP60_FEED_VERSION,folderId:FLIP60_FOLDER_ID,
    folderName:root.getName(), generatedAt:new Date().toISOString(),
    count:items.length,imageCount:imageCount,videoCount:videoCount,
    sort:'created_at_ascending',items:items};
  try {
    var encoded = JSON.stringify(data);
    // A single Google CacheService entry is limited to 100 KB.
    if(cache && encoded.length < 70000) cache.put(cacheKey,encoded,FLIP60_CACHE_SECONDS);
    else if(cache && encoded.length < 450000) {
      cache.remove(cacheKey); // invalidate old one-part cache on a forced refresh
      // Split large albums into smaller cache entries to prevent a Drive
      // folder rescan on every guest request while still returning ALL files.
      var size=18000, count=Math.ceil(encoded.length/size);
      for(var chunk=0;chunk<count;chunk++){
        cache.put(cacheKey+'_part_'+chunk,encoded.slice(chunk*size,(chunk+1)*size),FLIP60_CACHE_SECONDS);
      }
      cache.put(cacheKey+'_parts',String(count),FLIP60_CACHE_SECONDS);
    }
  } catch(ignore){}
  return data;
}

function toResponse_(data, callback) {
  var json = JSON.stringify(data)
    .replace(/</g,'\\u003c')
    .replace(/\u2028/g,'\\u2028')
    .replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback?callback+'('+json+');':json)
    .setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}

// Click Run in the editor to authorize Drive and verify the exact target folder.
function testFlip60() {
  var result = collectMedia_(true);
  Logger.log('FLIP60 folder: %s [%s]',result.folderName,result.folderId);
  Logger.log('Files: %s, photos: %s, videos: %s',result.count,result.imageCount,result.videoCount);
  Logger.log('First 3: %s',JSON.stringify(result.items.slice(0,3)));
  return result.count;
}
