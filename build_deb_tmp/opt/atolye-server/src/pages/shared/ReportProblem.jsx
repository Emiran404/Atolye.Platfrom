import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Send, CheckCircle2, Info, ArrowLeft, 
  MessageSquare, User, ShieldCheck, Globe, Activity, 
  Layers, ChevronRight, Zap, Github
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { StudentLayout, TeacherLayout } from '../../components/layouts';
import { t } from '../../utils/i18n';
import { useNavigate } from 'react-router-dom';
import packageJson from '../../../package.json';

const ReportProblem = () => {
  const navigate = useNavigate();
  const APP_VERSION = packageJson.version || '2.0.0';
  const { user, userType, theme } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bug',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system/metrics');
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Metrics fetch error:', error);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/system/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          context: {
            userId: user?.id,
            userName: user?.fullName || user?.name,
            userType,
            version: `v${APP_VERSION} Stable`,
            browser: navigator.userAgent,
            platform: navigator.platform,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Sunucu hatası');
      
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        toast.success(data.message || t('reportSent'));
        setFormData({ type: 'bug', subject: '', message: '' });
      } else {
        throw new Error(data.error || t('somethingWentWrong'));
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error(t('reportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const content = (
    <div className="max-w-[1400px] ml-0 pl-4 lg:pl-10 py-8 lg:py-12 pr-4 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={handleBack}
            className={`group p-4 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 backdrop-blur-md' 
                : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className={`flex items-center gap-2 mb-1`}>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-white'}`}>
                {t('feedbackCenter')}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">{t('reportProblemMenu')}</span>
            </h1>
          </div>
        </div>
        
        {metrics && (
          <div className={`hidden lg:flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/50 border-white/50 shadow-sm'}`}>
            <div className="flex flex-col items-center px-4 border-r border-slate-800/20 last:border-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">{t('serverLoad')}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${metrics.cpu < 50 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                <span className="font-mono text-sm font-black">{metrics.cpu}%</span>
              </div>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">{t('systemVersion')}</span>
              <span className="font-mono text-sm font-black text-blue-500">v{APP_VERSION} Stable</span>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className={`relative overflow-hidden group p-1 transition-all duration-500 rounded-[2rem] ${theme === 'dark' ? 'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'hover:shadow-2xl hover:shadow-blue-500/10'}`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className={`relative p-8 rounded-[1.9rem] border transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-600/20">
                  <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
                    <User size={30} className="text-blue-500" />
                  </div>
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t('activeUser')}</p>
                  <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user?.fullName || user?.name || t('unknown')}</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-white hover:shadow-md'}`}>
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-blue-500" />
                    <span className="text-sm font-bold opacity-80 uppercase tracking-tighter">{t('roleDefinition')}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${userType === 'teacher' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {userType === 'teacher' ? t('teacher') : t('student')}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Activity size={12} className="text-emerald-500" /> {t('platformSummary')}
                  </p>
                  <p className={`text-[13px] font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Win32 Platformu • v{APP_VERSION} {t('platformBuild')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`relative overflow-hidden group p-8 rounded-[2rem] border transition-all duration-300 ${
            theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck size={120} className="text-emerald-500" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Globe size={20} className="text-emerald-500" />
                </div>
                <h3 className={`text-lg font-black tracking-tight ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('secureTransmission')}</h3>
              </div>
              <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('secureTransmissionDesc')}
              </p>
            </div>
          </div>

          {/* GitHub Professional Link Entry */}
          <a 
            href="https://github.com/Emiran404/Atoyle.Platfrom/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`block p-6 rounded-[2rem] border transition-all duration-300 group/gh ${
              theme === 'dark' 
                ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80' 
                : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-blue-500/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shrink-0 group-hover/gh:scale-110 transition-transform shadow-lg shadow-black/20">
                <Github size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('professionalChannel')}</p>
                <h4 className={`text-base font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>GitHub Issues</h4>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover/gh:text-blue-500 group-hover/gh:translate-x-1 transition-all" />
            </div>
            <p className={`mt-4 text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
              {t('githubIssuesDesc')}
            </p>
          </a>
        </div>

        <div className="lg:col-span-8">
          <div className={`relative p-10 lg:p-12 rounded-[2.5rem] shadow-2xl border overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500`} />
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                    <Zap size={14} className="text-blue-500" /> {t('reportType')}
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={`w-full p-5 rounded-2xl border appearance-none outline-none transition-all duration-300 font-bold text-lg ${
                        theme === 'dark' 
                          ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                          : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5'
                      }`}
                    >
                      <option value="bug">{t('bug')}</option>
                      <option value="suggestion">{t('suggestion')}</option>
                      <option value="ui">{t('uiIssue')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={24} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                    <MessageSquare size={14} className="text-blue-500" /> {t('subjectTitle')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('subjectPlaceholder')}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full p-5 rounded-2xl border outline-none transition-all duration-300 font-bold text-lg ${
                      theme === 'dark' 
                        ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                        : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                  <Info size={14} className="text-blue-500" /> {t('detailedMessage')}
                </label>
                <textarea
                  required
                  rows={10}
                  placeholder={t('messagePlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full p-6 rounded-[2rem] border outline-none transition-all duration-300 resize-none leading-relaxed font-semibold text-lg ${
                    theme === 'dark' 
                      ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-20 rounded-3xl overflow-hidden transition-all duration-500 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:scale-105 transition-transform duration-500" />
                <div className="relative h-full flex items-center justify-center gap-4 text-white font-black text-xl tracking-tighter">
                  {loading ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {t('sendReportNow')}
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const Layout = userType === 'teacher' ? TeacherLayout : StudentLayout;

  if (success) {
    return (
      <Layout>
        <div className={`relative min-h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
          {/* Watermark for Success Page */}
          <div className="fixed inset-0 pointer-events-none select-none opacity-[0.15] dark:opacity-[0.1] -z-10 overflow-hidden" style={{ transform: 'rotate(-20deg) scale(1.2)' }}>
            <div className="flex flex-wrap gap-x-20 gap-y-12 items-center justify-center w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4">
              {Array.from({ length: 120 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 text-center">
                  <div className="flex gap-4">
                    <span className={`text-xl font-black tracking-widest whitespace-nowrap ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>POLYOS EXAM</span>
                    <span className={`text-xl font-black tracking-widest whitespace-nowrap ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>POLYOS EXAM</span>
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.4em] whitespace-nowrap uppercase ${theme === 'dark' ? 'text-slate-700' : 'text-slate-500'}`}>ATOLYE.PLATFORM</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center py-24 px-4 relative">
            <div className={`relative max-w-2xl w-full p-16 rounded-[4rem] shadow-2xl text-center border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className={`absolute top-0 left-0 w-full h-[8px] bg-emerald-500`} />
              <div className="w-32 h-32 bg-emerald-500/20 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-12 group hover:rotate-0 transition-transform duration-500 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 size={70} />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tighter">{t('notificationSent')}</h2>
              <p className={`text-xl leading-relaxed mb-12 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('successMessageDesc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="py-5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {t('newReport')}
                </button>
                <button
                  onClick={handleBack}
                  className={`py-5 px-8 font-black rounded-3xl transition-all border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
                >
                  {t('backToDashboard')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`relative min-h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Full Page Branded Watermark */}
        <div className="fixed inset-0 pointer-events-none select-none opacity-[0.15] dark:opacity-[0.1] -z-10 overflow-hidden" style={{ transform: 'rotate(-20deg) scale(1.2)' }}>
          <div className="flex flex-wrap gap-x-20 gap-y-12 items-center justify-center w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4">
            {Array.from({ length: 120 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 text-center">
                <div className="flex gap-4">
                  <span className={`text-xl font-black tracking-widest whitespace-nowrap ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>POLYOS EXAM</span>
                  <span className={`text-xl font-black tracking-widest whitespace-nowrap ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>POLYOS EXAM</span>
                </div>
                <span className={`text-[10px] font-black tracking-[0.4em] whitespace-nowrap uppercase ${theme === 'dark' ? 'text-slate-700' : 'text-slate-400'}`}>ATOLYE.PLATFORM</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          {content}
        </div>

        {/* Decorative background glows */}
        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full -z-20 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-20 pointer-events-none" />
      </div>
    </Layout>
  );
};

export default ReportProblem;
