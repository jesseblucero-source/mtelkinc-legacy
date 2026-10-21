attrs={'alt','aria-label','placeholder','title','data-search','data-title'}
class Edition(HTMLParser):
 def __init__(self,locale,mapping,route):self.route=route;super().__init__(convert_charrefs=True);self.lang=locale;self.mapping=mapping;self.skip=0;self.out=[]
 def translate(self,t):return self.mapping.get(t.strip(),t.strip())
 def link(self,value):
  if value.startswith(origin):return origin+self.link(value[len(origin):] or '/')
  if value.startswith('/'):
   u=urlsplit(value)
   if u.path in routes:return ('/'+self.lang if self.lang!='en' else '')+value
  return value
 def start(self,t,values,closed=False):
  a=dict(values)
  if t=='html' or a.get('lang') in ['en','fr','es']:a['lang']=self.lang
  if t in ['script','style']:self.skip+=1
  for k,v in list(a.items()):
   if v is None:continue
   if k=='data-search':
    original=a.get('data-search-en',v);a['data-search-en']=original
    a[k]=' '.join(dict.fromkeys([original]+[all_maps[code].get(original,original).lower() for code in ['fr','es']]))
   elif self.lang!='en' and (k in attrs or (t=='meta' and k=='content' and (a.get('name')=='description' or a.get('property') in ['og:title','og:description']))):
    translated=self.translate(v)
    a[k]=(v+' '+translated.lower()) if k=='data-search' else translated
   if k in ['href','src','action'] and a[k] and not a[k].startswith(('/', '#')) and not urlsplit(a[k]).scheme:a[k]=urljoin(self.route,a[k])
   if k=='srcset':a[k]=', '.join(urljoin(self.route,part.strip().split()[0])+(' '+' '.join(part.strip().split()[1:]) if len(part.strip().split())>1 else '') for part in a[k].split(','))
   if k in ['href','action'] or (t=='meta' and a.get('property')=='og:url' and k=='content'):a[k]=self.link(a[k])
  self.out.append('<'+t+''.join(' '+k+('="'+html.escape(v,quote=True)+'"' if v is not None else '') for k,v in a.items())+('/>' if closed else '>'))
 def handle_starttag(self,t,a):self.start(t,a)
 def handle_startendtag(self,t,a):self.start(t,a,True)
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
  self.out.append('</'+t+'>')
 def handle_data(self,t):
  if self.skip:self.out.append(t);return
  if not t.strip():self.out.append(t);return
  value=self.translate(t) if self.lang!='en' else t.strip()
  self.out.append(html.escape(t[:len(t)-len(t.lstrip())]+value+t[len(t.rstrip()):],quote=False))
 def handle_comment(self,t):self.out.append('<!--'+t+'-->')
 def handle_decl(self,t):self.out.append('<!'+t+'>')
