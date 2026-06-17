"use client";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { money } from "@/lib/validators";

export default function ContractDocument({ contract, task, sme, student }) {
  return (
    <div className="doc">
      <div className="eyebrow">Employment assignment agreement</div>
      <h3 className="mt-8">Adecco — Employer of Record</h3>
      <p className="text-faint text-sm">Reference {contract.id.slice(0, 8).toUpperCase()} · Generated for SkillBid task {task.id.slice(0, 8).toUpperCase()}</p>

      <div className="doc-section-title">Parties</div>
      <div className="doc-row"><span>Employer of record</span><span>Adecco</span></div>
      <div className="doc-row"><span>Platform</span><span>SkillBid B.V., Maastricht</span></div>
      <div className="doc-row"><span>Client company</span><span>{sme.companyName} (VAT {sme.vatNumber})</span></div>
      <div className="doc-row"><span>Employee</span><span>{contract.studentInfo.legalName || student.fullName}</span></div>

      <div className="doc-section-title">Assignment</div>
      <div className="doc-row"><span>Task</span><span>{task.title}</span></div>
      <div className="doc-row"><span>Start date</span><span>{fmtDate(contract.terms.startDate)}</span></div>
      <div className="doc-row"><span>End date</span><span>{fmtDate(contract.terms.endDate)}</span></div>
      <div className="doc-row"><span>Milestones</span><span>{task.milestones.length}</span></div>

      <div className="doc-section-title">Remuneration</div>
      <div className="doc-row"><span>Gross remuneration</span><span>{money(contract.terms.remuneration)}</span></div>
      <div className="doc-row"><span>SkillBid platform fee ({Math.round(contract.terms.commissionRate * 100)}%)</span><span>-{money(contract.terms.remuneration * contract.terms.commissionRate)}</span></div>
      <div className="doc-row"><strong>Net payable to employee (via Adecco payroll)</strong><strong>{money(contract.terms.netToStudent)}</strong></div>

      <div className="doc-section-title">Employee details on file</div>
      <div className="doc-row"><span>Address</span><span>{contract.studentInfo.address || "—"}</span></div>
      <div className="doc-row"><span>IBAN</span><span>{contract.studentInfo.iban || "—"}</span></div>
      <div className="doc-row"><span>Tax ID</span><span>{contract.studentInfo.taxId || "—"}</span></div>

      <div className="doc-section-title">Signatures</div>
      <div className="field-row">
        <div>
          <div className="text-faint text-sm">Company representative ({sme.companyName})</div>
          {contract.signedAtSme
            ? <div className="sig-box"><div className="sig-name">{sme.companyName}</div><div className="text-faint text-sm mt-8">Signed {fmtDateTime(contract.signedAtSme)}</div></div>
            : <div className="sig-box text-faint">Awaiting signature</div>}
        </div>
        <div>
          <div className="text-faint text-sm">Employee</div>
          {contract.signedAtStudent
            ? <div className="sig-box"><div className="sig-name">{contract.studentInfo.legalName}</div><div className="text-faint text-sm mt-8">Signed {fmtDateTime(contract.signedAtStudent)}</div></div>
            : <div className="sig-box text-faint">Awaiting signature</div>}
        </div>
      </div>
    </div>
  );
}
