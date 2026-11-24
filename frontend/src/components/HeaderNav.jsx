import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from './LanguageSelector'
import AddYourFieldModal from './AddYourFieldModal'
import {
  Sprout, Map, Search, Calendar, Activity,
  Cpu, Satellite, ShieldCheck, BarChart2, Plus, Menu, X, Sliders
} from 'lucide-react'

export default function HeaderNav() {
  const { t } = useLanguage()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/field-intelligence', label: t('nav_field_intelligence', 'Field Intelligence'), icon: <Map size={16} /> },
    { path: '/crop-explorer', label: t('nav_crop_explorer', 'Crop Explorer'), icon: <Search size={16} /> },
    { path: '/crop-planner', label: t('nav_crop_planner', 'Crop Planner'), icon: <Calendar size={16} /> },
    { path: '/soil-health', label: t('nav_soil_health', 'Soil Health'), icon: <Activity size={16} /> },
    { path: '/devices', label: t('nav_agrisense', 'AgriSense IoT'), icon: <Cpu size={16} /> },
    { path: '/agrivision', label: t('nav_agrivision', 'AgriVision'), icon: <Satellite size={16} /> },
    { path: '/regenerative', label: t('nav_regenerative', 'Regenerative'), icon: <ShieldCheck size={16} /> },
    { path: '/dashboard', label: t('nav_dashboard', 'Analytics'), icon: <BarChart2 size={16} /> },
    { path: '/what-if', label: t('nav_whatif', 'What-If'), icon: <Sliders size={16} /> },
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
              <Link to="/field-intelligence" className="flex items-center gap-2.5 group">
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
                    {t('app_subtitle', 'Regenerative Agricultural Intelligence')}
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
                      isActive
                        ? 'bg-emerald-500/25 text-white shadow-inner border border-emerald-400/30'
                        : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Controls: Language Selector & Add Field Action */}
            <div className="flex items-center gap-2.5">
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
          <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-emerald-950/95 border-t border-emerald-800/60 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30' : 'text-emerald-100/80 hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-emerald-950 shadow-sm"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>{t('btn_add_field', 'Add Field')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Add Your Field Modal */}
      <AddYourFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFieldCreated={() => {
          // Window reload or state trigger
        }}
      />
    </>
  )
}
