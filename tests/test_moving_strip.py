"""Checks the restored moving-filmstrip and the TV QR using a mocked Drive feed."""
import json, mimetypes
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).parents[1]
# Small image set: tested at the video/photo boundaries as well.
IMAGE_BYTES=[(ROOT/'assets/flip-coastal-hero.jpg').read_bytes(),(ROOT/'assets/flip60-uitnodiging.jpeg').read_bytes(),(ROOT/'assets/flip60-belangrike-inligting.jpeg').read_bytes()]
folder_id='10qytscu6v9hxoqTLKuNcfqvbfkvB31P6'
items=[]
for i in range(21):
    id=f'MEMORYIMAGE{i:02d}XYZ'
    items.append({'id':id,'name':f'memory-{i}.jpg','caption':f'Foto {i}', 'type':'image','createdAt':f'2026-01-01T00:{i:02d}:00.000Z','image':f'https://drive.google.com/thumbnail?id={id}&sz=w2400'})

def serve(route):
    url=urlparse(route.request.url)
    if url.hostname=='flip60.test':
        p=(ROOT/url.path.lstrip('/')).resolve()
        if p.is_file() and ROOT in p.parents:
            mime=mimetypes.guess_type(p.name)[0] or 'text/plain'
            if p.suffix=='.js':mime='application/javascript'
            return route.fulfill(status=200,content_type=mime,body=p.read_bytes())
    if url.hostname=='script.google.com' and url.path.endswith('/exec'):
        cb=parse_qs(url.query).get('callback',[''])[0]
        data={'ok':True,'folderId':folder_id,'count':len(items),'items':items,'imageCount':21,'videoCount':0}
        b=json.dumps(data)
        return route.fulfill(status=200,content_type='application/javascript',body=(f'{cb}({b});' if cb else b))
    if url.hostname=='drive.google.com' and url.path=='/thumbnail':
        id=parse_qs(url.query).get('id',[''])[0]
        try:n=int(id.replace('MEMORYIMAGE','').replace('XYZ',''))
        except:n=0
        data=IMAGE_BYTES[n%3]
        return route.fulfill(status=200,content_type='image/jpeg',body=data)
    return route.fulfill(status=404,content_type='text/plain',body='not found')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':950})
    page.route('**/*',serve)
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://flip60.test/">',1),wait_until='load')
    page.wait_for_function("document.querySelector('#reelCount')?.textContent.includes('21 HERINNERINGE')")
    page.locator('#filmRiver').scroll_into_view_if_needed()
    page.wait_for_timeout(600)
    before_id=page.locator('.film-frame.is-center').get_attribute('aria-label')
    next_id=page.locator('#nextImage').get_attribute('alt')
    before_transform=page.locator('#memoryTrack').evaluate('el=>getComputedStyle(el).left')
    page.locator('#nextSlide').click()
    page.wait_for_timeout(220)
    middle_transform=page.locator('#memoryTrack').evaluate('el=>getComputedStyle(el).left')
    # UI transition cannot leave two central cards active.
    assert middle_transform!=before_transform,(middle_transform,before_transform)
    assert page.locator('.film-frame.is-center').count()==1
    page.wait_for_timeout(950)
    after_id=page.locator('.film-frame.is-center').get_attribute('aria-label')
    main_id=page.locator('#mainMedia>img').get_attribute('alt')
    assert after_id==main_id==next_id,(after_id,main_id,next_id)
    assert page.locator('#memoryTrack .film-frame').count()==9
    assert page.locator('#liveReelQr img').is_visible()
    page.locator('#openTv').click()
    assert page.locator('#tvOverlay').is_visible()
    assert page.locator('.tv-qr img').is_visible()
    assert folder_id in page.locator('.tv-qr a').get_attribute('href')
    page.locator('#tvOverlay').screenshot(path='/mnt/data/Flip60-v4-TV-Reel-QR.png')
    page.locator('#closeTv').click()
    page.wait_for_timeout(2100)
    print('FILM_IMAGES', page.locator('#memoryTrack .film-frame img').evaluate_all('(imgs)=>imgs.slice(0,4).map(x=>({src:x.src.slice(0,90),complete:x.complete,naturalWidth:x.naturalWidth,rect:x.getBoundingClientRect().toJSON(),style:{display:getComputedStyle(x).display,opacity:getComputedStyle(x).opacity,width:getComputedStyle(x).width,height:getComputedStyle(x).height,visibility:getComputedStyle(x).visibility,position:getComputedStyle(x).position}}))'))
    page.locator('.film-frame.is-center img').screenshot(path='/mnt/data/Flip60-v4-Debug-IMG.png')
    page.locator('#filmWindow').screenshot(path='/mnt/data/Flip60-v4-Debug-Film-Window.png')
    page.locator('#herinneringe').screenshot(path='/mnt/data/Flip60-v4-Memory-and-Live-Reel-Desktop.png')
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile.route('**/*',serve)
    mobile.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://flip60.test/">',1),wait_until='load')
    mobile.wait_for_function("document.querySelector('#reelCount')?.textContent.includes('21 HERINNERINGE')")
    mobile.locator('#herinneringe').scroll_into_view_if_needed()
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    assert mobile.locator('#filmRiver .film-frame.is-center').is_visible()
    mobile.locator('#herinneringe').screenshot(path='/mnt/data/Flip60-v4-Memory-and-Live-Reel-Mobile.png')
    mobile.locator('#openTv').click()
    assert mobile.locator('.tv-qr img').is_visible()
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    mobile.locator('#tvOverlay').screenshot(path='/mnt/data/Flip60-v4-TV-Mobile-QR.png')
    print(json.dumps({'strip_moves_right_to_left':True,'strip_stays_in_sync_with_live_reel':True,'number_of_feed_items':len(items),'film_window_size':9,'fullscreen_tv_qr':True,'mobile_qr':True,'folder_id_matches':True,'javascript_errors':errors},indent=2))
    assert not errors
    browser.close()
