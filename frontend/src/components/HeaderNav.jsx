import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useUserMode } from '../context/UserModeContext'
import LanguageSelector from './LanguageSelector'
import {
  Sprout, FlaskConical, FileBarChart2, Cpu, Home as HomeIcon,
  Menu, X, ArrowRight, UserCheck
} from 'lucide-react'

export default function HeaderNav() {
  const { t } = useLanguage()
  const { toggleMode, isSimpleMode } = useUserMode()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Core navigation aligned to the Soil Data -> ML Analysis -> Crop Suitability -> Reports workflow
  const navItems = [
    {
      path: '/',
      label: t('nav_home', 'Home'),
      icon: <HomeIcon size={15} />,
    },
    {
      path: '/farm-details',
      label: t('nav_soil_analysis', 'Soil Analysis'),
      icon: <FlaskConical size={15} />,
      matchPaths: ['/farm-details', '/soil-test', '/environment', '/analysis'],
    },
    {
      path: '/soil-health',
      label: t('nav_crop_suitability', 'Crop Suitability'),
      icon: <Sprout size={15} />,
      matchPaths: ['/soil-health', '/recommendations', '/i-want-to-grow', '/what-if'],
    },
    {
      path: '/dashboard',
      label: t('nav_my_reports', 'My Reports'),
      icon: <FileBarChart2 size={15} />,
    },
    {
      path: '/devices',
      label: t('nav_device_input', 'Device / Data Input'),
      icon: <Cpu size={15} />,
      matchPaths: ['/devices', '/devices/register'],
    },
  ]

  const isNavActive = (item) => {
    if (location.pathname === item.path) return true
    if (item.matchPaths && item.matchPaths.includes(location.pathname)) return true
    return false
  }

  return (
    <header
      className="sticky top-0 z-40 w-full text-white"
      style={{
        backgroundColor: '#183B2A',
        borderBottom: '1px solid rgba(229, 229, 220, 0.14)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#E7D927] flex items-center justify-center text-[#183B2A] transition-transform group-hover:scale-105">
              <Sprout size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white leading-none block">
                {t('app_title', 'AgriN')}
              </span>
              <span className="text-[11px] text-[#E5E5DC]/75 font-medium block leading-none mt-1">
                Soil Intelligence &amp; Crop Suitability
              </span>
            </div>
          </Link>

          {/* Desktop Focused Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isNavActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#E7D927] text-[#171814] font-bold'
                      : 'text-[#F7F7F2]/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-white/20 text-[#F7F7F2] hover:bg-white/10 transition-colors"
              title="Switch between Simple Farmer Mode and Advanced Mode"
            >
              <UserCheck size={14} className="text-[#E7D927]" />
              <span>{isSimpleMode ? t('mode_simple', 'Simple Mode') : t('mode_advanced', 'Advanced Mode')}</span>
            </button>

            <LanguageSelector variant="dark" />

            <Link
              to="/farm-details"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] transition-colors"
            >
              <span>Analyse My Soil</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#F7F7F2] hover:bg-white/10 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-2 bg-[#143123] border-t border-white/10">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const active = isNavActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    active ? 'bg-[#E7D927] text-[#171814] font-bold' : 'text-[#F7F7F2]/90 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 text-[#F7F7F2]"
            >
              <UserCheck size={14} className="text-[#E7D927]" />
              <span>{isSimpleMode ? 'Simple Mode' : 'Advanced Mode'}</span>
            </button>
            <Link
              to="/farm-details"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#E7D927] text-[#171814]"
            >
              <span>Analyse My Soil</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
