
import { Level, LoadoutType } from './types';

export const CALLSIGN = 'RANA-43';
export const UNIT = 'TASK FORCE: DEVOPS GHOSTS';
export const OPERATOR_NAME = 'Mansoor Rana';

export const LOADOUT_CONFIGS = {
  [LoadoutType.SILENT_MERGE]: {
    name: 'SILENT MERGE',
    description: `Stealth-focused. You move through the repo like a ghost. Even Git doesn't know you were there.`,
    initialStats: { hp: 80, stealth: 100, style: 50, focus: 70 }
  },
  [LoadoutType.CICD_GHOST]: {
    name: 'CI/CD GHOST',
    description: `Balanced stats. You have built a pipeline so resilient it can deploy while the data center is on fire.`,
    initialStats: { hp: 100, stealth: 70, style: 70, focus: 80 }
  },
  [LoadoutType.BUG_HUNTER]: {
    name: 'BUG HUNTER',
    description: `High focus. You can spot a missing semicolon from 3 kilometers in heavy rain.`,
    initialStats: { hp: 90, stealth: 50, style: 90, focus: 100 }
  }
};

export const MISSIONS: Level[] = [
  {
    id: 1,
    title: 'TRAINING: HELLO WORLD EXTRACTION',
    briefing: `Standard infiltration. The legacy codebase is holding the "Hello World" string hostage. Recover it or the whole internet breaks.`,
    encounterType: 'DECISION',
    problem: 'A Merge Conflict Sentry blocks the path. It looks angry and smells like stale coffee.',
    choices: [
      { text: 'Force Push (Loud)', consequences: { hp: -5, style: 20, stealth: -40 }, nextText: 'SUCCESS! You force-pushed so hard the server actually moved 3 inches to the left in the rack. The Sentry is now a stack trace.' },
      { text: 'Rebase Carefully (Stealth)', consequences: { stealth: 10, focus: -5 }, nextText: `Smoother than a fresh jar of skip-peanut-butter. You rebased into the shadows and the Sentry is still checking the wrong branch.` }
    ],
    debrief: 'MISSION CRITICAL SUCCESS: The Junior Dev who wrote this code just got a notification and is currently questioning their career choices.'
  },
  {
    id: 2,
    title: 'INFILTRATION: THE FIREWALL OF JIRA',
    briefing: `The Ticket Sentry demands a status update. It hasn't seen its family in weeks.`,
    encounterType: 'PUZZLE',
    problem: `A blocking task appears: "ASAP - Change all buttons to a slightly different shade of blue". Your response?`,
    choices: [
      { text: `"Closed: Won't Do"`, consequences: { style: 30, focus: -10 }, nextText: `ULTIMATE ALPHA MOVE. The PM just fell off their chair. You have gained 500 Aura points and a permanent enemy.` },
      { text: `"Moved to Backlog (Forever)"`, consequences: { stealth: 20, hp: -5 }, nextText: `The task is now in the 'Legacy Void'. Legend says in 50 years, an AI will find it and laugh.` }
    ],
    debrief: 'TICKET RESOLVED: You closed 40 tickets by just deleting the epic. Efficiency: 9000%.'
  },
  {
    id: 3,
    title: 'STEALTH: THE QUICK SYNC AMBUSH',
    briefing: `A "Quick Sync" has appeared at 4:55 PM on a Friday. This is a Class-A threat.`,
    encounterType: 'STREALTH_OR_LOUD',
    problem: `The PM is patrolling Slack. They have a "very quick question that might take 2 hours".`,
    choices: [
      { text: `Status: "In a Tunnel (Offline)"`, consequences: { stealth: 30, focus: 10 }, nextText: 'GHOST MODE ENGAGED. You vanished so fast your monitor is still trying to find you. The PM is now tagging a bot.' },
      { text: 'Reply with a 500-page PDF', consequences: { focus: -20, hp: -10, style: 40 }, nextText: 'INTELLECTUAL DOMINANCE. They tried to read page 1 and their brain threw a StackOverflowError. You are free!' }
    ],
    debrief: 'FRIDAY SAVED: You are currently at home while the PM is still trying to find the "Mute" button on the empty Zoom call.'
  },
  {
    id: 4,
    title: 'PUZZLE: THE OFF-BY-ONE PERIMETER',
    briefing: `A loop is threatening to eat the entire server's RAM. Cut the red wire (the condition).`,
    encounterType: 'PUZZLE',
    problem: `for (let i = 0; i <= arr.length; i++) { ... } - The server is screaming "undefined". Why?`,
    choices: [
      { text: 'Index Out of Bounds Trap', consequences: { focus: 30, stealth: 10 }, nextText: 'SNIPER PRECISION. You changed that <= to < and the server just sighed in relief. RAM usage is now 0.001%.' },
      { text: `It's a Feature, not a Bug`, consequences: { hp: -30, focus: -20 }, nextText: "The server took offense to your sarcasm and tried to overclock itself to death. You smell smoke." }
    ],
    debrief: 'CODE OPTIMIZED: The server is so fast now it actually predicts your next typo.'
  },
  {
    id: 5,
    title: 'ENCOUNTER: THE MERGE CONFLICT TRENCH',
    briefing: `Two branches are fighting. It's like a digital bar fight. Resolve it before the Repo explodes.`,
    encounterType: 'DECISION',
    problem: 'Conflict detected in auth.js. 400 lines of spaghetti code from the intern vs 400 lines of legacy code.',
    choices: [
      { text: 'Delete File, Start Over', consequences: { style: 50, focus: -40, hp: -10 }, nextText: `SCORCHED EARTH POLICY. You deleted the entire 'src' folder. The build failed, but the codebase is finally clean.` },
      { text: 'Manual Resolve (Brain Damage)', consequences: { hp: -20, focus: -50, style: 20 }, nextText: 'You have spent 6 hours staring at commas. You now dream in semi-colons. Was it worth it? No.' }
    ],
    debrief: 'CONFLICT RESOLVED: You resolved the merge by just keeping your own changes and blaming the network.'
  },
  {
    id: 6,
    title: 'PUZZLE: DECODING PRODUCTION LOGS',
    briefing: `The production environment is doing the "Infinite Scream". Find the culprit.`,
    encounterType: 'PUZZLE',
    problem: `Log: "FATAL: User MansoorRana reached maximum awesomeness level. System cannot handle it."`,
    choices: [
      { text: 'Increase Awesome Threshold', consequences: { focus: 20, hp: 20 }, nextText: 'SYSTEM UPGRADED. The server is now wearing sunglasses and listening to techno. You fixed it.' },
      { text: 'Blame the Network Team', consequences: { style: 40, stealth: -60 }, nextText: 'THE ANCIENT TECHNIQUE. It worked perfectly. The network team is now debugging a router that isn\'t even plugged in.' }
    ],
    debrief: 'PRODUCTION STABILIZED: You fixed the bug by restarting the server 50 times in a row. A true pro.'
  },
  {
    id: 7,
    title: 'STEALTH: THE FRIDAY DEPLOY',
    briefing: `You are holding a "Hotfix" for a "Minor CSS Issue". It's 5:01 PM.`,
    encounterType: 'DECISION',
    problem: `The pipeline is blinking red, yellow, and purple. The "Deploy" button is looking at you suggestively.`,
    choices: [
      { text: 'YOLO PUSH', consequences: { hp: -50, style: 100 }, nextText: 'THE SERVER IS ON FIRE. BUT THE LOGO IS NOW 1PX ROUNDER. ABSOLUTE VICTORY.' },
      { text: 'Delete Slack, Go Home', consequences: { stealth: 50, focus: 20 }, nextText: 'You are now unreachable. If a server crashes in the forest and no dev is on Slack, does it make a sound?' }
    ],
    debrief: 'DEPLOYMENT COMPLETE: Technically everything is broken, but it looks great on your localhost.'
  },
  {
    id: 8,
    title: 'MINI-BOSS: THE LEGACY MONOLITH',
    briefing: `A server from 1994 has woken up. It speaks only in Fortran and anger.`,
    encounterType: 'BOSS',
    problem: 'The Monolith is using a GOTO statement that leads to a black hole.',
    choices: [
      { text: 'Recite C++ Poetry', consequences: { hp: -30, focus: 40 }, nextText: 'The Monolith fell into a deep sleep trying to understand your templates. You have conquered the ancient ones.' },
      { text: 'Turn it off and never back on', consequences: { style: 30, stealth: 20 }, nextText: 'You "retired" the hardware by throwing it into a literal dumpster. The company\'s technical debt just halved.' }
    ],
    debrief: 'MONOLITH DEFEATED: You replaced the 5-million-line app with a 10-line Python script. Nobel prize pending.'
  },
  {
    id: 9,
    title: 'MINI-BOSS: THE INFINITE LOOP',
    briefing: `A recursion error is spinning up so fast it might create a wormhole in the breakroom.`,
    encounterType: 'BOSS',
    problem: 'function help() { help(); } - The stack is overflowing. Quick, add a condition!',
    choices: [
      { text: 'return "Coffee"', consequences: { focus: 50, hp: 20 }, nextText: 'GENIUS. The recursion hit the coffee break and decided to stop and enjoy life. The CPU fan stopped screaming.' },
      { text: 'Throw New Error("No.")', consequences: { style: 30, focus: 10 }, nextText: 'The code simply quit. It didn\'t even throw the error, it just left a "Gone Fishing" sign in the console.' }
    ],
    debrief: 'RECURSION SNAPPED: You fixed the infinite loop by just turning off the internet. Modern problems require modern solutions.'
  },
  {
    id: 10,
    title: 'FINAL BOSS: THE UNSCHEDULED MEETING (SEV-0)',
    briefing: 'The ultimate boss: 5 VPs, 2 CEOs, and a confused QA lead are all in a Zoom room. And they want YOU.',
    encounterType: 'BOSS',
    problem: 'They are asking: "Why is the birthday cake not deployed yet?"',
    choices: [
      { text: 'Apply Birthday Patch', consequences: { focus: 1000, style: 1000, hp: 100 }, nextText: 'CRITICAL SUCCESS! The cake is now running on a Kubernetes cluster with 99.999% uptime. Party time!' },
      { text: 'Share Screen, Show Nyan Cat', consequences: { stealth: 1000, style: 1000, hp: -10 }, nextText: 'They were so mesmerized by the cat they promoted you to Senior Nyan Engineer. You extracted successfully!' }
    ],
    debrief: 'SEV-0 RESOLVED: The cake is live. The bugs are dead. Mansoor is another year more legendary.'
  }
];
