
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Stats, InventoryItem, LoadoutType, Level } from './types';
import { LOADOUT_CONFIGS, MISSIONS, OPERATOR_NAME, CALLSIGN, UNIT } from './constants';
imimport HUD from './HUD';

import { getDynamicBriefing } from './geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [stats, setStats] = useState<Stats>(LOADOUT_CONFIGS[LoadoutType.CICD_GHOST].initialStats);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadout, setLoadout] = useState<LoadoutType>(LoadoutType.CICD_GHOST);
  const [dynamicBriefing, setDynamicBriefing] = useState<string>('');
  const [transitionText, setTransitionText] = useState<string>('');
  const [lastDebrief, setLastDebrief] = useState<string>('');
  
  // Checkpoints for retrying missions
  const [levelStartStats, setLevelStartStats] = useState<Stats>(LOADOUT_CONFIGS[LoadoutType.CICD_GHOST].initialStats);
  const [levelStartInventory, setLevelStartInventory] = useState<InventoryItem[]>([]);

  // Ending Sequence State
  const [endingStage, setEndingStage] = useState<'IDLE' | 'HACKING' | 'SYNCING' | 'REVEAL'>('IDLE');
  const [hackProgress, setHackProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const birthdayLoopRef = useRef<number | null>(null);

  const currentLevel = MISSIONS[currentLevelIdx];

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((freq: number, type: OscillatorType = 'square', duration: number = 0.1, volume: number = 0.1) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Browsers may block audio until the first click
    }
  }, [getCtx]);

  const playBirthdayTune = useCallback(() => {
    const notes = [
      261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 0,
      261.63, 261.63, 293.66, 261.63, 392.00, 349.23, 0,
      261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66, 0,
      466.16, 466.16, 440.00, 349.23, 392.00, 349.23, 0
    ];
    let noteIndex = 0;
    const playNext = () => {
      if (gameState !== GameState.ENDING) return;
      const note = notes[noteIndex];
      if (note !== 0) playSound(note, 'sine', 0.5, 0.04);
      noteIndex = (noteIndex + 1) % notes.length;
      birthdayLoopRef.current = window.setTimeout(playNext, noteIndex % 7 === 6 ? 800 : 400);
    };
    playNext();
  }, [gameState, playSound]);

  useEffect(() => {
    return () => {
      if (birthdayLoopRef.current) window.clearTimeout(birthdayLoopRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === GameState.ENDING) {
      setEndingStage('HACKING');
      let prog = 0;
      const interval = setInterval(() => {
        prog += 5; 
        setHackProgress(prog);
        if (prog % 20 === 0) playSound(150 + prog * 4, 'sine', 0.05, 0.02);
        
        if (prog >= 100) {
          clearInterval(interval);
          setEndingStage('SYNCING');
          setTimeout(() => {
            setEndingStage('REVEAL');
            playSound(880, 'square', 0.5, 0.1);
            playBirthdayTune();
          }, 400); 
        }
      }, 15); 
      return () => clearInterval(interval);
    }
  }, [gameState, playBirthdayTune, playSound]);

  const startTransition = useCallback((text: string, nextState: GameState) => {
    playSound(440, 'square', 0.05);
    setTransitionText(text);
    setGameState(GameState.MISSION_LOADING);
    setTimeout(() => setGameState(nextState), 100); 
  }, [playSound]);

  const selectLoadout = (type: LoadoutType) => {
    const initialStats = LOADOUT_CONFIGS[type].initialStats;
    setLoadout(type);
    setStats({...initialStats});
    setLevelStartStats({...initialStats});
    setLevelStartInventory([]);
    startTransition('INITIALIZING NEURAL LINK...', GameState.MISSION_LOADING);
    fetchBriefing(0);
  };

  const fetchBriefing = async (idx: number) => {
    const level = MISSIONS[idx];
    setGameState(GameState.MISSION_LOADING);
    setTransitionText("SYNCING TACTICAL INTEL...");
    const briefing = await getDynamicBriefing(level.title, OPERATOR_NAME);
    setDynamicBriefing(briefing);
    setGameState(GameState.MISSION_ACTIVE);
  };

  const handleChoice = (consequences: any, nextText: string) => {
    playSound(880, 'sine', 0.05);
    
    const nextHp = stats.hp + (consequences.hp || 0);
    if (nextHp <= 0) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    setStats(prev => ({
      hp: Math.max(0, prev.hp + (consequences.hp || 0)),
      stealth: Math.max(0, prev.stealth + (consequences.stealth || 0)),
      style: Math.max(0, prev.style + (consequences.style || 0)),
      focus: Math.max(0, prev.focus + (consequences.focus || 0))
    }));

    if (consequences.item) setInventory(prev => [...prev, consequences.item]);
    setLastDebrief(nextText);
    setGameState(GameState.DEBRIEFING);
  };

  const nextMission = () => {
    playSound(660, 'square', 0.05);
    if (currentLevelIdx + 1 >= MISSIONS.length) {
      setGameState(GameState.ENDING);
    } else {
      const nextIdx = currentLevelIdx + 1;
      setLevelStartStats({...stats});
      setLevelStartInventory([...inventory]);
      setCurrentLevelIdx(nextIdx);
      fetchBriefing(nextIdx);
    }
  };

  const retryMission = () => {
    playSound(440, 'square', 0.05);
    setStats({...levelStartStats});
    setInventory([...levelStartInventory]);
    setGameState(GameState.MISSION_ACTIVE);
  };

  const renderStart = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center">
        <div className="text-[10px] opacity-60 tracking-[0.5em] mb-2 uppercase">{UNIT}</div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter glow-text uppercase">
          Birthday Protocol <span className="text-white">Active</span>
        </h1>
        <div className="h-1 w-24 bg-green-500 mx-auto"></div>
      </div>
      
      <div className="p-8 border-tactical bg-black/40 backdrop-blur-md max-w-lg w-full text-center relative">
        <div className="absolute top-0 left-0 w-8 h-8 corner-tl border-green-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 corner-br border-green-500"></div>
        <p className="mb-8 text-sm md:text-base opacity-80 leading-relaxed uppercase tracking-tight">
          Operator <span className="font-bold text-white underline decoration-green-500">{OPERATOR_NAME}</span>. Tactical analysis confirms legendary status. Prepare for system extraction.
        </p>
        <button 
          onClick={() => { getCtx(); setGameState(GameState.LOADOUT); }}
          className="group relative px-8 py-3 bg-green-900/20 border-2 border-green-500 overflow-hidden transition-all hover:bg-green-500 hover:text-black font-black uppercase tracking-widest text-xs"
        >
          <span className="relative z-10">Initialize Session</span>
          <div className="absolute inset-0 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        </button>
      </div>
    </div>
  );

  const renderLoadout = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl md:text-4xl font-black mb-8 glow-text italic tracking-tighter uppercase">Select Operational Mode</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {(Object.entries(LOADOUT_CONFIGS) as [LoadoutType, typeof LOADOUT_CONFIGS[LoadoutType]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => { getCtx(); selectLoadout(key); }}
            className="p-6 border-tactical bg-black/40 hover:bg-green-500/10 transition-all text-left flex flex-col h-full group relative"
          >
            <div className="absolute top-0 left-0 w-4 h-4 corner-tl border-green-500/20"></div>
            <div className="font-black text-xl mb-3 group-hover:text-white transition-colors uppercase">{config.name}</div>
            <p className="text-xs opacity-60 mb-6 flex-1 italic">{config.description}</p>
            <div className="space-y-1">
              <StatMini label="HP" value={config.initialStats.hp} color="bg-red-500" />
              <StatMini label="ST" value={config.initialStats.stealth} color="bg-blue-500" />
              <StatMini label="SY" value={config.initialStats.style} color="bg-purple-500" />
              <StatMini label="FC" value={config.initialStats.focus} color="bg-yellow-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-[10px] font-black tracking-widest animate-pulse mb-4 text-green-500 uppercase">
        {transitionText || "Syncing Data Streams..."}
      </div>
      <div className="w-48 h-1 bg-green-950 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 animate-[loading_0.15s_linear]"></div>
      </div>
    </div>
  );

  const renderMission = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-500/5 backdrop-blur-sm">
          <h2 className="text-[10px] font-bold opacity-60 uppercase mb-2 tracking-widest">TACTICAL INTEL // MISSION: {currentLevel.id}</h2>
          <div className="text-sm md:text-lg italic text-green-200 leading-relaxed font-mono">
            "{dynamicBriefing || currentLevel.briefing}"
          </div>
        </div>

        <div className="p-6 md:p-10 border-tactical bg-black/60 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-6 h-6 corner-tr border-green-500"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 corner-bl border-green-500"></div>
          <div className="text-xl md:text-3xl font-black mb-10 leading-snug uppercase tracking-tight">{currentLevel.problem}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLevel.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice.consequences, choice.nextText)}
                className="p-5 border-2 border-green-500/30 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10 transition-all text-left font-bold group relative overflow-hidden"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <span className="text-xs opacity-40 group-hover:text-green-500 transition-colors font-mono">&gt;</span>
                  <span className="text-sm md:text-base uppercase">{choice.text}</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 w-full"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDebrief = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="p-8 md:p-16 border-tactical bg-black/60 backdrop-blur-xl max-w-3xl w-full text-center relative border-b-8 border-b-green-500 shadow-2xl">
        <div className="absolute top-0 left-0 w-12 h-12 corner-tl border-green-500 opacity-60"></div>
        <div className="absolute top-0 right-0 w-12 h-12 corner-tr border-green-500 opacity-60"></div>
        <h3 className="text-[10px] font-black opacity-40 mb-8 uppercase tracking-[0.5em]">MISSION COMPLETE // {CALLSIGN}</h3>
        <p className="text-xl md:text-3xl font-bold mb-12 leading-tight text-white font-mono uppercase italic tracking-tight">
          {lastDebrief || currentLevel.debrief}
        </p>
        <div className="h-[2px] w-32 bg-green-500/30 mx-auto mb-10"></div>
        <button 
          onClick={nextMission}
          className="group relative px-12 py-5 bg-green-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all overflow-hidden"
        >
          <span className="relative z-10">Continue Operations &gt;&gt;</span>
          <div className="absolute top-0 left-0 w-full h-full bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-red-950/20">
      <div className="text-center p-12 border-4 border-red-500 bg-black/80 max-w-xl w-full shadow-[0_0_100px_rgba(255,0,0,0.3)]">
        <h2 className="text-5xl font-black text-red-500 mb-4 animate-glitch uppercase">TERMINAL ERROR</h2>
        <p className="text-lg mb-10 opacity-80 uppercase tracking-widest italic">Mission scrubbed. Neural link severed.</p>
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <button 
            onClick={retryMission}
            className="px-8 py-4 bg-green-600 text-white font-black uppercase hover:bg-green-500 transition-all border-2 border-green-400"
          >
            Retry Mission
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-red-500 text-black font-black uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(255,0,0,0.5)]"
          >
            Hard Reboot
          </button>
        </div>
      </div>
    </div>
  );

  const renderEnding = () => {
    let resultMessage = "MISSION ACCOMPLISHED. CAKE SECURED.";
    if (stats.hp < 30) resultMessage = "CRITICAL DAMAGE SUSTAINED. CAKE EXTRACTED VIA DUCT TAPE.";
    else if (stats.stealth > 90) resultMessage = "GHOST EXTRACTION. NO ONE KNEW THE CAKE EXISTED.";
    else if (stats.hp >= 80) resultMessage = "LEGENDARY PERFORMANCE. CAKE DEPLOYED TO PROD.";

    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#050a05]">
        
        {endingStage === 'HACKING' && (
          <div className="w-full max-w-md">
            <div className="text-2xl font-black text-green-500 mb-8 uppercase tracking-widest animate-pulse">BREACHING BIRTHDAY FIREWALL...</div>
            <div className="w-full bg-green-950 h-8 border-2 border-green-500 relative overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.2)]">
               <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${hackProgress}%` }}></div>
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black mix-blend-difference">{hackProgress}%</div>
            </div>
          </div>
        )}

        {endingStage === 'SYNCING' && (
          <div className="animate-glitch">
            <div className="text-4xl md:text-6xl font-black text-white uppercase mb-4 tracking-tighter">FINALIZING CAKE_MODULE.v43</div>
            <div className="text-sm opacity-50 uppercase tracking-[0.5em]">System status: legendary...</div>
          </div>
        )}

        {endingStage === 'REVEAL' && (
          <div className="flex flex-col items-center w-full max-w-7xl mx-auto h-full py-6 md:py-10 justify-center overflow-y-auto">
            <div className="mb-6 md:mb-10 w-full">
              <div className="text-5xl md:text-[7rem] font-black glow-text mb-2 uppercase tracking-tighter animate-glitch leading-none">Happy Birthday!</div>
              <div className="text-2xl md:text-4xl font-bold uppercase tracking-[0.6em] text-green-500">{OPERATOR_NAME}</div>
            </div>

            <div className="cake-float relative mb-12 transform scale-125">
              <div className="w-48 h-40 flex flex-col items-center">
                 <div className="w-24 h-12 bg-gradient-to-b from-white to-green-100 rounded-t-lg relative border-2 border-green-800 flex items-center justify-center">
                    <div className="absolute -top-6 w-2 h-6 bg-red-500 shadow-[0_0_15px_red] rounded-full animate-pulse"></div>
                 </div>
                 <div className="w-32 h-14 bg-gradient-to-b from-green-300 to-green-500 rounded-lg -mt-2 border-2 border-green-900 z-10 flex items-center justify-center shadow-lg">
                    <span className="text-green-950 font-black text-xl">43</span>
                 </div>
                 <div className="w-44 h-16 bg-gradient-to-b from-green-600 to-green-900 rounded-lg -mt-2 border-2 border-green-950 z-20 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-2 left-0 w-full h-2 bg-white/20"></div>
                 </div>
              </div>
              <div className="mt-4 p-2 bg-black/80 border border-green-500 border-dashed text-[10px] font-bold uppercase tracking-widest text-green-500">Package status: deployed_by_rana</div>
            </div>

            <div className="p-8 md:p-12 border-tactical bg-black/90 mb-10 w-full max-w-6xl border-l-8 border-l-green-500 flex flex-col lg:flex-row gap-12 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(0,255,65,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              </div>
              
              <div className="flex-1 text-left relative z-10">
                <div className="text-2xl md:text-4xl font-black text-green-300 mb-8 uppercase leading-tight tracking-tight">{resultMessage}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <EndingStat label="HP" value={stats.hp} color="text-red-400" />
                  <EndingStat label="STLTH" value={stats.stealth} color="text-blue-400" />
                  <EndingStat label="STYL" value={stats.style} color="text-purple-400" />
                  <EndingStat label="FCS" value={stats.focus} color="text-yellow-400" />
                </div>
              </div>
              
              <div className="lg:w-80 text-left border-t lg:border-t-0 lg:border-l border-green-500/30 pt-8 lg:pt-0 lg:pl-10 flex flex-col justify-center space-y-4 relative z-10">
                <div className="text-green-500 font-bold text-sm uppercase tracking-widest">&gt; PERKS_ACTIVE:</div>
                <div className="text-base text-white/90 font-bold">🎖 LEGENDARY OPERATOR</div>
                <div className="text-base text-white/90 font-bold">🧁 UNLIMITED CAKE ACCESS</div>
                <div className="text-base text-white/90 font-bold">🛡 BUG IMMUNITY V43</div>
              </div>
            </div>

            <div className="text-md md:text-xl italic text-green-200/50 mb-10 px-4 font-mono uppercase tracking-widest max-w-4xl">
              "System uptime: 43 years. Zero critical regressions. You deliver quality code and legendary vibes every single sprint."
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="px-16 py-6 border-2 border-green-500 hover:bg-green-500 hover:text-black font-black transition-all text-sm tracking-[0.4em] uppercase mb-12 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
            >
              Restart Simulation
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-[#00ff41] font-mono selection:bg-[#00ff41] selection:text-black flex flex-col relative overflow-hidden">
      <div className="flex-1 relative z-10 w-full mx-auto flex flex-col h-full">
        {gameState !== GameState.START && gameState !== GameState.LOADOUT && gameState !== GameState.MISSION_LOADING && gameState !== GameState.ENDING && gameState !== GameState.GAME_OVER && (
          <HUD stats={stats} inventory={inventory} level={currentLevelIdx + 1} totalLevels={MISSIONS.length} loadoutType={loadout} />
        )}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {gameState === GameState.START && renderStart()}
            {gameState === GameState.LOADOUT && renderLoadout()}
            {gameState === GameState.MISSION_LOADING && renderLoading()}
            {gameState === GameState.MISSION_ACTIVE && renderMission()}
            {gameState === GameState.DEBRIEFING && renderDebrief()}
            {gameState === GameState.ENDING && renderEnding()}
            {gameState === GameState.GAME_OVER && renderGameOver()}
        </div>
      </div>
    </div>
  );
};

const StatMini: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-[8px] font-bold w-4 opacity-70">{label}</span>
    <div className="flex-1 h-1 bg-white/5 overflow-hidden border border-white/5">
      <div className={`${color} h-full`} style={{ width: `${Math.min(100, value)}%` }}></div>
    </div>
  </div>
);

const EndingStat: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="p-6 border border-green-500/30 bg-black/60 flex flex-col items-center justify-center min-w-[100px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
    <div className="text-xs opacity-50 mb-2 tracking-[0.3em] uppercase">{label}</div>
    <div className={`text-3xl md:text-5xl font-black ${color} drop-shadow-[0_0_10px_currentColor]`}>{value}</div>
  </div>
);

export default App;
