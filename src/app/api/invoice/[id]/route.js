import { createElement as h } from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createServerSupabase } from '@/lib/supabase';

const WHITE = '#FFFFFF';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#F9FAFB';
const GREEN = '#16a34a';
const AMBER = '#92400E';

const s = StyleSheet.create({
  page: { backgroundColor: WHITE, paddingBottom: 40, fontFamily: 'Helvetica' },
  topBar: { height: 6 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 44, paddingTop: 28, paddingBottom: 24,
  },
  studioName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: DARK },
  studioTag: { fontSize: 7, letterSpacing: 2, marginTop: 3 },
  invoiceLabel: { fontSize: 8, letterSpacing: 3, color: MUTED, marginBottom: 4, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  invoiceNumber: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right' },
  invoiceDate: { fontSize: 9, color: MUTED, marginTop: 4, textAlign: 'right' },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginHorizontal: 44 },
  grid: { flexDirection: 'row', paddingHorizontal: 44, paddingVertical: 24, gap: 32 },
  col: { flex: 1 },
  sectionLabel: { fontSize: 7.5, letterSpacing: 2.5, fontFamily: 'Helvetica-Bold', color: MUTED, marginBottom: 10 },
  fieldBold: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 3 },
  field: { fontSize: 9, color: MUTED, marginBottom: 3 },
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: 44, paddingVertical: 10 },
  tableHeaderText: { fontSize: 8, letterSpacing: 2, fontFamily: 'Helvetica-Bold', color: MUTED },
  tableRow: { flexDirection: 'row', paddingHorizontal: 44, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: BORDER },
  colDesc: { flex: 3 },
  colStatus: { flex: 2, alignItems: 'center' },
  colAmount: { flex: 2, alignItems: 'flex-end' },
  rowText: { fontSize: 10, color: DARK },
  rowAmount: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },
  badgePaid: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: GREEN, backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 3 },
  badgeUnpaid: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AMBER, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 3 },
  subtotalRow: { flexDirection: 'row', paddingHorizontal: 44, paddingTop: 12, paddingBottom: 4 },
  subtotalLabel: { flex: 5, fontSize: 8.5, color: MUTED, textAlign: 'right', paddingRight: 16 },
  subtotalAmount: { flex: 2, fontSize: 9, color: MUTED, textAlign: 'right' },
  totalRow: { flexDirection: 'row', paddingHorizontal: 44, paddingTop: 8, paddingBottom: 4 },
  totalLabel: { flex: 5, fontSize: 8.5, letterSpacing: 2, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right', paddingRight: 16 },
  totalAmount: { flex: 2, fontSize: 20, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 44, paddingVertical: 18,
    borderTopWidth: 1, borderTopColor: BORDER,
    marginTop: 24,
  },
  footerLeft: { fontSize: 9, color: MUTED },
  footerBold: { fontFamily: 'Helvetica-Bold', color: DARK },
  footerRight: { fontSize: 7.5, letterSpacing: 2, color: MUTED, textAlign: 'right' },
  footerAccent: { fontFamily: 'Helvetica-Bold' },
});

function Row(label, statusPaid, amount, accent) {
  return h(View, { style: s.tableRow },
    h(View, { style: s.colDesc }, h(Text, { style: s.rowText }, label)),
    h(View, { style: s.colStatus },
      h(Text, { style: statusPaid ? s.badgePaid : s.badgeUnpaid }, statusPaid ? '✓ Paid' : 'Unpaid'),
    ),
    h(View, { style: s.colAmount }, h(Text, { style: s.rowAmount }, `NGN ${Number(amount).toLocaleString('en-NG')}`)),
  );
}

function buildPdf({ booking, studio, invoiceNumber, depositPaid, balancePaid }) {
  const accent = studio.accent_color || '#D30E15';
  const total = Number(booking.deposit_amount) + Number(booking.balance_amount);
  const totalPaid = (depositPaid ? Number(booking.deposit_amount) : 0) + (balancePaid ? Number(booking.balance_amount) : 0);
  const totalDue = total - totalPaid;
  const dueColor = totalDue > 0 ? accent : GREEN;

  const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const sessionDate = booking.session_date
    ? new Date(booking.session_date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const showPaymentDetails = studio.paystack_bank_name || studio.paystack_account_number;

  return h(Document, { title: invoiceNumber, author: studio.name },
    h(Page, { size: 'A4', style: s.page },

      h(View, { style: { ...s.topBar, backgroundColor: accent } }),

      h(View, { style: s.headerRow },
        h(View, {},
          h(Text, { style: s.studioName }, studio.name),
          h(Text, { style: { ...s.studioTag, color: accent } }, 'PHOTOGRAPHY'),
        ),
        h(View, {},
          h(Text, { style: s.invoiceLabel }, 'INVOICE'),
          h(Text, { style: s.invoiceNumber }, invoiceNumber),
          h(Text, { style: s.invoiceDate }, invoiceDate),
        ),
      ),

      h(View, { style: s.divider }),

      h(View, { style: s.grid },
        h(View, { style: s.col },
          h(Text, { style: s.sectionLabel }, 'BILLED TO'),
          h(Text, { style: s.fieldBold }, booking.client_name),
          booking.client_email && h(Text, { style: s.field }, booking.client_email),
          booking.client_phone && h(Text, { style: s.field }, booking.client_phone),
        ),
        h(View, { style: s.col },
          h(Text, { style: s.sectionLabel }, 'SESSION DETAILS'),
          booking.services?.title && h(Text, { style: s.fieldBold }, booking.services.title),
          sessionDate && h(Text, { style: s.field }, sessionDate),
          !booking.services?.title && !sessionDate && h(Text, { style: { ...s.field, fontStyle: 'italic' } }, 'No session details'),
        ),
      ),

      h(View, { style: s.divider }),

      h(View, { style: { ...s.tableHeaderRow, backgroundColor: accent + '18' } },
        h(View, { style: s.colDesc }, h(Text, { style: s.tableHeaderText }, 'DESCRIPTION')),
        h(View, { style: s.colStatus }, h(Text, { style: s.tableHeaderText }, 'STATUS')),
        h(View, { style: s.colAmount }, h(Text, { style: s.tableHeaderText }, 'AMOUNT')),
      ),

      Number(booking.deposit_amount) > 0 && Row('Deposit', depositPaid, booking.deposit_amount, accent),
      Number(booking.balance_amount) > 0 && Row('Balance', balancePaid, booking.balance_amount, accent),

      totalPaid > 0 && totalPaid < total && h(View, { style: s.subtotalRow },
        h(Text, { style: s.subtotalLabel }, 'Amount Paid'),
        h(Text, { style: s.subtotalAmount }, `NGN ${totalPaid.toLocaleString('en-NG')}`),
      ),

      h(View, { style: s.totalRow },
        h(Text, { style: s.totalLabel }, totalDue > 0 ? 'BALANCE DUE' : 'TOTAL'),
        h(Text, { style: { ...s.totalAmount, color: dueColor } }, `NGN ${(totalDue > 0 ? totalDue : total).toLocaleString('en-NG')}`),
      ),

      (showPaymentDetails || booking.notes) && h(View, { style: { ...s.divider, marginTop: 20 } }),
      (showPaymentDetails || booking.notes) && h(View, { style: s.grid },
        showPaymentDetails && h(View, { style: s.col },
          h(Text, { style: s.sectionLabel }, 'PAYMENT DETAILS'),
          studio.paystack_bank_name && h(Text, { style: s.field }, `Bank: ${studio.paystack_bank_name}`),
          studio.paystack_account_name && h(Text, { style: s.field }, `Account Name: ${studio.paystack_account_name}`),
          studio.paystack_account_number && h(Text, { style: s.field }, `Account Number: ${studio.paystack_account_number}`),
        ),
        booking.notes && h(View, { style: s.col },
          h(Text, { style: s.sectionLabel }, 'NOTES'),
          h(Text, { style: { ...s.field, lineHeight: 1.6 } }, booking.notes),
        ),
      ),

      h(View, { style: s.footer },
        h(Text, { style: s.footerLeft },
          'Thank you for choosing ',
          h(Text, { style: s.footerBold }, studio.name),
          '.',
        ),
        h(Text, { style: { ...s.footerRight, color: MUTED } },
          'Powered by ',
          h(Text, { style: { ...s.footerAccent, color: accent } }, 'photostudio.ng'),
        ),
      ),
    ),
  );
}

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, email, phone, accent_color, paystack_bank_name, paystack_account_number, paystack_account_name')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return new Response('Not found', { status: 404 });

  const [{ data: booking }, { data: payments }] = await Promise.all([
    supabase.from('bookings').select('*, services(title)').eq('id', id).eq('studio_id', studio.id).single(),
    supabase.from('payments').select('type, status').eq('booking_id', id),
  ]);
  if (!booking) return new Response('Not found', { status: 404 });

  const depositPaid = !!payments?.find(p => p.type === 'deposit' && p.status === 'paid') || booking.deposit_paid;
  const balancePaid = !!payments?.find(p => p.type === 'balance' && p.status === 'paid') || booking.balance_paid;
  const invoiceNumber = `INV-${new Date(booking.created_at).getFullYear()}-${id.slice(0, 6).toUpperCase()}`;

  const doc = buildPdf({ booking, studio, invoiceNumber, depositPaid, balancePaid });
  const buf = await renderToBuffer(doc);

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
    },
  });
}
