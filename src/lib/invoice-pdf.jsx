import React from 'react';
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', backgroundColor: '#ffffff' },
  accentBar: { height: 4, marginBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  studioName: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  studioTag: { fontSize: 7, marginTop: 3, color: '#aaaaaa' },
  invoiceLabel: { fontSize: 7, color: '#aaaaaa', textAlign: 'right' },
  invoiceNumber: { fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 2 },
  invoiceDate: { fontSize: 9, color: '#888888', textAlign: 'right', marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#eeeeee', marginBottom: 20 },
  twoCol: { flexDirection: 'row', marginBottom: 20 },
  sectionLabel: { fontSize: 7, color: '#aaaaaa', fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  smallText: { fontSize: 9, color: '#666666', marginBottom: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  tableHeaderText: { fontSize: 7, color: '#999999', fontFamily: 'Helvetica-Bold' },
  tableBodyText: { fontSize: 10 },
  badge: { fontSize: 7, fontFamily: 'Helvetica-Bold', paddingVertical: 2, paddingHorizontal: 5, borderWidth: 1 },
  badgePaid: { color: '#166534', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  badgeUnpaid: { color: '#92400e', backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  totalRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: 2, borderTopColor: '#dddddd', marginTop: 2 },
  totalLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  totalAmt: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 28, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#eeeeee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 9, color: '#888888' },
  footerBrand: { fontSize: 7, color: '#aaaaaa', fontFamily: 'Helvetica-Bold' },
});

function fmt(d, opts) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-NG', opts || { day: 'numeric', month: 'long', year: 'numeric' });
}

function InvoicePDF({ invoiceNumber, invoiceDate, studioName, accentColor, clientName, clientEmail, clientPhone, serviceName, sessionDate, depositAmount, balanceAmount, depositPaid, balancePaid, bankName, accountName, accountNumber, notes }) {
  const accent = accentColor || '#D30E15';
  const total = (depositAmount || 0) + (balanceAmount || 0);
  const totalPaid = (depositPaid ? (depositAmount || 0) : 0) + (balancePaid ? (balanceAmount || 0) : 0);
  const totalDue = total - totalPaid;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        <View style={[s.accentBar, { backgroundColor: accent }]} />

        <View style={s.header}>
          <View>
            <Text style={s.studioName}>{studioName}</Text>
            <Text style={[s.studioTag, { color: accent }]}>PHOTOGRAPHY</Text>
          </View>
          <View>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={s.invoiceDate}>{fmt(invoiceDate)}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.twoCol}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={s.sectionLabel}>BILLED TO</Text>
            <Text style={s.clientName}>{clientName}</Text>
            <Text style={s.smallText}>{clientEmail}</Text>
            {clientPhone ? <Text style={s.smallText}>{clientPhone}</Text> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionLabel}>SESSION DETAILS</Text>
            {serviceName ? <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{serviceName}</Text> : null}
            {sessionDate ? (
              <Text style={s.smallText}>{fmt(sessionDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            ) : null}
            {!serviceName && !sessionDate ? <Text style={[s.smallText, { fontStyle: 'italic' }]}>No session details</Text> : null}
          </View>
        </View>

        {/* Table header */}
        <View style={[s.tableRow, { backgroundColor: accent + '14', borderBottomWidth: 0 }]}>
          <View style={{ flex: 3 }}><Text style={s.tableHeaderText}>DESCRIPTION</Text></View>
          <View style={{ flex: 2, alignItems: 'center' }}><Text style={s.tableHeaderText}>STATUS</Text></View>
          <View style={{ flex: 2, alignItems: 'flex-end' }}><Text style={s.tableHeaderText}>AMOUNT</Text></View>
        </View>

        {(depositAmount || 0) > 0 && (
          <View style={s.tableRow}>
            <View style={{ flex: 3 }}><Text style={s.tableBodyText}>Deposit</Text></View>
            <View style={{ flex: 2, alignItems: 'center' }}>
              <Text style={[s.badge, depositPaid ? s.badgePaid : s.badgeUnpaid]}>{depositPaid ? 'PAID' : 'UNPAID'}</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'flex-end' }}>
              <Text style={s.tableBodyText}>N{(depositAmount || 0).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {(balanceAmount || 0) > 0 && (
          <View style={s.tableRow}>
            <View style={{ flex: 3 }}><Text style={s.tableBodyText}>Balance</Text></View>
            <View style={{ flex: 2, alignItems: 'center' }}>
              <Text style={[s.badge, balancePaid ? s.badgePaid : s.badgeUnpaid]}>{balancePaid ? 'PAID' : 'UNPAID'}</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'flex-end' }}>
              <Text style={s.tableBodyText}>N{(balanceAmount || 0).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {totalPaid > 0 && totalPaid < total && (
          <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 }}>
            <View style={{ flex: 5, alignItems: 'flex-end' }}><Text style={{ fontSize: 9, color: '#aaaaaa' }}>Amount Paid</Text></View>
            <View style={{ flex: 2, alignItems: 'flex-end' }}><Text style={{ fontSize: 9, color: '#aaaaaa' }}>N{totalPaid.toLocaleString()}</Text></View>
          </View>
        )}

        <View style={s.totalRow}>
          <View style={{ flex: 3, alignItems: 'flex-end' }}>
            <Text style={s.totalLabel}>{totalDue > 0 ? 'BALANCE DUE' : 'TOTAL'}</Text>
          </View>
          <View style={{ flex: 2, alignItems: 'flex-end' }}>
            <Text style={[s.totalAmt, { color: totalDue > 0 ? accent : '#16a34a' }]}>
              N{(totalDue > 0 ? totalDue : total).toLocaleString()}
            </Text>
          </View>
        </View>

        {(bankName || accountNumber || notes) ? (
          <View style={{ flexDirection: 'row', marginTop: 24 }}>
            {(bankName || accountNumber) ? (
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={s.sectionLabel}>PAYMENT DETAILS</Text>
                {bankName ? <Text style={s.smallText}>Bank: <Text style={{ color: '#1a1a1a', fontFamily: 'Helvetica-Bold' }}>{bankName}</Text></Text> : null}
                {accountName ? <Text style={s.smallText}>Account Name: <Text style={{ color: '#1a1a1a', fontFamily: 'Helvetica-Bold' }}>{accountName}</Text></Text> : null}
                {accountNumber ? <Text style={s.smallText}>Account No: <Text style={{ color: '#1a1a1a', fontFamily: 'Helvetica-Bold' }}>{accountNumber}</Text></Text> : null}
              </View>
            ) : null}
            {notes ? (
              <View style={{ flex: 1 }}>
                <Text style={s.sectionLabel}>NOTES</Text>
                <Text style={s.smallText}>{notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={s.footer}>
          <Text style={s.footerText}>
            Thank you for choosing <Text style={{ color: '#1a1a1a', fontFamily: 'Helvetica-Bold' }}>{studioName}</Text>.
          </Text>
          <Text style={s.footerBrand}>POWERED BY PHOTOSTUDIO.NG</Text>
        </View>

      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(data) {
  return renderToBuffer(<InvoicePDF {...data} />);
}
