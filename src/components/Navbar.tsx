import React, { useState } from 'react';
import { Logo } from './Logo';
import { Language, translations } from '../data/translations';
import { Menu, X, Sun, Moon, Compass, BookOpen, Globe2, SlidersHorizontal, ShieldAlert, Database, Users, Bell } from 'lucide-react';

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
      <header className="print:hidden sticky top-0 z-[1000] bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-xl border-b border-[#e5e5e7] dark:border-[#1f2937] transition-all w-full">
        {/* ROW 1: PRIMARY BRANDING & GLOBAL CONTROLS */}
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onSelectTab('overview')}>
            <Logo size="md" />
          </div>

          {/* Central Mode Switcher: Mode Warga vs Mode Riset & Satgas */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
            <button
              onClick={() => onToggleAppMode('citizen')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2 ${
                appMode === 'citizen'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.modeCitizenDesc}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.modeCitizen}</span>
            </button>

            <button
              onClick={() => onToggleAppMode('science')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2 ${
                appMode === 'science'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.modeScienceDesc}
            >
              <Globe2 className="w-4 h-4 shrink-0" />
              <span>{t.modeScience}</span>
            </button>
          </div>

          {/* Right Controls: Alert Hub, Theme, Language, Tour & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Early Warning Alert Center Trigger */}
            {onOpenAlertModal && (
              <button
                onClick={onOpenAlertModal}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                title={language === 'id' ? 'Pusat Siaga & Peringatan Dini Gambut (3 Aktif)' : 'Early Warning Alert Hub (3 Active)'}
                aria-label="Pusat Peringatan Dini"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <Bell className="w-3.5 h-3.5 text-rose-500 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline font-semibold">3 Siaga</span>
              </button>
            )}

            {/* Live Indicator */}
            {isLiveSync && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                NASA FIRMS Live
              </span>
            )}

            {/* Direct Dark / Light Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer group"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform" />
                )}
              </button>
            )}

            {/* Language Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-[11px] font-mono font-bold border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onToggleLanguage('id')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
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
                className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 transition-all cursor-pointer shadow-2xs"
                title={language === 'id' ? 'Buka Ringkasan Ilmiah 30 Detik (Pintasan: ?)' : 'Open 30-Second Science Briefing (Shortcut: ?)'}
              >
                <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>{t.scienceTourBtn}</span>
                <kbd className="text-[10px] font-mono px-1 rounded bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
                  ?
                </kbd>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-900 dark:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                      onClick={() => onSelectTab(item.id)}
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

              <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span>Modul Analisis NASA:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 uppercase">{activeTab}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1001] md:hidden bg-black/40 backdrop-blur-xs pt-14 flex flex-col">
          <div className="bg-white dark:bg-[#111827] border-b border-[#e5e5e7] dark:border-[#1f2937] p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Mode Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs gap-1">
              <button
                onClick={() => {
                  onToggleAppMode('citizen');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.modeCitizen}</span>
              </button>

              <button
                onClick={() => {
                  onToggleAppMode('science');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'science'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>{t.modeScience}</span>
              </button>
            </div>

            {/* Tour & Nav Items */}
            {onOpenTour && (
              <button
                onClick={() => {
                  onOpenTour();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition min-h-[40px] cursor-pointer bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t.scienceTourBtn}</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                  {language === 'id' ? 'Ringkasan 30 Detik' : '30-Sec Briefing'}
                </span>
              </button>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition min-h-[42px] cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#1f2937] text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a2333] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Theme & Language Bar */}
            <div className="pt-3 border-t border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#86868b] dark:text-[#9ca3af]">
                {language === 'id' ? 'Tema Tampilan:' : 'Theme Mode:'}
              </span>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-[#e5e5e7] dark:border-[#374151] bg-[#f5f5f7] dark:bg-[#1f2937] text-[#1d1d1f] dark:text-white"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'id' ? 'Mode Gelap (Aktif)' : 'Dark (Active)'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'id' ? 'Mode Terang (Aktif)' : 'Light (Active)'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
