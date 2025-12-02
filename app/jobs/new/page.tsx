"use client";

import { useState } from "react";

type JobForm = {
  source: string;
  company: string;
  role: string;
  yoe: string;
  pay: string;
  link: string;
  applied: string;
  appliedDate: string;
  responded: string;
};

export default function NewJobPage() {
  const [form, setForm] = useState<JobForm>({
    source: "",
    company: "",
    role: "",
    yoe: "",
    pay: "",
    link: "",
    applied: "",
    appliedDate: "",
    responded: "",
  });

  const [jd, setJd] = useState("");

  const [status, setStatus] = useState<null | {
    type: "ok" | "error";
    msg: string;
  }>(null);

  const [loading, setLoading] = useState(false);

  const update = (field: keyof JobForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 💡 FREE heuristic parser – runs only in browser, no APIs
  const extractFromJD = () => {
    if (!jd.trim()) {
      setStatus({
        type: "error",
        msg: "Paste a job description first.",
      });
      return;
    }

    const parsed = parseJD(jd);

    setForm((prev) => ({
      ...prev,
      ...parsed,
    }));

    setStatus({
      type: "ok",
      msg: "Auto-filled fields from JD. Please review and edit if needed.",
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setStatus({ type: "ok", msg: "Saved to sheet 🎉" });
      setForm({
        source: "",
        company: "",
        role: "",
        yoe: "",
        pay: "",
        link: "",
        applied: "",
        appliedDate: "",
        responded: "",
      });
      setJd("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setStatus({ type: "error", msg: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center bg-zinc-100 py-10">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-1 text-black">Job Tracker</h1>
        <p className="text-sm text-black mb-5">
          Fill this form and it will be added directly to your Google Sheet.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* JD paste area */}
          <Field label="Job Description (Paste JD)">
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px] text-black"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
            />
            <button
              type="button"
              onClick={extractFromJD}
              className="mt-2 text-xs px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Auto-fill from JD (Free)
            </button>
          </Field>

          <Field label="Source">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
              placeholder="WellFound, LinkedIn, etc."
            />
          </Field>

          <Field label="Company" required>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              required
            />
          </Field>

          <Field label="Role">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Software Engineer Intern"
            />
          </Field>

          <Field label="YOE">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.yoe}
              onChange={(e) => update("yoe", e.target.value)}
              placeholder="0, 1, etc."
            />
          </Field>

          <Field label="Pay">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.pay}
              onChange={(e) => update("pay", e.target.value)}
              placeholder="1L – 2L"
            />
          </Field>

          <Field label="Job Link">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.link}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </Field>

          <Field label="Applied?">
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.applied}
              onChange={(e) => update("applied", e.target.value)}
            >
              <option value="">Select</option>
              <option value="✅">✅ Yes</option>
              <option value="⏳">⏳ In progress</option>
              <option value="❌">❌ No</option>
            </select>
          </Field>

          <Field label="Applied Date">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.appliedDate}
              onChange={(e) => update("appliedDate", e.target.value)}
              type="date"
            />
          </Field>

          <Field label="Responded / Notes">
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm text-black"
              value={form.responded}
              onChange={(e) => update("responded", e.target.value)}
              placeholder="e.g. sent assignment, waiting..."
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-2.5 text-sm font-semibold bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Job"}
          </button>

          {status && (
            <p
              className={`text-xs mt-1 ${
                status.type === "ok" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status.msg}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}


function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}


function parseJD(jd: string): Partial<JobForm> {
  const result: Partial<JobForm> = {};

  const cleaned = jd.replace(/\r/g, "");
  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const lower = cleaned.toLowerCase();

  const titleLine =
    lines.find((l) => /job title|position/i.test(l)) || lines[0];

  if (titleLine) {
    let role = titleLine.replace(/^(job title|position)\s*[:\-]\s*/i, "");

    role = role.replace(/^(hiring for|we are hiring for|we are hiring)\s*/i, "");
    result.role = role;
  }


  const companyLine = lines.find((l) => /^company\s*[:\-]/i.test(l));
  if (companyLine) {
    const parts = companyLine.split(/[:\-]/);
    if (parts[1]) result.company = parts[1].trim();
  } else {
    const atMatch = cleaned.match(/at\s+([A-Z][A-Za-z0-9&().,\- ]{2,60})/);
    if (atMatch) result.company = atMatch[1].trim();
  }


  const yoeMatch =
    cleaned.match(/(\d+)\s*-\s*(\d+)\s*(years?|yrs?|yr)/i) || // range
    cleaned.match(/(\d+)\+?\s*(years?|yrs?|yr)/i); // single
  if (yoeMatch) {

    if (yoeMatch[2]) {
      result.yoe = `${yoeMatch[1]}-${yoeMatch[2]}`;
    } else {
      result.yoe = yoeMatch[1];
    }
  }

  const payMatch =
    cleaned.match(
      /(₹|rs\.?|inr|usd|\$)\s?[\d.,]+(\s*-\s*[\d.,]+)?\s*(lpa|pa|per annum|month|mo)?/i,
    ) || cleaned.match(/[\d.,]+\s*(lpa|LPA)/);

  if (payMatch) {
    result.pay = payMatch[0].trim();
  }


  if (lower.includes("linkedin")) result.source = "LinkedIn";
  else if (lower.includes("naukri")) result.source = "Naukri";
  else if (lower.includes("wellfound") || lower.includes("angel.co"))
    result.source = "WellFound";
  else if (lower.includes("instahyre")) result.source = "Instahyre";


  const linkMatch = cleaned.match(/https?:\/\/\S+/);
  if (linkMatch) {
    result.link = linkMatch[0].replace(/[).,]$/, ""); 
  }

  return result;
}
