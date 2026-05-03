'use client';

import { useState, useMemo } from 'react';

const STATUS_VARIANT = {
  paid:    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  failed:  { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-600'   },
};

function fmtDate(p) {
  const d = p.paid_at || p.created_at;
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PaymentsClient({ payments, studio }) {
  const accent = studio.accent_color || '#D30E15';

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [typeFilter, setType]       = useState('all');
  const [sortBy, setSort]           = useState('date_desc');
  const [exporting, setExporting]   = useState(null);

  const filtered = useMemo(() => {
    let list = [...payments];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.bookings?.client_name?.toLowerCase().includes(q) ||
        p.bookings?.client_email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (typeFilter   !== 'all') list = list.filter(p => p.type   === typeFilter);
    list.sort((a, b) => {
      if (sortBy === 'date_desc')    return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date_asc')     return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'amount_desc')  return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount_asc')   return Number(a.amount) - Number(b.amount);
      if (sortBy === 'client_az')    return (a.bookings?.client_name || '').localeCompare(b.bookings?.client_name || '');
      return 0;
    });
    return list;
  }, [payments, search, statusFilter, typeFilter, sortBy]);

  const collected = filtered.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pending   = filtered.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const failed    = filtered.filter(p => p.status === 'failed').length;

  async function downloadExcel() {
    setExporting('excel');
    try {
      const XLSX = await import('xlsx');
      const rows = filtered.map((p, i) => ({
        '#': i + 1,
        Client:  p.bookings?.client_name  || '—',
        Email:   p.bookings?.client_email || '—',
        Type:    p.type.charAt(0).toUpperCase() + p.type.slice(1),
        'Amount (₦)': Number(p.amount),
        Status:  p.status.charAt(0).toUpperCase() + p.status.slice(1),
        Date:    fmtDate(p),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 16 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');
      XLSX.writeFile(wb, `${studio.name.replace(/\s+/g, '-')}-payments.xlsx`);
    } finally {
      setExporting(null);
    }
  }

  async function downloadPDF() {
    setExporting('pdf');
    try {
      const { Document, Page, View, Text, StyleSheet, pdf } = await import('@react-pdf/renderer');

      const s = StyleSheet.create({
        page:         { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', backgroundColor: '#fff' },
        accentBar:    { height: 4, backgroundColor: accent, marginBottom: 24 },
        headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 },
        studioName:   { fontSize: 18, fontFamily: 'Helvetica-Bold' },
        reportTitle:  { fontSize: 8, color: accent, fontFamily: 'Helvetica-Bold', marginTop: 3 },
        brand:        { fontSize: 7, color: '#aaaaaa', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
        brandAccent:  { color: accent },
        genDate:      { fontSize: 8, color: '#888888', textAlign: 'right', marginTop: 2 },
        divider:      { borderBottomWidth: 1, borderBottomColor: '#eeeeee', marginVertical: 16 },
        summaryRow:   { flexDirection: 'row', gap: 12, marginBottom: 20 },
        summaryBox:   { flex: 1, borderWidth: 1, borderColor: '#eeeeee', padding: 10 },
        summaryLabel: { fontSize: 7, color: '#aaaaaa', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
        summaryVal:   { fontSize: 14, fontFamily: 'Helvetica-Bold' },
        filterNote:   { fontSize: 8, color: '#888888', marginBottom: 16 },
        thRow:        { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: accent + '14' },
        thText:       { fontSize: 7, color: '#888888', fontFamily: 'Helvetica-Bold' },
        tdRow:        { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
        tdText:       { fontSize: 9, color: '#1a1a1a' },
        tdSub:        { fontSize: 8, color: '#888888', marginTop: 1 },
        badgePaid:    { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#166534', backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', paddingVertical: 2, paddingHorizontal: 5 },
        badgePending: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#92400e', backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', paddingVertical: 2, paddingHorizontal: 5 },
        badgeFailed:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#991b1b', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 2, paddingHorizontal: 5 },
        footer:       { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eeeeee', paddingTop: 10 },
        footerLeft:   { fontSize: 8, color: '#aaaaaa' },
        footerRight:  { fontSize: 7, color: '#aaaaaa', fontFamily: 'Helvetica-Bold' },
      });

      const badgeStyle = { paid: s.badgePaid, pending: s.badgePending, failed: s.badgeFailed };

      const filterDesc = [
        statusFilter !== 'all' ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All statuses',
        typeFilter   !== 'all' ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + ' only' : 'All types',
        `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`,
      ].join(' · ');

      const genDate = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

      const element = (
        <Document>
          <Page size="A4" style={s.page}>
            <View style={s.accentBar} />

            <View style={s.headerRow}>
              <View>
                <Text style={s.studioName}>{studio.name}</Text>
                <Text style={s.reportTitle}>PAYMENTS REPORT</Text>
              </View>
              <View>
                <Text style={s.brand}>Powered by <Text style={s.brandAccent}>photostudio.ng</Text></Text>
                <Text style={s.genDate}>Generated {genDate}</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.summaryRow}>
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>COLLECTED</Text>
                <Text style={[s.summaryVal, { color: '#166534' }]}>N{collected.toLocaleString()}</Text>
              </View>
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>PENDING</Text>
                <Text style={[s.summaryVal, { color: '#92400e' }]}>N{pending.toLocaleString()}</Text>
              </View>
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>FAILED</Text>
                <Text style={[s.summaryVal, { color: '#991b1b' }]}>{failed}</Text>
              </View>
            </View>

            <Text style={s.filterNote}>{filterDesc}</Text>

            {/* Table */}
            <View style={s.thRow}>
              <View style={{ flex: 3 }}><Text style={s.thText}>CLIENT</Text></View>
              <View style={{ flex: 2 }}><Text style={s.thText}>TYPE</Text></View>
              <View style={{ flex: 2, alignItems: 'flex-end' }}><Text style={s.thText}>AMOUNT</Text></View>
              <View style={{ flex: 2, alignItems: 'center' }}><Text style={s.thText}>STATUS</Text></View>
              <View style={{ flex: 2, alignItems: 'flex-end' }}><Text style={s.thText}>DATE</Text></View>
            </View>

            {filtered.map((p) => (
              <View key={p.id} style={s.tdRow}>
                <View style={{ flex: 3 }}>
                  <Text style={s.tdText}>{p.bookings?.client_name || '—'}</Text>
                  <Text style={s.tdSub}>{p.bookings?.client_email || ''}</Text>
                </View>
                <View style={{ flex: 2, justifyContent: 'center' }}>
                  <Text style={s.tdText}>{p.type.charAt(0).toUpperCase() + p.type.slice(1)}</Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={[s.tdText, { fontFamily: 'Helvetica-Bold' }]}>N{Number(p.amount).toLocaleString()}</Text>
                </View>
                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={badgeStyle[p.status] || s.badgePending}>
                    {p.status.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={s.tdText}>{fmtDate(p)}</Text>
                </View>
              </View>
            ))}

            <View style={s.footer} fixed>
              <Text style={s.footerLeft}>{studio.name} · Payments Report</Text>
              <Text style={s.footerRight}>photostudio.ng</Text>
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(element).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${studio.name.replace(/\s+/g, '-')}-payments.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  const selectClass = 'border border-gray-200 px-3 py-2 text-xs text-black bg-white focus:outline-none focus:border-gray-400 appearance-none pr-7 cursor-pointer';

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 px-3 sm:px-5 py-4 sm:py-5">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Collected</p>
          <p className="text-sm sm:text-2xl font-serif text-green-600 leading-snug">₦{collected.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 px-3 sm:px-5 py-4 sm:py-5">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Pending</p>
          <p className="text-sm sm:text-2xl font-serif text-amber-600 leading-snug">₦{pending.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 px-3 sm:px-5 py-4 sm:py-5">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Failed</p>
          <p className="text-sm sm:text-2xl font-serif text-red-500 leading-snug">{failed}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-gray-400 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="relative">
          <select value={typeFilter} onChange={e => setType(e.target.value)} className={selectClass}>
            <option value="all">All types</option>
            <option value="deposit">Deposit</option>
            <option value="balance">Balance</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="relative">
          <select value={sortBy} onChange={e => setSort(e.target.value)} className={selectClass}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Amount ↓</option>
            <option value="amount_asc">Amount ↑</option>
            <option value="client_az">Client A–Z</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Spacer */}
        <div className="hidden sm:block w-px h-6 bg-gray-200" />

        {/* Export */}
        <button
          onClick={downloadExcel}
          disabled={!!exporting || filtered.length === 0}
          className="px-4 py-2 border border-gray-300 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting === 'excel' ? 'Exporting…' : '↓ Excel'}
        </button>
        <button
          onClick={downloadPDF}
          disabled={!!exporting || filtered.length === 0}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: accent }}
        >
          {exporting === 'pdf' ? 'Generating…' : '↓ PDF'}
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-neutral-gray italic">No payments match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {['Client', 'Type', 'Amount', 'Status', 'Date'].map(h => (
              <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">{h}</p>
            ))}
          </div>

          {filtered.map((p, i) => {
            const v = STATUS_VARIANT[p.status] ?? STATUS_VARIANT.pending;
            return (
              <div key={p.id} className={i < filtered.length - 1 ? 'border-b border-gray-50' : ''}>
                {/* Mobile */}
                <div className="md:hidden px-4 py-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">{p.bookings?.client_name ?? '—'}</p>
                      <p className="text-xs text-neutral-gray truncate">{p.bookings?.client_email ?? ''}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border flex-shrink-0 ${v.bg} ${v.border} ${v.text}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-gray">
                    <span className="capitalize">{p.type}</span>
                    <span className="font-medium text-black">₦{Number(p.amount).toLocaleString()}</span>
                    <span>{fmtDate(p)}</span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-5 px-6 py-5 gap-2 items-center">
                  <div>
                    <p className="text-sm font-medium text-black">{p.bookings?.client_name ?? '—'}</p>
                    <p className="text-xs text-neutral-gray truncate">{p.bookings?.client_email ?? ''}</p>
                  </div>
                  <p className="text-sm text-neutral-gray capitalize">{p.type}</p>
                  <p className="text-sm font-medium text-black">₦{Number(p.amount).toLocaleString()}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border w-fit ${v.bg} ${v.border} ${v.text}`}>
                    {p.status}
                  </span>
                  <p className="text-sm text-neutral-gray">{fmtDate(p)}</p>
                </div>
              </div>
            );
          })}

          <div className="px-6 py-3 border-t border-gray-50 text-right">
            <p className="text-[10px] text-neutral-gray">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              {filtered.length !== payments.length ? ` (filtered from ${payments.length})` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
