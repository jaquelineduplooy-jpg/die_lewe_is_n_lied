# Flip60 V11 — Click & Upload, no QR code needed

All Flip60 V10 story design, portrait avatar and ordered 10-second Memory Reel code remain unchanged.
The existing Google Apps Script feed is extended with a separate photo-uploader page.

## Shareable upload URL — available only AFTER redeployment

https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec?page=upload&key=-EA69j8zM0v3n7AMDfxw2A

Share the link in WhatsApp. Guests select up to 20 photos at a time and press **Laai foto’s op**. No Google login is required when the Web App is deployed **Execute as Me / Anyone**.
Each JPEG, PNG, HEIC, HEIF, WebP, GIF or AVIF file must be under 12 MB. The uploaded photos are saved directly into Flip60’s existing Drive folder. The account that deployed the Apps Script owns the uploaded files and guests never receive folder editor permissions.

## Enable (two-file change to your existing Google Apps Script)

1. Sign in as **duplooy717@gmail.com** and open the existing **Flip60 Live Memory Reel** project at script.google.com.
2. Replace the contents of **Code.gs** with `google-apps-script/Code.gs` from this ZIP. **Do not delete existing functions; this Code.gs preserves the feed and adds upload support.**
3. In the editor, click **+ → HTML**, name the file **Upload**, and paste the contents of `google-apps-script/Upload.html`.
4. Save. Run `testFlip60Uploader()` once if Google requests authorization.
5. Select **Deploy → Manage deployments → Edit (pencil)** on the *existing* Flip60 web-app deployment; choose **New version**, and click **Deploy**. Keep **Execute as Me** and **Who has access: Anyone**. Updating the existing deployment preserves its `/exec` URL.
6. Open the URL above in a private/incognito window. Pick a test photo and confirm it appears in the correct Drive folder and in the reel after refresh.
7. Deploy this website folder on Vercel. Flip60’s story page and separate live-reel page now show **Stuur jou foto’s** buttons instead of the QR JPEG.

> This link is **not yet live** until steps 1–5 are completed. Do not share it before testing. The existing public Drive folder URL only lets guests upload if they have editor rights, which is not recommended.

## Safety

- Anyone with the upload URL can upload photos. Share with trusted guests; don’t post on public social media.
- Files are checked for image formats and limited to 12 MB each; uploads are never allowed to delete or edit the album.
- New photos are set to view-only link sharing where Google Drive policy permits so the reel can display them; ensure guests consent to sharing their pictures on the birthday website.
- Google Apps Script web apps have execution quotas and limitations; the 12 MB limit is a conservative usability setting, not a Google-guaranteed maximum. Large videos are not supported by this uploader.
- Don’s Still On Fire code and folder are not used or changed.
