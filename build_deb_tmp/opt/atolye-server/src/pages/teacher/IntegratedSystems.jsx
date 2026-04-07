import React from 'react';
import { Network, Monitor, ArrowRight, ExternalLink, ShieldCheck, Activity, UserCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeacherLayout } from '../../components/layouts';

const IntegratedSystems = () => {
    const navigate = useNavigate();

    return (
        <TeacherLayout>
            <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Network className="text-blue-600 w-8 h-8" />
                        Entegre Sistemler
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-3xl leading-relaxed">
                        PolyOS ekosistemindeki diğer modülleri buradan yönetebilir ve birbirleriyle haberleşmelerini sağlayabilirsiniz.
                    </p>
                </div>

                {/* Systems Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

                    {/* PolyOS Labs Card */}
                    <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer" onClick={() => navigate('/ogretmen/polyos')}>
                        {/* Background decoration */}
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <Monitor size={28} />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold tracking-wide">AKTİF</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">PolyOS Labs</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Sınıftaki tüm bilgisayarları eşzamanlı, düşük gecikmeli ve kernel seviyesinde yönetin. Uzaktan ekran izleme, komut çalıştırma ve cihaz kilitleme işlemleri.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <ShieldCheck size={14} className="text-blue-500" />
                                    <span>Kernel Kilit</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <Activity size={14} className="text-emerald-500" />
                                    <span>&lt;1ms Gecikme</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                Panele Git <ArrowRight size={16} />
                            </span>
                            <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>

                    {/* PolyOS OGA Card */}
                    <div
                        className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                        onClick={() => navigate('/ogretmen/polyos-oga')}
                    >
                        {/* Background decoration */}
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <UserCheck size={28} />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold tracking-wide">AKTİF</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">PolyOS OGA</h3>
                            <p className="text-xs font-semibold text-purple-500 mb-3 uppercase tracking-wider">Öğrenci Aktarımı</p>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                PolyOS Labs ortamındaki öğrencileri okul numarası ve PolyOS şifresiyle platforma aktarın. Yalnızca <code className="text-xs bg-slate-100 px-1 rounded">.polyoslab</code> dosyası oluşturarak güvenli, şifreli öğrenci profili transferi yapabilirsiniz.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <Users size={14} className="text-purple-500" />
                                    <span>Toplu Aktarım</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <Users size={14} className="text-purple-500" />
                                    <span>Sınıf Bazlı</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <span className="text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                Aktarım Yönetimi <ArrowRight size={16} />
                            </span>
                            <ExternalLink size={18} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                    </div>

                    {/* Future Module Placeholder */}
                    <div className="relative bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] opacity-70">
                        <div className="w-14 h-14 rounded-xl bg-slate-200/50 flex items-center justify-center text-slate-400 mb-4">
                            <Network size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 mb-2">Sınav Güvenlik Modülü</h3>
                        <p className="text-slate-500 text-sm mb-4 max-w-[250px]">
                            Akıllı kopya algılama ve kamera izleme sistemleri yakında eklenecek.
                        </p>
                        <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            Yakında
                        </span>
                    </div>

                </div>
            </div>
        </TeacherLayout>
    );
};

export default IntegratedSystems;
