/**
 * FLIP60 — LIVE READ-ONLY PHOTO + VIDEO REEL (standalone Google Apps Script)
 * Folder: https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6
 *
 * Deploy once as a WEB APP: Execute as Me; Who has access: Anyone.
 * Publishes the read-only photo feed AND a separate, upload-only guest page.
 * Does not connect to or modify Don's Still On Fire code.
 *
 * Endpoints after deployment:
 *   /exec?mode=health          JSON diagnostic, counts and folder ID
 *   /exec?mode=feed            JSON data
 *   /exec?mode=feed&callback=fn   JSONP for cross-domain Vercel website
 *   /exec?page=upload&key=...  Guest photo upload page
 *
 * IMPORTANT: The media files ALSO need sharing rights allowing visitors to
 * view the images/videos. The Apps Script's access is not passed to guests'
 * browsers. Check thumbnail load as a signed-out visitor before sharing.
 */
var FLIP60_FOLDER_ID = '10qytscu6v9hxoqTLKuNcfqvbfkvB31P6';
var FLIP60_FEED_VERSION = '4.0.0';
var FLIP60_CACHE_SECONDS = 75;
// A link-only passcode. Treat the URL as private to guests, not as a public listing.
var FLIP60_UPLOAD_KEY = '-EA69j8zM0v3n7AMDfxw2A';
var FLIP60_UPLOAD_MAX_BYTES = 12 * 1024 * 1024;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.page === 'upload') {
    if (p.key !== FLIP60_UPLOAD_KEY) {
      return HtmlService.createHtmlOutput('<h2>Hierdie oplaaiskakel is nie geldig nie.</h2>');
    }
    var template = HtmlService.createTemplateFromFile('Upload');
    template.uploadToken = FLIP60_UPLOAD_KEY;
    return template.evaluate().setTitle('Flip se foto-album | Stuur jou foto\'s')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
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
  var cache = null, cacheKey = 'flip60_media_v4_newest_'+FLIP60_FOLDER_ID;
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
        caption:'',
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
  // Latest files ADDED TO DRIVE first. Always chronological, never random.
  // Source is Drive file creation time (upload time), not the date of a historical photo.
  // Retain every file from all folders, including mixed photo/video media.
  items.sort(function(a,b) {
    var diff = (b.createdAt||b.updatedAt||'').localeCompare(a.createdAt||a.updatedAt||'');
    if (diff) return diff;
    diff = a.name.localeCompare(b.name);
    return diff || a.id.localeCompare(b.id);
  });
  var imageCount=0,videoCount=0;
  items.forEach(function(item){if(item.type==='video')videoCount++;else imageCount++;});
  var data = {ok:true,version:FLIP60_FEED_VERSION,folderId:FLIP60_FOLDER_ID,
    folderName:root.getName(), generatedAt:new Date().toISOString(),
    count:items.length,imageCount:imageCount,videoCount:videoCount,
    sort:'created_at_descending',items:items};
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


/**
 * FLIP60 PHOTO UPLOADER — independent of the read-only photo feed.
 * Only the holder of the unguessable upload URL can upload.
 * The web app MUST execute as the owner of the folder.
 * Never expose a general Drive editor link to guests.
 */
function uploadFlip60Photo(request) {
  if (!request || String(request.key || '') !== FLIP60_UPLOAD_KEY) {
    throw new Error('Ongeldige oplaaiskakel.');
  }
  var name = String(request.name || '').replace(/[\\/<>:"|?*\x00-\x1f]/g, '_').trim().slice(0, 150);
  if (!name || name.length < 5) throw new Error('Ongeldige lêernaam.');
  var ext = name.toLowerCase().split('.').pop();
  var permitted = {
    jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',
    webp:'image/webp',gif:'image/gif',
    heic:'image/heic',heif:'image/heif',avif:'image/avif'
  };
  var mime = permitted[ext];
  if (!mime) throw new Error('Slegs foto-lêers word aanvaar (JPG, PNG, HEIC, WebP, AVIF, GIF).');
  var suppliedSize = Number(request.size || 0);
  if (!Number.isFinite(suppliedSize) || suppliedSize <= 0 || suppliedSize > FLIP60_UPLOAD_MAX_BYTES) {
    throw new Error('Foto moet kleiner as 12 MB wees.');
  }
  var base64 = String(request.base64 || '');
  if (!base64 || base64.length > 17000000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error('Ongeldige fotodata.');
  }
  var bytes = Utilities.base64Decode(base64);
  if (bytes.length !== suppliedSize || bytes.length > FLIP60_UPLOAD_MAX_BYTES || !flip60LooksLikeImage_(bytes, ext)) {
    throw new Error('Die fotoformaat is nie geldig nie.');
  }
  var blob = Utilities.newBlob(bytes, mime, name);
  var file = DriveApp.getFolderById(FLIP60_FOLDER_ID).createFile(blob);
  // The story site shows these photos to viewers. Try granting view-only access
  // to the uploaded file; never give edit access to guests.
  var publiclyViewable = false;
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    publiclyViewable = true;
  } catch (sharingError) {
    // Drive policy may block public sharing; the photo was still uploaded.
    Logger.log('Flip60 sharing warning for %s: %s', file.getId(), sharingError);
  }
  // New uploads should become visible in the existing 2-minute feed refresh.
  try {
    var c = CacheService.getScriptCache();
    var prefix = 'flip60_media_v3_' + FLIP60_FOLDER_ID;
    var keys = [prefix, prefix + '_parts'];
    for (var i=0; i<40; i++) keys.push(prefix+'_part_'+i);
    c.removeAll(keys);
  } catch (cacheError) { Logger.log('Flip60 cache invalidation: '+cacheError); }
  return {ok:true,name:name,id:file.getId(),publiclyViewable:publiclyViewable};
}

// Refuse disguised executables/HTML even if their filenames end in .jpg etc.
function flip60LooksLikeImage_(bytes, ext) {
  function b(i){return (bytes[i] || 0) & 255;}
  function ascii(start, text) {
    for (var i=0;i<text.length;i++) if (b(start+i)!==text.charCodeAt(i)) return false;
    return true;
  }
  if (bytes.length < 16) return false;
  if (ext==='jpg' || ext==='jpeg') return b(0)===255 && b(1)===216 && b(2)===255;
  if (ext==='png') return b(0)===137 && ascii(1, 'PNG') && b(4)===13;
  if (ext==='gif') return ascii(0,'GIF87a') || ascii(0,'GIF89a');
  if (ext==='webp') return ascii(0,'RIFF') && ascii(8,'WEBP');
  if (ext==='heic' || ext==='heif' || ext==='avif') return ascii(4,'ftyp');
  return false;
}

/** Run this as duplooy717@gmail.com to validate the target folder. */
function testFlip60Uploader() {
  var folder=DriveApp.getFolderById(FLIP60_FOLDER_ID);
  Logger.log('Upload destination: %s (%s)',folder.getName(),folder.getId());
  Logger.log('Uploader is configured. Open the published /exec?page=upload&key=... URL.');
}
