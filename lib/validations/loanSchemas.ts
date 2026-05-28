import { z } from "zod";
import { MIN_LOAN, MAX_LOAN } from "@/lib/interest";

export const loanApplicationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  jobTitle: z.string().min(2, "Job title is required").max(100),
  jobSalary: z.string().min(1, "Salary is required"),
  requestedAmount: z
    .number()
    .min(MIN_LOAN, `Minimum loan amount is $${MIN_LOAN}`)
    .max(MAX_LOAN, `Maximum loan amount is $${MAX_LOAN}`),
  disclaimerAccepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the disclaimer to proceed",
  }),
  jobLetterFileKey: z.string().optional(),
  paystubFileKey: z.string().optional(),
});

export const adminLoanActionSchema = z.object({
  loanId: z.string().min(1),
  adminNotes: z.string().optional(),
  denialReason: z.string().optional(),
  approvedAmount: z.number().optional(),
});

export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type AdminLoanActionInput = z.infer<typeof adminLoanActionSchema>;
