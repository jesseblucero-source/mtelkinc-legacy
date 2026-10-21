import {PDFDocument,rgb,fontkit} from './vendor/dealer-pdf-abc73e6e67db/engine.js';

const fontURL='/assets/roboto-application-pdf-8c6f2880cb24.ttf';
let fontRequest;
export async function createApplicationPDF(data,ui,copy,lang){
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 fontRequest=fontRequest||fetch(fontURL).then(r=>{if(!r.ok)throw Error('Font unavailable');return r.arrayBuffer()}).catch(e=>{fontRequest=null;throw e});
 const bytes=await fontRequest,font=await pdf.embedFont(bytes,{subset:true});
 const content=[ui.print_heading,ui.reference+': '+data.reference,ui.prepared+': '+new Date(data.prepared).toLocaleString(lang),ui.route_label+': '+data.route,ui.ack,ui.checks_title,...data.checks.map(code=>ui['flag_'+code]),ui.checks_note,...data.groups.flatMap(g=>[g.title,...g.answers.flatMap(a=>[a.label,a.value])]),...(data.signature?[data.signature.heading,...data.signature.rows.flatMap(r=>[r.label,r.value]),data.signature.disclosure]:[]),copy.pdf_footer];
 const supported=new Set(font.getCharacterSet());
 for(const text of content)for(const c of String(text).replace(/[\r\n\t]/g,' ')){if(!supported.has(c.codePointAt(0)))throw Error('PDF_FONT_UNSUPPORTED')}
 const ink=rgb(.05,.075,.065),muted=rgb(.39,.27,.26),orange=rgb(.86,.18,.08),paper=rgb(.98,.965,.95);
 const w=612,h=792,left=46,right=46,bottom=60,usable=w-left-right;let page,y;
 function addPage(){page=pdf.addPage([w,h]);page.drawRectangle({x:0,y:h-54,width:w,height:54,color:ink});page.drawText('MT E.L.K., INC.',{x:left,y:h-34,font,size:16,color:paper});y=h-80}
 function need(height){if(y-height<bottom)addPage()}
 function lines(text,size,max=usable){const result=[];for(const paragraph of String(text).replace(/\r\n?/g,'\n').replace(/\t/g,'    ').split('\n')){let line='';for(const char of paragraph){if(line&&font.widthOfTextAtSize(line+char,size)>max){let cut=line.lastIndexOf(' ');if(cut>line.length*.45){result.push(line.slice(0,cut));line=line.slice(cut+1)+char}else{result.push(line);line=char}}else line+=char}result.push(line)}return result}
 function write(text,size=10.5,color=ink,after=7){for(const line of lines(text,size)){need(size*1.45);page.drawText(line,{x:left,y,font,size,color});y-=size*1.45}y-=after}
 function heading(text){need(60);y-=7;write(text,14,orange,9)}
 addPage();write(ui.print_heading,19,ink,12);write(ui.reference+': '+data.reference,11);write(ui.prepared+': '+new Date(data.prepared).toLocaleString(lang),9,muted);write(ui.route_label+': '+data.route,10);write(ui.ack,9,muted,12);heading(ui.checks_title);for(const code of data.checks)write('- '+ui['flag_'+code],9.5,muted,5);write(ui.checks_note,9,muted,10);
 for(const group of data.groups){heading(group.title);for(const answer of group.answers){need(50);write(answer.label,9,muted,3);write(answer.value,10.5,ink,12)}}
 if(data.signature){need(260);heading(data.signature.heading);for(const row of data.signature.rows){need(48);write(row.label,9,muted,3);write(row.value,row.name==='signature_name'?17:9.5,ink,10)}write(data.signature.disclosure,9,muted,12)}
 write(copy.pdf_footer,9,muted,8);
 const pages=pdf.getPages();for(let i=0;i<pages.length;i++){const p=pages[i];p.drawLine({start:{x:left,y:43},end:{x:w-right,y:43},thickness:.5,color:muted});p.drawText(data.reference,{x:left,y:28,font,size:8,color:muted});const label=copy.page+' '+(i+1)+' / '+pages.length;p.drawText(label,{x:w-right-font.widthOfTextAtSize(label,8),y:28,font,size:8,color:muted})}
 pdf.setTitle('MT E.L.K., INC. - '+ui.print_heading);pdf.setAuthor('MT E.L.K., INC.');pdf.setSubject('Completed application prepared by the applicant');pdf.setLanguage(lang);
 return new Blob([await pdf.save()],{type:'application/pdf'});
}
