import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  Bike, 
  AlertTriangle, 
  Activity, 
  Gauge, 
  Compass, 
  BellRing, 
  Clock, 
  CheckCircle2, 
  X, 
  Play, 
  FastForward, 
  ShieldAlert,
  Radio
} from 'lucide-react';

export const AccidentDemoLab: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { 
    travelSpeed, 
    isAccidentDetected, 
    accidentCountdown, 
    triggerAccidentSimulation, 
    cancelAccidentTimer,
    startEmergencyTrigger
  } = useEmergency();

  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(45);

  const handleSimulateCrash = () => {
    triggerAccidentSimulation();
  };

  const handleFastForwardCodeRed = () => {
    cancelAccidentTimer();
    startEmergencyTrigger('AUTOMATED ACCIDENT CODE RED: Sudden Kinetic Deceleration to 0 km/h');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/80 shadow-2xl p-5 text-slate-900 dark:text-slate-100 max-w-xl mx-auto space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Solo Commuter Accident Crash Lab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                Live Simulator
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test automated deceleration detection, 60s alarm, and Code Red hospital dispatch
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Telemetry Dashboard */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        
        {/* Speedometer */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Current Speed
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            {isAccidentDetected ? (
              <span className="text-red-600 dark:text-red-400 animate-pulse">0 km/h</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">{simulatedSpeed} km/h</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {isAccidentDetected ? 'IMPACT CONFIRMED' : 'Cruising Speed'}
          </span>
        </div>

        {/* Accelerometer G-Force */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            G-Force Sensor
          </span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            {isAccidentDetected ? (
              <span className="text-red-600 font-black">-14.2 G (CRASH)</span>
            ) : (
              <span className="text-slate-700 dark:text-slate-300">1.02 G (Nominal)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">3-Axis Gyro Active</span>
        </div>

        {/* Crash Sensor State */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Sensor Status
          </span>
          <div className="text-sm font-bold mt-1.5 flex items-center justify-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isAccidentDetected ? 'bg-red-600 animate-ping' : 'bg-emerald-500'}`}></span>
            <span className={isAccidentDetected ? 'text-red-600 font-black' : 'text-emerald-600'}>
              {isAccidentDetected ? 'COLLISION' : 'MONITORING'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Auto-dispatch armed</span>
        </div>

      </div>

      {/* Speed Slider for Real-Time Simulation */}
      {!isAccidentDetected && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Cruising Speed Adjustment:
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {simulatedSpeed} km/h
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={80}
            value={simulatedSpeed}
            onChange={e => setSimulatedSpeed(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>15 km/h (Bicycle)</span>
            <span>45 km/h (Scooter)</span>
            <span>80 km/h (Highway)</span>
          </div>
        </div>
      )}

      {/* Primary Trigger Controls */}
      {!isAccidentDetected ? (
        <div className="space-y-2">
          <button
            onClick={handleSimulateCrash}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
          >
            <AlertTriangle className="w-5 h-5 text-amber-200" />
            <span>TRIGGER SUDDEN ACCIDENT (Drop Speed from {simulatedSpeed} km/h to 0)</span>
          </button>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Simulates instant kinetic impact $\rightarrow$ triggers 60s alarm countdown $\rightarrow$ tests automatic hospital notification.
          </p>
        </div>
      ) : (
        /* Active Crash Mode Panel (Stationary, completely steady) */
        <div className="p-4 rounded-xl bg-red-600 text-white space-y-3 border-2 border-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-200" />
              <span className="font-extrabold text-sm uppercase tracking-wider">
                60-Second Intervention Timer Active
              </span>
            </div>
            <span className="text-2xl font-mono font-black bg-black/30 px-3 py-1 rounded-lg">
              {accidentCountdown}s
            </span>
          </div>

          <p className="text-xs text-red-100 leading-relaxed">
            Continuous audio siren alarm is active. You have 60 seconds to cancel if safe. When the countdown reaches 0, Code Red is automatically sent to the nearest hospital!
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={cancelAccidentTimer}
              className="py-2.5 px-3 rounded-xl bg-white text-red-700 font-extrabold text-xs hover:bg-slate-100 shadow transition-transform active:scale-95"
            >
              Cancel (False Alarm)
            </button>
            <button
              onClick={handleFastForwardCodeRed}
              className="py-2.5 px-3 rounded-xl bg-slate-950 text-amber-300 font-extrabold text-xs hover:bg-slate-900 border border-amber-400/40 flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <FastForward className="w-4 h-4" />
              <span>Fast-Forward to Code Red</span>
            </button>
          </div>
        </div>
      )}

      {/* Protocol Explanation */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
        <strong className="text-slate-800 dark:text-slate-200 block">PulseWay Autonomous Crash Protocol:</strong>
        <p>1. <strong>Kinetic Drop:</strong> Travel speed drops abruptly from cruising to 0 with G-force spike.</p>
        <p>2. <strong>60s Grace Window:</strong> Loud siren + vibration allows driver to cancel if uninjured.</p>
        <p>3. <strong>Hospital Gatekeeper:</strong> Code Red alert is transmitted to nearest hospital; ambulance is dispatched once the hospital dashboard accepts and confirms.</p>
      </div>

    </div>
  );
};
