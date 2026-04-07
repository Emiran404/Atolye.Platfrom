import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { X, Printer } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const OpticalFormModal = ({ isOpen, onClose, submission }) => {
    const { user } = useAuthStore();
    const printRef = useRef();

    if (!isOpen || !submission) return null;

    const exam = submission.exam;
    const questions = exam?.questions || [];
    const answers = submission.answers || [];

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'left=0,top=0,width=850,height=900,toolbar=0,scrollbars=0,status=0');
        windowPrint.document.write(`
      <html>
        <head>
          <title>Sınav Optik Formu - ${user?.fullName || user?.name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #fff; display: flex; justify-content: center; }
            * { box-sizing: border-box; }
            @page { margin: 0; size: A4 portrait; }
            .print-container { width: 210mm; margin: 0; padding: 10mm; }
            .no-print { display: none !important; }
            @media print {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              .print-container { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
        windowPrint.document.close();
        windowPrint.focus();
        setTimeout(() => {
            windowPrint.print();
            windowPrint.close();
        }, 250);
    };

    const orangeColor = '#f28b50';
    const lightOrange = '#fcebdc';

    const Bubble = ({ letter, isFilled }) => (
        <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: `1.5px solid ${isFilled ? '#000' : orangeColor}`,
            backgroundColor: isFilled ? '#000' : '#fff',
            color: isFilled ? '#000' : orangeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            lineHeight: '1px'
        }}>
            {!isFilled && letter}
        </div>
    );

    const TinyBubble = ({ letter, isFilled }) => (
        <div style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            border: `1px solid ${isFilled ? '#000' : orangeColor}`,
            backgroundColor: isFilled ? '#000' : '#fff',
            color: isFilled ? '#000' : orangeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6px',
            fontWeight: 'bold',
            lineHeight: '1px'
        }}>
            {!isFilled && letter}
        </div>
    );

    const alphabetTr = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];

    const NameGrid = ({ title, value, cols = 12 }) => {
        const valUpper = (value || '').toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞIİÖŞÜ]/g, '');
        return (
            <div style={{ border: `1px solid ${orangeColor}`, display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
                <div style={{ backgroundColor: lightOrange, textAlign: 'center', padding: '4px', fontSize: '10px', fontWeight: 'bold', borderBottom: `1px solid ${orangeColor}` }}>
                    {title}
                </div>
                <div style={{ display: 'flex', padding: '2px', gap: '2px' }}>
                    {Array.from({ length: cols }).map((_, colIdx) => {
                        const char = valUpper[colIdx] || '';
                        return (
                            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRight: colIdx < cols - 1 ? `1px solid ${lightOrange}` : 'none', paddingRight: '1px' }}>
                                <div style={{ height: '12px', borderBottom: `1px solid ${orangeColor}`, textAlign: 'center', fontSize: '9px', fontWeight: 'bold', color: '#000' }}>
                                    {char}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '1px 0' }}>
                                    {alphabetTr.map(letter => (
                                        <TinyBubble key={letter} letter={letter} isFilled={char === letter} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const nameParts = (user?.fullName || user?.name || '').trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join('');

    const studentNoStr = String(user?.studentNumber || '').padStart(5, '0').slice(-5);
    const classNameStr = String(user?.className || '');
    const matchClass = classNameStr.match(/(\d+)/);
    const classGrade = matchClass ? matchClass[1] : '';
    const matchBranch = classNameStr.match(/[a-zA-ZçğıöşüÇĞIÖŞÜ]+/);
    const classBranch = matchBranch ? matchBranch[0].toUpperCase().charAt(0) : '';

    // Create columns for questions (e.g., 40 questions per column)
    const columns = [];
    for (let i = 0; i < questions.length; i += 40) {
        columns.push(questions.slice(i, i + 40));
    }
    // Ensure we show at least 4 columns even if less questions for visual aesthetic (like the real OMR form)
    while (columns.length < 4) {
        columns.push([]);
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '1000px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                        Sınav Optiğimi Görüntüle
                    </h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                            }}
                        >
                            <Printer size={18} />
                            Yazdır
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', backgroundColor: '#fef2f2', color: '#ef4444',
                                border: 'none', borderRadius: '8px', cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Body / Optik Form */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#e2e8f0' }}>

                    <div
                        ref={printRef}
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            fontFamily: 'Arial, sans-serif',
                            width: '100%',
                            maxWidth: '790px',
                            margin: '0 auto',
                            color: '#000',
                            display: 'flex',
                            gap: '12px',
                            position: 'relative',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {/* Timing Marks Left */}
                        <div className="no-print" style={{ width: '20px', display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '10px' }}>
                            {Array.from({ length: 87 }).map((_, i) => (
                                <div key={i} style={{ height: '4px', width: '100%', backgroundColor: '#000' }}></div>
                            ))}
                        </div>

                        {/* Main Form Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                            {/* Header Box */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: orangeColor, letterSpacing: '-1px' }}>PolyOS</div>
                                        <div style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>SINAV SİSTEMİ</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        backgroundColor: lightOrange,
                                        border: `1px solid ${orangeColor}`,
                                        padding: '12px',
                                        textAlign: 'center',
                                        fontSize: '22px',
                                        fontWeight: 'bold',
                                        marginBottom: '10px'
                                    }}>
                                        {exam?.title?.toUpperCase() || 'CEVAP KAĞIDI'}
                                    </div>

                                    {/* Personal Info Text Area */}
                                    <div style={{ border: `1px solid ${orangeColor}`, display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                                        <div style={{ borderBottom: `1px solid ${lightOrange}`, padding: '8px 12px', display: 'flex' }}>
                                            <span style={{ color: orangeColor, width: '90px' }}>Adı Soyadı</span>
                                            <span>: {user?.fullName || user?.name}</span>
                                        </div>
                                        <div style={{ borderBottom: `1px solid ${lightOrange}`, padding: '8px 12px', display: 'flex' }}>
                                            <span style={{ color: orangeColor, width: '90px' }}>Okul/Sınıf</span>
                                            <span>: Sınav Platformu - {user?.className}</span>
                                        </div>
                                        <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ color: orangeColor, width: '90px', display: 'inline-block' }}>Puan</span>
                                                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>: {submission.grade !== null && submission.grade !== undefined ? `${submission.grade} / 100` : 'Okunmadı'}</span>
                                            </div>
                                            <div>
                                                <Barcode
                                                    value={`${user?.className}-${user?.studentNumber}`}
                                                    width={1}
                                                    height={25}
                                                    fontSize={10}
                                                    background="transparent"
                                                    displayValue={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mid Section: ADI, SOYADI, ÖĞRENCİ NO, SINIF/ŞUBE */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <NameGrid title="ADI" value={firstName} cols={12} />
                                <NameGrid title="SOYADI" value={lastName} cols={12} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ border: `1px solid ${orangeColor}`, width: '130px' }}>
                                            <div style={{ backgroundColor: lightOrange, textAlign: 'center', padding: '6px', fontSize: '11px', fontWeight: 'bold', borderBottom: `1px solid ${orangeColor}` }}>
                                                ÖĞRENCİ NO
                                            </div>
                                            <div style={{ display: 'flex', padding: '5px', justifyContent: 'center' }}>
                                                {studentNoStr.split('').map((char, colIdx) => (
                                                    <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 3px', borderRight: colIdx < 4 ? `1px solid ${lightOrange}` : 'none' }}>
                                                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginBottom: '2px', paddingBottom: '2px', borderBottom: `1px solid ${lightOrange}` }}>{char}</div>
                                                        {Array.from({ length: 10 }).map((_, num) => (
                                                            <Bubble key={num} letter={num} isFilled={num === parseInt(char)} />
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ border: `1px solid ${orangeColor}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', borderBottom: `1px solid ${orangeColor}` }}>
                                                <div style={{ width: '50px', backgroundColor: lightOrange, textAlign: 'center', padding: '6px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${orangeColor}` }}>
                                                    SINIF
                                                </div>
                                                <div style={{ padding: '6px', display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {['9', '10', '11', '12', 'M'].map(c => (
                                                        <Bubble key={c} letter={c} isFilled={c === classGrade} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', borderBottom: `1px solid ${orangeColor}` }}>
                                                <div style={{ width: '50px', backgroundColor: lightOrange, textAlign: 'center', padding: '6px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${orangeColor}` }}>
                                                    ŞUBE
                                                </div>
                                                <div style={{ padding: '6px', display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                                                    {['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'].map(b => (
                                                        <Bubble key={b} letter={b} isFilled={b === classBranch} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ padding: '8px', fontSize: '10px', color: '#000', fontStyle: 'italic', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: lightOrange }}>
                                                PolyOS Dijital Değerlendirme Sistemi tarafından otomatik değerlendirilmiştir.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Columns */}
                            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', margin: '0 auto' }}>
                                {columns.map((colQuestions, colIdx) => {
                                    return (
                                        <div key={colIdx} style={{ width: 'fit-content', minWidth: '160px', border: `1px solid ${orangeColor}` }}>
                                            <div style={{ backgroundColor: lightOrange, textAlign: 'center', padding: '4px', fontSize: '12px', fontWeight: 'bold', borderBottom: `1px solid ${orangeColor}` }}>
                                                {(exam?.department || 'TEST').toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px', gap: '3px' }}>
                                                {Array.from({ length: 40 }).map((_, idx) => {
                                                    const originalIdx = (colIdx * 40) + idx;
                                                    const q = colQuestions[idx];

                                                    if (q) {
                                                        const answer = answers.find(a => String(a.questionId) === String(q.id));
                                                        const studentSelectedIndex = answer ? answer.selectedIndex : -1;

                                                        return (
                                                            <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ width: '18px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#000' }}>
                                                                    {originalIdx + 1}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '3px' }}>
                                                                    {['A', 'B', 'C', 'D', 'E'].map((letter, optIdx) => {
                                                                        const isSelected = studentSelectedIndex === optIdx;
                                                                        return (
                                                                            <Bubble key={letter} letter={letter} isFilled={isSelected} />
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={`empty-${originalIdx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ width: '18px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#000', opacity: 0.2 }}>
                                                                    {originalIdx + 1}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '3px', opacity: 0.2 }}>
                                                                    {['A', 'B', 'C', 'D', 'E'].map(letter => (
                                                                        <Bubble key={letter} letter={letter} isFilled={false} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Timing Marks Right */}
                        <div className="no-print" style={{ width: '20px', display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '10px' }}>
                            {Array.from({ length: 87 }).map((_, i) => (
                                <div key={i} style={{ height: '4px', width: '100%', backgroundColor: '#000' }}></div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpticalFormModal;
