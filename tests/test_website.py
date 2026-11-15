import json,mimetypes,time
from pathlib import Path
from urllib.parse import urlparse,parse_qs,unquote
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).parent.parent
FEED='https://script.google.com/macros/s/flip60test/exec'
IMAGE=(ROOT/'assets/flip-coastal-hero.jpg').read_bytes()
results={}

def feed_items(num=35):
    seq=[]
    for i in range(num):
        isvideo=i in (2,18)
        fid=f'FLIP0000{i:04d}'
        seq.append({'id':fid,'type':'video' if isvideo else 'image', 'name':f'{"video" if isvideo else "photo"}-{i:03d}.{"mp4" if isvideo else "jpg"}', 'caption':f'Flip memory {i}',
                    'image':f'https://drive.google.com/thumbnail?id={fid}&sz=w2400',
                    'previewUrl':f'https://drive.google.com/file/d/{fid}/preview',
                    'originalUrl':f'https://drive.google.com/file/d/{fid}/view',
                    'createdAt':f'2026-11-01T00:{i:02d}:00.000Z', 'videoUrl':''})
    return seq

state={'items':feed_items(35)}

def serve(route):
    url=urlparse(route.request.url)
    p=unquote(url.path).lstrip('/')
    if url.hostname=='flip60.test':
        f=ROOT/p
        if p=='config.js':
            data=f.read_text().replace('PHOTO_FEED_URL: ""','PHOTO_FEED_URL: "'+FEED+'"')
            return route.fulfill(status=200,body=data,content_type='application/javascript')
        if f.is_file() and ROOT in f.resolve().parents:
            mime=mimetypes.guess_type(f.name)[0] or 'text/plain'
            if f.suffix=='.js': mime='application/javascript'
            return route.fulfill(status=200,body=f.read_bytes(),content_type=mime)
    if url.hostname=='script.google.com' and p.endswith('/exec'):
        cb=parse_qs(url.query).get('callback',[''])[0]
        items=state['items']
        res={'ok':True,'folderId':'10qytscu6v9hxoqTLKuNcfqvbfkvB31P6','count':len(items), 'items':items}
        body=cb+'('+json.dumps(res)+');' if cb else json.dumps(res)
        return route.fulfill(status=200,body=body,content_type='application/javascript' if cb else 'application/json')
    if url.hostname=='drive.google.com':
        if p=='thumbnail':
            if 'MISSING' in url.query:
                return route.fulfill(status=403,body='Forbidden')
            return route.fulfill(status=200,body=IMAGE,content_type='image/jpeg')
        if p.endswith('/preview'):
            return route.fulfill(status=200,body='<html><body>Drive video preview simulated</body></html>',content_type='text/html')
    return route.fulfill(status=404,body='Not found')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    desktop=browser.new_page(viewport={'width':1440,'height':900})
    desktop.route('**/*',serve)
    errors=[]
    desktop.on('pageerror',lambda e:errors.append(str(e)))
    desktop.clock.install()
    desktop.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://flip60.test/">',1),wait_until='load')
    desktop.wait_for_function("document.querySelector('#feedStatus')?.textContent.includes('LIVE')",timeout=14000)
    results['live_count']=desktop.locator('#reelCount').inner_text()
    results['live_feed_label']=desktop.locator('#feedStatus').inner_text()
    results['all_items']=desktop.locator('#reelCount').inner_text().endswith('35 HERINNERINGE')
    results['rsvp_removed']=desktop.locator('#rsvpForm').count()==0 and desktop.locator('a[href="#rsvp"]').count()==0
    results['qr_present']=desktop.locator('.album-qr img').is_visible()
    results['qr_points_to_folder']='10qytscu6v9hxoqTLKuNcfqvbfkvB31P6' in desktop.locator('.album-qr').get_attribute('href')
    results['hero_swaps_to_real_photo']=desktop.locator('.hero-visual>img').evaluate('img=>img.src.includes("drive.google.com/thumbnail")')
    results['desktop_no_overflow']=desktop.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    results['start_image']=desktop.locator('#mainMedia img').get_attribute('src')
    after=desktop.locator('#nextImage').get_attribute('src')
    desktop.locator('#nextSlide').click()
    results['right_neighbor_handoff']=desktop.locator('#mainMedia img').get_attribute('src')==after
    desktop.locator('#nextSlide').click() # video at index 2
    results['video_poster']=desktop.locator('.video-poster-overlay button').is_visible()
    desktop.locator('.video-poster-overlay button').click()
    results['embedded_drive_video']=desktop.locator('#mainMedia iframe.video-iframe').count()==1
    results['paused_for_video']='Speel' in desktop.locator('#pauseSlide').inner_text()
    desktop.locator('#nextSlide').click()
    results['video_stops_on_handoff']=desktop.locator('#mainMedia iframe.video-iframe').count()==0
    desktop.locator('#prevSlide').click() # back to Drive video
    desktop.locator('#openTv').click()
    results['tv_video_cta']=desktop.locator('#tvVideoPlay').is_visible()
    desktop.locator('#tvVideoPlay').click()
    results['tv_embeds_drive_video']=desktop.locator('.tv-main iframe.video-iframe').count()==1
    desktop.locator('#tvNext').click() # close iframe on next item
    results['tv_video_removed_on_next']=desktop.locator('.tv-main iframe.video-iframe').count()==0
    results['tv_open']=desktop.locator('#tvOverlay').is_visible()
    desktop.locator('#closeTv').click()
    results['tv_close']=desktop.locator('#tvOverlay').is_hidden()
    desktop.locator('#pauseSlide').click() # unpause
    # 10 seconds should advance one position
    before_timer=desktop.locator('#mainMedia img').get_attribute('src')
    expected=desktop.locator('#nextImage').get_attribute('src')
    desktop.clock.fast_forward(10050)
    desktop.wait_for_timeout(100)
    results['ten_second_handoff']=desktop.locator('#mainMedia img').get_attribute('src')==expected
    results['timer_before']=before_timer
    state['items']=feed_items(38)
    desktop.locator('#refreshFeed').click()
    desktop.wait_for_function("document.querySelector('#feedStatus')?.textContent.includes('36 foto')",timeout=12000)
    results['refreshed_count']=desktop.locator('#reelCount').inner_text()
    results['refresh_added_items']=desktop.locator('#reelCount').inner_text().endswith('38 HERINNERINGE')
    results['errors']=errors
    desktop.screenshot(path='/mnt/data/Flip60-Live-Drive-Desktop.png',full_page=True)
    mob=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mob.route('**/*',serve)
    mob.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://flip60.test/">',1),wait_until='load')
    mob.wait_for_function("document.querySelector('#feedStatus')?.textContent.includes('LIVE')",timeout=12000)
    results['mobile_no_overflow']=mob.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    mob.locator('.menu-toggle').click()
    results['mobile_nav_works']=mob.locator('#mobileNav').is_visible()
    results['mobile_rsvp_removed']=mob.locator('#rsvpForm').count()==0
    mob.screenshot(path='/mnt/data/Flip60-Live-Drive-Mobile.png',full_page=True)
    debug=browser.new_page(viewport={'width':1200,'height':900})
    debug.route('**/*',serve)
    debug.set_content((ROOT/'feed-check.html').read_text().replace('<head>','<head><base href="https://flip60.test/">',1),wait_until='load')
    debug.wait_for_function("document.querySelector('#status')?.textContent.includes('Feed werk')",timeout=16000)
    results['feed_check_success']='Feed werk' in debug.locator('#status').inner_text()
    results['feed_check_count']=debug.locator('#count').inner_text()
    debug.screenshot(path='/mnt/data/Flip60-Feed-Check.png',full_page=True)
    # A public feed may be readable even when Drive thumbnails are private.
    # The website must show a transparent error rather than a blank frame.
    state['items']=feed_items(35)
    state['items'][0]['image']='https://drive.google.com/thumbnail?id=MISSING&sz=w2400'
    broken=browser.new_page(viewport={'width':1050,'height':760})
    broken.route('**/*',serve)
    broken.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href=\"https://flip60.test/\">',1),wait_until='load')
    broken.wait_for_selector('#mainMedia .reel-error',timeout=12000)
    results['private_photo_detected']=broken.locator('#mainMedia .reel-error').is_visible()
    broken.wait_for_function("document.querySelector('#feedStatus')?.textContent.includes('Net 2/3')",timeout=12000)
    results['private_photo_diagnostic']='Net 2/3' in broken.locator('#feedStatus').inner_text()
    browser.close()
print(json.dumps(results,indent=2,ensure_ascii=False))
assert results['rsvp_removed'] and results['qr_present'] and results['qr_points_to_folder']
assert results['all_items'] and results['right_neighbor_handoff'] and results['ten_second_handoff']
assert results['hero_swaps_to_real_photo'] and results['video_poster'] and results['embedded_drive_video'] and results['paused_for_video'] and results['video_stops_on_handoff']
assert results['tv_open'] and results['tv_close'] and results['refresh_added_items'] and results['mobile_no_overflow'] and results['desktop_no_overflow']
assert results['tv_video_cta'] and results['tv_embeds_drive_video'] and results['tv_video_removed_on_next']
assert results['private_photo_detected'] and results['private_photo_diagnostic']
assert results['feed_check_success'] and not results['errors']
