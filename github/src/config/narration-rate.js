export const narrationRates=Object.freeze([1,1.15,1.25,1.5]);
export const defaultNarrationRate=1.15;
export function normalizeNarrationRate(value){const rate=Number(value);return narrationRates.includes(rate)?rate:defaultNarrationRate;}
export function migrateNarrationRate(preferences){
 // Previous versions saved .82/.92 (or 1), even though visitors requested faster speech.
 preferences.speed=preferences.narrationRateVersion===1?normalizeNarrationRate(preferences.speed):defaultNarrationRate;
 preferences.narrationRateVersion=1;
 return preferences;
}
