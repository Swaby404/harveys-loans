interface Web3FormsPayload {
  subject: string;
  name: string;
  email: string;
  message: string;
  [key: string]: string | number | boolean;
}

export async function sendViaWeb3Forms(payload: Web3FormsPayload): Promise<boolean> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("WEB3FORMS_ACCESS_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: accessKey, ...payload }),
    });
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error("Web3Forms submission error:", err);
    return false;
  }
}

export async function notifyAdminNewApplication(data: {
  applicantName: string;
  applicantEmail: string;
  requestedAmount: number;
  jobTitle: string;
  jobSalary: string;
  loanId: string;
}): Promise<boolean> {
  return sendViaWeb3Forms({
    subject: `New Loan Application – ${data.applicantName} – $${data.requestedAmount.toFixed(2)}`,
    name: data.applicantName,
    email: data.applicantEmail,
    message: `
New Loan Application Submitted

Applicant: ${data.applicantName}
Email: ${data.applicantEmail}
Requested Amount: $${data.requestedAmount.toFixed(2)}
Job Title: ${data.jobTitle}
Annual Salary: ${data.jobSalary}
Application ID: ${data.loanId}

Please log in to the admin dashboard to review and process this application.
    `.trim(),
  });
}
