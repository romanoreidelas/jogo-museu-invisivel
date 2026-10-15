// Procedural soundscape, not a recorded or AI-generated audio file.
export class Soundscape {
 constructor(preset={}){ this.preset=preset; this.context=null; this.playing=false; this.volume=.35; this.ducked=false; this.groupVolume={music:1,effects:1}; this.enabled={sea:true,wind:true,tones:true}; this.layers={}; this.operation=0; }
 initialize(){
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Context) throw new Error('Seu navegador não oferece síntese de áudio.');
  const ctx=this.context=new Context();
  this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
  const makeLayer=(name)=>{const gain=ctx.createGain();gain.gain.value=this.enabled[name]?this.groupVolume[name==='tones'?'music':'effects']:0;gain.connect(this.master);this.layers[name]=gain;return gain;};
  const noise=(name,frequency,amplitude,cycle)=>{
   const destination=makeLayer(name), buffer=ctx.createBuffer(1,ctx.sampleRate*8,ctx.sampleRate), data=buffer.getChannelData(0);
   // Low-passed noise avoids sharp transients; a continuous oscillator shapes the swell.
   let previous=0;for(let i=0;i<data.length;i++){previous=(previous+.02*(Math.random()*2-1))/1.02;data[i]=previous*3.5;}
   const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
   const filter=ctx.createBiquadFilter();filter.type=name==='sea'?'lowpass':'bandpass';filter.frequency.value=frequency;filter.Q.value=.3;
   const envelope=ctx.createGain();envelope.gain.value=amplitude;
   const lfo=ctx.createOscillator(), depth=ctx.createGain();lfo.frequency.value=cycle;depth.gain.value=amplitude*.65;lfo.connect(depth);depth.connect(envelope.gain);
   source.connect(filter);filter.connect(envelope);envelope.connect(destination);source.start();lfo.start();
  };
  noise('sea',this.preset.sea||620,.65,this.preset.swell||.095);noise('wind',this.preset.wind||1100,.32,.047);
  const tones=makeLayer('tones');(this.preset.frequencies||[130.81,196,261.63,329.63]).forEach((frequency,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.value=.025;depth.gain.value=.012;lfo.frequency.value=.045+i*.013;lfo.connect(depth);depth.connect(gain.gain);osc.connect(gain);gain.connect(tones);osc.start();lfo.start();});
 }
 async start(){const operation=++this.operation;if(!this.context)this.initialize();const ctx=this.context;await ctx.resume();if(this.context!==ctx||operation!==this.operation)return;if(ctx.state!=='running')throw new Error('O navegador não liberou o áudio. Tente iniciar novamente.');this.playing=true;this.update();}
 stop(immediate=false){this.operation++;this.playing=false;if(immediate&&this.master){const g=this.master.gain,t=this.context.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(0,t);this.context.suspend?.().catch(()=>{});}else this.update();}
 destroy(){this.stop();if(this.context){this.context.close?.();this.context=null;this.master=null;this.layers={};}}
 update(){if(this.master)this.master.gain.setTargetAtTime(this.playing?this.volume*(this.ducked?.22:1):0,this.context.currentTime,.25);}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)));this.update();}
 duck(value){this.ducked=value;this.update();}
 setGroupVolume(group,value){this.groupVolume[group]=Math.max(0,Math.min(1,Number(value)));for(const name of Object.keys(this.layers))this.setLayer(name,this.enabled[name]);}
 setLayer(name,value){this.enabled[name]=value;if(this.layers[name])this.layers[name].gain.setTargetAtTime(value?this.groupVolume[name==='tones'?'music':'effects']:0,this.context.currentTime,.3);}
}
