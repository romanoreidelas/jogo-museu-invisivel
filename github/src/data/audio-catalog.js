import {bundledAudio} from '../config/bundled-audio.js';
import {artworks} from './artworks.js';
import {poems} from './game-copy.js';
import {soundPresets} from '../config/sound-presets.js';
const phases=[['mystery','Escuta misteriosa'],['options','Alternativas'],['reveal','Revelação da pintura'],['detail','Detalhe ampliado']];
const screens=[['home','Tela inicial','Bem-vindo ao Museu Invisível. Escute, imagine e descubra cinco pinturas.'],['help','Instruções','Escute a descrição, escolha entre três pinturas e descubra um detalhe. Você pode repetir, ler as transcrições e jogar no seu ritmo.'],['transition','Transição entre rodadas','Uma nova obra espera por você. Continue quando quiser.'],['correct','Acerto','Excelente! Você encontrou a pintura!'],['wrong','Erro','Boa tentativa! Vamos descobrir qual era a obra.'],['reveal','Revelação geral','Uma pintura acaba de ser revelada. Observe os elementos que apareceram na descrição.'],['score','Tela de pontuação','Confira os pontos e as cinco obras descobertas nesta partida.'],['final','Tela final','Parabéns, explorador da arte! A arte também vive nas palavras, nos sons e na imaginação.']];
export const targets=[...artworks.flatMap(w=>phases.map(([phase,label])=>({id:`work/${w.id}/${phase}`,label:`${w.title} — ${label}`,work:w,phase,text:phase==='mystery'?poems[w.id]:phase==='detail'?w.details[0].objective:phase==='reveal'?`${w.title}. ${w.artist}. ${w.objective}`:'Escolha uma das três pinturas. As alternativas também têm descrições textuais.',ambientText:`Ambiente sintetizado: ${soundPresets[w.id].name}. Ruído suave filtrado, sem fala e sem música. Interpretação sonora, não uma gravação da cena.`,preset:soundPresets[w.id]}))),...screens.map(([id,label,text])=>({id:`screen/${id}`,label,text,ambientText:'Áudio não configurado.'}))];
export const targetMap=new Map(targets.map(t=>[t.id,t]));
export const allowedKeys=new Set(targets.flatMap(t=>['narration','ambient'].map(c=>t.id+':'+c)));
export function resolveTrack(store,target,channel){
 const t=targetMap.get(target);if(!t)throw Error('Destino de áudio desconhecido.');
 const key=target+':'+channel,c=store.get(key),bundle=bundledAudio[key];
 const original=!!bundle||channel==='narration'||!!t.preset;
 const defaults={mode:original?'original':'none',volume:bundle?.volume??(channel==='narration'?1:.16),loop:bundle?.loop??(channel==='ambient'),text:bundle?(bundle.text||''):(channel==='narration'?t.text:t.ambientText)};
 const v={...defaults,...c};if(v.mode==='original'&&!original)v.mode='none';
 const useBundle=bundle&&v.mode==='original';
 return {...v,key,mode:useBundle?'file':v.mode,
  name:useBundle?bundle.name:v.mode==='file'?v.file.name:v.mode==='original'?(channel==='narration'?'Voz do dispositivo':`Ambiente original — ${t.preset.name}`):'Áudio não configurado',
  url:useBundle?bundle.url:v.mode==='file'?store.url(key):null,
  text:v.mode==='file'?(c?.text||''):useBundle?(c?.text??defaults.text):v.text||defaults.text,
  preset:t.preset,original,bundled:!!useBundle};
}
