import React from 'react';
import { Search, Bell, MessageSquare, Zap } from 'lucide-react';

const KnowledgeLayout = ({ children, sidebar, widgets }) => {
  return (
    <div className="min-h-screen bg-[#12131A] text-slate-300 font-sans selection:bg-red-500/30 selection:text-white">
      
      {/* --- Action Toolbar (Sub-Header) --- */}
      <div className="sticky top-16 z-40 bg-[#12131A]/95 backdrop-blur border-b border-gray-800 py-2 mb-4 shadow-lg shadow-black/20">
        <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 flex items-center justify-between gap-3 md:gap-4">
           {/* Branding / Breadcrumb */}
           <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 shrink-0">
              <span className="text-red-500 font-bold tracking-tight">KNOWLEDGE<span className="text-[10px] text-slate-500 ml-0.5">BASE</span></span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200">Feed</span>
           </div>

           {/* Search Bar - Wider & Central */}
           <div className="flex-1 max-w-3xl relative group">
              <input 
                type="text" 
                placeholder="Search the knowledge database..." 
                className="w-full bg-gray-800 border border-gray-700 rounded-sm px-4 py-2 pl-10 text-xs focus:outline-none focus:border-red-500/50 transition-all text-slate-200 placeholder-slate-600 shadow-inner"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
              <div className="absolute right-2 top-2 text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-600/30 hidden sm:block cursor-pointer hover:bg-red-600/30 transition-colors">
                Ask AI
              </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 md:px-5 py-1.5 rounded-sm text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all hover:shadow-[0_0_20px_rgba(255,42,42,0.5)] border border-red-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ask Question</span>
             </button>
             
             <div className="h-6 w-[1px] bg-white/10"></div>

             <div className="flex items-center gap-4 text-slate-400">
               <button className="hover:text-white transition-colors relative p-1">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_5px_rgba(248,113,113,0.8)]"></span>
               </button>
               <button className="hover:text-white transition-colors p-1">
                 <MessageSquare className="w-4 h-4" />
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 pb-12 items-start">
        
        {/* Left Sidebar (Dense Nav) */}
        <div className="hidden md:block md:col-span-3 xl:col-span-2 sticky top-36 h-fit space-y-2">
           {sidebar}
        </div>

        {/* Center Feed (Dense) */}
        <main className="md:col-span-9 xl:col-span-7 min-h-0 space-y-4">
          {children}
        </main>

        {/* Right Sidebar (Widgets) */}
        <aside className="hidden xl:block xl:col-span-3 space-y-4 sticky top-36 h-fit">
          {widgets}
        </aside>
      </div>
      
      {/* Floating Action Button (Mobile) */}
      <button className="md:hidden fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-600/40 z-50 border border-white/20 hover:scale-105 transition-transform">
        <Zap className="w-6 h-6" />
      </button>

    </div>
  );
};

export default KnowledgeLayout;
