import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, Check, RefreshCw, Download, Key, Info } from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useToast } from '../../components/ui/Toast';

const PolyOsOGA = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('ALL');
    const [selected, setSelected] = useState(new Set());
    const [withPwd, setWithPwd] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const { toast } = useToast();

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/students');
            const data = await res.json();
            if (data.success && Array.isArray(data.students)) {
                setStudents(data.students.sort((a, b) =>
                    (a.className || '').localeCompare(b.className || '') ||
                    (a.fullName || '').localeCompare(b.fullName || '')
                ));
            }
        } catch {
            toast.error('Öğrenci listesi yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const uniqueClasses = useMemo(() =>
        [...new Set(students.map(s => s.className).filter(Boolean))].sort()
        , [students]);

    const classCounts = useMemo(() => {
        const map = {};
        students.forEach(s => { if (s.className) map[s.className] = (map[s.className] || 0) + 1; });
        return map;
    }, [students]);

    const filtered = useMemo(() => students.filter(s => {
        const matchSearch = !search ||
            s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            s.studentNumber?.includes(search);
        const matchClass = filterClass === 'ALL' || s.className === filterClass;
        return matchSearch && matchClass;
    }), [students, search, filterClass]);

    const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));

    const toggleStudent = (id) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const toggleAllFiltered = () => {
        if (allFilteredSelected) {
            setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.delete(s.id)); return n; });
        } else {
            setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s.id)); return n; });
        }
    };

    const clearAll = () => setSelected(new Set());

    const selectedStudents = useMemo(() => students.filter(s => selected.has(s.id)), [students, selected]);

    const downloadPolyosLab = () => {
        if (selected.size === 0) return;
        setDownloading(true);
        try {
            const sel = students.filter(s => selected.has(s.id));
            const data = {
                polyoslab_version: '1.0', format: 'polyoslab',
                exported_at: new Date().toISOString(), student_count: sel.length, include_passwords: withPwd,
                students: sel.map(s => ({
                    id: s.id, fullName: s.fullName, studentNumber: s.studentNumber, className: s.className,
                    polyos_id: s.studentNumber?.toLowerCase() || s.id,
                    ...(withPwd ? { password_hash: `sha256:${s.id}` } : {})
                }))
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `polyos_oga_${Date.now()}.polyoslab`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('.polyoslab dosyası indirildi.');
        } catch {
            toast.error('Dosya oluşturulamadı.');
        } finally {
            setDownloading(false);
        }
    };

    const avatarColor = (name) => {
        const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500'];
        let h = 0;
        for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i)) % colors.length;
        return colors[h];
    };

    return (
        <TeacherLayout>
            <div className="flex flex-col h-full">

                {/* ── Başlık bloğu ── */}
                <div className="flex-shrink-0 w-full">
                    {/* Satır 1: başlık */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-violet-100 rounded-xl">
                            <Download className="text-violet-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-none uppercase tracking-tight">Öğrenci Aktarımı</h1>
                            <p className="text-slate-500 text-sm mt-1">Seçili öğrencileri PolyOS sistemine aktarmak için dışa aktarın</p>
                        </div>
                    </div>

                    <hr className="border-slate-200 mb-4" />

                    {/* Satır 2: sınıf chip'leri */}
                    <div className="flex items-center gap-2 flex-wrap mb-5">
                        {uniqueClasses.map(cls => (
                            <button
                                key={cls}
                                onClick={() => setFilterClass(prev => prev === cls ? 'ALL' : cls)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${filterClass === cls
                                    ? 'bg-violet-100 border-violet-400 text-violet-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                                    }`}
                            >
                                <span>{cls}</span>
                                <span className={`rounded-xl px-1.5 py-0.5 text-[10px] font-bold ${filterClass === cls ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {classCounts[cls] || 0}
                                </span>
                            </button>
                        ))}
                        {uniqueClasses.length > 0 && (
                            <span className="text-slate-400 text-xs ml-2">
                                Toplam <strong className="text-slate-700">{students.length}</strong> öğrenci
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Gövde ── */}
                <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_420px] gap-5 h-full">

                        {/* SOL: Öğrenci Listesi */}
                        <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

                            {/* Arama + filtre toolbar */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Ad veya numara ara…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-0 transition-colors"
                                    />
                                </div>
                                <select
                                    value={filterClass}
                                    onChange={e => setFilterClass(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-sm focus:outline-none appearance-none"
                                >
                                    <option value="ALL">Tüm Sınıflar ({students.length})</option>
                                    {uniqueClasses.map(cls => (
                                        <option key={cls} value={cls}>{cls} ({classCounts[cls] || 0})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchStudents}
                                    disabled={loading}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Yenile"
                                >
                                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Tümünü seç / sayaç bar */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 flex-shrink-0 bg-slate-50">
                                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={toggleAllFiltered}>
                                    <div className={`w-4 h-4 rounded-xl border-2 flex items-center justify-center transition-all ${allFilteredSelected
                                        ? 'bg-violet-600 border-violet-600'
                                        : 'border-slate-300 group-hover:border-violet-400'
                                        }`}>
                                        {allFilteredSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-800 transition-colors font-medium">
                                        {allFilteredSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {(search || filterClass !== 'ALL')
                                        ? <><strong className="text-slate-600">{filtered.length}</strong> sonuç</>
                                        : <><strong className="text-slate-600">{students.length}</strong> öğrenci</>
                                    }
                                </span>
                            </div>

                            {/* Öğrenci satırları */}
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                        <RefreshCw size={18} className="animate-spin mr-2" /> Yükleniyor…
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                        <Users size={36} className="opacity-30" />
                                        <p className="text-sm">Arama kriterlerine uygun öğrenci bulunamadı.</p>
                                    </div>
                                ) : filtered.map(student => {
                                    const isSelected = selected.has(student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleStudent(student.id)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group select-none ${isSelected ? 'bg-violet-50 hover:bg-violet-100/60' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            {/* Checkbox */}
                                            <div className={`w-4 h-4 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300 group-hover:border-violet-400'
                                                }`}>
                                                {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                            </div>

                                            {/* Avatar */}
                                            <div className={`w-8 h-8 shrink-0 rounded-xl ${avatarColor(student.fullName)} flex items-center justify-center text-white text-xs font-bold`}>
                                                {(student.fullName || '?').charAt(0).toUpperCase()}
                                            </div>

                                            {/* Bilgi */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate leading-none ${isSelected ? 'text-violet-900' : 'text-slate-800'}`}>
                                                    {student.fullName}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">{student.studentNumber}</p>
                                            </div>

                                            {/* Sınıf badge */}
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                                {student.className}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SAĞ: Ekran */}
                        <div className="flex flex-col gap-4">
                            {/* Seçim Durumu ve Dosya Dışa Aktarımı */}
                            {selected.size === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center text-slate-400 gap-2 min-h-[200px]">
                                    <Users size={32} className="opacity-30 mb-2" />
                                    <p className="text-sm">İşlem yapmak için soldaki listeden öğrenci seçin.</p>
                                </div>
                            ) : null}

                            {/* .polyoslab Dosya Dışa Aktarımı */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <Download size={16} className="text-blue-600" />
                                    <h3 className="text-base font-bold text-slate-900">Dosya Olarak Aktar</h3>
                                </div>

                                <div className="space-y-3">
                                    {/* Şifre toggle */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Key size={14} className="text-slate-400 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tighter">Şifre Hashleri</p>
                                            <p className="text-[10px] text-slate-400 font-mono">SHA-256 GÜVENLİ</p>
                                        </div>
                                        <button onClick={() => setWithPwd(p => !p)}
                                            className={`relative w-9 h-5 rounded-xl transition-colors ${withPwd ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white shadow transition-transform ${withPwd ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={downloadPolyosLab}
                                        disabled={selected.size === 0 || downloading}
                                        className={`w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-all ${selected.size === 0 ? 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-black text-white'
                                            }`}
                                    >
                                        {downloading ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                                        .POLYOSLAB İNDİR
                                    </button>

                                    <div className="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50 p-2 border-l-2 border-slate-300 leading-tight">
                                        <Info size={12} className="shrink-0 mt-0.5" />
                                        <span>Bu dosya, seçilen öğrenci profillerini başka bir PolyOS sistemine toplu aktarmak için kullanılır.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default PolyOsOGA;
