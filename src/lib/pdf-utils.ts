/**
 * PDF export utility for ICL CRM invoices.
 * Uses browser print API with A4 layout — works in all browsers,
 * lets users "Save as PDF" from the print dialog.
 */

import { formatCurrency, formatDate } from "./utils";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  number: string;
  type: string;
  status: string;
  client_name: string;
  client_tin?: string;
  client_vrn?: string;
  items: InvoiceItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  issue_date?: string;
  due_date?: string;
  terms?: string;
  notes?: string;
}

interface CompanySettings {
  company_name?: string;
  company_tin?: string;
  company_vrn?: string;
  company_brn?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
}

const TYPE_LABELS: Record<string, string> = {
  invoice: "TAX INVOICE",
  proforma: "PROFORMA INVOICE",
  quotation: "QUOTATION",
};

export function printInvoice(invoice: Record<string, unknown>, settings: Record<string, unknown>): void {
  const inv = invoice as unknown as InvoiceData;
  const company = settings as unknown as CompanySettings;
  const typeLabel = TYPE_LABELS[inv.type] ?? "INVOICE";

  // Build the print HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${inv.number} — ${inv.client_name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          color: #1a1a1a;
          background: white;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
        .company-name { font-size: 22px; font-weight: 700; color: #00AAEE; margin-bottom: 6px; }
        .company-info { color: #555; font-size: 11px; line-height: 1.6; }
        .invoice-meta { text-align: right; }
        .invoice-type { display: inline-block; background: #e8f4fd; color: #00AAEE; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px; }
        .invoice-number { font-size: 24px; font-weight: 800; color: #1a1a1a; }
        .invoice-dates { color: #555; font-size: 11px; line-height: 1.8; margin-top: 4px; }
        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; background: #d1fae5; color: #065f46; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-draft { background: #f3f4f6; color: #374151; }
        .status-overdue { background: #fee2e2; color: #991b1b; }

        .divider { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }

        .bill-section { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; margin-bottom: 6px; }
        .client-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
        .client-tax { color: #555; font-size: 11px; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #1a1a1a; color: white; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; }
        thead th:last-child, thead th:nth-child(3) { text-align: right; }
        tbody td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 12px; vertical-align: top; }
        tbody td:last-child, tbody td:nth-child(3) { text-align: right; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody tr:last-child td { border-bottom: none; }

        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
        .total-row.subtotal { color: #555; }
        .total-row.vat { color: #d97706; font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 4px; }
        .total-row.grand { font-size: 16px; font-weight: 800; color: #00AAEE; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
        .vat-note { font-size: 10px; color: #9ca3af; margin-top: 4px; }

        .terms { background: #f9fafb; border-radius: 8px; padding: 14px; margin-top: 24px; }
        .terms-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; margin-bottom: 4px; }
        .terms-text { color: #555; font-size: 11px; line-height: 1.5; }

        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; line-height: 1.6; }

        @media print {
          body { padding: 20px; }
          @page { margin: 1cm; size: A4; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div>
          <div class="company-name">${company.company_name ?? "Integrated Communication Limited"}</div>
          <div class="company-info">
            ${company.company_address ?? "Dar es Salaam, Tanzania"}<br/>
            ${company.company_phone ?? ""} &nbsp;|&nbsp; ${company.company_email ?? ""}<br/>
            <strong>TIN:</strong> ${company.company_tin ?? "—"} &nbsp;|&nbsp;
            <strong>VRN:</strong> ${company.company_vrn ?? "—"} &nbsp;|&nbsp;
            <strong>BRN:</strong> ${company.company_brn ?? "—"}
          </div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-type">${typeLabel}</div>
          <div class="invoice-number">${inv.number}</div>
          <div class="invoice-dates">
            ${inv.issue_date ? `<strong>Issued:</strong> ${formatDate(inv.issue_date)}<br/>` : ""}
            ${inv.due_date ? `<strong>Due:</strong> ${formatDate(inv.due_date)}` : ""}
          </div>
          <div class="status-badge status-${inv.status}">${inv.status.toUpperCase()}</div>
        </div>
      </div>

      <hr class="divider"/>

      <!-- Bill To -->
      <div class="bill-section">
        <div class="section-title">Bill To</div>
        <div class="client-name">${inv.client_name}</div>
        ${inv.client_tin ? `<div class="client-tax"><strong>TIN:</strong> ${inv.client_tin}</div>` : ""}
        ${inv.client_vrn ? `<div class="client-tax"><strong>VRN:</strong> ${inv.client_vrn}</div>` : ""}
      </div>

      <!-- Line Items -->
      <table>
        <thead>
          <tr>
            <th style="width:50%">Description</th>
            <th style="text-align:center;width:12%">Qty</th>
            <th style="width:19%">Unit Rate (TZS)</th>
            <th style="width:19%">Amount (TZS)</th>
          </tr>
        </thead>
        <tbody>
          ${(inv.items ?? []).map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align:center">${item.quantity}</td>
              <td style="text-align:right">${formatCurrency(Number(item.rate))}</td>
              <td style="text-align:right">${formatCurrency(Number(item.amount ?? (item.quantity * item.rate)))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-row subtotal">
          <span>Subtotal (Excl. VAT)</span>
          <span>${formatCurrency(inv.subtotal)}</span>
        </div>
        <div class="total-row vat">
          <span>VAT @ ${inv.vat_rate}% (Kodi ya Ongezeko la Thamani)</span>
          <span>${formatCurrency(inv.vat_amount)}</span>
        </div>
        <div class="total-row grand">
          <span>TOTAL DUE (TZS)</span>
          <span>${formatCurrency(inv.total)}</span>
        </div>
        <div class="vat-note">All amounts in Tanzania Shillings (TZS) · TRA compliant</div>
      </div>

      <!-- Terms -->
      ${inv.terms ? `
      <div class="terms">
        <div class="terms-title">Terms &amp; Conditions</div>
        <div class="terms-text">${inv.terms}</div>
      </div>` : ""}

      ${inv.notes ? `
      <div class="terms" style="background:#eff6ff;margin-top:10px;">
        <div class="terms-title">Notes</div>
        <div class="terms-text">${inv.notes}</div>
      </div>` : ""}

      <!-- Footer -->
      <div class="footer">
        <strong>${company.company_name ?? "Integrated Communication Limited"}</strong><br/>
        TIN: ${company.company_tin ?? "—"} &nbsp;|&nbsp; VRN: ${company.company_vrn ?? "—"}<br/>
        This is a computer-generated ${typeLabel.toLowerCase()}. Tanzania Revenue Authority (TRA) compliant.
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups to export PDF. Then click the Export button again.");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close window after printing (user may cancel)
      printWindow.onafterprint = () => printWindow.close();
    }, 300);
  };
}
