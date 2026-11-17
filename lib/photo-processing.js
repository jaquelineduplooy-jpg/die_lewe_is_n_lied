/**
 * Flip60 photo processing: display-only, never writes to Google Drive.
 * Detects substantial, nearly solid black phone/screenshot bars and trims
 * those bars only. The actual photograph is not stretched or cropped.
 */
'use strict';
const sharp = require('sharp');

function isDark(r, g, b) {
  return Math.max(r,g,b) <= 37;
}
function getBlackEdges(data, info) {
  const {width:w, height:h, channels:c} = info;
  const lineIsBlack = (axis,n) => {
    const horizontal = axis === 'y';
    const length = horizontal ? w : h;
    const stride = Math.max(1, Math.floor(length/110));
    let dark=0, checked=0;
    // Sample the central 90% to avoid photographer borders or an occasional icon.
    for(let v=Math.floor(length*.045); v<Math.ceil(length*.955); v+=stride) {
      const x=horizontal?v:n, y=horizontal?n:v;
      const pos=(y*w+x)*c;
      if(isDark(data[pos],data[pos+1],data[pos+2])) dark++;
      checked++;
    }
    return checked>3 && dark/checked>.925;
  };
  // Requiring at least two nonblack lines prevents an isolated compression pixel
  // from prematurely terminating a genuine phone matte.
  const scan = (axis, fromEnd) => {
    const length=axis==='y'?h:w;
    let n=0, streak=0;
    while(n<Math.floor(length*.445)){
      const idx=fromEnd?length-1-n:n;
      if(lineIsBlack(axis,idx)){streak=0;n++;}
      else if(++streak<2){n++;}
      else break;
    }
    return Math.max(0,n-streak);
  };
  function brightnessAt(axis,n){
    const horizontal=axis==='y',length=horizontal?w:h;
    let total=0,count=0;
    const stride=Math.max(1,Math.floor(length/80));
    for(let v=Math.floor(length*.075);v<Math.ceil(length*.925);v+=stride){
      const x=horizontal?v:n,y=horizontal?n:v,p=(y*w+x)*c;
      total+=(data[p]+data[p+1]+data[p+2])/3;count++;
    }
    return count?total/count:0;
  }
  function isClearlyMatte(axis,depth,fromEnd){
    const length=axis==='y'?h:w;
    if(depth<Math.max(6,Math.floor(length*.085)))return false;
    const matteIndex=fromEnd?length-1-Math.floor(depth*.5):Math.floor(depth*.5);
    const interiorIndex=fromEnd?Math.max(0,length-depth-Math.max(4,Math.floor(length*.025))):Math.min(length-1,depth+Math.max(4,Math.floor(length*.025)));
    const matteBrightness=brightnessAt(axis,matteIndex);
    const contentBrightness=brightnessAt(axis,interiorIndex);
    // An abrupt transition from near-solid black into visible picture content,
    // not a continuous dark or nighttime photograph.
    return matteBrightness<18 && contentBrightness-matteBrightness>24;
  }
  let top=scan('y',false), bottom=scan('y',true);
  let left=scan('x',false), right=scan('x',true);
  const yTrim=(top+bottom)/h, xTrim=(left+right)/w;
  // Conservative rule: remove only conspicuous, uniform bars. Do not touch
  // naturally dark photographs with ordinary edge shadows.
  if(yTrim<.14 || (!isClearlyMatte('y',top,false) && !isClearlyMatte('y',bottom,true))) {top=0;bottom=0;}
  if(xTrim<.14 || (!isClearlyMatte('x',left,false) && !isClearlyMatte('x',right,true))) {left=0;right=0;}
  // Prevent pathological crops on an almost-black photo.
  if(h-top-bottom < .14*h){top=0;bottom=0;}
  if(w-left-right < .14*w){left=0;right=0;}
  // Leave a 1% perimeter within the detected inner picture to avoid losing edges.
  const pY=Math.min(3,Math.floor(h*.008)), pX=Math.min(3,Math.floor(w*.008));
  if(top || bottom){top=Math.max(0,top-pY);bottom=Math.max(0,bottom-pY);}
  if(left || right){left=Math.max(0,left-pX);right=Math.max(0,right-pX);}
  return {top,bottom,left,right,changed:!!(top||bottom||left||right)};
}

async function processPhoto(bytes, options={}) {
  const maxDimension=Math.min(2200,Math.max(480,Number(options.maxDimension)||1600));
  const orientationCorrected=await sharp(bytes,{limitInputPixels:50000000,failOn:'none'}).rotate().toBuffer();
  const meta=await sharp(orientationCorrected).metadata();
  if(!meta.width||!meta.height)throw new Error('Invalid image');
  const sample=await sharp(orientationCorrected).resize({width:370,height:370,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const b=getBlackEdges(sample.data,sample.info);
  const crop={
    left:Math.floor((b.left/sample.info.width)*meta.width),
    top:Math.floor((b.top/sample.info.height)*meta.height),
    width:Math.ceil(((sample.info.width-b.left-b.right)/sample.info.width)*meta.width),
    height:Math.ceil(((sample.info.height-b.top-b.bottom)/sample.info.height)*meta.height)
  };
  crop.width=Math.min(crop.width,meta.width-crop.left);
  crop.height=Math.min(crop.height,meta.height-crop.top);
  const pipeline=sharp(orientationCorrected);
  if(b.changed && crop.width>12 && crop.height>12)pipeline.extract(crop);
  const buffer=await pipeline.resize({width:maxDimension,height:maxDimension,fit:'inside',withoutEnlargement:true}).webp({quality:91,effort:4}).toBuffer();
  return {buffer,crop:b,source:{width:meta.width,height:meta.height}};
}
module.exports={processPhoto,getBlackEdges};
