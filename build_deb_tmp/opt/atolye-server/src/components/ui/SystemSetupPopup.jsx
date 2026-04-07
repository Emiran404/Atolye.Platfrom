import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, X, Code, Network } from 'lucide-react';

const SystemSetupPopup = () => {
  const [minimized, setMinimized] = useState(false);
  const navigate = useNavigate();

  if (minimized) {
    return (
      <div 
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 left-6 bg-[#ec5b13] text-white p-4 rounded-full cursor-pointer shadow-lg shadow-[#ec5b13]/40 z-[100] hover:scale-110 transition-transform animate-bounce"
        title="Kuruluma Devam Et"
      >
        <Terminal size={24} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
      <div className="relative w-full max-w-[850px] group">
        {/* Background decorative elements */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#0ea5e9]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#ec5b13]/20 rounded-full blur-3xl"></div>
        
        <div className="relative overflow-hidden rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch bg-white/70 dark:bg-[#221610]/60 backdrop-blur-xl border border-white/30 dark:border-[#ec5b13]/10">
          
          {/* Close button */}
          <button 
            onClick={() => setMinimized(true)}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Tech Illustration / Side Image */}
          <div className="w-full md:w-2/5 min-h-[300px] md:min-h-[auto] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/40 to-[#ec5b13]/40 mix-blend-overlay z-10"></div>
             <div className="w-full h-full bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDosfRAte5fh_RAPLjI6GTwqyI_1ZyrHn3z2Q-xFxrm63AC5eNk4ZkAJcs_DUcJNZslQoX_x4T9X3pGwoLHdtq_537gWaR8rwLkVSKAlR9OeCSz6A5bHRau2gEXz1cpxo4wKJzNfPiNy_4YDmxLLYxytF--OJ9n9iA1DNveVozBMUFfM2L5y7LLxFkKD89eJKbPYcufATtyZy-KSjxsNNxUNGEokIcglwUA7XJe9zoQtELYZojBtTNWm-ZE217Pi7ek4VNCAZgo12nL")' }}>
             </div>
             <div className="absolute inset-0 flex items-center justify-center z-20">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                     <Terminal className="text-white" size={48} />
                 </div>
             </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
              <div>
                  <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-bold uppercase tracking-wider rounded">v2.1.2 Stable</span>
                      <span className="px-2 py-1 bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-bold uppercase tracking-wider rounded">Yeni Kurulum</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                      PolyOS Exam
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                      PolyOS Exam Yazılımımızı yüklediğiniz ve kullandığınız için teşekkür ederiz. Görünüşe göre yeni
                      kurulum yaptınız. Öğretmen hesabını şimdi bu sayfadan oluşturun.
                  </p>
              </div>
              <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center gap-4">
                      <button
                          onClick={() => navigate('/ogretmen/kayit')}
                          className="flex-1 md:flex-none min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-[#ec5b13] to-[#ff7e42] text-white text-sm font-bold shadow-lg shadow-[#ec5b13]/30 hover:shadow-[#ec5b13]/40 transition-all active:scale-95">
                          <span className="truncate">Hesabı Oluştur</span>
                      </button>
                      <a className="flex items-center gap-2 px-4 h-12 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          href="https://github.com/Emiran404/Atoyle.Platfrom" target="_blank" rel="noopener noreferrer">
                          <Network className="text-slate-700 dark:text-slate-300" size={20} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Github</span>
                      </a>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                      <div className="flex items-center gap-2 text-slate-400">
                          <Terminal size={16} />
                          <p className="text-[11px] font-medium uppercase tracking-widest">Tech-focused Infrastructure</p>
                      </div>
                      <p className="text-slate-500 text-xs font-medium">
                          Developed by <span className="text-[#ec5b13]">Emirhan Gök</span>
                      </p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSetupPopup;
