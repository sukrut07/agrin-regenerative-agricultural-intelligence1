import React, { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import { useUserMode } from '../context/UserModeContext'
import {
  getFarmExpenses,
  addFarmExpense,
  getFarmSales,
  recordFarmSale,
  getFarmPnL
} from '../services/api'
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Calendar,
  PieChart, Tag, ArrowUpRight, ArrowDownRight, Wallet,
  Receipt, ShoppingBag, Volume2, X, CheckCircle2, ShieldAlert
} from 'lucide-react'

export default function FarmEconomics() {
  const { t, currentLanguage } = useLanguage()
  const { isSimpleMode, speakText } = useUserMode()

  // Selected farm / field identifier
  const [selectedFarmId, setSelectedFarmId] = useState('farm_default')

  // Data states
  const [pnl, setPnl] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('EXPENSES') // 'EXPENSES' | 'SALES'

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    category: 'SEEDS',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paid_to: ''
  })
  const [expenseSubmitting, setExpenseSubmitting] = useState(false)

  const [saleForm, setSaleForm] = useState({
    crop_name: 'Soybean (JS-335)',
    quantity_quintals: '',
    price_per_quintal: '4450',
    total_amount: '',
    buyer_name: 'APMC Parbhani Mandi',
    date: new Date().toISOString().split('T')[0],
    payment_status: 'PAID'
  })
  const [saleSubmitting, setSaleSubmitting] = useState(false)

  // Load all farm economics
  const loadData = async () => {
    setLoading(true)
    try {
      const [pnlRes, expRes, salesRes] = await Promise.all([
        getFarmPnL(selectedFarmId),
        getFarmExpenses(selectedFarmId),
        getFarmSales(selectedFarmId)
      ])
      setPnl(pnlRes)
      setExpenses(Array.isArray(expRes) ? expRes : [])
      setSales(Array.isArray(salesRes) ? salesRes : [])
    } catch (err) {
      console.error('Failed to load farm economics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedFarmId])

  // Handle Add Expense
  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault()
    setExpenseSubmitting(true)
    try {
      await addFarmExpense({
        farm_id: selectedFarmId,
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount) || 0,
        description: expenseForm.description,
        date: expenseForm.date,
        paid_to: expenseForm.paid_to || null
      })
      setShowExpenseModal(false)
      setExpenseForm({
        category: 'SEEDS',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paid_to: ''
      })
      loadData()
    } catch (err) {
      console.error('Failed to add expense:', err)
      alert('Error recording expense.')
    } finally {
      setExpenseSubmitting(false)
    }
  }

  // Handle Record Sale
  const handleRecordSaleSubmit = async (e) => {
    e.preventDefault()
    setSaleSubmitting(true)
    try {
      const qty = parseFloat(saleForm.quantity_quintals) || 0
      const rate = parseFloat(saleForm.price_per_quintal) || 0
      const total = parseFloat(saleForm.total_amount) || (qty * rate)

      await recordFarmSale({
        farm_id: selectedFarmId,
        crop_name: saleForm.crop_name,
        quantity_quintals: qty,
        price_per_quintal: rate,
        total_amount: total,
        buyer_name: saleForm.buyer_name,
        date: saleForm.date,
        payment_status: saleForm.payment_status
      })
      setShowSaleModal(false)
      setSaleForm({
        crop_name: 'Soybean (JS-335)',
        quantity_quintals: '',
        price_per_quintal: '4450',
        total_amount: '',
        buyer_name: 'APMC Parbhani Mandi',
        date: new Date().toISOString().split('T')[0],
        payment_status: 'PAID'
      })
      loadData()
    } catch (err) {
      console.error('Failed to record sale:', err)
      alert('Error recording harvest sale.')
    } finally {
      setSaleSubmitting(false)
    }
  }

  // Voice narration helper
  const handleVoiceOverview = () => {
    if (!pnl) return
    const text = currentLanguage === 'mr'
      ? `तुमच्या शेतात एकूण खर्च ₹${pnl.total_expenses.toLocaleString('en-IN')} आणि एकूण विक्री ₹${pnl.total_revenue.toLocaleString('en-IN')} झाली आहे. निव्वळ नफा ₹${pnl.net_profit.toLocaleString('en-IN')} आहे.`
      : currentLanguage === 'hi'
      ? `आपके खेत का कुल खर्च ₹${pnl.total_expenses.toLocaleString('en-IN')} और कुल बिक्री ₹${pnl.total_revenue.toLocaleString('en-IN')} है। शुद्ध मुनाफा ₹${pnl.net_profit.toLocaleString('en-IN')} है।`
      : `Your farm recorded ₹${pnl.total_expenses.toLocaleString('en-IN')} in expenses and ₹${pnl.total_revenue.toLocaleString('en-IN')} in harvest sales, yielding a net profit of ₹${pnl.net_profit.toLocaleString('en-IN')} with a ${pnl.profit_margin_pct}% margin.`
    const langCode = currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-US'
    speakText(text, langCode)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />

      {/* Top Banner */}
      <section className="bg-[#183B2A] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#E5E5DC]/15">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7D927] text-xs font-semibold mb-2 border border-white/15">
              <Wallet size={14} />
              <span>{t('nav_economics', 'AgriLedger — Farm P&L Accounting')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('economics_title', 'AgriLedger — Farm Economics & P&L')}
            </h1>
            <p className="text-[#F7F7F2]/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Track real cost of cultivation (seeds, fertilizers, diesel, labor) against harvest sales to maximize farm operating margin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleVoiceOverview}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#E7D927] text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              title="Voice summary"
            >
              <Volume2 size={16} />
              <span>{isSimpleMode ? 'हिशोब ऐका (Listen)' : 'Voice Summary'}</span>
            </button>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>{t('btn_add_expense', 'Add Expense')}</span>
            </button>

            <button
              onClick={() => setShowSaleModal(true)}
              className="px-4 py-2 rounded-full bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>{t('btn_record_sale', 'Record Sale')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Ledger Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading || !pnl ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Calculating farm economics...
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Gross Revenue */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                  <span>{t('total_revenue', 'Gross Harvest Revenue')}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{pnl.total_revenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  From {sales.length} harvest sale records
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                  <span>{t('total_expenses', 'Total Cultivation Cost')}</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                    <ArrowDownRight size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{pnl.total_expenses.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-rose-700 font-semibold mt-1">
                  Across {expenses.length} input expense logs
                </div>
              </div>

              {/* Net Profit */}
              <div className={`rounded-2xl p-5 shadow-sm border ${
                pnl.net_profit >= 0
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="flex items-center justify-between text-slate-600 text-xs font-bold mb-2">
                  <span>{t('net_profit', 'Net Farm Profit')}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    pnl.net_profit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {pnl.net_profit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                </div>
                <div className={`text-2xl font-black ${
                  pnl.net_profit >= 0 ? 'text-emerald-950' : 'text-rose-950'
                }`}>
                  ₹{pnl.net_profit.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">
                  Profit Margin: <span className="font-black text-emerald-800">{pnl.profit_margin_pct}%</span>
                </div>
              </div>

              {/* Cost per Hectare */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                  <span>{t('cost_per_ha', 'Cost per Hectare')}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Receipt size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{pnl.cost_per_hectare.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ha</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Based on 2.4 ha operated holding
                </div>
              </div>
            </div>

            {/* Category Expense Breakdown */}
            {pnl.category_breakdown && Object.keys(pnl.category_breakdown).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <PieChart size={14} className="text-emerald-600" />
                  <span>Cost of Cultivation Breakdown by Input</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(pnl.category_breakdown).map(([cat, amt]) => {
                    const pct = pnl.total_expenses > 0 ? Math.round((amt / pnl.total_expenses) * 100) : 0
                    return (
                      <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-extrabold text-slate-700 uppercase text-[10px] truncate mb-1">
                          {cat.replace('_', ' ')}
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          ₹{amt.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 mt-1">
                          {pct}% of cost
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Transactions Switcher */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 pt-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('EXPENSES')}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'EXPENSES'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Expenses Ledger ({expenses.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('SALES')}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'SALES'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Harvest Sales Ledger ({sales.length})
                  </button>
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto">
                {activeTab === 'EXPENSES' ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Date</th>
                        <th className="py-3 px-5">Category</th>
                        <th className="py-3 px-5">Description</th>
                        <th className="py-3 px-5">Paid To</th>
                        <th className="py-3 px-5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No expenses recorded yet. Click "Add Expense" to start tracking.
                          </td>
                        </tr>
                      ) : (
                        expenses.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-5 font-semibold text-slate-600">{e.date}</td>
                            <td className="py-3.5 px-5">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {e.category.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 font-bold text-slate-800">{e.description}</td>
                            <td className="py-3.5 px-5 text-slate-500">{e.paid_to || '—'}</td>
                            <td className="py-3.5 px-5 text-right font-black text-rose-700">
                              -₹{e.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Date</th>
                        <th className="py-3 px-5">Crop Name</th>
                        <th className="py-3 px-5">Quantity (Qtl)</th>
                        <th className="py-3 px-5">Rate / Qtl</th>
                        <th className="py-3 px-5">Buyer</th>
                        <th className="py-3 px-5 text-right">Total Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No harvest sales recorded yet. Click "Record Sale" to add your Mandi receipt.
                          </td>
                        </tr>
                      ) : (
                        sales.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-5 font-semibold text-slate-600">{s.date}</td>
                            <td className="py-3.5 px-5 font-extrabold text-emerald-950">{s.crop_name}</td>
                            <td className="py-3.5 px-5 font-bold text-slate-800">{s.quantity_quintals} Qtl</td>
                            <td className="py-3.5 px-5 text-slate-600">₹{s.price_per_quintal}/Qtl</td>
                            <td className="py-3.5 px-5 text-slate-500">{s.buyer_name || 'APMC'}</td>
                            <td className="py-3.5 px-5 text-right font-black text-emerald-700">
                              +₹{s.total_amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt size={18} className="text-rose-600" />
                <span>{t('btn_add_expense', 'Add Expense')}</span>
              </h2>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="SEEDS">Seeds & Planting Material</option>
                  <option value="FERTILIZERS">Fertilizers & Bio-Inputs</option>
                  <option value="SOIL_AMENDMENTS">Soil Amendments (Gypsum/Lime)</option>
                  <option value="MACHINERY_RENTAL">Machinery & Tractor Rental</option>
                  <option value="LABOR">Farm Labor & Weeding</option>
                  <option value="IRRIGATION">Irrigation & Power/Diesel</option>
                  <option value="PESTICIDES">Plant Protection (Bio-pesticides)</option>
                  <option value="OTHER">Other Farm Overhead</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Item Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 kg Agricultural Gypsum from Krishi Seva Kendra"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid To / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Krishi Seva Kendra"
                    value={expenseForm.paid_to}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paid_to: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {expenseSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                <span>{t('btn_record_sale', 'Record Harvest Sale')}</span>
              </h2>
              <button
                onClick={() => setShowSaleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Sold</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soybean (JS-335) / Cotton"
                  value={saleForm.crop_name}
                  onChange={(e) => setSaleForm({ ...saleForm, crop_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 25"
                    value={saleForm.quantity_quintals}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0
                      const rate = parseFloat(saleForm.price_per_quintal) || 0
                      setSaleForm({
                        ...saleForm,
                        quantity_quintals: e.target.value,
                        total_amount: qty && rate ? (qty * rate).toString() : saleForm.total_amount
                      })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate per Quintal (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4450"
                    value={saleForm.price_per_quintal}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0
                      const qty = parseFloat(saleForm.quantity_quintals) || 0
                      setSaleForm({
                        ...saleForm,
                        price_per_quintal: e.target.value,
                        total_amount: qty && rate ? (qty * rate).toString() : saleForm.total_amount
                      })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Revenue Received (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 111250"
                  value={saleForm.total_amount}
                  onChange={(e) => setSaleForm({ ...saleForm, total_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Buyer / APMC Mandi</label>
                  <input
                    type="text"
                    placeholder="e.g. Parbhani APMC"
                    value={saleForm.buyer_name}
                    onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saleSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {saleSubmitting ? 'Recording...' : 'Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
