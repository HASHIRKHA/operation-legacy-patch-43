
import React from 'react';
import { Stats, InventoryItem, LoadoutType } from '../types';
import { CALLSIGN, UNIT, OPERATOR_NAME } from '../constants';

interface HUDProps {
  stats: Stats;
  inventory: InventoryItem[];
  level: number;
  totalLevels: number;
  loadoutType: LoadoutType;
}

const HUD: React.FC<HUDProps> = ({ stats, inventory, level, totalLevels, loadoutType }) => {
  const progress = (level / totalLevels) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between z-50">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="relative p-3 md:p-4 border-tactical bg-black/60 backdrop-blur-sm w-[200px] md:min-w-[250px]">
          <div className="absolute top-0 left-0 w-4 h-4 corner-tl"></div>
          <div className="absolute top-0 right-0 w-4 h-4 corner-tr"></div>
          <div className="glow-text text-[8px] md:text-xs opacity-70 mb-1">ID: {OPERATOR_NAME}</div>
          <div className="font-bold text-sm md:text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {CALLSIGN}
          </div>
          <div className="text-[8px] opacity-50 uppercase tracking-widest hidden md:block">{UNIT}</div>
        </div>

        <div className="relative p-3 md:p-4 border-tactical bg-black/60 backdrop-blur-sm w-[150px] md:min-w-[200px] text-right">
          <div className="absolute top-0 left-0 w-4 h-4 corner-tl"></div>
          <div className="absolute top-0 right-0 w-4 h-4 corner-tr"></div>
          <div className="glow-text text-[8px] md:text-xs opacity-70 mb-1">NAV_SYSTEM</div>
          <div className="text-lg md:text-xl font-bold">L-{level}/{totalLevels}</div>
          <div className="w-full bg-green-900/30 h-1 mt-2">
            <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Middle Grid Decor (Lower opacity to not distract) */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-[0.03] border border-green-500/10 pointer-events-none">
        {[...Array(64)].map((_, i) => <div key={i} className="border border-green-500/5"></div>)}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        {/* Stats Panel */}
        <div className="relative p-3 md:p-4 border-tactical bg-black/60 backdrop-blur-sm w-[200px] md:min-w-[250px]">
          <div className="absolute bottom-0 left-0 w-4 h-4 corner-bl"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 corner-br"></div>
          <div className="glow-text text-[8px] md:text-xs opacity-70 mb-2">VITAL_SIGNS</div>
          
          <div className="space-y-1 md:space-y-2">
            <StatBar label="HP" value={stats.hp} color="bg-red-500" />
            <StatBar label="STLTH" value={stats.stealth} color="bg-blue-500" />
            <StatBar label="STYL" value={stats.style} color="bg-purple-500" />
            <StatBar label="FCS" value={stats.focus} color="bg-yellow-500" />
          </div>
        </div>

        {/* Inventory / Logs Panel - Smaller on mobile */}
        <div className="relative p-3 md:p-4 border-tactical bg-black/60 backdrop-blur-sm w-[150px] md:min-w-[300px] max-h-[120px] md:max-h-[200px] overflow-hidden hidden sm:block">
          <div className="absolute bottom-0 left-0 w-4 h-4 corner-bl"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 corner-br"></div>
          <div className="glow-text text-[8px] md:text-xs opacity-70 mb-2">FIELD_LOGS</div>
          <div className="text-[8px] md:text-[10px] space-y-1 font-mono">
            <div className="text-green-500/60">[SYS] LOADOUT: {loadoutType}</div>
            {inventory.length > 0 ? (
              inventory.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="text-white/80 animate-pulse">
                  [INV] {item.name.toUpperCase()}
                </div>
              ))
            ) : (
              <div className="text-green-500/20 italic">No field items</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-[8px] md:text-[10px] w-8 md:w-12 font-bold opacity-80">{label}</span>
    <div className="flex-1 h-1 md:h-2 bg-black/60 border border-white/5 overflow-hidden">
      <div 
        className={`${color} h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
    <span className="text-[8px] md:text-[10px] w-6 md:w-8 text-right font-mono">{value}</span>
  </div>
);

export default HUD;
