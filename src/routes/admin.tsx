import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import {
  BarChart3, Calendar, Users, DollarSign, Settings, FileText,
  Search, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Plus,
  Menu, X, LogOut, Home, Layers, Sparkles, Github, Check
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | 36ixty Booths" },
      { name: "description", content: "Manage enquiries, bookings, services and site content for 36ixty Booths with GitHub Commit publishing." },
    ],
  }),
});

const monthlyData = [
  { name: "Jan", enquiries: 45, bookings: 32 },
  { name: "Feb", enquiries: 52, bookings: 38 },
  { name: "Mar", enquiries: 68, bookings: 49 },
  { name: "Apr", enquiries: 74, bookings: 55 },
  { name: "May", enquiries: 95, bookings: 72 },
  { name: "Jun", enquiries: 110, bookings: 88 },
];

const serviceShare = [
  { name: "360 Booth", value: 35, color: "#3b82f6" },
  { name: "AI Booth", value: 25, color: "#8b5cf6" },
  { name: "AI Sketch Bots", value: 20, color: "#ec4899" },
  { name: "Trading Cards", value: 12, color: "#f59e0b" },
  { name: "Enclosed Booth", value: 8, color: "#10b981" },
];

const initialEnquiries = [
  { id: "ENQ-1092", name: "Sarah Jenkins", service: "AI Sketch Bots", date: "2026-11-12", status: "Confirmed", amount: "£2,400" },
  { id: "ENQ-1091", name: "Marcus Thorne", service: "360 Booth Hire", date: "2026-11-18", status: "Pending", amount: "£1,850" },
  { id: "ENQ-1090", name: "Elena Rostova", service: "Corporate Package", date: "2026-11-25", status: "Confirmed", amount: "£4,200" },
  { id: "ENQ-1089", name: "David Kim", service: "Trading Card Booth", date: "2026-12-02", status: "Reviewing", amount: "£2,100" },
];

const initialServices = [
  { id: "SRV-01", title: "360 Booth Hire", description: "High-impact slow-motion video content that guests love.", category: "Video Activations", updated: "2 days ago" },
  { id: "SRV-02", title: "AI Sketch Bots", description: "Robotic portrait sketching combined with AI generation.", category: "AI Experiential", updated: "3 days ago" },
  { id: "SRV-03", title: "Trading Card Booth", description: "Turn guests into customized collectible cards instantly.", category: "Interactive Print", updated: "1 week ago" },
  { id: "SRV-04", title: "Enclosed Photo Booth", description: "Classic private booth experience with modern finishes.", category: "Traditional", updated: "5 days ago" },
  { id: "SRV-05", title: "AI Booth", description: "Intelligent image transformations and custom brand worlds.", category: "AI Experiential", updated: "Just now" },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "enquiries" | "services" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State for dynamic content additions
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [services, setServices] = useState(initialServices);

  // GitHub Commit Config state
  const [ghOwner, setGhOwner] = useState("36ixty");
  const [ghRepo, setGhRepo] = useState("36ixty-web");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghToken, setGhToken] = useState("");
  const [commitStatus, setCommitStatus] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setGhOwner(localStorage.getItem("gh_owner") || "36ixty");
    setGhRepo(localStorage.getItem("gh_repo") || "36ixty-web");
    setGhBranch(localStorage.getItem("gh_branch") || "main");
    setGhToken(localStorage.getItem("gh_token") || "");
  }, []);

  const saveGhSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gh_owner", ghOwner);
    localStorage.setItem("gh_repo", ghRepo);
    localStorage.setItem("gh_branch", ghBranch);
    localStorage.setItem("gh_token", ghToken);
    setCommitStatus("GitHub settings saved successfully!");
    setTimeout(() => setCommitStatus(null), 3000);
  };

  const commitContentToGitHub = async (filename: string, contentJson: any, message: string) => {
    if (!ghToken) {
      setCommitStatus("Warning: No GitHub token configured in Settings. Saved to local state only.");
      return;
    }
    setIsCommitting(true);
    try {
      const path = `src/content/${filename}`;
      const url = `https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/${path}`;

      let sha: string | undefined = undefined;
      const getRes = await fetch(url, {
        headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const putRes = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message || `cms: add/update ${filename}`,
          content: btoa(unescape(encodeURIComponent(JSON.stringify(contentJson, null, 2)))),
          branch: ghBranch,
          sha,
        }),
      });

      if (putRes.ok) {
        setCommitStatus(`Successfully committed ${filename} to GitHub (${ghOwner}/${ghRepo})!`);
      } else {
        const err = await putRes.json();
        setCommitStatus(`GitHub commit error: ${err.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setCommitStatus(`Commit failed: ${err.message}`);
    } finally {
      setIsCommitting(false);
      setTimeout(() => setCommitStatus(null), 5000);
    }
  };

  // Modal / Form states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // New Service form state
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Experiential");

  // New Enquiry form state
  const [newClientName, setNewClientName] = useState("");
  const [newServiceType, setNewServiceType] = useState("360 Booth Hire");
  const [newEventDate, setNewEventDate] = useState("");
  const [newAmount, setNewAmount] = useState("£2,000");

  const handleAddService = async (e: FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;
    const slug = newServiceTitle.toLowerCase().replaceAll(" ", "-");
    const newItem = {
      id: `SRV-0${services.length + 1}`,
      title: newServiceTitle,
      description: newServiceDesc || "New experiential service activation.",
      category: newServiceCategory,
      updated: "Just now",
    };
    setServices([newItem, ...services]);

    // Commit to GitHub as JSON
    await commitContentToGitHub(
      `services/${slug}.json`,
      newItem,
      `cms: add service ${newServiceTitle}`
    );

    setNewServiceTitle("");
    setNewServiceDesc("");
    setShowServiceModal(false);
  };

  const handleAddEnquiry = (e: FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    const newEnq = {
      id: `ENQ-1${Math.floor(100 + Math.random() * 900)}`,
      name: newClientName,
      service: newServiceType,
      date: newEventDate || "2026-12-15",
      status: "Pending",
      amount: newAmount,
    };
    setEnquiries([newEnq, ...enquiries]);
    setNewClientName("");
    setShowEnquiryModal(false);
  };

  const filteredEnquiries = enquiries.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar for Desktop & Mobile Toggle */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 font-black text-xl tracking-wider">
            <span className="text-white">3</span><span className="text-rose-500">6</span><span className="text-white">IXTY</span>
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full uppercase">Admin</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <BarChart3 className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("enquiries")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "enquiries" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Users className="w-4 h-4" /> Enquiries & Bookings
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "services" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Layers className="w-4 h-4" /> Services & CMS
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Settings className="w-4 h-4" /> Settings & Git
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" /> Return to Website
          </Link>
          <Link to="/" className="text-slate-400 hover:text-rose-400 transition-colors" title="Log out">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">{activeTab} Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {commitStatus && (
              <div className="hidden xl:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-rose-300">
                <Github className="w-3.5 h-3.5 text-rose-400" />
                <span>{commitStatus}</span>
              </div>
            )}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-rose-500 w-64"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowServiceModal(true)}
                className="hidden lg:flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Content (Git Commit)
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                36
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6 md:p-8 flex-1 space-y-8">
          {commitStatus && (
            <div className="xl:hidden bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <Github className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{commitStatus}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enquiries</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{440 + enquiries.length}</h3>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this month
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirmed Bookings</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">328</h3>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +12.1% this month
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Revenue</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">£348.2k</h3>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% YoY
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Services</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{services.length}</h3>
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-2">
                      Synced with GitHub
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400">
                    <Github className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Enquiries vs. Bookings Trend</h3>
                    <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">2026 YTD</span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", color: "#f8fafc" }} />
                        <Bar dataKey="enquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bookings" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Service Popularity Share</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={serviceShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {serviceShare.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", color: "#f8fafc" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Enquiries Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Recent Event Enquiries</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manage incoming leads and booking requests from potential clients.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowEnquiryModal(true)} className="text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Enquiry
                    </button>
                    <button onClick={() => setActiveTab("enquiries")} className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors">
                      View all &rarr;
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Client Name</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Event Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {enquiries.slice(0, 5).map((enq) => (
                        <tr key={enq.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-400">{enq.id}</td>
                          <td className="p-4 font-semibold text-white">{enq.name}</td>
                          <td className="p-4">{enq.service}</td>
                          <td className="p-4">{enq.date}</td>
                          <td className="p-4 font-semibold text-emerald-400">{enq.amount}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              enq.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              enq.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {enq.status === "Confirmed" && <CheckCircle2 className="w-3 h-3" />}
                              {enq.status === "Pending" && <Clock className="w-3 h-3" />}
                              {enq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "enquiries" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">All Enquiries & Bookings</h3>
                  <p className="text-xs text-slate-400">Complete database of leads, client communications and confirmed event dates.</p>
                </div>
                <button onClick={() => setShowEnquiryModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-600/20">
                  <Plus className="w-4 h-4" /> Add Enquiry
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredEnquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono text-xs text-slate-400">{enq.id}</td>
                        <td className="p-4 font-semibold text-white">{enq.name}</td>
                        <td className="p-4">{enq.service}</td>
                        <td className="p-4">{enq.date}</td>
                        <td className="p-4 font-semibold text-emerald-400">{enq.amount}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            enq.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {enq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Services & GitHub CMS Content</h3>
                  <p className="text-xs text-slate-400">Adding services here automatically creates a GitHub commit to your repository.</p>
                </div>
                <button onClick={() => setShowServiceModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-600/20">
                  <Github className="w-4 h-4" /> Add Service (Git Commit)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv, i) => (
                  <div key={srv.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{srv.id}</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{srv.category}</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{srv.title}</h4>
                    <p className="text-xs text-slate-400">{srv.description}</p>
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-rose-400 font-medium">Synced via Git</span>
                      <span className="text-slate-500">Updated {srv.updated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6 max-w-xl">
              <div>
                <h3 className="text-lg font-bold text-white">GitHub Repository & Token Settings</h3>
                <p className="text-xs text-slate-400">Configure your GitHub repo details and Personal Access Token to enable direct Git commits when adding content.</p>
              </div>
              <form onSubmit={saveGhSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5 text-sm">
                    <span className="text-slate-300 font-medium">GitHub Owner / Org</span>
                    <input
                      type="text"
                      value={ghOwner}
                      onChange={(e) => setGhOwner(e.target.value)}
                      placeholder="e.g. 36ixty"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="text-slate-300 font-medium">Repository Name</span>
                    <input
                      type="text"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      placeholder="e.g. 36ixty-web"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </label>
                </div>
                <label className="block space-y-1.5 text-sm">
                  <span className="text-slate-300 font-medium">Branch</span>
                  <input
                    type="text"
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </label>
                <label className="block space-y-1.5 text-sm">
                  <span className="text-slate-300 font-medium">GitHub Personal Access Token (repo scope)</span>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono text-xs"
                  />
                  <span className="text-[11px] text-slate-500">Token requires `repo` scope permissions to create commits.</span>
                </label>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Save GitHub Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Add New Service / Git Commit Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Github className="w-5 h-5 text-rose-400" /> Add Content & Commit to GitHub
              </h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hologram Booth Experience"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Experiential">Experiential</option>
                  <option value="AI Experiential">AI Experiential</option>
                  <option value="Video Activations">Video Activations</option>
                  <option value="Interactive Print">Interactive Print</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of the new experience..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                💡 Clicking "Commit & Publish" will push a new JSON file (`src/content/services/[slug].json`) directly to your GitHub repo via the GitHub Contents API.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCommitting}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2"
                >
                  {isCommitting ? "Committing..." : "Commit & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Event Enquiry</h3>
              <button onClick={() => setShowEnquiryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Client Name / Brand</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Corp"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Service Requested</label>
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="360 Booth Hire">360 Booth Hire</option>
                  <option value="AI Sketch Bots">AI Sketch Bots</option>
                  <option value="Trading Card Booth">Trading Card Booth</option>
                  <option value="Enclosed Photo Booth">Enclosed Photo Booth</option>
                  <option value="AI Booth">AI Booth</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Est. Amount</label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-600/20"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
