import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useUserMode } from '../context/UserModeContext'
import LanguageSelector from './LanguageSelector'
import AddYourFieldModal from './AddYourFieldModal'
import {
  Sprout, Map, Search, Calendar, Activity, ShoppingBag,
  Cpu, Satellite, ShieldCheck, DollarSign, Plus, Menu, X, Sliders, Sparkles, UserCheck
} from 'lucide-react'

export default function HeaderNav() {
  const { t } = useLanguage()
  const { uiMode, toggleMode, isSimpleMode } = useUserMode()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Soil Intelligence is prominently positioned as the core primary feature
  const navItems = [
    {
      path: '/soil-health',
      label: t('nav_soil_health', 'Soil Intelligence'),
      icon: <Activity size={16} />,
      highlight: true
    },
    {
      path: '/field-intelligence',
      label: t('nav_field_intelligence', 'My Farm'),
      icon: <Map size={16} />
    },
    {
      path: '/marketplace',
      label: t('nav_agrimarket', 'AgriMarket'),
      icon: <ShoppingBag size={16} />
    },
    {
      path: '/crop-planner',
      label: t('nav_crop_planner', 'Crop Planner'),
      icon: <Calendar size={16} />
    },
    {
      path: '/crop-explorer',
      label: t('nav_crop_explorer', 'Crop Explorer'),
      icon: <Search size={16} />
    },
    {
      path: '/economics',
      label: t('nav_economics', 'Farm Economics'),
      icon: <DollarSign size={16} />
    },
    {
      path: '/agrivision',
      label: t('nav_agrivision', 'AgriVision'),
      icon: <Satellite size={16} />
    },
    {
      path: '/devices',
      label: t('nav_agrisense', 'AgriSense IoT'),
      icon: <Cpu size={16} />
    },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full text-white shadow-md transition-all"
        style={{
          background: 'linear-gradient(135deg, #103420 0%, #16462c 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link to="/soil-health" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-emerald-950 shadow-md group-hover:scale-105 transition-transform">
                  <Sprout size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                      {t('app_title', 'AgriN')}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {t('track_badge', 'BRICS')}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-300/80 font-medium block leading-none mt-1">
                    {t('app_subtitle', 'Soil Intelligence & Farmer Ecosystem')}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      item.highlight && !isActive
                        ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/25'
                        : isActive
                        ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md'
                        : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right Controls: Mode Toggle, Language Selector & Add Field Action */}
            <div className="flex items-center gap-2.5">
              {/* Dual Mode Switcher (Simple Farmer vs Advanced Expert) */}
              <button
                onClick={toggleMode}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all bg-white/10 border-white/20 text-emerald-200 hover:bg-white/15"
                title="Switch between Simple Farmer Mode and Advanced Expert Mode"
              >
                <UserCheck size={14} className="text-emerald-400" />
                <span>{isSimpleMode ? t('mode_simple', 'Simple Mode') : t('mode_advanced', 'Advanced Mode')}</span>
              </button>

              <LanguageSelector variant="dark" />

              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-sm transition-all hover:scale-105"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>{t('btn_add_field', 'Add Field')}</span>
              </button>

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 lg:hidden"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 space-y-2 bg-emerald-950/95 border-t border-emerald-800/60 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/50">
              <button
                onClick={toggleMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
              >
                <UserCheck size={14} />
                <span>Mode: {isSimpleMode ? 'Simple Farmer' : 'Advanced'}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-emerald-950"
              >
                <Plus size={14} />
                <span>{t('btn_add_field', 'Add Field')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-emerald-500 text-emerald-950 font-bold' : 'text-emerald-100/80 hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Guided Add Field Modal */}
      <AddYourFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFieldCreated={() => setIsModalOpen(false)}
      />
    </>
  )
}
