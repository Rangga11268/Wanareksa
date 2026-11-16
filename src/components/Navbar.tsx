import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Language, translations } from '../data/translations';
import { Menu, X, Sun, Moon, Compass, BookOpen, Globe2, SlidersHorizontal, ShieldAlert, Database, Users, Bell, Volume2, VolumeX } from 'lucide-react';
import { telemetryAudio } from '../utils/telemetryAudio';

export type NavTab = 'story' | 'overview' | 'lab' | 'mitigation' | 'data-hub' | 'team';
export type ThemeMode = 'system' | 'light' | 'dark';
export type AppMode = 'citizen' | 'science';

interface NavbarProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  onOpenTeam?: () => void;
  onOpenTour?: () => void;
  onOpenAlertModal?: () => void;
  isLiveSync?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  activeTab,
  onSelectTab,
  appMode,
  onToggleAppMode,
  onOpenTeam,
  onOpenTour,
  onOpenAlertModal,
  isLiveSync = false,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => telemetryAudio.getIsMuted());

  // Prevent background scroll and expensive map re-renders when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  const handleToggleAudio = () => {
    const next = telemetryAudio.toggleMute();
    setIsMuted(next);
  };

  const navItems = [
    { id: 'story' as NavTab, label: t.navStory, icon: BookOpen },
    { id: 'overview' as NavTab, label: t.navOverview, icon: Globe2 },
    { id: 'lab' as NavTab, label: t.navLab, icon: SlidersHorizontal },
    { id: 'mitigation' as NavTab, label: t.navMitigation, icon: ShieldAlert },
    { id: 'data-hub' as NavTab, label: t.navData, icon: Database },
    { id: 'team' as NavTab, label: t.navTeam, icon: Users },
  ];

  const themeLabel = theme === 'dark'
    ? (language === 'id' ? 'Ganti ke Mode Terang' : 'Switch to Light Mode')
    : (language === 'id' ? 'Ganti ke Mode Gelap' : 'Switch to Dark Mode');

  return (
    <>
      <header className="print:hidden sticky top-0 z-[1000] bg-white/95 dark:bg-[#070c18]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all w-full">
        {/* ROW 1: PRIMARY BRANDING & GLOBAL CONTROLS */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-1 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onSelectTab('overview')}>
            <div className="block sm:hidden">
              <Logo size="sm" showSubtitle={false} />
            </div>
            <div className="hidden sm:block">
              <Logo size="md" />
            </div>
          </div>

          {/* Central Architectural Platform Perspective Switcher */}
          <nav aria-label="Perspective Navigation" className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs h-10">
            <button
              onClick={() => {
                telemetryAudio.playClick();
                onToggleAppMode('citizen');
              }}
              className={`h-8 px-3.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-2 ${
                appMode === 'citizen'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
              title={t.modeCitizenDesc}
            >
              <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${appMode === 'citizen' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-bold tracking-tight">{language === 'id' ? 'Portal Warga' : 'Citizen Portal'}</span>
              <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden xl:inline">
                {language === 'id' ? 'Aksi Cepat' : 'Rapid Action'}
              </span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={() => {
                telemetryAudio.playClick();
                onToggleAppMode('science');
              }}
              className={`h-8 px-3.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-2 ${
                appMode === 'science'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
              title={t.modeScienceDesc}
            >
              <Globe2 className={`w-3.5 h-3.5 shrink-0 ${appMode === 'science' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
              <span className="font-bold tracking-tight">{language === 'id' ? 'Riset Sains & Satgas' : 'Science & Satgas'}</span>
              <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden xl:inline">
                NASA 26-Yr
              </span>
            </button>
          </nav>

          {/* Right Controls: Alert Hub, Theme, Language, Tour & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Early Warning Alert Center Trigger */}
            {onOpenAlertModal && (
              <button
                onClick={onOpenAlertModal}
                className="flex items-center justify-center gap-1.5 h-9 w-9 sm:w-auto sm:px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition-all shadow-2xs cursor-pointer group"
                title={language === 'id' ? 'Pusat Peringatan Dini Gambut' : 'Early Warning Alert Hub'}
                aria-label={language === 'id' ? 'Pusat Peringatan Dini' : 'Early Warning Alert Hub'}
              >
                <Bell className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="hidden sm:inline">{language === 'id' ? '3 Siaga' : '3 Alerts'}</span>
              </button>
            )}

            {/* Live Indicator (Unboxed Monospace Text, Desktop Only) */}
            {isLiveSync && (
              <span className="hidden sm:inline-flex items-center text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                NASA FIRMS Live
              </span>
            )}

            {/* Audio Feedback Toggle Button (Desktop Only) */}
            <button
              onClick={handleToggleAudio}
              aria-label={isMuted ? (language === 'id' ? 'Aktifkan Suara Telemetri' : 'Enable Telemetry Audio') : (language === 'id' ? 'Bisukan Suara' : 'Mute Audio')}
              title={isMuted ? (language === 'id' ? 'Suara Telemetri: Nonaktif' : 'Telemetry Sound: Muted') : (language === 'id' ? 'Suara Telemetri: Aktif' : 'Telemetry Sound: Active')}
              className="hidden md:flex h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer shadow-2xs"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              )}
            </button>

            {/* Direct Dark / Light Theme Toggle Button (Desktop Only) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className="hidden md:flex h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer shadow-2xs"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Language Switch (Desktop Only) */}
            <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-900/90 rounded-lg p-0.5 text-xs font-mono font-bold border border-slate-200 dark:border-slate-800 h-9 shadow-2xs">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`h-8 px-2.5 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onToggleLanguage('id')}
                className={`h-8 px-2.5 rounded-md transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* 30-Sec Science Briefing Tour Button */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="hidden xl:inline-flex items-center gap-2 text-xs font-semibold px-3 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                title={language === 'id' ? 'Buka Ringkasan Ilmiah 30 Detik (Pintasan: ?)' : 'Open 30-Second Science Briefing (Shortcut: ?)'}
              >
                <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{t.scienceTourBtn}</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  ?
                </kbd>
              </button>
            )}

            {/* Mobile Menu Toggle (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden h-9 w-9 text-slate-900 dark:text-white flex items-center justify-center cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MODE PERSPECTIVE DOCK (1-Tap Direct Switch for Judges & Citizens on Mobile) */}
        <div className="md:hidden w-full px-2.5 sm:px-4 py-1.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800 text-xs shadow-2xs">
            <button
              onClick={() => {
                telemetryAudio.playClick();
                onToggleAppMode('citizen');
              }}
              className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 min-h-[34px] ${
                appMode === 'citizen'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${appMode === 'citizen' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{language === 'id' ? 'Portal Warga' : 'Citizen'}</span>
            </button>

            <button
              onClick={() => {
                telemetryAudio.playClick();
                onToggleAppMode('science');
              }}
              className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 min-h-[34px] ${
                appMode === 'science'
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className={`w-3.5 h-3.5 shrink-0 ${appMode === 'science' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
              <span className="truncate">{language === 'id' ? 'Sains & Satgas' : 'Science 26-Yr'}</span>
            </button>
          </div>
        </div>

        {/* ROW 2: SCIENCE & SATGAS SUB-NAVIGATION (Hanya Tampil Saat Mode Riset Aktif) */}
        {appMode === 'science' && (
          <div className="hidden md:block w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0a0f1d]/70 px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        telemetryAudio.playClick();
                        onSelectTab(item.id);
                      }}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-white dark:bg-[#141d2e] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isActive 
                          ? (item.id === 'mitigation' ? 'text-rose-500 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400')
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-300/60 dark:border-slate-700/60 hidden xl:inline" title="Tekan tombol 1-6 di keyboard untuk navigasi cepat">
                  Shortcut: [1-6]
                </span>
                <span>Modul Analisis NASA:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 uppercase">{activeTab}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Side Slide-In Drawer (Clipped in overflow-hidden to eliminate horizontal page swipe) */}
      <div
        className={`fixed inset-0 z-[1001] md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        {/* Overlay Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/60 transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Panel Sliding from Right */}
        <aside
          aria-label="Mobile Navigation Drawer"
          className={`absolute top-0 right-0 bottom-0 w-[84vw] max-w-sm bg-white dark:bg-[#0c1220] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out will-change-transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header with Logo & Close Button */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Logo size="sm" showSubtitle={false} />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label={language === 'id' ? 'Tutup Navigasi' : 'Close Navigation'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {/* Mode Switcher (Portal Warga vs Sains & Satgas) */}
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs gap-1">
              <button
                onClick={() => {
                  telemetryAudio.playClick();
                  onToggleAppMode('citizen');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'citizen'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${appMode === 'citizen' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{language === 'id' ? 'Portal Warga' : 'Citizen'}</span>
              </button>

              <button
                onClick={() => {
                  telemetryAudio.playClick();
                  onToggleAppMode('science');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'science'
                    ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe2 className={`w-3.5 h-3.5 shrink-0 ${appMode === 'science' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{language === 'id' ? 'Sains & Satgas' : 'Science'}</span>
              </button>
            </div>

            {/* 30-Sec Tour Button */}
            {onOpenTour && (
              <button
                onClick={() => {
                  onOpenTour();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between min-h-[40px]"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>{t.scienceTourBtn}</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {language === 'id' ? '30 Detik' : '30-Sec'}
                </span>
              </button>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 pt-1 font-bold">
                {appMode === 'science' ? (language === 'id' ? 'Modul Analisis Sains:' : 'Science Modules:') : (language === 'id' ? 'Menu Navigasi:' : 'Navigation:')}
              </div>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      telemetryAudio.playClick();
                      onSelectTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition min-h-[42px] cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#1a2333] text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151d2e] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Bottom Quick Controls: Language, Telemetry Audio & Theme */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0a0f1d] shrink-0 space-y-3">
            {/* Row 1: Language Switcher in Drawer */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px] font-medium">
                {language === 'id' ? 'Bahasa / Language:' : 'Language:'}
              </span>
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-mono font-bold border border-slate-300/70 dark:border-slate-700">
                <button
                  onClick={() => onToggleLanguage('en')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onToggleLanguage('id')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    language === 'id'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ID
                </button>
              </div>
            </div>

            {/* Row 2: Audio Feedback & Theme Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Audio Toggle */}
              <button
                onClick={handleToggleAudio}
                className="px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-mono">{language === 'id' ? 'Suara Mati' : 'Muted'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="text-[11px] font-mono">{language === 'id' ? 'Suara Aktif' : 'Sound On'}</span>
                  </>
                )}
              </button>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px]">{language === 'id' ? 'Mode Gelap' : 'Dark'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[11px]">{language === 'id' ? 'Mode Terang' : 'Light'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-400 text-center pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              WANAREKSA &bull; NASA Space Apps 2026
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};
