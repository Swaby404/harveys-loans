"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle, XCircle, User, Briefcase, DollarSign, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LoanDetail {
  id: string;
  status: string;
  requestedAmount: string;
  approvedAmount: string | null;
  jobTitle: string;
  jobSalary: string;
  processingFee: string;
  jobLetterFileName: string | null;
  paystubFileName: string | null;
  adminNotes: string | null;
  denialReason: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

export default function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [denialReason, setDenialReason] = useState("");

  useEffect(() => {
    fetch(`/api/loans/${id}`)
      .then((r) => r.json())
      .then((d) => { setLoan(d); setApprovedAmount(d.requestedAmount || ""); })
      .catch(() => setError("Failed to load application."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/loans/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedAmount: parseFloat(approvedAmount), adminNotes }),
      });
      const j = await res.json();
      if (!res.ok) { setError(j.error || "Approval failed."); return; }
      setSuccess("Loan approved! Notification email sent to applicant.");
      setApproveOpen(false);
      router.refresh();
      setTimeout(() => router.push("/admin/applications"), 2000);
    } catch { setError("An error occurred."); }
    finally { setActionLoading(false); }
  };

  const handleDeny = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/loans/${id}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denialReason, adminNotes }),
      });
      const j = await res.json();
      if (!res.ok) { setError(j.error || "Denial failed."); return; }
      setSuccess("Loan application denied. Notification email sent to applicant.");
      setDenyOpen(false);
      setTimeout(() => router.push("/admin/applications"), 2000);
    } catch { setError("An error occurred."); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!loan) return <Alert type="error">Application not found.</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/applications" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-600">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-navy-800">Application Review</h1>
          <p className="text-xs text-gray-400 mt-0.5">ID: {loan.id}</p>
        </div>
        <Badge variant={loanStatusVariant(loan.status)} className="text-sm px-3 py-1.5">{loan.status}</Badge>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Action buttons for PENDING */}
      {loan.status === "PENDING" && (
        <div className="flex gap-3">
          <Button onClick={() => setApproveOpen(true)} className="flex items-center gap-2">
            <CheckCircle size={16} /> Approve Loan
          </Button>
          <Button variant="danger" onClick={() => setDenyOpen(true)} className="flex items-center gap-2">
            <XCircle size={16} /> Deny Application
          </Button>
        </div>
      )}

      {/* Applicant */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <User size={16} className="text-gold-500" /> Applicant Information
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400">Full Name</p><p className="font-semibold text-navy-700">{loan.user.firstName} {loan.user.lastName}</p></div>
          <div><p className="text-gray-400">Email</p><p className="font-semibold text-navy-700">{loan.user.email}</p></div>
          <div><p className="text-gray-400">Phone</p><p className="font-semibold text-navy-700">{loan.user.phone || "—"}</p></div>
          <div><p className="text-gray-400">Applied</p><p className="font-semibold text-navy-700">{new Date(loan.createdAt).toLocaleDateString()}</p></div>
        </div>
      </Card>

      {/* Employment */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <Briefcase size={16} className="text-gold-500" /> Employment Details
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400">Job Title</p><p className="font-semibold text-navy-700">{loan.jobTitle}</p></div>
          <div><p className="text-gray-400">Annual Salary</p><p className="font-semibold text-navy-700">{loan.jobSalary}</p></div>
        </div>
      </Card>

      {/* Documents */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-gold-500" /> Uploaded Documents
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Job Letter</p>
            <p className={`font-semibold ${loan.jobLetterFileName ? "text-green-600" : "text-red-400"}`}>
              {loan.jobLetterFileName || "Not uploaded"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Paystub</p>
            <p className={`font-semibold ${loan.paystubFileName ? "text-green-600" : "text-red-400"}`}>
              {loan.paystubFileName || "Not uploaded"}
            </p>
          </div>
        </div>
      </Card>

      {/* Financial */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-gold-500" /> Loan Details
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400">Requested</p><p className="font-bold text-navy-700 text-lg">${Number(loan.requestedAmount).toFixed(2)}</p></div>
          <div><p className="text-gray-400">Processing Fee</p><p className="font-semibold text-red-500">-${Number(loan.processingFee).toFixed(2)}</p></div>
          {loan.approvedAmount && <div><p className="text-gray-400">Approved Amount</p><p className="font-bold text-green-600">${Number(loan.approvedAmount).toFixed(2)}</p></div>}
          {loan.denialReason && <div className="col-span-2"><p className="text-gray-400">Denial Reason</p><p className="font-semibold text-red-600">{loan.denialReason}</p></div>}
          {loan.adminNotes && <div className="col-span-2"><p className="text-gray-400">Admin Notes</p><p className="font-semibold text-navy-700">{loan.adminNotes}</p></div>}
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal isOpen={approveOpen} onClose={() => setApproveOpen(false)} title="Approve Loan Application" size="md">
        <div className="space-y-4">
          <Alert type="info">
            Approving this loan will send an email notification to the applicant with the loan terms.
          </Alert>
          <div>
            <label className="label">Approved Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="input-field pl-7"
                step="50"
                min="50"
                max="5000"
              />
            </div>
          </div>
          <div>
            <label className="label">Admin Notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="input-field min-h-20 resize-none"
              placeholder="Internal notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleApprove} loading={actionLoading} className="flex-1">
              <CheckCircle size={16} /> Confirm Approval
            </Button>
            <Button variant="ghost" onClick={() => setApproveOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Deny Modal */}
      <Modal isOpen={denyOpen} onClose={() => setDenyOpen(false)} title="Deny Application" size="md">
        <div className="space-y-4">
          <Alert type="warning">
            Denying this application will send an email notification to the applicant.
          </Alert>
          <div>
            <label className="label">Reason for Denial <span className="text-red-500">*</span></label>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="input-field min-h-24 resize-none"
              placeholder="Explain the reason for denial..."
              required
            />
          </div>
          <div>
            <label className="label">Admin Notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="input-field min-h-16 resize-none"
              placeholder="Internal notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="danger" onClick={handleDeny} loading={actionLoading} className="flex-1" disabled={!denialReason.trim()}>
              <XCircle size={16} /> Confirm Denial
            </Button>
            <Button variant="ghost" onClick={() => setDenyOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
