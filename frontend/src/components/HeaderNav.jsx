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
                style={{
                  position: 'sticky', top: 0, zIndex: 40, width: '100%',
                  backgroundColor: '#183B2A',
                  borderBottom: '1px solid rgba(229, 229, 220, 0.14)',
                  fontFamily: "'Manrope','Inter',system-ui,sans-serif",
                }}
              >
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    {/* Brand Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E7D927', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#183B2A', flexShrink: 0 }}>
                        <Sprout size={19} strokeWidth={2.5} />
                      </div>
                      <div style={{ lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.4px', color: '#fff', display: 'block' }}>
                          {t('app_title', 'AgriN')}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(229,229,220,0.7)', display: 'block', marginTop: 1 }}>
                          Soil Intelligence &amp; Crop Suitability
                        </span>
                      </div>
                    </Link>

                    {/* Desktop Focused Navigation */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="agrin-desktop-nav" aria-label="Main navigation">
                      {navItems.map((item) => {
                        const active = isNavActive(item)
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '7px 13px', borderRadius: 8,
                              fontSize: 12, fontWeight: active ? 800 : 600,
                              textDecoration: 'none', whiteSpace: 'nowrap',
                              transition: 'background .15s, color .15s',
                              background: active ? '#E7D927' : 'transparent',
                              color: active ? '#171814' : 'rgba(247,247,242,0.85)',
                            }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff' }}}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(247,247,242,0.85)' }}}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </nav>

                    {/* Right Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={toggleMode}
                        title="Switch between Simple Farmer Mode and Advanced Mode"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(247,247,242,0.9)', cursor: 'pointer', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        className="agrin-desktop-nav"
                      >
                        <UserCheck size={13} style={{ color: '#E7D927' }} />
                        <span>{isSimpleMode ? t('mode_simple', 'Simple Mode') : t('mode_advanced', 'Advanced Mode')}</span>
                      </button>

                      <LanguageSelector variant="dark" />

                      <Link
                        to="/farm-details"
                        className="btn-agrin-cta agrin-desktop-nav"
                        style={{ fontSize: 12, padding: '7px 16px' }}
                      >
                        <span>Analyse My Soil</span>
                        <ArrowRight size={13} />
                      </Link>

                      <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,247,242,0.9)', transition: 'background .15s' }}
                        className="agrin-hamburger"
                        aria-label="Toggle navigation menu"
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='none'}
                      >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ padding: '12px 20px 20px', background: '#122D1F', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const active = isNavActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: active ? 800 : 600,
                    textDecoration: 'none',
                    background: active ? '#E7D927' : 'transparent',
                    color: active ? '#171814' : 'rgba(247,247,242,0.9)',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button
              onClick={toggleMode}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.1)', color: 'rgba(247,247,242,0.9)', border: 'none', cursor: 'pointer' }}
            >
              <UserCheck size={13} style={{ color: '#E7D927' }} />
              <span>{isSimpleMode ? 'Simple Mode' : 'Advanced Mode'}</span>
            </button>
            <Link
              to="/farm-details"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-agrin-cta"
              style={{ fontSize: 12, padding: '8px 18px' }}
            >
              <span>Analyse My Soil</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
          </header>
          )
}
