"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  DollarSign,
  Upload,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { INTEREST_SCHEDULE_DISPLAY, PROCESSING_FEE, MIN_LOAN, MAX_LOAN } from "@/lib/interest";
import { loanApplicationSchema, type LoanApplicationInput } from "@/lib/validations/loanSchemas";

const STEPS = ["Employment", "Loan Amount", "Documents", "Review & Submit"];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [jobLetter, setJobLetter] = useState<File | null>(null);
  const [paystub, setPaystub] = useState<File | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<LoanApplicationInput>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { requestedAmount: 500, disclaimerAccepted: false },
  });

  const requestedAmount = watch("requestedAmount");

  const handleFileUpload = async (file: File, type: "jobLetter" | "paystub") => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }
    setError("");
    if (type === "jobLetter") setJobLetter(file);
    else setPaystub(file);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof LoanApplicationInput)[] = [];
    if (step === 0) fieldsToValidate = ["jobTitle", "jobSalary"];
    if (step === 1) fieldsToValidate = ["requestedAmount"];
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: LoanApplicationInput) => {
    if (!disclaimerAccepted) {
      setError("You must accept the disclaimer to proceed.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      setUploadingFiles(true);
      const formData = new FormData();
      if (jobLetter) formData.append("jobLetter", jobLetter);
      if (paystub) formData.append("paystub", paystub);

      let jobLetterKey = "";
      let paystubKey = "";

      if (jobLetter || paystub) {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          jobLetterKey = uploadData.jobLetterKey || "";
          paystubKey = uploadData.paystubKey || "";
        }
      }
      setUploadingFiles(false);

      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          disclaimerAccepted,
          jobLetterFileKey: jobLetterKey,
          paystubFileKey: paystubKey,
          jobLetterFileName: jobLetter?.name,
          paystubFileName: paystub?.name,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Submission failed. Please try again.");
        return;
      }
      router.push("/dashboard?applied=1");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  return (
    <>
      {/* Disclaimer Modal */}
      <Modal isOpen={disclaimerOpen} title="Terms & Disclaimer" size="xl" closable={false}>
        <div className="space-y-4 max-h-96 overflow-y-auto text-sm text-gray-700 leading-relaxed">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-yellow-800 font-medium">Please read this disclaimer carefully before applying.</p>
          </div>

          <h3 className="font-bold text-navy-700 text-base">Cayman Islands Money Lenders Law</h3>
          <p>
            Harvey&apos;s Loans LLC operates under and is fully compliant with the{" "}
            <strong>Cayman Islands Money Lenders Law (as revised)</strong>. By submitting a loan application,
            you acknowledge and agree to be bound by all applicable provisions of this law.
          </p>

          <h3 className="font-bold text-navy-700 text-base">Interest Rates & Charges</h3>
          <p>The following interest rates apply to <strong>missed payment weeks</strong>, compounding on the outstanding balance:</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            {INTEREST_SCHEDULE_DISPLAY.map((r) => (
              <div key={r.week} className="flex justify-between text-sm">
                <span className="text-gray-600">{r.label}</span>
                <span className={`font-bold ${r.color}`}>{r.rate}</span>
              </div>
            ))}
          </div>
          <p className="text-red-600 font-medium">
            A <strong>non-refundable processing fee of ${PROCESSING_FEE}</strong> is charged on all approved loan applications, regardless of outcome.
          </p>

          <h3 className="font-bold text-navy-700 text-base">Debt Recovery</h3>
          <p>
            Non-payment or persistent default may result in civil debt recovery proceedings initiated under the
            Cayman Islands Money Lenders Law. Harvey&apos;s Loans LLC reserves the right to pursue all legal
            remedies available under Cayman law to recover outstanding debts.
          </p>

          <h3 className="font-bold text-navy-700 text-base">Data Privacy</h3>
          <p>
            Your personal and employment information will be stored securely using AES-256 encryption and used
            solely for the purpose of processing your loan application and managing your account. We do not sell
            your data to third parties.
          </p>

          <h3 className="font-bold text-navy-700 text-base">Loan Range</h3>
          <p>Loan amounts range from <strong>${MIN_LOAN}</strong> to <strong>${MAX_LOAN.toLocaleString()}</strong>.</p>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold-400 focus:ring-gold-400"
            />
            <span className="text-sm text-gray-700 group-hover:text-navy-700">
              I have read and agree to the Terms & Disclaimer above, including the interest rate schedule,
              processing fee disclosure, and Cayman Islands Money Lenders Law provisions.
            </span>
          </label>
          <Button
            className="w-full mt-4"
            disabled={!disclaimerAccepted}
            onClick={() => setDisclaimerOpen(false)}
          >
            <CheckCircle size={16} /> I Accept & Continue
          </Button>
        </div>
      </Modal>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-navy-800">Loan Application</h1>
          <p className="text-gray-500 mt-1">Complete all steps to submit your application.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-all ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-gold-400 text-navy-800" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? "text-navy-700" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Employment */}
          {step === 0 && (
            <div className="card space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase size={20} className="text-gold-500" />
                <h2 className="text-lg font-bold text-navy-700">Employment Details</h2>
              </div>
              <Input
                label="Job Title"
                placeholder="e.g. Accountant, Nurse, Teacher"
                required
                error={errors.jobTitle?.message}
                {...register("jobTitle")}
              />
              <Input
                label="Annual Salary (USD)"
                type="text"
                placeholder="e.g. 45,000"
                required
                error={errors.jobSalary?.message}
                helperText="Enter your gross annual salary in USD"
                {...register("jobSalary")}
              />
            </div>
          )}

          {/* Step 1: Loan Amount */}
          {step === 1 && (
            <div className="card space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} className="text-gold-500" />
                <h2 className="text-lg font-bold text-navy-700">Loan Amount</h2>
              </div>
              <div>
                <label className="label">
                  Requested Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    min={MIN_LOAN}
                    max={MAX_LOAN}
                    step="50"
                    className="input-field pl-7"
                    {...register("requestedAmount", { valueAsNumber: true })}
                  />
                </div>
                {errors.requestedAmount && <p className="mt-1 text-sm text-red-500">{errors.requestedAmount.message}</p>}
                <input
                  type="range"
                  min={MIN_LOAN}
                  max={MAX_LOAN}
                  step={50}
                  className="w-full mt-3 accent-gold-400"
                  {...register("requestedAmount", { valueAsNumber: true })}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>${MIN_LOAN}</span>
                  <span className="font-bold text-navy-700">${requestedAmount?.toLocaleString()}</span>
                  <span>${MAX_LOAN.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-navy-700 mb-2">Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Requested Amount</span><span className="font-semibold">${(requestedAmount || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-red-500">Processing Fee (non-refundable)</span><span className="text-red-500 font-semibold">-${PROCESSING_FEE}.00</span></div>
                  <div className="flex justify-between border-t border-gold-200 pt-2 mt-2"><span className="font-bold text-navy-700">Net Amount</span><span className="font-bold text-navy-700">${((requestedAmount || 0) - PROCESSING_FEE).toFixed(2)}</span></div>
                </div>
              </div>

              <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
                <p className="text-xs text-navy-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Shield size={12} className="text-navy-500" /> Interest Rate Schedule
                </p>
                <div className="space-y-1">
                  {INTEREST_SCHEDULE_DISPLAY.map((r) => (
                    <div key={r.week} className="flex justify-between text-xs">
                      <span className="text-gray-500">{r.label}</span>
                      <span className={`font-bold ${r.color}`}>{r.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="card space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Upload size={20} className="text-gold-500" />
                <h2 className="text-lg font-bold text-navy-700">Upload Documents</h2>
              </div>
              <p className="text-sm text-gray-500">Please upload your proof of employment. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>

              {/* Job Letter Upload */}
              <div>
                <label className="label">Job Letter / Employment Letter <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-gold-400 ${jobLetter ? "border-green-400 bg-green-50" : "border-gray-300"}`}>
                  {jobLetter ? (
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">{jobLetter.name}</span>
                      <button type="button" onClick={() => setJobLetter(null)} className="text-red-500 text-xs ml-2 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG, max 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "jobLetter")}
                    style={{ position: "absolute", opacity: 0, width: "100%", height: "100%" }}
                  />
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "jobLetter")}
                  />
                </div>
              </div>

              {/* Paystub Upload */}
              <div>
                <label className="label">Recent Paystub <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 border border-gray-200 rounded-lg p-2"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "paystub")}
                  />
                </div>
                {paystub && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> {paystub.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">PDF, JPG or PNG, max 5MB</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={20} className="text-gold-500" />
                <h2 className="text-lg font-bold text-navy-700">Review & Submit</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Job Title</span><span className="font-semibold text-navy-700">{getValues("jobTitle")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Annual Salary</span><span className="font-semibold text-navy-700">{getValues("jobSalary")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Requested Amount</span><span className="font-semibold text-navy-700">${(getValues("requestedAmount") || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-red-500">Processing Fee</span><span className="text-red-500 font-semibold">-${PROCESSING_FEE}.00 (non-refundable)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Job Letter</span><span className={jobLetter ? "text-green-600 font-semibold" : "text-red-400"}>{jobLetter ? "✓ Uploaded" : "Not uploaded"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Paystub</span><span className={paystub ? "text-green-600 font-semibold" : "text-red-400"}>{paystub ? "✓ Uploaded" : "Not uploaded"}</span></div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <Shield size={12} className="inline mr-1" />
                  By submitting this application, you confirm that all information provided is accurate and truthful.
                  This application is governed by the <strong>Cayman Islands Money Lenders Law (as revised)</strong>.
                  You agree to the interest rate schedule and $20 non-refundable processing fee.
                  Your documents will be reviewed by our team and you will receive a decision via email.
                </p>
              </div>

              <Button type="submit" loading={submitting} className="w-full py-3.5 text-base">
                {uploadingFiles ? "Uploading documents..." : "Submit Application"}
                <ChevronRight size={18} />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ChevronLeft size={16} /> Previous
            </Button>
            {step < STEPS.length - 1 && (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
