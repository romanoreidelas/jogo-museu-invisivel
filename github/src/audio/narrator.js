import {defaultNarrationRate,normalizeNarrationRate} from '../config/narration-rate.js';

export class Narrator {
 constructor(onChange=()=>{}){
  this.onChange=onChange;this.audio=null;this.state='idle';this.token=0;
  this.text='';this.source=null;this.volume=1;this.rate=defaultNarrationRate;
  this.voice=null;this.utterance=null;this.transport=0;this.wantPlaying=false;
 }
 emit(state,message=''){this.state=state;this.onChange(state,message);}
 stop(){
  this.token++;this.transport++;this.wantPlaying=false;
  if(this.audio){this.audio.pause();this.audio.currentTime=0;this.audio=null;}
  globalThis.speechSynthesis?.cancel();globalThis.speechSynthesis?.resume();this.utterance=null;this.emit('idle');
 }
 async play({url,text,alternative=false}){
  this.stop();this.text=String(text??'').replace(/\s+/g,' ').trim();this.source=url;
  const token=this.token,operation=++this.transport;this.wantPlaying=true;
  if(url){
   const audio=this.audio=new Audio(url);audio.volume=this.volume;
   audio.preservesPitch=true;audio.playbackRate=this.rate;
   audio.onplaying=()=>{if(token!==this.token||!this.wantPlaying){audio.pause();return;}this.emit('playing');};
   audio.onended=()=>{if(token===this.token&&this.wantPlaying){this.wantPlaying=false;this.emit('ended');}};
   audio.onerror=()=>{if(token===this.token)this.emit('error','Não foi possível reproduzir este MP3. Substitua o arquivo em Áudios.');};
   this.emit('loading');
   try{await audio.play();if(token!==this.token||!this.wantPlaying){audio.pause();return;}if(operation===this.transport)this.emit('playing');}
   catch{if(token===this.token&&operation===this.transport&&this.wantPlaying)this.emit('error','A reprodução foi bloqueada ou o MP3 não pôde ser aberto. Tente novamente.');}
   return;
  }
  if(!alternative){this.emit('unavailable','Esta cena ainda não tem MP3. Adicione uma gravação em Áudios ou ative a voz alternativa.');return;}
  if(!globalThis.speechSynthesis||!globalThis.SpeechSynthesisUtterance){this.emit('error','A voz alternativa não está disponível. O texto está na transcrição.');return;}
  // Let the voice engine phrase the scene, preserving punctuation and proper names.
  // Re-queuing one utterance per sentence added unnecessary silence between phrases.
  const u=this.utterance=new SpeechSynthesisUtterance(this.text);
  u.lang='pt-BR';u.rate=this.rate;u.volume=this.volume;if(this.voice)u.voice=this.voice;
  u.onstart=()=>{if(token!==this.token)return;if(!this.wantPlaying){globalThis.speechSynthesis?.pause();return;}this.emit('playing');};
  u.onend=()=>{if(token===this.token)this.emit('ended');};
  u.onerror=e=>{if(token===this.token&&e.error!=='interrupted'&&e.error!=='canceled')this.emit('error','A voz alternativa falhou. A transcrição permanece disponível.');};
  this.emit('loading');speechSynthesis.speak(u);
 }
 pause(){
  if(!['playing','loading'].includes(this.state))return;
  this.wantPlaying=false;this.transport++;
  // Transport commands run synchronously, before state/DOM updates or volume fades.
  if(this.audio)this.audio.pause();else globalThis.speechSynthesis?.pause();
  this.emit('paused');
 }
 async resume(){
  if(this.state!=='paused')return;
  const token=this.token,operation=++this.transport,audio=this.audio;
  this.wantPlaying=true;this.emit('loading');
  try{
   if(audio)await audio.play();else globalThis.speechSynthesis?.resume();
   if(token!==this.token||!this.wantPlaying){audio?.pause();return;}
   if(operation===this.transport)this.emit('playing');
  }catch{if(token===this.token&&operation===this.transport&&this.wantPlaying)this.emit('error','Não foi possível continuar a narração.');}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)));if(this.audio)this.audio.volume=this.volume;if(this.utterance)this.utterance.volume=this.volume;}
 setRate(value){
  const rate=normalizeNarrationRate(value);if(rate===this.rate)return;
  this.rate=rate;
  if(this.audio){this.audio.preservesPitch=true;this.audio.playbackRate=rate;return;}
  // Browser speech cannot safely change the rate of a queued utterance.
  // Never call speak/play here: only an explicit playback action may start speech.
  if(this.utterance&&['playing','loading','paused'].includes(this.state))
   this.emit(this.state,'Velocidade salva para a próxima reprodução.');
 }
}
