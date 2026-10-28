"""Re-encode responsive variants; preserve the original photo and existing fallbacks."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1];assets=root/'dist/assets';source=assets/'hero.jpg';original=Image.open(source)
rows=[]
for width in [480,780,960,1440]:
 photo=original.copy();photo.thumbnail((width,4096));temp=assets/('hero-delivery-'+str(width)+'.avif');photo.save(temp,quality=55,speed=6);data=temp.read_bytes();sha=hashlib.sha256(data).hexdigest();name='hero-'+str(width)+'-'+sha[:12]+'.avif';temp.rename(assets/name);rows.append({'url':'/assets/'+name,'width':photo.width,'height':photo.height,'bytes':len(data),'sha256':sha})
photo=original.copy();photo.thumbnail((780,4096));temp=assets/'hero-delivery-780.webp';photo.save(temp,format='WEBP',quality=80,method=6);data=temp.read_bytes();sha=hashlib.sha256(data).hexdigest();name='hero-780-'+sha[:12]+'.webp';temp.rename(assets/name)
record={'source':'/assets/hero.jpg','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'avif':rows,'webp_780':{'url':'/assets/'+name,'width':photo.width,'height':photo.height,'bytes':len(data),'sha256':sha}}
(root/'content/home-delivery.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'avif_bytes':{str(x['width']):x['bytes'] for x in rows},'webp780':len(data)}))
