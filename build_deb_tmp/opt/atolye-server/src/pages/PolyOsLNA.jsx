import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Clock, CheckCircle, Loader, Terminal } from 'lucide-react';

// ── Arka plan matris efekti için kullanılacak karakterler ─────────────────────
const CHARS = 'PolyOS OGA System Register // ACCESS CONTROL ACTIVE // KERNEL LOCK ';

// ── Scrolling text component ────────────────────────────────────────────────
function MatrixBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const cols = Math.floor(canvas.width / 14);
        const drops = Array(cols).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4f1d96';
            ctx.font = '12px monospace';

            drops.forEach((y, i) => {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillStyle = Math.random() > 0.97 ? '#a855f7' : '#3b1363';
                ctx.fillText(char, i * 14, y * 14);
                if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                else drops[i]++;
            });
        };

        const id = setInterval(draw, 45);
        return () => { clearInterval(id); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-70" />;
}

// ── Banner scrolling text ──────────────────────────────────────────────────────
function ScrollBanner() {
    return (
        <div className="fixed top-0 left-0 right-0 z-10 bg-purple-950/80 backdrop-blur-sm border-b border-purple-800/50 overflow-hidden h-7 flex items-center">
            <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite] text-xs font-mono text-purple-400 tracking-widest px-4">
                {Array(6).fill('[ PolyOS OGS Register ] &nbsp; ⬡ &nbsp; Login Suspended &nbsp; ⬡ &nbsp; ACCESS CONTROL ACTIVE &nbsp; ⬡ &nbsp; KERNEL LOCK ENGAGED &nbsp; ⬡ &nbsp; ').join('')}
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
    );
}

// ── Ana sayfa ──────────────────────────────────────────────────────────────────
const PolyOsLNA = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'expired' | 'success'
    const [studentNumber, setStudentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [error, setError] = useState('');
    const [studentCount, setStudentCount] = useState(0);

    // Token doğrula (Gerçek API)
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('expired');
                setError('Token bulunamadı! Geçersiz bağlantı.');
                return;
            }

            try {
                const res = await fetch('/api/auth/oga-verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const data = await res.json();

                if (data.success) {
                    setStudentCount(data.studentCount);
                    const diff = Math.max(0, Math.floor((data.expiry - Date.now()) / 1000));
                    setCountdown(diff);
                    setStatus('valid');
                } else {
                    setStatus('expired');
                    setError(data.error || 'Geçersiz seans.');
                }
            } catch (err) {
                setStatus('expired');
                setError('Sunucu ile bağlantı kurulamadı.');
            }
        };

        verifyToken();
    }, [token]);

    // Geri sayım
    useEffect(() => {
        if (status !== 'valid' || countdown === null) return;
        const id = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { setStatus('expired'); clearInterval(id); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [status, countdown]);

    const fmtTime = (s) => {
        if (s === null) return '--:--';
        return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    };
    const isWarning = countdown !== null && countdown < 60;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!studentNumber.trim() || !password.trim()) { setError('Okul numarası ve şifre zorunludur.'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/oga-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNumber, password, token })
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
            } else {
                setError(data.error || 'Kimlik doğrulanamadı.');
            }
        } catch (err) {
            setError('Sistem hatası: Bağlantı kesildi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
            <MatrixBackground />
            <ScrollBanner />

            {/* İçerik kartı */}
            <div className="relative z-20 w-full max-w-md mx-4 mt-10">
                {/* Terminal header bar */}
                <div className="bg-slate-800/90 border border-purple-900/60 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-3 h-3 bg-red-500 opacity-80" />
                        <span className="w-3 h-3 bg-yellow-500 opacity-80" />
                        <span className="w-3 h-3 bg-green-500 opacity-80" />
                    </div>
                    <span className="flex-1 text-center text-[10px] font-mono text-purple-400 tracking-widest select-none uppercase">
                        polyos-oga — register session
                    </span>
                    <Terminal size={13} className="text-purple-600" />
                </div>

                <div className="bg-slate-900/95 border border-t-0 border-purple-900/60 rounded-xl p-6 backdrop-blur-lg">

                    {/* ── LOADING ── */}
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loader size={32} className="text-purple-400 animate-spin" />
                            <p className="text-purple-300 text-[11px] font-mono uppercase tracking-widest">Oturum doğrulanıyor...</p>
                        </div>
                    )}

                    {/* ── EXPIRED ── */}
                    {status === 'expired' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 border border-red-700/40 flex items-center justify-center bg-red-950/20">
                                <ShieldAlert size={32} className="text-red-400" />
                            </div>
                            <h2 className="text-base font-bold text-red-300 font-mono uppercase tracking-tighter">OTURUM GEÇERSİZ</h2>
                            <p className="text-slate-400 text-[11px] text-center font-mono leading-relaxed px-4">
                                {error || 'Süre doldu veya geçersiz token kullanıldı.'}<br />
                                Lütfen öğretmeninizden sistemi tekrar tetiklemesini isteyin.
                            </p>
                        </div>
                    )}

                    {/* ── SUCCESS ── */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 border border-emerald-700/40 flex items-center justify-center bg-emerald-950/20">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="text-base font-bold text-emerald-300 font-mono uppercase tracking-tighter">İşlem Tamamlandı</h2>
                            <p className="text-slate-400 text-[11px] text-center font-mono leading-relaxed">
                                Öğrenci profiliniz PolyOS platformuna aktarıldı.<br />
                                Bilgisayarı kullanmaya devam edebilirsiniz.
                            </p>
                        </div>
                    )}

                    {/* ── VALID — Form ── */}
                    {status === 'valid' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Başlık */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-sm font-bold text-purple-200 font-mono uppercase">Öğrenci Kendi Kayıt</h2>
                                    <span className={`text-[11px] font-bold font-mono px-2 py-1 flex items-center gap-1 border ${isWarning ? 'bg-red-950/60 border-red-500 text-red-400 animate-pulse' : 'bg-purple-900/40 border-purple-700/50 text-purple-400'}`}>
                                        <Clock size={11} /> {fmtTime(countdown)}
                                    </span>
                                </div>
                                <div className="p-2 border-l-2 border-purple-600 bg-purple-900/10 mb-4">
                                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">
                                        Seans Aktif: <span className="text-purple-300">{studentCount} öğrenci</span> için aktarım bekleniyor.
                                    </p>
                                </div>
                            </div>

                            {/* Okul No */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-500 font-mono mb-1.5 uppercase tracking-widest">Okul Numarası</label>
                                <input
                                    type="text"
                                    value={studentNumber}
                                    onChange={e => setStudentNumber(e.target.value)}
                                    placeholder="2401"
                                    className="w-full bg-slate-900 border border-purple-900/40 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>

                            {/* Şifre */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-500 font-mono mb-1.5 uppercase tracking-widest">PolyOS Şifresi</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900 border border-purple-900/40 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>

                            {/* Hata */}
                            {error && (
                                <p className="text-[10px] text-red-300 font-mono bg-red-950/40 border border-red-900/50 px-3 py-2 uppercase tracking-tighter">{error}</p>
                            )}

                            {/* Gönder */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-900 py-3 rounded-xl text-xs font-bold font-mono tracking-widest transition-all disabled:opacity-30 uppercase"
                            >
                                {submitting ? <><Loader size={14} className="animate-spin" /> Veriler Doğrulanıyor...</> : 'Oturumu Başlat'}
                            </button>

                            <p className="text-[9px] text-slate-700 font-mono text-center uppercase tracking-widest">
                                Secure OGA Link · SHA-256 Verified
                            </p>
                        </form>
                    )}
                </div>

                {/* Debug Info (Only in Dev) */}
                <div className="mt-4 text-[9px] text-slate-800 font-mono opacity-20 hover:opacity-100 transition-opacity break-all text-center uppercase">
                    Session Checksum: {token?.slice(0, 32)}...
                </div>
            </div>
        </div>
    );
};

export default PolyOsLNA;
