/**
 * FLIP60 PHOTO FEED — NEW SEPARATE APPS SCRIPT DEPLOYMENT
 * Bound to Flip's NEW Drive folder, not Don's memory folder.
 * The public web app returns photo/video metadata via JSONP for reliable
 * browser reads from Vercel without relying on Apps Script CORS headers.
 *
 * INSTALL:
 * 1. Log in to script.google.com as the OWNER of the Flip60 Drive folder.
 * 2. Create a NEW standalone Apps Script, paste this Code.gs.
 * 3. Deploy > New deployment > Web app > Execute as Me > Anyone.
 * 4. Authorize Drive access, copy the /exec URL into ../config.js.
 * 5. Set appropriate viewing permissions on the media. Browser images/videos
 *    are fetched from Drive and need to be accessible to celebration guests.
 *
 * SECURITY: This is read-only. No POST/UPLOAD and no write access to Drive.
 * Share only appropriate celebratory media in this folder.
 */
var FLIP60_DRIVE_FOLDER_ID = '10qytscu6v9hxoqTLKuNcfqvbfkvB31P6';

function doGet(e) {
  try {
    var callback = e && e.parameter && e.parameter.callback ? String(e.parameter.callback) : '';
    if(callback && !/^[a-zA-Z_$][a-zA-Z0-9_$]{0,90}$/.test(callback)) {
      return ContentService.createTextOutput('/* Invalid callback */').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    var folder = DriveApp.getFolderById(FLIP60_DRIVE_FOLDER_ID);
    var iterator = folder.getFiles();
    var items = [];
    while(iterator.hasNext()) {
      var file = iterator.next();
      var mime = String(file.getMimeType() || '');
      if(!/^image\//.test(mime) && !/^video\//.test(mime)) continue;
      var id=file.getId();
      var video=/^video\//.test(mime);
      items.push({
        id:id,
        fileId:id,
        name:file.getName(),
        caption:file.getName().replace(/\.[^.]+$/,''),
        type:video?'video':'image',
        mimeType:mime,
        image:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w2400',
        thumbnailUrl:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w2400',
        previewUrl:'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview',
        originalUrl:'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view',
        // Drive does not reliably offer an embeddable autoplay video URL.
        // For a seamless video segment, provide a separately hosted HTTPS MP4.
        videoUrl:'',
        createdAt:file.getDateCreated().toISOString()
      });
    }
    // Chronological and deterministic — NO SHUFFLE, NO arbitrary photo limit.
    items.sort(function(a,b) {var n=a.createdAt.localeCompare(b.createdAt);return n!==0?n:a.id.localeCompare(b.id);});
    var result={ok:true,folderId:FLIP60_DRIVE_FOLDER_ID,generatedAt:new Date().toISOString(),count:items.length,items:items};
    var payload=callback ? callback+'('+JSON.stringify(result)+');' : JSON.stringify(result);
    return ContentService.createTextOutput(payload).setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
  } catch(error) {
    var cb=e&&e.parameter&&e.parameter.callback?String(e.parameter.callback):'';
    if(cb&&!/^[a-zA-Z_$][a-zA-Z0-9_$]{0,90}$/.test(cb)) cb='';
    var result={ok:false,error:String(error),items:[]};
    return ContentService.createTextOutput(cb?cb+'('+JSON.stringify(result)+');':JSON.stringify(result)).setMimeType(cb?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
  }
}
