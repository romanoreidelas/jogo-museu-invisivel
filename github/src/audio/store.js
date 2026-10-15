export const MAX_FILE=40*1024*1024,MAX_PACKAGE=250*1024*1024;
export function validateFile(file){if(!(file instanceof Blob)||!file.size||file.size>MAX_FILE||!(/\.(mp3|wav|ogg|m4a|mpeg|mpg)$/i.test(file.name)))throw Error('Escolha MP3, WAV, OGG, M4A, MPEG ou MPG, de até 40 MB. A compatibilidade será verificada.');}
export function validateConfig(c){if(c&&c.text==null)c.text='';if(!c||!['original','file','none'].includes(c.mode)||!Number.isFinite(c.volume)||c.volume<0||c.volume>1||typeof c.text!=='string'||c.text.length>12000||typeof c.loop!=='boolean')throw Error('Configuração de áudio inválida.');if(c.mode==='file')validateFile(c.file);return c;}
const transactionDone=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Falha ao salvar os áudios.'));tx.onabort=()=>reject(tx.error||Error('Operação cancelada.'));});
export class AudioStore{
 constructor(name='museu-invisivel-media'){this.name=name;this.db=null;this.items=new Map();this.urls=new Map();}
 async open(){this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open(this.name,2);r.onupgradeneeded=()=>{for(const s of ['files','settings','security'])if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s);};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Feche outras abas do jogo e tente novamente.'));});this.db.onversionchange=()=>this.db.close();await this.migrate();await this.reload();return this;}
 async all(store){return new Promise((resolve,reject)=>{const tx=this.db.transaction(store),out=[],r=tx.objectStore(store).openCursor();r.onsuccess=()=>{const c=r.result;if(c){out.push([c.key,c.value]);c.continue();}};tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error);});}
 async migrate(){const old=await this.all('files'),current=new Map(await this.all('settings'));if(!old.length)return;const tx=this.db.transaction(['files','settings'],'readwrite');for(const [key,file]of old){const [id,channel]=key.split(':');const k=`work/${id}/mystery:${channel}`;if(!current.has(k))tx.objectStore('settings').put({mode:'file',file,volume:channel==='ambient'?.16:1,text:'',loop:channel==='ambient'},k);}tx.objectStore('files').clear();await transactionDone(tx);}
 async reload(){this.revoke();this.items=new Map(await this.all('settings'));}
 revoke(){for(const u of this.urls.values())URL.revokeObjectURL(u);this.urls.clear();}
 get(key){return this.items.get(key);}
 url(key){const file=this.get(key)?.file;if(!file)return null;if(!this.urls.has(key))this.urls.set(key,URL.createObjectURL(file));return this.urls.get(key);}
 async write(entries){for(const [,c]of entries)validateConfig(c);const tx=this.db.transaction('settings','readwrite');for(const [key,c]of entries)tx.objectStore('settings').put(c,key);await transactionDone(tx);await this.reload();}
 async security(){return (await this.all('security')).find(([k])=>k==='password')?.[1];}
 async setSecurity(value){const tx=this.db.transaction('security','readwrite');tx.objectStore('security').put(value,'password');await transactionDone(tx);}
 async exportPackage(){const records=[];let total=0;for(const [key,c]of this.items){const {file,...config}=c;let audio=null;if(file){total+=file.size;if(total>MAX_PACKAGE)throw Error('Pacote maior que 250 MB. Reduza os arquivos antes de exportar.');const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));audio={name:file.name,type:file.type,data:btoa(binary)};}records.push({key,config,audio});}return {format:'museu-invisivel-audio',version:2,records};}
 async importPackage(pack,allowedKeys,probe=async()=>{}){if(pack?.format!=='museu-invisivel-audio'||pack.version!==2||!Array.isArray(pack.records)||pack.records.length>200)throw Error('Pacote incompatível.');const seen=new Set(),entries=[];let total=0;for(const r of pack.records){if(!allowedKeys.has(r.key)||seen.has(r.key))throw Error('Destino inválido ou duplicado no pacote.');seen.add(r.key);let file;if(r.audio){if(typeof r.audio.data!=='string'||r.audio.data.length>MAX_FILE*1.4)throw Error('Arquivo do pacote excede o limite.');const binary=atob(r.audio.data);total+=binary.length;if(total>MAX_PACKAGE)throw Error('Pacote excede 250 MB de áudios.');file=new File([Uint8Array.from(binary,c=>c.charCodeAt(0))],r.audio.name,{type:r.audio.type});validateFile(file);await probe(file);}const c={...r.config};delete c.file;if(file)c.file=file;validateConfig(c);entries.push([r.key,c]);}await this.write(entries);return entries.length;}
}
export async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt),iterations:150000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits));}
export async function createPassword(password){if(password.length<8)throw Error('Use uma senha com pelo menos 8 caracteres.');const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));return {salt,hash:await passwordHash(password,salt)};}
export async function checkPassword(password,record){const h=await passwordHash(password,record.salt);return h.length===record.hash.length&&h.reduce((v,n,i)=>v|(n^record.hash[i]),0)===0;}
export function audioSignature(bytes){
 const ascii=(start,end)=>String.fromCharCode(...bytes.slice(start,end));
 if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE')return 'wav';
 if(ascii(0,4)==='OggS')return 'ogg';
 if(ascii(0,3)==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224))return 'mp3';
 if(ascii(4,8)==='ftyp')return 'mp4';
 if(bytes[0]===0&&bytes[1]===0&&bytes[2]===1&&[0xba,0xb3].includes(bytes[3]))return 'mpeg';
 return null;
}
export async function probeAudio(file){
 validateFile(file);
 const bytes=await file.arrayBuffer(),kind=audioSignature(new Uint8Array(bytes));
 if(!kind)throw Error('O conteúdo não foi reconhecido como áudio compatível. Exporte ou converta o arquivo para MP3; renomear a extensão não converte o conteúdo.');
 const url=URL.createObjectURL(file),a=new Audio();let context;
 try{
  a.autoplay=false;a.muted=true;a.preload='auto';
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Não foi possível ler este arquivo. Converta para MP3 e tente novamente.')),15000);a.onloadeddata=()=>{clearTimeout(timer);Number.isFinite(a.duration)&&a.duration>0?resolve():reject(Error('Áudio sem duração válida. Converta para MP3.'));};a.onerror=()=>{clearTimeout(timer);reject(Error('Este formato ou codec não é compatível neste navegador. Converta para MP3.'));};a.src=url;a.load?.();});
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(Context){context=new Context();const decoded=await context.decodeAudioData(bytes.slice(0));if(!decoded.length||!decoded.numberOfChannels)throw Error('O arquivo não contém uma faixa de áudio decodificável.');}
  else if(kind==='mpeg')throw Error('Não foi possível validar a faixa de áudio deste MPEG. Converta para MP3.');
  return {format:kind,duration:a.duration};
 }catch(error){throw Error(error.message.includes('MP3')?error.message:'Este arquivo não pôde ser decodificado como áudio. Converta para MP3 e tente novamente.');}
 finally{a.pause();a.removeAttribute?.('src');a.load?.();await context?.close?.();URL.revokeObjectURL(url);}
}
