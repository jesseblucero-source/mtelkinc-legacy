export function initPage(){
// Three.js r180 progressive hero scene. Photo content stays in the accessible image below.
(() => {
 const hero=document.querySelector('.hero'),surface=hero?.querySelector('.hero-image'),image=surface?.querySelector('img');
 if(!hero||!surface||!image)return;
 if(!window.ResizeObserver||!window.IntersectionObserver||!image.decode){surface.dataset.depth='fallback';document.dispatchEvent(new Event('hero-depth-fallback'));return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:760px)'),fine=matchMedia('(pointer:fine)');
 let activated=false,sceneState=null,loading=false,failed=false,visible=true,pageActive=true,raf=0,last=0,elapsed=0,clock=0;
 const pointer={x:0,y:0},smooth={x:0,y:0};
 const paused=()=>reduced.matches||document.documentElement.classList.contains('cinema-paused');
 const allowed=()=>visible&&pageActive&&!document.hidden&&!document.documentElement.classList.contains('soundscape-open')&&!paused();
 function stop(){cancelAnimationFrame(raf);raf=0;clock=0;}
 function draw(now){raf=0;if(!sceneState||!allowed())return;raf=requestAnimationFrame(draw);const interval=phone.matches?1000/30:1000/45;if(now-last<interval)return;
  const dt=clock?Math.min((now-clock)/1000,.1):0;clock=now;last=now;elapsed+=dt;const s=sceneState;
  smooth.x+=(pointer.x-smooth.x)*.075;smooth.y+=(pointer.y-smooth.y)*.075;
  const strength=phone.matches?.55:1,t=elapsed,progress=Math.min(t/7,1),push=progress*progress*(3-2*progress);
  s.camera.position.x=(Math.sin(t*.31)*.07+smooth.x*.16)*strength;
  s.camera.position.y=(Math.cos(t*.27)*.028+smooth.y*.08)*strength+Math.min(scrollY/hero.offsetHeight,1)*.035;
  s.camera.position.z=3.15-push*.18+Math.sin(t*.36)*.025;s.camera.lookAt(0,0,0);
  s.photo.rotation.y=Math.sin(t*.22)*.012+smooth.x*.018;
  s.dust.rotation.z=t*.008;s.dust.position.y=Math.sin(t*.24)*.045;
  s.renderer.render(s.scene,s.camera);surface.depthFrames=++s.frames;
 }
 function resize(){if(!sceneState)return;const s=sceneState,r=surface.getBoundingClientRect(),aspect=Math.max(r.width,1)/Math.max(r.height,1);
  s.renderer.setPixelRatio(Math.min(devicePixelRatio,phone.matches?1:1.25));s.renderer.setSize(r.width,r.height,false);s.camera.aspect=aspect;s.camera.updateProjectionMatrix();s.photo.scale.x=aspect;
  const a=image.naturalWidth/image.naturalHeight;s.texture.repeat.set(Math.min(aspect/a,1),Math.min(a/aspect,1));s.texture.offset.set((1-s.texture.repeat.x)*.5,(1-s.texture.repeat.y)*.54);s.texture.needsUpdate=true;
  if(allowed())s.renderer.render(s.scene,s.camera);
 }
 async function initialize(){if(!activated||loading||sceneState||failed||paused()||navigator.connection?.saveData)return;loading=true;
  let renderer,texture,geometry,material,dustGeometry,dustMaterial;
  try{
   // Do not download Three.js for reduced-motion devices or browsers without WebGL2.
   const probe=document.createElement('canvas');const gl=probe.getContext('webgl2',{failIfMajorPerformanceCaveat:true});if(!gl)throw Error('WebGL2 unavailable');gl.getExtension('WEBGL_lose_context')?.loseContext();
   const T=await import('/vendor/three/three-hero-r180-da00bccb.min.js');await image.decode();
   // A fresh image has intrinsic dimensions; responsive markup dimensions are not texture allocation sizes.
   const textureImage=new Image();textureImage.src=image.currentSrc||image.src;await textureImage.decode();if(paused()||!pageActive){loading=false;return;}
   renderer=new T.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x260203);renderer.domElement.className='hero-depth-canvas';renderer.domElement.setAttribute('aria-hidden','true');
   texture=new T.Texture(textureImage);texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;
   geometry=new T.PlaneGeometry(2.4,2.4);material=new T.MeshBasicMaterial({map:texture,toneMapped:false});const photo=new T.Mesh(geometry,material),scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,20);camera.position.z=3.15;scene.add(photo);
   const positions=new Float32Array(24*3);for(let i=0;i<24;i++){positions[i*3]=Math.sin(i*13.7)*1.15;positions[i*3+1]=Math.cos(i*8.9)*1.15;positions[i*3+2]=.35+(i%7)*.13;}
   dustGeometry=new T.BufferGeometry();dustGeometry.setAttribute('position',new T.BufferAttribute(positions,3));dustMaterial=new T.PointsMaterial({color:0xd47658,size:.014,transparent:true,opacity:.23,depthWrite:false});const dust=new T.Points(dustGeometry,dustMaterial);scene.add(dust);
   sceneState={renderer,texture,geometry,material,dustGeometry,dustMaterial,photo,scene,camera,dust,frames:0};surface.append(renderer.domElement);resize();surface.classList.add('has-hero-depth');surface.dataset.depth='ready';document.dispatchEvent(new Event('hero-depth-ready'));
   renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();},{once:true});sync();
  }catch(e){[texture,geometry,material,dustGeometry,dustMaterial,renderer].forEach(x=>x?.dispose());fallback();}finally{loading=false;}
 }
 window.MTPageRouter?.onLeave(()=>{pageActive=false;stop();if(sceneState){const s=sceneState;[s.texture,s.geometry,s.material,s.dustGeometry,s.dustMaterial,s.renderer].forEach(x=>x.dispose());s.renderer.domElement.remove();sceneState=null;}});
 function fallback(){stop();if(sceneState){const s=sceneState;[s.texture,s.geometry,s.material,s.dustGeometry,s.dustMaterial,s.renderer].forEach(x=>x.dispose());s.renderer.domElement.remove();sceneState=null;}failed=true;surface.classList.remove('has-hero-depth');surface.dataset.depth='fallback';document.dispatchEvent(new Event('hero-depth-fallback'));}
 function sync(){stop();surface.classList.toggle('depth-static',paused());const hint=document.querySelector('.cinema-controls>span');if(hint&&sceneState)hint.textContent=paused()?'STATIC PHOTO':phone.matches?'SCROLL TO EXPLORE':'MOVE POINTER TO EXPLORE';if(!sceneState){if(allowed())initialize();return;}if(allowed())raf=requestAnimationFrame(draw);}
 hero.addEventListener('pointermove',e=>{if(!fine.matches||e.pointerType==='touch')return;const r=surface.getBoundingClientRect();pointer.x=e.clientX>=r.left&&e.clientX<=r.right?Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)):0;pointer.y=Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2));},{passive:true});
 hero.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
 new ResizeObserver(resize).observe(surface);new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.01}).observe(surface);
 if(reduced.addEventListener)reduced.addEventListener('change',sync);else reduced.addListener?.(sync);document.addEventListener('cinema-motion-change',sync);document.addEventListener('music-immersive-change',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{pageActive=false;stop();});window.addEventListener('pageshow',()=>{pageActive=true;sync();});window.addEventListener('beforeprint',()=>{stop();surface.classList.add('depth-static');});window.addEventListener('afterprint',sync);
 function start(){
  let armed=false,paintObserver,timeout;
  function arm(){if(armed)return;armed=true;paintObserver?.disconnect();clearTimeout(timeout);setTimeout(()=>{activated=true;if('requestIdleCallback' in window)requestIdleCallback(()=>sync(),{timeout:2000});else sync();},2400);}
  // Wait until the primary photo has actually painted before asking the GPU to build a scene.
  if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')){
   paintObserver=new PerformanceObserver(list=>{if(list.getEntries().some(e=>e.element===image))arm();});paintObserver.observe({type:'largest-contentful-paint',buffered:true});timeout=setTimeout(arm,6000);
  }else requestAnimationFrame(()=>requestAnimationFrame(arm));
 }
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
