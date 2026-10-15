// Fade an HTMLAudioElement without leaving callbacks attached to an old track.
export class VolumeFader {
 constructor({schedule=globalThis.requestAnimationFrame?.bind(globalThis),cancel=globalThis.cancelAnimationFrame?.bind(globalThis),now=()=>performance.now()}={}){this.schedule=schedule;this.cancelFrame=cancel;this.now=now;this.frame=null;this.generation=0;}
 cancel(){this.generation++;if(this.frame!==null)this.cancelFrame?.(this.frame);this.frame=null;}
 to(audio,target,duration=300){this.cancel();const end=Math.max(0,Math.min(1,target));if(!this.schedule||duration<=0){audio.volume=end;return;}const generation=this.generation,start=audio.volume,started=this.now();const tick=time=>{if(generation!==this.generation)return;const progress=Math.min(1,Math.max(0,(time-started)/duration));audio.volume=start+(end-start)*progress;if(progress<1)this.frame=this.schedule(tick);else this.frame=null;};this.frame=this.schedule(tick);}
}
