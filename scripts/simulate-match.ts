// =============================================================================
// CLI Match Simulation Runner
// Usage: npm run sim
// =============================================================================

import { MatchSimulator } from '../src/engine/core/MatchSimulator.js';
import { sampleManCity, sampleArsenal } from '../tests/fixtures/sampleTeams.js';

console.log('====================================================');
console.log(' PREMIER LEAGUE FOOTBALL MANAGER: MATCH SIMULATOR');
console.log('====================================================\n');

const seed = Math.floor(Math.random() * 1000000);
console.log(`Matchup: ${sampleManCity.name} vs ${sampleArsenal.name}`);
console.log(`Simulation Seed: ${seed}`);
console.log('Simulating 90-minute match...\n');

const startTime = performance.now();
const simulator = new MatchSimulator(sampleManCity, sampleArsenal, { seed, durationMinutes: 90 });
const result = simulator.simulate({ seed, durationMinutes: 90 });
const elapsedMs = performance.now() - startTime;

console.log('----------------------------------------------------');
console.log(`FINAL SCORE: ${sampleManCity.name} ${result.homeScore} - ${result.awayScore} ${sampleArsenal.name}`);
console.log(`Simulated in ${elapsedMs.toFixed(2)}ms (${result.keyframes.length} keyframes generated)`);
console.log('----------------------------------------------------\n');

console.log('KEY MATCH EVENTS:');
for (const event of result.events) {
  if (['GOAL', 'YELLOW_CARD', 'RED_CARD', 'INJURY', 'HALF_TIME', 'FULL_TIME'].includes(event.type)) {
    const minStr = `${event.minute}'`.padEnd(5);
    console.log(`[${minStr}] [${event.type.padEnd(11)}] ${event.description}`);
  }
}

console.log('\nMATCH STATS SUMMARY:');
console.log(`Possession:        ${result.stats.home.possession}%  -  ${result.stats.away.possession}%`);
console.log(`Shots:             ${result.stats.home.shots}  -  ${result.stats.away.shots}`);
console.log(`Shots on Target:   ${result.stats.home.shotsOnTarget}  -  ${result.stats.away.shotsOnTarget}`);
console.log(`Expected Goals:    ${result.stats.home.xG.toFixed(2)}  -  ${result.stats.away.xG.toFixed(2)}`);
console.log(`Passes Completed:  ${result.stats.home.passesCompleted}  -  ${result.stats.away.passesCompleted}`);
console.log(`Tackles Won:       ${result.stats.home.tacklesWon}  -  ${result.stats.away.tacklesWon}`);
console.log(`Fouls:             ${result.stats.home.fouls}  -  ${result.stats.away.fouls}`);
console.log(`Yellow Cards:      ${result.stats.home.yellowCards}  -  ${result.stats.away.yellowCards}`);
console.log(`Red Cards:         ${result.stats.home.redCards}  -  ${result.stats.away.redCards}`);
console.log('====================================================\n');
