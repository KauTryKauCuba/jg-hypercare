import type { CommissionRequest, ReferralState } from '../store/referralStore';
import { formatDate, formatRM, getReferredCompanies, purchaseLinesOf } from './referrals';

export type StatementLine = {
  lineId: string;
  company: string;
  companyNote?: string;
  purchased: string;
  priceDetail: string;
  spending: number;
  commission: number;
};

export const statementLinesFor = (
  companyId: string,
  referral: ReferralState,
  request: CommissionRequest,
): StatementLine[] => {
  const details = getReferredCompanies(companyId, referral);
  return (request.items ?? []).map((item) => {
    const detail = details.find((d) => d.name === item.name);
    const line = detail ? purchaseLinesOf(detail, referral).find((l) => l.id === item.lineId) : undefined;
    return {
      lineId: item.lineId,
      company: item.name,
      companyNote: line
        ? `${line.kind === 'plan' ? 'Joined' : 'Bought'} ${line.date}${detail ? ` · code ${detail.codeUsed}` : ''}`
        : undefined,
      purchased: item.label,
      priceDetail: line?.detail ?? '-',
      spending: line?.amount ?? 0,
      commission: item.amount,
    };
  });
};

export type StatementInput = {
  employerName: string;
  referralCode: string | null;
  request: CommissionRequest;
  lines: StatementLine[];
};

const TEAL: [number, number, number] = [0, 137, 144];
const DARK: [number, number, number] = [20, 27, 46];
const MUTED: [number, number, number] = [100, 116, 139];

async function buildStatement({ employerName, referralCode, request, lines }: StatementInput) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text('Commission Statement', margin, 56);
  doc.setFontSize(16);
  doc.setTextColor(...TEAL);
  doc.text('JobGiga', pageWidth - margin, 56, { align: 'right' });
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 70, pageWidth - margin, 70);

  const info: [string, string][] = [
    ['Employer', employerName],
    ['Referral code', referralCode ?? '-'],
    ['Request no.', `CR-${request.id.split('-').pop()!.slice(-6).toUpperCase()}`],
    ['Requested on', request.requestedAt],
    ['Commission rate', `${request.rate}%`],
    ['Status', request.status],
    ['Invoice', request.invoice ? `${request.invoice.fileName} (uploaded ${request.invoice.uploadedAt})` : 'Not uploaded'],
  ];
  if (request.payment) info.push(['Payment', `Paid ${request.payment.paidAt} · Ref ${request.payment.reference}`]);
  if (request.payment?.proof) info.push(['Proof of payment', request.payment.proof.fileName]);
  if (request.status === 'Needs Revision' && request.revisionNote) info.push(['Revision note', request.revisionNote]);

  doc.setFontSize(10.5);
  let y = 94;
  for (const [label, value] of info) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    const wrapped = doc.splitTextToSize(value, pageWidth - margin * 2 - 110);
    doc.text(wrapped, margin + 110, y);
    y += 16 * wrapped.length;
  }

  const totalSpending = lines.reduce((sum, l) => sum + l.spending, 0);
  const totalCommission = Math.round(lines.reduce((sum, l) => sum + l.commission, 0) * 100) / 100;
  const companyCount = new Set(lines.map((l) => l.company)).size;

  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [['Referred company', 'Purchased', 'Price x Qty', 'Spending', 'Rate', 'Commission']],
    body: lines.map((l) => [
      l.companyNote ? `${l.company}\n${l.companyNote}` : l.company,
      l.purchased,
      l.priceDetail.replace(/×/g, 'x'),
      formatRM(l.spending),
      `${request.rate}%`,
      formatRM(l.commission),
    ]),
    foot: [[`Total (${lines.length} ${lines.length === 1 ? 'item' : 'items'}, ${companyCount} ${companyCount === 1 ? 'company' : 'companies'})`, '', '', formatRM(totalSpending), '', formatRM(totalCommission)]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 7, textColor: DARK, lineColor: [226, 232, 240], lineWidth: { bottom: 0.5 } },
    headStyles: { fillColor: [241, 245, 249], textColor: MUTED, fontStyle: 'bold' },
    footStyles: { fillColor: [248, 250, 252], textColor: DARK, fontStyle: 'bold' },
    columnStyles: {
      1: { cellWidth: 100 },
      2: { cellWidth: 118 },
      3: { cellWidth: 78, halign: 'right' },
      4: { cellWidth: 38, halign: 'right' },
      5: { cellWidth: 78, halign: 'right', textColor: TEAL, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body' && data.column.index >= 3) data.cell.styles.halign = 'right';
    },
  });

  const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const matches = Math.abs(totalCommission - request.amount) < 0.005;
  const checkFill: [number, number, number] = matches ? [236, 253, 245] : [254, 242, 242];
  const checkText: [number, number, number] = matches ? [21, 128, 61] : [185, 28, 28];
  doc.setFillColor(...checkFill);
  doc.roundedRect(margin, tableEnd + 16, pageWidth - margin * 2, 46, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...checkText);
  doc.text(
    matches ? 'Total commission matches the requested amount.' : 'Total commission does not match the requested amount.',
    margin + 14,
    tableEnd + 35,
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Requested: ${formatRM(request.amount)}   ·   Calculated: ${formatRM(totalCommission)}   ·   The invoice should show ${formatRM(request.amount)}.`,
    margin + 14,
    tableEnd + 51,
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Generated on ${formatDate(new Date())} by JobGiga Superadmin`, margin, doc.internal.pageSize.getHeight() - 30);

  return doc;
}

const statementFileName = ({ employerName, request }: StatementInput) => {
  const slug = employerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `commission-statement-${slug}-${request.id}.pdf`;
};

export async function downloadCommissionStatement(input: StatementInput) {
  const doc = await buildStatement(input);
  doc.save(statementFileName(input));
}

export async function viewCommissionStatement(input: StatementInput) {
  // Open the tab synchronously so the popup blocker treats it as a direct click.
  const tab = window.open('', '_blank');
  const doc = await buildStatement(input);
  doc.setProperties({ title: statementFileName(input) });
  const url = URL.createObjectURL(doc.output('blob'));
  if (tab) tab.location.href = url;
  else window.open(url, '_blank');
}
