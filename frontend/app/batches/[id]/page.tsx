"use client";

import { useState } from "react";
import { useBatchById } from "@/hooks/useBatch";
import { useAddStudent, useRemoveStudent } from "@/hooks/useStudents"; // assume you have this hook
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params.id;
  const router = useRouter();

  const { data, isLoading, error } = useBatchById(batchId as string);
  const addStudentMutation = useAddStudent();
  const removeStudentMutation = useRemoveStudent(); // remove student hook

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
  });

  const [lastFeesPaidFor, setLastFeesPaidFor] = useState(new Date().toISOString().slice(0, 10));
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));

  const monthMap = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  if (isLoading)
    return <p className="text-white text-center mt-12">Loading batch...</p>;
  if (error)
    return <p className="text-red-400 text-center mt-12">Failed to load batch</p>;
  if (!data?.batch)
    return <p className="text-white/60 text-center mt-12">Batch not found</p>;

  const { batch } = data;

  // Calculate fees collected for this month
  const currentMonth = monthMap[new Date().getMonth()];
  const collectedThisMonth = batch.students.reduce((sum: number, student: any) => {
    return sum + (student.lastFeesPaidFor === currentMonth ? batch.fees : 0);
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !lastFeesPaidFor || !admissionDate) {
      toast.error("Please fill required fields");
      return;
    }

    const admission = new Date(admissionDate);
    const admissionMonth = monthMap[admission.getMonth()];
    const admissionYear = admission.getFullYear();

    const lastFeesDate = new Date(lastFeesPaidFor);
    const lastFeesPaidMonth = monthMap[lastFeesDate.getMonth()];

    addStudentMutation.mutate(
      {
        ...form,
        batchId: batch._id,
        admissionMonth,
        admissionYear,
        lastFeesPaidFor: lastFeesPaidMonth
      },
      {
        onSuccess: () => {
          batch.students.push({
            _id: new Date().getTime().toString(),
            name: form.name,
            mobileNumber: form.mobileNumber,
            admissionMonth,
            admissionYear,
            lastFeesPaidFor: lastFeesPaidMonth
          });
          setForm({ name: "", mobileNumber: "" });
          setLastFeesPaidFor(new Date().toISOString().slice(0, 10));
          setAdmissionDate(new Date().toISOString().slice(0, 10));
          setShowForm(false);
          
        },
      }
    );
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    removeStudentMutation.mutate(
      studentId,
      {
        onSuccess: () => {
            batch.students = batch.students.filter((student: any) => student._id !== studentId);
        }
      }
    );

  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 sm:p-6 font-sans">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex items-center mb-6 justify-between px-4">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white cursor-pointer transition text-xl flex items-center gap-1"
        >
          <ArrowLeft /> Back
        </button>
        <h1 className="text-xl font-extrabold text-center text-white/70 mb-4 tracking-tight">
          Batch Details
        </h1>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Batch Info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg">
          <h1 className="text-white/90 text-xl text-center font-extrabold mb-2">{batch.name.toUpperCase()}</h1>
          <p className="text-white/70">Class: {batch.class}</p>
          <p className="text-white/70">Group: {batch.group}</p>
          <p className="text-white/70">Fees: ₹ {batch.fees}</p>
          <p className="text-white/70 mt-2">Students Enrolled: {batch.students.length}</p>

          {/* Fees Tracker */}
          <div className="mt-4 bg-black/30 p-4 rounded-xl">
            <h2 className="text-white/70 mb-2 font-semibold">Fees Collected This Month</h2>
            <p className="text-2xl font-bold text-white">₹ {collectedThisMonth} / {batch.students.length * batch.fees}</p>
          </div>

          {/* Students List */}
          <div className="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto">
            {batch.students.length > 0 ? batch.students.map((student: any) => (
              <div
                key={student._id}
                className="px-3 py-2 w-full bg-white/10 text-white rounded-md flex items-center justify-between text-sm transition hover:bg-white/20"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-white/80 text-sm">
                    Mobile: {student.mobileNumber || "N/A"} | Admission: {student.admissionMonth} {student.admissionYear} | Last Paid: {student.lastFeesPaidFor}
                  </p>
                  <p className="text-white/50 text-xs">Last Fees Paid: {student.lastFeesPaidFor}</p>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  className="text-red-500 hover:text-red-400 transition p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <p className="text-white/50 text-sm">No students enrolled yet</p>
            )}
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition font-semibold"
          >
            <UserPlus /> {showForm ? "Cancel" : "Add Student"}
          </button>

          {/* Add Student Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 bg-black/30 p-4 rounded-xl">
              <div className="flex flex-col">
                <label className="text-white/70 text-sm mb-1">Name*</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Student name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white/70 text-sm mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  placeholder="Optional"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white/70 text-sm mb-1">Last Fees Paid For*</label>
                <input
                  type="date"
                  value={lastFeesPaidFor}
                  onChange={e => setLastFeesPaidFor(e.target.value)}
                  className="w-full rounded-lg bg-white/20 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white/70 text-sm mb-1">Admission Date*</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="w-full rounded-lg bg-white/20 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition appearance-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={addStudentMutation.isPending}
                className="w-full bg-white text-black font-semibold py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60"
              >
                {addStudentMutation.isPending ? "Adding..." : "Add Student"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
