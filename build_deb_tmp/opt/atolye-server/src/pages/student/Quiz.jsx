import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Timer,
    Send,
    HelpCircle,
    FileText,
    Home,
    Trophy,
    XCircle,
    BarChart3
} from 'lucide-react';
import { StudentSidebar } from '../../components/layout';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useLiveSessionStore } from '../../store/liveSessionStore';
import { ConfirmModal } from '../../components/ui';
import { t } from '../../utils/i18n';

const Quiz = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const { loadExams, exams } = useExamStore();
    const { submitQuiz, loadSubmissions } = useSubmissionStore();
    const { sendHeartbeat, reportWarning, finishSession } = useLiveSessionStore();

    const [exam, setExam] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Tamam',
        onConfirm: () => {},
        type: 'warning'
    });

    // Verileri yükle
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await loadExams();
            const allSubmissions = await loadSubmissions();

            const foundExam = exams.find(e => e.id === examId);
            if (!foundExam || !foundExam.isQuiz) {
                toast.error('Sınav bulunamadı veya geçerli bir quiz değil.');
                navigate('/ogrenci/panel');
                return;
            }

            // Daha önce teslim edilmiş mi kontrol et
            const existing = allSubmissions.find(s => s.examId === examId && s.studentId === user?.id && s.status !== 'edit_granted');
            if (existing) {
                setSubmitted(true);
                setQuizResult(existing);
                setLoading(false);
                return;
            }

            setExam(foundExam);

            // Süreyi hesapla
            const now = new Date();
            const end = new Date(foundExam.endDate);
            const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
            setTimeLeft(remainingSeconds);

            if (remainingSeconds <= 0) {
                toast.error('Sınav süresi dolmuş.');
                navigate('/ogrenci/panel');
            }

            setLoading(false);
        };

        fetchData();
    }, [examId, user?.id]);

    // Sayaç Yönetimi
    useEffect(() => {
        if (loading || submitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Süre bitince otomatik gönder
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, submitted]);

    // Canlı İzleme (Sinyal Gönderme & İptal Kontrolü)
    useEffect(() => {
        if (loading || submitted || !exam) return;

        const checkHeartbeat = async () => {
            const response = await sendHeartbeat(exam.id, user.id, user.fullName, user.studentNumber, user.className, currentQuestionIndex);
            if (response && response.status === 'cancelled') {
                toast.error('Sınavınız gözetmen tarafından iptal edilmiştir.', { duration: 6000 });
                setSubmitted(true);
                navigate('/ogrenci/panel');
            }
        };

        const heartbeatInterval = setInterval(checkHeartbeat, 15000);
        checkHeartbeat(); // İlk sinyali ve soru değiştiğinde anında gönder

        return () => clearInterval(heartbeatInterval);
    }, [loading, submitted, exam, user, currentQuestionIndex]);

    // Anti-Cheat (Sınav Güvenliği)
    useEffect(() => {
        if (!exam || submitted) return;

        const handleContextMenu = (e) => {
            if (exam.disableShortcuts) {
                e.preventDefault();
                toast.error('Sağ tık bu sınavda engellenmiştir.');
                reportWarning(exam.id, user.id, 'right_click', 'Sağ tık kullanımı engellendi');
            }
        };

        const handleCopy = (e) => {
            if (exam.disableShortcuts) {
                e.preventDefault();
                toast.error('Kopyalama bu sınavda engellenmiştir.');
                reportWarning(exam.id, user.id, 'copy_paste', 'Kopyalama girişimi engellendi');
            }
        };

        const handleVisibilityChange = () => {
            if (exam.disableShortcuts && document.hidden && !submitted) {
                toast.error('Sınav ekranından ayrıldınız! Lütfen sınavınıza odaklanın!', { duration: 5000 });
                reportWarning(exam.id, user.id, 'tab_switch', 'Öğrenci sınav sekmesinden ayrıldı');
            }
        };

        const handleBlur = () => {
            if (exam.disableShortcuts && !submitted) {
                toast.warning('Dikkatiniz dağıldı! Lütfen sınav ekranına geri dönün.');
                reportWarning(exam.id, user.id, 'blur', 'Ekran odağı kayboldu');
            }
        };

        const handleKeyDown = (e) => {
            if (exam.disableShortcuts) {
                // F1-F12 keys, Alt, Tab, Meta, Ctrl+C/V
                if (
                    e.key === 'F11' ||
                    e.key === 'F12' ||
                    (e.altKey && e.key === 'Tab') ||
                    (e.altKey && e.key === 'F4') ||
                    e.metaKey ||
                    (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p'))
                ) {
                    e.preventDefault();
                    toast.error('Bu kısayol işlemi sınav sırasında engellenmiştir.');
                    reportWarning(exam.id, user.id, 'keyboard', `Yasaklı kısayol tuşu kullanıldı (${e.key})`);
                }
            }
        };

        const handleFullscreenChange = async () => {
            if (exam.preventLeaveFullScreen && !document.fullscreenElement && !submitted) {
                toast.error('Sınav sırasında tam ekrandan çıkmak yasaktır! Lütfen tekrar tam ekrana dönün.', { duration: 6000 });
                reportWarning(exam.id, user.id, 'fullscreen', 'Tam ekrandan çıkıldı');
                setIsPaused(true);
            }
        };

        // Event Listenere'ları ekle
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Tam ekrana zorla (eğer açık ve destekleniyorsa)
        if (exam.preventLeaveFullScreen && !document.fullscreenElement) {
            try {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.log('Otomatik tam ekran engellendi, kullanıcı etkileşimi bekleniyor:', err);
                });
            } catch (e) { }
        }

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [exam, submitted]);

    const handleSelectOption = (questionId, optionIndex) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (submitting || submitted) return;

        // Cevaplanmamış soruları kontrol et
        const unansweredCount = exam.questions.length - Object.keys(answers).length;
        if (unansweredCount > 0 && timeLeft > 5) { // 5 saniyeden fazla varsa onayla
            setConfirmModal({
                isOpen: true,
                title: 'Eksik Cevaplar',
                message: `${unansweredCount} soru cevaplanmadı. Yine de göndermek istiyor musunuz?`,
                confirmText: 'Gönder',
                type: 'warning',
                onConfirm: () => processSubmit()
            });
            return;
        }

        processSubmit();
    };

    const processSubmit = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, idx]) => ({
                questionId: qId,
                selectedIndex: idx
            }));

            // Mevcut IP'yi al (opsiyonel)
            let clientIp = 'Bilinmiyor';
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                clientIp = ipData.ip;
            } catch (e) { }

            const result = await submitQuiz({
                examId,
                studentId: user?.id,
                studentNumber: user?.studentNumber,
                studentName: user?.fullName,
                studentClass: user?.className,
                answers: formattedAnswers,
                clientIp
            });

            if (result.success) {
                if (result.submission?.status === 'ungraded' || result.score === null) {
                    toast.success('Quiz başarıyla tamamlandı! Notlandırma bekleniyor.');
                } else {
                    toast.success(`Quiz başarıyla tamamlandı! Puanınız: ${result.score}`);
                }
                setSubmitted(true);
                setQuizResult(result.submission);
                
                // Canlı oturumu bitir
                finishSession(examId, user?.id);

                // 3 saniye sonra dashboard'a yönlendir
                setTimeout(() => {
                    navigate('/ogrenci/panel');
                }, 3000);
            } else {
                toast.error(result.error || 'Gönderim sırasında bir hata oluştu.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeLeft < 60) return '#ef4444'; // Son 1 dakika kırmızı
        if (timeLeft < 300) return '#f59e0b'; // Son 5 dakika sarı
        return '#10b981'; // Güvenli yeşil
    };

    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '24px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            position: 'sticky',
            top: '24px',
            zIndex: 10
        },
        quizCard: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            flex: 1
        },
        questionText: {
            fontSize: '22px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '32px',
            lineHeight: '1.4'
        },
        optionsGrid: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        option: (isSelected, isSubmitted, isCorrect) => ({
            padding: '20px 24px',
            borderRadius: '16px',
            border: '2px solid',
            borderColor: isSelected
                ? (isSubmitted ? (isCorrect ? '#10b981' : '#ef4444') : '#2463eb')
                : '#e2e8f0',
            backgroundColor: isSelected
                ? (isSubmitted ? (isCorrect ? '#f0fdf4' : '#fef2f2') : '#f8faff')
                : 'white',
            cursor: isSubmitted ? 'default' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontWeight: isSelected ? '600' : '400',
            color: isSelected ? '#1e293b' : '#64748b'
        }),
        optionCircle: (isSelected, isSubmitted, isCorrect) => ({
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: isSelected
                ? (isSubmitted ? (isCorrect ? '#10b981' : '#ef4444') : '#2463eb')
                : '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }),
        navigation: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #f1f5f9'
        },
        navBtn: (variant) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: variant === 'primary' ? '#2463eb' : 'white',
            color: variant === 'primary' ? 'white' : '#64748b',
            border: variant === 'primary' ? 'none' : '1px solid #e2e8f0'
        }),
        progressDot: (isActive, isAnswered) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isActive ? '#2463eb' : (isAnswered ? '#10b981' : '#e2e8f0'),
            transition: 'transform 0.2s',
            transform: isActive ? 'scale(1.2)' : 'scale(1)'
        }),
        resultCard: {
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '32px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
        },
        badge: (score) => ({
            display: 'inline-flex',
            padding: '8px 20px',
            borderRadius: '30px',
            fontWeight: '700',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backgroundColor: score >= 50 ? '#ecfdf5' : '#fef2f2',
            color: score >= 50 ? '#059669' : '#dc2626',
            marginBottom: '24px'
        })
    };

    if (loading) {
        return (
            <StudentSidebar>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ marginBottom: '16px' }}></div>
                        <p style={{ color: '#64748b' }}>{t('loading')}</p>
                    </div>
                </div>
            </StudentSidebar>
        );
    }

    // Sonuç ekranı
    if (submitted && quizResult) {
        return (
            <StudentSidebar>
                <div style={styles.container}>
                    <div style={styles.resultCard}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: quizResult.grade >= 50 ? '#f0fdf4' : '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: quizResult.grade >= 50 ? '#10b981' : '#ef4444'
                        }}>
                            {quizResult.grade >= 50 ? <Trophy size={60} /> : <XCircle size={60} />}
                        </div>

                        <div style={styles.badge(quizResult.grade)}>
                            {quizResult.grade >= 50 ? 'Başarılı' : 'Geliştirilmeli'}
                        </div>

                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                            Puanınız: {quizResult.grade}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px' }}>
                            {quizResult.earnedPoints} / {quizResult.totalPoints} puan topladınız.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                            maxWidth: '600px',
                            margin: '0 auto 40px',
                            textAlign: 'left'
                        }}>
                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                                    {quizResult.answers.filter(a => a.isCorrect).length}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>DOĞRU</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                <XCircle size={24} color="#ef4444" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                                    {quizResult.answers.filter(a => !a.isCorrect && a.selectedIndex !== null).length}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>YANLIŞ</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                <HelpCircle size={24} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                                    {quizResult.answers.filter(a => a.selectedIndex === null).length}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>BOŞ</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button
                                onClick={() => navigate('/ogrenci/panel')}
                                style={{ ...styles.navBtn('primary'), width: '200px', height: '56px', fontSize: '16px' }}
                            >
                                <Home size={20} />
                                Ana Sayfaya Dön
                            </button>
                            <button
                                onClick={() => navigate('/ogrenci/notlarim')}
                                style={{ ...styles.navBtn('secondary'), width: '200px', height: '56px', fontSize: '16px', color: '#2463eb', borderColor: '#2463eb' }}
                            >
                                <BarChart3 size={20} />
                                Notlarımı Gör
                            </button>
                        </div>
                    </div>
                </div>
            </StudentSidebar>
        );
    }

    const currentQuestion = exam?.questions[currentQuestionIndex];

    const handleResume = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsPaused(false);
        } catch (e) {
            toast.error('Tam ekrana geçiş reddedildi.');
        }
    };

    if (isPaused) {
        return (
            <div style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
                <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Sınav Duraklatıldı</h1>
                <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '32px', textAlign: 'center', maxWidth: '600px' }}>
                    Sınav sırasında tam ekrandan çıkmak güvenlik kurallarına aykırıdır. Lütfen sınava devam etmek için tekrar tam ekrana geçin.
                </p>
                <button
                    onClick={handleResume}
                    style={{
                        padding: '16px 32px', backgroundColor: '#2463eb', color: 'white', borderRadius: '12px',
                        fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', border: 'none'
                    }}
                >
                    Sınava Devam Et (Tam Ekrana Geç)
                </button>
            </div>
        );
    }

    return (
        <>
            <StudentSidebar />
            <div
                style={{
                    marginLeft: '288px',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#f6f6f8',
                    userSelect: exam?.disableShortcuts ? 'none' : 'auto' // Metin seçimini engelle
                }}
                onCopy={(e) => exam?.disableShortcuts && e.preventDefault()}
                onContextMenu={(e) => exam?.disableShortcuts && e.preventDefault()}
            >
                <div style={styles.container}>
                    {/* Header with Title and Timer */}
                    <div style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => {
                                    setConfirmModal({
                                        isOpen: true,
                                        title: 'Sınavdan Çık',
                                        message: 'Sınavdan çıkmak istediğinize emin misiniz? Puanınız kaydedilmeyecek.',
                                        confirmText: 'Çıkış Yap',
                                        type: 'danger',
                                        onConfirm: () => navigate('/ogrenci/panel')
                                    });
                                }}
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white' }}
                            >
                                <ChevronLeft size={20} color="#64748b" />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{exam?.title}</h1>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Soru {currentQuestionIndex + 1} / {exam?.questions.length}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {exam?.preventLeaveFullScreen && (
                                <button
                                    onClick={() => {
                                        if (!document.fullscreenElement) {
                                            document.documentElement.requestFullscreen().catch(e => console.error(e));
                                        }
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Tam Ekranı Aç
                                </button>
                            )}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 16px',
                                backgroundColor: getTimerColor() + '15',
                                borderRadius: '12px',
                                border: `1px solid ${getTimerColor()}40`
                            }}>
                                <Timer size={20} color={getTimerColor()} />
                                <span style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: getTimerColor()
                                }}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Question Area */}
                    <div style={styles.quizCard}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
                            {exam?.questions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    style={styles.progressDot(idx === currentQuestionIndex, answers[q.id] !== undefined)}
                                />
                            ))}
                        </div>

                        {currentQuestion && (
                            <div key={currentQuestion.id} className="fade-in">
                                <h4 style={styles.questionText}>{currentQuestion.text}</h4>

                                <div style={styles.optionsGrid}>
                                    {currentQuestion.options.map((option, idx) => (
                                        <div
                                            key={idx}
                                            style={styles.option(answers[currentQuestion.id] === idx, false)}
                                            onClick={() => handleSelectOption(currentQuestion.id, idx)}
                                            onMouseEnter={e => !submitted && (e.currentTarget.style.borderColor = '#2463eb')}
                                            onMouseLeave={e => !submitted && answers[currentQuestion.id] !== idx && (e.currentTarget.style.borderColor = '#e2e8f0')}
                                        >
                                            <div style={styles.optionCircle(answers[currentQuestion.id] === idx, false)}>
                                                {answers[currentQuestion.id] === idx && (
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2463eb' }} />
                                                )}
                                            </div>
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div style={styles.navigation}>
                            <button
                                style={{ ...styles.navBtn('secondary'), opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                <ChevronLeft size={18} />
                                Önceki
                            </button>

                            {currentQuestionIndex === exam?.questions.length - 1 ? (
                                <button
                                    style={{ ...styles.navBtn('primary'), backgroundColor: '#10b981', minWidth: '140px' }}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Gönderiliyor...' : (
                                        <>
                                            <Send size={18} />
                                            Sınavı Bitir
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    style={styles.navBtn('primary')}
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Sonraki
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Instructions / Info Box */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '16px',
                        border: '1px solid #dbeafe',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <AlertCircle size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
                        <div>
                            <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>Dikkat Edilmesi Gerekenler</h5>
                            <p style={{ fontSize: '13px', color: '#1e40af', opacity: 0.8 }}>
                                Süre bittiğinde sınav otomatik olarak gönderilecektir. Sayfayı yenilemek cevaplarınızın kaybolmasına neden olabilir.
                            </p>
                        </div>
                    </div>
                </div>
                <ConfirmModal
                    {...confirmModal}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />
            </div>

            <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2463eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
    );
};

export default Quiz;
