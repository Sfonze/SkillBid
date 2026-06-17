"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import ContractDocument from "@/components/ContractDocument";

export default function ContractFlow({ params }) {
  const { taskId } = params;
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const { pushToast } = useToast();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [info, setInfo] = useState({ legalName: "", address: "", iban: "", taxId: "" });
  const [agreeSme, setAgreeSme] = useState(false);
  const [typedNameSme, setTypedNameSme] = useState("");
  const [agreeStudent, setAgreeStudent] = useState(false);
  const [typedNameStudent, setTypedNameStudent] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/contracts/${taskId}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setInfo((i) => ({ ...i, legalName: i.legalName || d.student.fullName }));
    }
    setLoaded(true);
  }

  useEffect(() => { if (user) load(); }, [user]);

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;
  if (!loaded) return <div className="container section">Loading…</div>;
  if (!data) return <div className="container section">No contract started for this task yet.</div>;

  const { task, contract, sme, student } = data;
  const isSme = user.role === "SME" && user.id === sme.id;
  const isStudent = user.role === "STUDENT" && user.id === student.id;

  async function submitInfo(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/contracts/${taskId}/student-info`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(info) });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || "Something went wrong."); return; }
    load();
  }
  async function signSme() {
    const res = await fetch(`/api/contracts/${taskId}/sign-sme`, { method: "POST" });
    if (res.ok) load();
  }
  async function signStudent() {
    const res = await fetch(`/api/contracts/${taskId}/sign-student`, { method: "POST" });
    if (res.ok) { pushToast("Contract signed — task workspace unlocked.", "sage"); load(); }
  }

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "720px" }}>
        <div className="eyebrow">Employment contract · {task.title}</div>
        <h2 className="mt-8">Set up the assignment with Adecco</h2>
        <p className="section-sub mt-8" style={{ marginBottom: "24px" }}>Adecco becomes {student.fullName.split(" ")[0]}&apos;s employer for this task. Three quick steps: employee details, company sign-off, employee sign-off.</p>

        <div className="pipeline" style={{ marginBottom: "24px" }}>
          <div className={"pipeline-step" + (contract.status !== "PENDING_STUDENT_INFO" ? " done" : " current")}><span className="pipeline-dot"></span>Employee details</div>
          <div className={"pipeline-step" + (contract.status === "SIGNED" || contract.status === "PENDING_STUDENT_SIGNATURE" ? " done" : contract.status === "PENDING_SME_SIGNATURE" ? " current" : "")}><span className="pipeline-dot"></span>Company signs</div>
          <div className={"pipeline-step" + (contract.status === "SIGNED" ? " done" : contract.status === "PENDING_STUDENT_SIGNATURE" ? " current" : "")}><span className="pipeline-dot"></span>Employee signs</div>
        </div>

        {contract.status === "PENDING_STUDENT_INFO" && (
          isStudent ? (
            <div className="card card-pad">
              <h3 style={{ fontSize: "17px", marginBottom: "14px" }}>Your employment details for Adecco</h3>
              <form onSubmit={submitInfo}>
                <div className="field"><label className="field-label">Legal full name</label><input className="input" required value={info.legalName} onChange={(e) => setInfo({ ...info, legalName: e.target.value })} /></div>
                <div className="field"><label className="field-label">Home address</label><input className="input" required value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} placeholder="Street, postcode, city, Netherlands" /></div>
                <div className="field-row">
                  <div className="field"><label className="field-label">IBAN</label><input className="input" required value={info.iban} onChange={(e) => setInfo({ ...info, iban: e.target.value })} placeholder="NL00ADEC0123456789" /></div>
                  <div className="field"><label className="field-label">Tax ID</label><input className="input" required value={info.taxId} onChange={(e) => setInfo({ ...info, taxId: e.target.value })} /></div>
                </div>
                <div className="field-hint mt-8" style={{ marginBottom: "14px" }}>These details are used solely to set up Adecco payroll for this assignment.</div>
                {error && <div className="field-error mt-8">{error}</div>}
                <button className="btn btn-stamp btn-block" type="submit">Submit details</button>
              </form>
            </div>
          ) : <div className="empty-state"><h3>Waiting on {student.fullName}</h3><p>They need to submit their employment details before the contract can be signed.</p></div>
        )}

        {contract.status !== "PENDING_STUDENT_INFO" && <ContractDocument contract={contract} task={task} sme={sme} student={student} />}

        {contract.status === "PENDING_SME_SIGNATURE" && (
          isSme ? (
            <div className="card card-pad mt-24">
              <h3 style={{ fontSize: "17px", marginBottom: "10px" }}>Sign as {sme.companyName}</h3>
              <input className="input" placeholder="Type your full name to sign" value={typedNameSme} onChange={(e) => setTypedNameSme(e.target.value)} />
              <label className="checkbox-row mt-16"><input type="checkbox" checked={agreeSme} onChange={(e) => setAgreeSme(e.target.checked)} /> I confirm these terms are correct and agree to Adecco acting as employer of record for this assignment.</label>
              <button className="btn btn-stamp btn-block mt-16" disabled={!agreeSme || !typedNameSme.trim()} onClick={signSme}>Sign contract</button>
            </div>
          ) : <div className="empty-state mt-24"><h3>Waiting on {sme.companyName}</h3><p>They need to review and sign before this moves forward.</p></div>
        )}

        {contract.status === "PENDING_STUDENT_SIGNATURE" && (
          isStudent ? (
            <div className="card card-pad mt-24">
              <h3 style={{ fontSize: "17px", marginBottom: "10px" }}>Sign as employee</h3>
              <input className="input" placeholder="Type your full name to sign" value={typedNameStudent} onChange={(e) => setTypedNameStudent(e.target.value)} />
              <label className="checkbox-row mt-16"><input type="checkbox" checked={agreeStudent} onChange={(e) => setAgreeStudent(e.target.checked)} /> I agree to these terms and to being employed by Adecco for the duration of this assignment.</label>
              <button className="btn btn-sage btn-block mt-16" disabled={!agreeStudent || !typedNameStudent.trim()} onClick={signStudent}>Sign contract</button>
            </div>
          ) : <div className="empty-state mt-24"><h3>Waiting on {student.fullName}</h3><p>The company has signed — waiting on the employee&apos;s signature.</p></div>
        )}

        {contract.status === "SIGNED" && (
          <div className="mt-24">
            <span className="badge badge-sage"><span className="badge-dot"></span>Contract fully signed</span>
            <div className="mt-16"><button className="btn btn-stamp" onClick={() => router.push(`/workspace/${task.id}`)}>Go to task workspace →</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
