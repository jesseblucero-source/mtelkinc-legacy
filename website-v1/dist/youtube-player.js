// Configure the official embedded player without changing source records or navigating away.
export function configureYouTubePlayer(frame) {
 const url = new URL(frame.src);
 if (url.origin !== 'https://www.youtube-nocookie.com' || !/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) {
  throw new Error('Invalid embedded video URL');
 }
 // Identify the actual embedding site, including localized/custom-domain routes.
 url.searchParams.set('origin', location.origin);
 url.searchParams.set('playsinline', '1');
 frame.referrerPolicy = 'strict-origin-when-cross-origin';
 frame.src = url.href;
 return frame;
}
