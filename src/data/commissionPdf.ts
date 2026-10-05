import jobgigaLogo from '../assets/referral/jobgiga-logo.png';
import { assignSalesInvoiceNos, getReferralsSnapshot } from '../store/referralStore';
import type { CommissionRequest, ReferralState } from '../store/referralStore';
import { COMPANIES } from './companies';
import { formatDate, formatRM, getReferredCompanies, monthOf, parseDate, purchaseLinesOf } from './referrals';

export type StatementLine = {
  lineId: string;
  receiptNo: string;
  company: string;
  companyNote?: string;
  // The referral code this customer signed up with, and who it is assigned to (if not the main code).
  codeUsed?: string;
  assignee?: string;
  purchased: string;
  priceDetail: string;
  paymentDate: string;
  spending: number;
  commission: number;
};

// Numbers every purchase across all employers, so each sales invoice number is unique system-wide.
const salesInvoiceNos = () => {
  const referrals = getReferralsSnapshot();
  const all = COMPANIES.flatMap((c) =>
    referrals[c.id]
      ? getReferredCompanies(c.id, referrals[c.id]).flatMap((d) => purchaseLinesOf(d, referrals[c.id]))
      : [],
  );
  return assignSalesInvoiceNos(
    all.map((line, i) => {
      const paid = parseDate(line.date);
      return {
        id: line.id,
        period: `${String(paid.getFullYear()).slice(-2)}${String(paid.getMonth() + 1).padStart(2, '0')}`,
        order: paid.getTime() + i / 1000,
      };
    }),
  );
};

export const statementLinesFor = (
  companyId: string,
  referral: ReferralState,
  request: CommissionRequest,
): StatementLine[] => {
  const details = getReferredCompanies(companyId, referral);
  const invoiceNos = salesInvoiceNos();
  return (request.items ?? []).map((item) => {
    const detail = details.find((d) => d.name === item.name);
    const line = detail ? purchaseLinesOf(detail, referral).find((l) => l.id === item.lineId) : undefined;
    return {
      lineId: item.lineId,
      receiptNo: invoiceNos[item.lineId] ?? '-',
      company: item.name,
      companyNote: line
        ? `${line.kind === 'plan' ? 'Joined' : 'Bought'} ${line.date}${detail ? ` · code ${detail.codeUsed}` : ''}`
        : undefined,
      codeUsed: detail?.codeUsed,
      assignee: detail?.assignedId ? referral.assignedCodes?.find((a) => a.id === detail.assignedId)?.name : undefined,
      purchased: item.label,
      priceDetail: line?.detail ?? '-',
      paymentDate: line?.date ?? '-',
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
const LINE: [number, number, number] = [226, 232, 240];

const JOBGIGA = {
  name: 'JobGiga Sdn. Bhd.',
  regNo: '202501055580 (1656986-T)',
  sstNo: 'N/A',
  address: ['11, Jalan IMP 1/1, Taman Industri Meranti Perdana', '47120 Puchong Selangor'],
  email: 'sales@jobgiga.com',
};

// No user accounts are stored yet, so every request is shown as made by this partner admin.
const PARTNER_ADMIN = 'Ahmad Yusuf';

// Each request has exactly one advice, so both share the same running number: CR-000001 / CA-000001.
const runningNo = (request: CommissionRequest) => String(request.adviceNo ?? 0).padStart(6, '0');
export const requestNo = (request: CommissionRequest) => `CR-${runningNo(request)}`;
export const adviceNo = (request: CommissionRequest) => `CA-${runningNo(request)}`;

// Every request is verified when it is made; only a rejected one loses that status.
const adviceStatus = (request: CommissionRequest) => (request.status === 'Rejected' ? 'REJECTED' : 'VERIFIED');

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const under1000 = (n: number): string => {
  const parts: string[] = [];
  if (n >= 100) parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
  const rest = n % 100;
  if (rest > 0 && rest < 20) parts.push(ONES[rest]);
  else if (rest >= 20) parts.push(TENS[Math.floor(rest / 10)] + (rest % 10 ? ` ${ONES[rest % 10]}` : ''));
  return parts.join(' ');
};

const numberToWords = (n: number): string => {
  if (n === 0) return 'Zero';
  const scales: [number, string][] = [[1_000_000_000, 'Billion'], [1_000_000, 'Million'], [1_000, 'Thousand']];
  const parts: string[] = [];
  let rest = n;
  for (const [size, name] of scales) {
    if (rest >= size) {
      parts.push(`${under1000(Math.floor(rest / size))} ${name}`);
      rest %= size;
    }
  }
  if (rest > 0) parts.push(under1000(rest));
  return parts.join(' ');
};

const ringgitInWords = (amount: number) => {
  const sen = Math.round(amount * 100);
  const ringgit = Math.floor(sen / 100);
  const cents = sen % 100;
  return `Ringgit Malaysia ${numberToWords(ringgit)}${cents ? ` and Sen ${numberToWords(cents)}` : ''} Only`;
};

const money = (amount: number) => amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const timeNow = (date: Date) =>
  `${formatDate(date)}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

type Segment = { text: string; highlight?: boolean };
type Pdf = InstanceType<typeof import('jspdf').jsPDF>;

// Wraps text whose parts mix normal and highlighted (bold teal) styles; returns the number of lines drawn.
function richParagraph(doc: Pdf, segments: Segment[], x: number, y: number, width: number, lineHeight: number) {
  const style = (highlight?: boolean) => {
    doc.setFont('helvetica', highlight ? 'bold' : 'normal');
    doc.setTextColor(...(highlight ? TEAL : DARK));
  };
  const words = segments.flatMap((seg) =>
    seg.text.split(/(\s+)/).filter(Boolean).map((text) => ({ text, highlight: seg.highlight })),
  );
  const lines: Segment[][] = [[]];
  let lineWidth = 0;
  for (const word of words) {
    style(word.highlight);
    const w = doc.getTextWidth(word.text);
    const isSpace = !word.text.trim();
    if (!isSpace && lineWidth + w > width && lines[lines.length - 1].length > 0) {
      lines.push([]);
      lineWidth = 0;
    }
    if (isSpace && lineWidth === 0) continue;
    lines[lines.length - 1].push(word);
    lineWidth += w;
  }
  lines.forEach((line, i) => {
    let cx = x;
    for (const word of line) {
      style(word.highlight);
      doc.text(word.text, cx, y + i * lineHeight);
      cx += doc.getTextWidth(word.text);
    }
  });
  style(false);
  return lines.length;
}

// jsPDF needs the image data, not a URL.
async function loadImage(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function buildStatement({ employerName, referralCode, request, lines }: StatementInput) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 54;
  // Codes the claimed customers actually used; falls back to the employer's own code.
  const usedCodes = [...new Set(lines.map((l) => l.codeUsed).filter((c): c is string => !!c))];
  const codes = usedCodes.length > 0 ? usedCodes : referralCode ? [referralCode] : [];
  const code = codes.length > 0 ? codes.join(', ') : '-';
  const codeLabel = codes.length > 1 ? 'referral codes' : 'referral code';
  const rate = `${request.rate}%`;
  const status = adviceStatus(request);
  const verifiedOn = request.requestedAt;

  const lastTableY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const ensureSpace = (y: number, needed: number) => {
    if (y + needed <= bottomLimit) return y;
    doc.addPage();
    return 50;
  };
  const sectionTitle = (text: string, x: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(text.toUpperCase(), x, y);
  };
  // Label / value rows; returns the y after the last row.
  const keyValues = (rows: [string, string][], x: number, y: number, labelWidth: number, valueWidth: number, highlight?: string) => {
    doc.setFontSize(9.5);
    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(label, x, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(label === highlight ? TEAL : DARK));
      const wrapped = doc.splitTextToSize(value, valueWidth);
      doc.text(wrapped, x + labelWidth, y);
      y += 13 * wrapped.length;
    }
    return y;
  };
  const numberedList = (items: string[], y: number, fontSize: number, x = margin, width = contentWidth) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...DARK);
    items.forEach((item, i) => {
      const wrapped = doc.splitTextToSize(item, width - 16);
      doc.text(`${i + 1}.`, x, y);
      doc.text(wrapped, x + 16, y);
      y += (fontSize + 3.5) * wrapped.length;
    });
    return y;
  };

  /* ----- header ----- */
  const logo = await loadImage(jobgigaLogo);
  if (logo) doc.addImage(logo, 'PNG', margin, 32, 31, 25.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text('JobGiga', margin + (logo ? 37 : 0), 52);
  doc.setFontSize(12.5);
  doc.text(JOBGIGA.name, margin, 78);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  [`Reg. No. : ${JOBGIGA.regNo}`, `SST No. : ${JOBGIGA.sstNo}`, ...JOBGIGA.address].forEach((t, i) =>
    doc.text(t, margin, 92 + i * 12),
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEAL);
  doc.text('COMMISSION ADVICE', pageWidth - margin, 56, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Confirmation of commission entitlement  ·  Not a tax invoice', pageWidth - margin, 70, { align: 'right' });
  keyValues(
    [
      ['Advice no.', adviceNo(request)],
      ['Status', status],
      ['Verified on', verifiedOn],
      ['Currency', 'RM'],
    ],
    pageWidth - margin - 200,
    88,
    90,
    110,
    'Status',
  );

  doc.setDrawColor(...LINE);
  doc.line(margin, 152, pageWidth - margin, 152);

  /* ----- intro ----- */
  doc.setFontSize(10);
  const introLines = richParagraph(
    doc,
    [
      { text: 'This advice confirms the commission ' },
      { text: employerName, highlight: true },
      { text: ` is entitled to for the sales invoices below. They were requested by your admin user, matched to your ${codeLabel} ` },
      { text: code, highlight: true },
      { text: ', and verified by JobGiga after each customer payment was confirmed.' },
    ],
    margin,
    170,
    contentWidth,
    13,
  );
  let y = 170 + introLines * 13 + 8;

  /* ----- channel partner / request & verification ----- */
  const colX = margin + contentWidth / 2 + 10;
  sectionTitle('Channel partner', margin, y);
  sectionTitle('Request & verification', colX, y);
  const leftEnd = keyValues(
    [
      ['Channel partner', employerName],
      ['Company reg. no.', '-'],
      [codes.length > 1 ? 'Referral codes' : 'Referral code', code],
      // The agreement date is the 28th of the month the request was made.
      ['Agreement ref.', `28th ${monthOf(request.requestedAt)}`],
    ],
    margin,
    y + 18,
    92,
    contentWidth / 2 - 102,
  );
  const rightEnd = keyValues(
    [
      ['Request no.', requestNo(request)],
      ['Requested by', `${PARTNER_ADMIN}, ${request.requestedAt}`],
      ['Verified by', `JobGiga, ${verifiedOn}`],
      ['Commission rate', rate],
    ],
    colX,
    y + 18,
    86,
    contentWidth / 2 - 96,
  );
  y = Math.max(leftEnd, rightEnd) + 8;

  /* ----- sales invoices claimed ----- */
  sectionTitle('Sales invoices claimed', margin, y);
  const totalPaid = lines.reduce((sum, l) => sum + l.spending, 0);
  const totalCommission = Math.round(lines.reduce((sum, l) => sum + l.commission, 0) * 100) / 100;

  autoTable(doc, {
    startY: y + 8,
    margin: { left: margin, right: margin, bottom: 60 },
    head: [['No.', 'Sales invoice / receipt no.', 'Customer', 'Product & plan', 'Payment date', 'Amount paid, excl. SST (A)', 'Rate', 'Commission (A x Rate)']],
    body: lines.map((l, i) => [
      String(i + 1),
      // VADS's uploaded invoice (one per request) sits under each sales invoice number once it exists.
      request.invoice ? `${l.receiptNo}\n${request.invoice.fileName}` : l.receiptNo,
      l.codeUsed ? `${l.company}\nvia ${l.codeUsed}${l.assignee ? ` (${l.assignee})` : ''}` : l.company,
      l.purchased,
      l.paymentDate,
      money(l.spending),
      rate,
      money(l.commission),
    ]),
    foot: [[{ content: 'Total', colSpan: 5 }, money(totalPaid), '', money(totalCommission)]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 5, textColor: DARK, lineColor: LINE, lineWidth: { bottom: 0.5 }, valign: 'middle' },
    headStyles: { fillColor: [241, 245, 249], textColor: MUTED, fontStyle: 'bold' },
    footStyles: { fillColor: [248, 250, 252], textColor: DARK, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 86 },
      4: { cellWidth: 62 },
      5: { cellWidth: 66, halign: 'right' },
      6: { cellWidth: 34, halign: 'center' },
      7: { cellWidth: 64, halign: 'right', textColor: TEAL, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body' && (data.column.index === 5 || data.column.index === 7)) data.cell.styles.halign = 'right';
      if (data.section === 'head' && (data.column.index === 0 || data.column.index === 6)) data.cell.styles.halign = 'center';
    },
  });

  y = lastTableY() + 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    'Only paid sales invoices mapped to your referral code can be requested. Each sales invoice can be claimed on one advice only.',
    margin,
    y,
  );

  /* ----- basis of calculation + totals ----- */
  y = ensureSpace(y + 16, 80);
  const boxX = margin + contentWidth / 2 + 10;
  const boxWidth = pageWidth - margin - boxX;
  sectionTitle('Basis of calculation', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      `Commission = ${rate} x amount paid by the customer, excluding SST. Calculated per sales invoice after payment is confirmed and rounded to the nearest sen.`,
      contentWidth / 2 - 10,
    ),
    margin,
    y + 16,
  );

  autoTable(doc, {
    startY: y - 10,
    margin: { left: boxX, right: margin, bottom: 60 },
    tableWidth: boxWidth,
    body: [
      ['Total amount paid (excl. SST)', formatRM(totalPaid)],
      [`Commission entitlement (${rate})`, formatRM(request.amount)],
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 6, textColor: DARK, lineColor: LINE, lineWidth: { bottom: 0.5 } },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => {
      if (data.row.index === 1) {
        data.cell.styles.fillColor = [240, 250, 251];
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 0) data.cell.styles.textColor = TEAL;
      }
    },
  });
  const wordsY = lastTableY() + 14;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const words = doc.splitTextToSize(`In words: ${ringgitInWords(request.amount)}`, boxWidth);
  doc.text(words, boxX, wordsY);
  y = Math.max(wordsY + words.length * 11, y + 56) + 6;

  /* ----- next step box ----- */
  const steps = [
    'Issue your invoice to JobGiga for the amount above. One invoice may cover several verified advices; list each advice no. and its amount.',
    'Add SST on your invoice only if you are SST-registered. Amounts on this advice exclude any tax you charge.',
    'Upload the invoice in the JobGiga system and attach the verified advices it covers. Invoices sent by email are not accepted.',
    'Payment will be processed according to the agreed payment terms.',
  ];
  doc.setFontSize(9);
  const stepsHeight = steps.reduce((h, t) => h + 12 * doc.splitTextToSize(t, contentWidth - 44).length, 0);
  const boxHeight = 66 + stepsHeight;
  y = ensureSpace(y, boxHeight);
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 6, 6, 'S');
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text('NEXT STEP: SUBMIT YOUR INVOICE', margin + 12, y + 18);
  const third = (contentWidth - 24) / 3;
  const quote: [string, string][] = [
    ['Quote this advice no.', adviceNo(request)],
    ['Amount to invoice (excl. tax)', formatRM(request.amount)],
    ['Bill to', JOBGIGA.name],
  ];
  quote.forEach(([label, value], i) => {
    const x = margin + 12 + third * i;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label, x, y + 34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...DARK);
    doc.text(value, x, y + 48);
  });
  numberedList(steps, y + 64, 8.5, margin + 12, contentWidth - 28);
  y += boxHeight + 26;

  /* ----- terms ----- */
  const terms = [
    'This advice confirms commission entitlement only. It is not a tax invoice and not a demand for payment.',
    'Only an advice with status VERIFIED can be invoiced. An advice marked DRAFT or PENDING VERIFICATION is not a confirmation of entitlement.',
    'Commission is paid only against your invoice uploaded in the JobGiga system and matched to verified advices.',
    'Please raise any discrepancy within 14 days of the verification date.',
  ];
  doc.setFontSize(8.5);
  const termsHeight = 14 + terms.reduce((h, t) => h + 12 * doc.splitTextToSize(t, contentWidth - 16).length, 0);
  y = ensureSpace(y, termsHeight);
  sectionTitle('Terms', margin, y);
  numberedList(terms, y + 14, 8.5);

  /* ----- footer on every page ----- */
  const generated = `Generated by the JobGiga system on ${timeNow(new Date())}  ·  Queries: ${JOBGIGA.email}  ·  System-generated; no signature required.`;
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.line(margin, pageHeight - 46, pageWidth - margin, pageHeight - 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(generated, margin, pageHeight - 32);
    doc.text(`Commission Advice  ·  Page ${page}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  return doc;
}

const statementFileName = ({ employerName, request }: StatementInput) => {
  const slug = employerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `commission-advice-${slug}-${adviceNo(request).toLowerCase()}.pdf`;
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
