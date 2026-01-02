"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useStudentById, useCreateBill } from "@/hooks/useStudents";

const monthMap: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

const reverseMonthMap = Object.fromEntries(
  Object.entries(monthMap).map(([k, v]) => [v, k])
) as Record<number, string>;

function calculatePendingAmount(
  lastMonth?: string,
  lastYear?: number,
  monthlyFees?: number
) {
  if (!lastMonth || !lastYear || !monthlyFees) return 0;

  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + now.getMonth();
  const lastPaidIndex = lastYear * 12 + monthMap[lastMonth];

  const pendingMonths = Math.max(0, currentIndex - lastPaidIndex);
  return pendingMonths * monthlyFees;
}

function calculateTotalFeesCollected(
  lastMonth?: string,
  lastYear?: number,
  monthlyFees?: number,
  admissionMonth?: string,
  admissionYear?: number
){
    if (!lastMonth || !lastYear || !monthlyFees || !admissionMonth || !admissionYear) return 0;

    const lastPaidIndex = lastYear * 12 + monthMap[lastMonth];
    const admissionIndex = admissionYear * 12 + monthMap[admissionMonth];

    const totalFeesCollectedForMonth = Math.max(0, lastPaidIndex - admissionIndex);
    return totalFeesCollectedForMonth * monthlyFees + monthlyFees;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data, isLoading, error } = useStudentById(studentId);
  const createBill = useCreateBill(studentId);

  if (isLoading) {
    return <p className="text-white text-center mt-12">Loading student...</p>;
  }

  if (error) {
    return (
      <p className="text-red-400 text-center mt-12">
        Failed to load student
      </p>
    );
  }

  if (!data?.student) {
    return (
      <p className="text-white/60 text-center mt-12">
        Student not found
      </p>
    );
  }

  const { student } = data;


  const pendingAmount = calculatePendingAmount(
    student.lastFeesPaidFor,
    student.lastFeesPaidForYear,
    student.batch?.fees
  );

  const totalFeesCollected = calculateTotalFeesCollected(
    student.lastFeesPaidFor,
    student.lastFeesPaidForYear,
    student.batch?.fees,
    student.admissionMonth,
    student.admissionYear
  )

  const canPayNext =
    pendingAmount > 0 && !createBill.isPending;

  const handlePayNext = () => {
    const lastIndex =
      (student.lastFeesPaidForYear || 0) * 12 +
      monthMap[student.lastFeesPaidFor || ""];

    const nextIndex = lastIndex + 1;

    const forYear = Math.floor(nextIndex / 12);
    const forMonth = reverseMonthMap[nextIndex % 12];

    createBill.mutate({ forMonth, forYear });
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-white/70 font-bold">
          Student Details
        </h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-extrabold text-white text-center">
            {student.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/80 text-sm">
            <Info label="Mobile Number" value={student.mobileNumber || "N/A"} />
            <Info label="Admission Month" value={student.admissionMonth} />
            <Info label="Admission Year" value={student.admissionYear} />
            <Info label="Last Fees Paid For" value={`${student.lastFeesPaidFor} ${student.lastFeesPaidForYear}`} />
            <Info label="Batch Name" value={student.batch?.name} />
            <Info label="Class" value={student.batch?.class} />
            <Info label="Group" value={student.batch?.group} />
            <Info label="Batch Fees" value={`₹ ${student.batch?.fees}`} />
          </div>

          {/* Fees Section */}
          <div className="mt-4 space-y-2">
            <div className="sm:flex-row flex flex-col justify-between items-center">
              <h3 className="text-white/70 font-semibold">
                Fees Records
              </h3>
              <span className={`${pendingAmount === 0 ? "text-green-500" : "text-yellow-500"}  font-semibold`}>
                Pending ₹ {pendingAmount}
              </span>

              <span className={`${totalFeesCollected === 0 ? "text-red-500" : "text-green-500"}  font-semibold`}>
                Total fees collected ₹ {totalFeesCollected}
              </span>

            </div>

            <button
                  onClick={handlePayNext}
                  disabled={!canPayNext}
                  className="bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 w-full"
                >
                  Pay Next Month
            </button>

            <div className="max-h-100 overflow-y-auto mt-4">
                {student.fees && student.fees.length > 0 ? (
                    <ul className="space-y-2">
                        {[...student.fees].reverse().map((fee: any, index) => (
                        <li
                            key={fee._id}
                            className="bg-black/30 px-3 py-2 rounded-lg text-white/80 text-sm"
                        >
                            ({index+1}) Amount: ₹ {student.batch?.fees} | Month: {fee.forMonth} | Year: {fee.forYear}
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-white/50 text-sm">
                        No fees records found
                    </p>
                )}
            </div>
          </div>

          <div className="pt-4 text-xs text-white/40">
            <p>
              Created At:{" "}
              {new Date(student.createdAt!).toLocaleString()}
            </p>
            <p>
              Last Updated:{" "}
              {new Date(student.updatedAt!).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: any }) {
  return (
    <div className="bg-black/30 rounded-xl p-3">
      <p className="text-white/50 text-xs">{label}</p>
      <p className="text-white font-semibold">
        {value ?? "—"}
      </p>
    </div>
  );
}
