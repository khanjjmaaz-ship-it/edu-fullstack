import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  // Next.js Server Action to update the DB securely on the backend
  async function approveUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    await prisma.user.update({
      where: { id: userId },
      data: { status: "APPROVED" }
    });
    revalidatePath("/admin");
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hidden Admin Control Panel</h1>
        <a href="/api/auth/signout" className="bg-red-500/10 text-red-500 px-4 py-2 rounded border border-red-500/20 hover:bg-red-500/20 transition font-semibold">Sign Out Admin</a>
      </div>
      
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Student Approvals Dashboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-3 pr-6">Name</th>
                <th className="pb-3 pr-6">Email</th>
                <th className="pb-3 pr-6">CNIC (Masked)</th>
                <th className="pb-3 pr-6">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-4 pr-6 font-medium">{u.name}</td>
                  <td className="py-4 pr-6 text-slate-400">{u.email}</td>
                  <td className="py-4 pr-6 font-mono text-slate-300">{u.cnic.slice(0, 5) + "-*******-X"}</td>
                  <td className="py-4 pr-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'APPROVED' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {u.status === 'PENDING' ? (
                      <form action={approveUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className="bg-indigo-600 px-4 py-1.5 rounded text-sm font-semibold hover:bg-indigo-500 transition shadow">Approve</button>
                      </form>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
