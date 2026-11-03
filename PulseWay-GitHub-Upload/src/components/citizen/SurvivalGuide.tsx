import React, { useState, useRef } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { SURVIVAL_GUIDE_DATA } from '../../data/mockData';
import { SurvivalGuideEmergency } from '../../types';
import { 
  User, 
  Users, 
  Pill, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const SurvivalGuide: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language } = useEmergency();
  const [pathway, setPathway] = useState<'ALONE' | 'ASSISTED'>('ALONE');
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('heart-attack');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const chipContainerRef = useRef<HTMLDivElement>(null);

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const filteredEmergencies = SURVIVAL_GUIDE_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentIndex = Math.max(0, filteredEmergencies.findIndex(i => i.id === selectedEmergencyId));
  const selectedItem: SurvivalGuideEmergency = 
    filteredEmergencies[currentIndex] || SURVIVAL_GUIDE_DATA[0];

  const getLocalizedTitle = (item: SurvivalGuideEmergency) => {
    if (language === 'kn') return item.kannadaTitle;
    if (language === 'hi') return item.hindiTitle;
    return item.title;
  };

  const goToNextEmergency = () => {
    if (filteredEmergencies.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredEmergencies.length;
    const nextItem = filteredEmergencies[nextIdx];
    setSelectedEmergencyId(nextItem.id);
    scrollChipIntoView(nextItem.id);
  };

  const goToPreviousEmergency = () => {
    if (filteredEmergencies.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredEmergencies.length) % filteredEmergencies.length;
    const prevItem = filteredEmergencies[prevIdx];
    setSelectedEmergencyId(prevItem.id);
    scrollChipIntoView(prevItem.id);
  };

  const scrollChipIntoView = (id: string) => {
    const el = document.getElementById(`chip-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const slideChipsLeft = () => {
    if (chipContainerRef.current) {
      chipContainerRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const slideChipsRight = () => {
    if (chipContainerRef.current) {
      chipContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      goToNextEmergency();
    } else if (isRightSwipe) {
      goToPreviousEmergency();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-5 text-slate-900 dark:text-slate-100 max-w-3xl mx-auto space-y-3.5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight font-serif">
              Emergency Survival Guide
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Validated medical steps & emergency medicine protocols
            </p>
          </div>
        </div>

        {/* 112 Direct Hotline Pill */}
        <a
          href="tel:112"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/30 transition-transform active:scale-95 shrink-0"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Call 112</span>
        </a>
      </div>

      {/* Two Pathways Toggle: "If you are alone" vs "If there is someone to assist you" */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => setPathway('ALONE')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            pathway === 'ALONE'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>If You Are Alone</span>
        </button>

        <button
          onClick={() => setPathway('ASSISTED')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            pathway === 'ASSISTED'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>If Someone Is Assisting</span>
        </button>
      </div>

      {/* Interactive Emergency Slider Navigation Bar */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={goToPreviousEmergency}
          title="Slide to Previous Emergency"
          className="flex items-center gap-1 font-bold text-xs text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Emergency</span>
        </button>

        <div className="flex items-center gap-1.5 text-center">
          <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
            {currentIndex + 1} of {filteredEmergencies.length}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">· Swipe or click arrows to slide</span>
        </div>

        <button
          onClick={goToNextEmergency}
          title="Slide to Next Emergency"
          className="flex items-center gap-1 font-bold text-xs text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <span className="hidden sm:inline">Next Emergency</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Emergency Chips with Left and Right Scroll Slide Arrows */}
      <div className="relative flex items-center">
        <button
          onClick={slideChipsLeft}
          className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 shrink-0 mr-1.5 cursor-pointer shadow-xs"
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div
          ref={chipContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 scroll-smooth"
        >
          {filteredEmergencies.map((item) => {
            const isSelected = selectedEmergencyId === item.id;
            return (
              <button
                key={item.id}
                id={`chip-${item.id}`}
                onClick={() => setSelectedEmergencyId(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.title.split('/')[0]}
              </button>
            );
          })}
        </div>

        <button
          onClick={slideChipsRight}
          className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 shrink-0 ml-1.5 cursor-pointer shadow-xs"
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Card with Touch Swipe Support */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-4 space-y-4 select-none touch-pan-y animate-in fade-in duration-150"
      >
        
        {/* Title & Category Banner */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold">
              {selectedItem.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              {getLocalizedTitle(selectedItem)}
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
            {pathway === 'ALONE' ? 'Solo Protocol' : 'Assisted Bystander Protocol'}
          </span>
        </div>

        {/* Immediate Action Steps */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Immediate Action Steps ({pathway === 'ALONE' ? 'Solo' : 'Bystander'}):
          </h3>
          <div className="space-y-2">
            {(pathway === 'ALONE' ? selectedItem.aloneInstructions : selectedItem.assistedInstructions).map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  {idx + 1}
                </span>
                <p className="leading-relaxed text-slate-800 dark:text-slate-200 flex-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Necessary Emergency Medicines */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Emergency Medicines & First Aid Gear:
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedItem.emergencyMedicines.map((med, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{med}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices & Warning Signs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              Critical Best Practices:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedItem.bestPractices.map((bp, i) => (
                <li key={i}>{bp}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> High Urgency Danger Signs:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-300 leading-relaxed">
              {selectedItem.dangerSigns.map((ds, i) => (
                <li key={i}>{ds}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Slide Trigger to Next Emergency */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <button
            onClick={goToPreviousEmergency}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Slide Previous</span>
          </button>

          <button
            onClick={goToNextEmergency}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Slide to Next Guide: {filteredEmergencies[(currentIndex + 1) % filteredEmergencies.length]?.title.split('/')[0]}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
