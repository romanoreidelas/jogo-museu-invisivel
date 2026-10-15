import test from 'node:test';
import assert from 'node:assert/strict';
import {Narrator} from '../src/audio/narrator.js';
import {migrateNarrationRate,normalizeNarrationRate,narrationRates} from '../src/config/narration-rate.js';
const spoken=[];
globalThis.speechSynthesis={cancel(){},pause(){},resume(){},speak(u){spoken.push(u);u.onstart?.();}};
globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
globalThis.Audio=class{constructor(src){this.src=src;this.currentTime=0;}async play(){this.paused=false;}pause(){this.paused=true;}};
test('initial rate is 1.15 and legacy saved rates migrate once',()=>{
 for(const speed of [.82,.92,1,undefined])assert.equal(migrateNarrationRate({speed}).speed,1.15);
 for(const speed of narrationRates)assert.equal(migrateNarrationRate({speed,narrationRateVersion:1}).speed,speed);
 assert.equal(normalizeNarrationRate(NaN),1.15);assert.equal(normalizeNarrationRate('1.5'),1.5);
});
test('each offered speed reaches the real utterance rate, without per-sentence queue gaps',async()=>{
 const n=new Narrator(),text='O Nascimento de Vênus. Sandro Botticelli. c. 1485. Uma nova frase, sem pausa inserida.';
 for(const speed of narrationRates){n.setRate(speed);n.stop();const before=spoken.length;await n.play({text,alternative:true});assert.equal(spoken.length,before+1);assert.equal(n.utterance.rate,speed);assert.equal(n.utterance.lang,'pt-BR');assert.equal(n.utterance.text,text);n.utterance.onend();assert.equal(n.state,'ended');}
 n.stop();
});
test('changing browser speech rate never starts or restarts playback, including while paused',async()=>{
 const n=new Narrator();await n.play({text:'Uma pintura.',alternative:true});const original=n.utterance,count=spoken.length;
 n.setRate(1.25);assert.equal(n.utterance,original);assert.equal(spoken.length,count);assert.equal(n.state,'playing');
 n.pause();n.setRate(1.5);assert.equal(n.state,'paused');assert.equal(spoken.length,count);await n.resume();assert.equal(n.utterance,original);assert.equal(spoken.length,count);
 await n.play({text:'Próxima reprodução explícita.',alternative:true});assert.equal(n.utterance.rate,1.5);n.stop();
});
test('MP3 applies every rate immediately while preserving position, pause, and pitch',async()=>{
 const n=new Narrator();await n.play({url:'voz.mp3',text:'Texto'});assert.equal(n.audio.playbackRate,1.15);const audio=n.audio;audio.currentTime=18;
 for(const speed of narrationRates){n.setRate(speed);assert.equal(n.audio,audio);assert.equal(audio.currentTime,18);assert.equal(audio.playbackRate,speed);assert.equal(audio.preservesPitch,true);}
 n.pause();n.setRate(1.25);assert.equal(audio.paused,true);assert.equal(audio.playbackRate,1.25);await n.resume();assert.equal(audio.playbackRate,1.25);n.stop();
});
test('starting a new scene clears the synthesis paused flag left by a cancelled scene',async()=>{
 const original=globalThis.speechSynthesis;let paused=false;globalThis.speechSynthesis={cancel(){},resume(){paused=false;},pause(){paused=true;},speak(u){if(!paused)u.onstart?.();}};
 try{const n=new Narrator();await n.play({text:'Primeira cena.',alternative:true});n.pause();assert.equal(paused,true);await n.play({text:'Segunda cena.',alternative:true});assert.equal(paused,false);assert.equal(n.state,'playing');n.stop();}finally{globalThis.speechSynthesis=original;}
});
