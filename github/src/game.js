export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export class Game{
 constructor(works,bonus=false,random=Math.random){this.rounds=shuffle(works,random).slice(0,5).map(work=>({work,options:shuffle([work,...shuffle(works.filter(x=>x.id!==work.id),random).slice(0,2)],random),plays:0,chosen:null,detail:false,points:0}));this.index=0;this.bonus=bonus;}
 get round(){return this.rounds[this.index];}get score(){return this.rounds.reduce((s,r)=>s+r.points,0);}get hits(){return this.rounds.filter(r=>r.chosen===r.work.id).length;}
 listen(){if(!this.round.chosen)this.round.plays++;}
 choose(id){const r=this.round;if(r.chosen||!r.options.some(w=>w.id===id))return false;r.chosen=id;r.points=id===r.work.id?10+(this.bonus&&r.plays===1?5:0):0;return true;}
 discover(){const r=this.round;if(!r.chosen||r.detail)return false;r.detail=true;r.points+=5;return true;}
 next(){if(!this.round.detail)return false;if(this.index===4)return 'finished';this.index++;return true;}
}
