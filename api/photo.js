'use strict';
/**
 * Optional Vercel same-origin image endpoint.
 * Retrieves public Google Drive thumbnails and removes only detectable phone
 * screenshot black margins. Read-only; never changes or uploads Drive photos.
 * The website falls back to the original Drive thumbnail if this is unavailable.
 */
const {processPhoto} = require('../lib/photo-processing');
module.exports = async function handler(req,res) {
  if(req.method!=='GET')return res.status(405).json({error:'GET required'});
  const id=String(req.query?.id||'');
  const resourceKey=String(req.query?.resourcekey||'');
  const turn=Number(req.query?.turn||0);
  if(![0,90,180,270].includes(turn))return res.status(400).json({error:'Invalid rotation'});
  if(!/^[A-Za-z0-9_-]{12,120}$/.test(id) || (resourceKey&&!/^[A-Za-z0-9_-]{1,140}$/.test(resourceKey))) return res.status(400).json({error:'Invalid file identifier'});
  const pictureUrl=new URL('https://drive.google.com/thumbnail');
  pictureUrl.searchParams.set('id',id);
  pictureUrl.searchParams.set('sz','w2200');
  if(resourceKey)pictureUrl.searchParams.set('resourcekey',resourceKey);
  try {
    const upstream=await fetch(pictureUrl.toString(),{
      redirect:'follow',signal:AbortSignal.timeout(18000),
      headers:{'Accept':'image/avif,image/webp,image/jpeg,image/png,image/*','User-Agent':'Mozilla/5.0 (compatible; Flip60PhotoReel/1.0)'}
    });
    if(!upstream.ok)throw new Error('Drive returned '+upstream.status);
    if(!String(upstream.headers.get('content-type')||'').startsWith('image/'))throw new Error('Drive did not return a public image');
    if(Number(upstream.headers.get('content-length')||0)>16_000_000)throw new Error('Image too large');
    const source=Buffer.from(await upstream.arrayBuffer());
    if(source.length>16_000_000)throw new Error('Image too large');
    const result=await processPhoto(source,{maxDimension:1900,turn});
    res.setHeader('Content-Type','image/webp');
    res.setHeader('Cache-Control','public,max-age=3600,s-maxage=86400,stale-while-revalidate=604800');
    res.setHeader('X-Flip60-Matte-Trimmed',result.crop.changed?'yes':'no');
    res.setHeader('X-Flip60-Auto-Oriented','exif');
    res.setHeader('X-Flip60-Manual-Rotation',String(turn));
    return res.status(200).end(result.buffer);
  } catch(e) {
    // An image element will fall back to the untouched Google Drive thumbnail.
    res.setHeader('Cache-Control','private,no-store');
    return res.status(502).json({error:'Public Drive thumbnail unavailable'});
  }
};
