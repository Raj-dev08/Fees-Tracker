"use client";

import { useState, useMemo } from "react";
import { useBatchById } from "@/hooks/useBatch";
import { useAddStudent, useRemoveStudent } from "@/hooks/useStudents";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const monthMap = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const monthMapObj: Record<string, number> = {
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
}

function calculatePending(lastMonth?: string, lastYear?: number, batchFees?: number) {
  if (!lastMonth || !lastYear || !batchFees) return 0;
  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + now.getMonth();
  const lastPaidIndex = lastYear * 12 + monthMapObj[lastMonth];
  const pendingMonths = Math.max(0, currentIndex - lastPaidIndex);
  return pendingMonths * batchFees;
}

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params.id;
  const router = useRouter();

  const { data, isLoading, error } = useBatchById(batchId as string);
  const addStudentMutation = useAddStudent();
  const removeStudentMutation = useRemoveStudent(); 

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", mobileNumber: "" });
  const [lastFeesPaidFor, setLastFeesPaidFor] = useState(new Date().toISOString().slice(0, 10));
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));

  if (isLoading) return <p className="text-white text-center mt-12">Loading batch...</p>;
  if (error) return <p className="text-red-400 text-center mt-12">Failed to load batch</p>;
  if (!data?.batch) return <p className="text-white/60 text-center mt-12">Batch not found</p>;

  const { batch } = data;

  
  const totalCollected = batch.students.reduce((sum: number, s: any) => {
    return sum + ((calculatePending(s.lastFeesPaidFor, s.lastFeesPaidForYear, batch.fees) === 0 ? batch.fees : 0));
  }, 0);

  const totalPending = batch.students.reduce((sum: number, s: any) => {
    return sum + calculatePending(s.lastFeesPaidFor, s.lastFeesPaidForYear, batch.fees);
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const lastFeesPaidForYear = lastFeesDate.getFullYear();
    
    const { student } = await addStudentMutation.mutateAsync({
      ...form,
      batchId: batch._id,
      admissionMonth,
      admissionYear,
      lastFeesPaidFor: lastFeesPaidMonth,
      lastFeesPaidForYear
    });

    batch.students.unshift(student);

    setForm({ name: "", mobileNumber: "" });
    setLastFeesPaidFor(new Date().toISOString().slice(0, 10));
    setAdmissionDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    removeStudentMutation.mutate(studentId, {
      onSuccess: () => {
        batch.students = batch.students.filter((s: any) => s._id !== studentId);
      },
    });
  };

  const filteredStudents = batch.students.filter((student: any) => 
    student.name.toLowerCase().includes(search.toLowerCase()) || student.mobileNumber.includes(search)
  );



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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <h1 className="text-white/90 text-xl text-center font-extrabold mb-2">{batch.name.toUpperCase()}</h1>
          <p className="text-white/70">Class: {batch.class}</p>
          <p className="text-white/70">Group: {batch.group}</p>
          <p className="text-white/70">Fees: ₹ {batch.fees}</p>
          <p className="text-white/70">Students Enrolled: {batch.students.length}</p>

          {/* Collected / Pending Summary */}
          <div className="flex sm:flex-row flex-col items-center justify-between mt-2 bg-black/30 p-3 rounded-xl">
            <span className="text-white/70">Monthly Collection: ₹ {totalCollected} / {batch.fees * batch.students.length}</span>
            <span className="text-yellow-500 font-semibold">Total Pending: ₹ {totalPending}</span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or phone number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full mt-4 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />

          {/* Students List */}
          <div className="mt-3 flex flex-col gap-2 max-h-80 overflow-y-scroll border-t border-white/10 pt-2">
            {filteredStudents.length > 0 ? filteredStudents.map((student: any) => {
              const pending = calculatePending(student.lastFeesPaidFor, student.lastFeesPaidForYear, batch.fees);
              return (
                <div
                  key={student._id}
                  className="px-3 py-2 w-full bg-white/10 text-white rounded-md flex items-center justify-between text-sm transition hover:bg-white/20"
                >
                  <button className="flex flex-col text-left w-full" onClick={()=>router.push(`/students/${student._id}`)}>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-white/80 text-sm">
                      Mobile: {student.mobileNumber || "N/A"} | Admission: {student.admissionMonth} {student.admissionYear}
                    </p>
                    <p className={`${pending === 0 ? "text-green-400" : "text-yellow-400"} text-xs`}>
                      Last Paid: {student.lastFeesPaidFor} {student.lastFeesPaidForYear} | Pending: ₹ {pending}
                    </p>
                  </button>
                  <button
                    onClick={() => handleRemoveStudent(student._id)}
                    className="text-red-500 cursor-pointer hover:text-red-400 transition p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            }) : (
              <p className="text-white/50 text-sm">No students match your search</p>
            )}
          </div>

          {/* Add Student Button and Form */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition font-semibold"
          >
            <UserPlus /> {showForm ? "Cancel" : "Add Student"}
          </button>

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
                  className="w-full rounded-lg bg-white/20 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
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
