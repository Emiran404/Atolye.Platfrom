import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Play, Pause } from 'lucide-react';
import { Modal } from './ui/Modal';

const FilePreviewModal = ({ isOpen, onClose, file, fileUrl }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!file || !fileUrl) return null;

  const getFileType = () => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(extension)) {
      return 'video';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'word';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return 'powerpoint';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else if (extension === 'pkt') {
      return 'packet_tracer';
    }
    return 'unknown';
  };

  const fileType = getFileType();

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto',
            maxHeight: '70vh'
          }}>
            <img
              src={fileUrl}
              alt={file.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s',
                objectFit: 'contain'
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#000'
          }}>
            <video
              src={fileUrl}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px'
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            height: '70vh'
          }}>
            <iframe
              src={fileUrl}
              title={file.name}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
            />
          </div>
        );

      case 'word':
      case 'powerpoint':
      case 'excel':
      case 'packet_tracer':
        const fileConfig = {
          word: { color: '#2b579a', icon: 'W', name: 'Word Belgesi' },
          powerpoint: { color: '#d04423', icon: 'P', name: 'PowerPoint Sunumu' },
          excel: { color: '#217346', icon: 'X', name: 'Excel Tablosu' },
          packet_tracer: { color: '#0077c8', icon: 'PT', name: 'Cisco Packet Tracer Dosyası' }
        };
        const config = fileConfig[fileType];
        const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Bilinmiyor';
        
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: config.color,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
            }}>
              <span style={{ fontSize: fileType === 'packet_tracer' ? '22px' : '36px', color: 'white', fontWeight: '700' }}>
                {config.icon}
              </span>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              {file.name}
            </h3>
            
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px', 
              backgroundColor: '#f1f5f9', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                {config.name} • {fileSize}
              </p>
            </div>
            
            {fileType === 'packet_tracer' && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                maxWidth: '400px'
              }}>
                <p style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  <strong>📌 Bu dosyayı görüntülemek için:</strong><br />
                  1. Dosyayı indirin<br />
                  2. Bilgisayarınızda Cisco Packet Tracer açın<br />
                  3. File → Open ile dosyayı seçin
                </p>
              </div>
            )}
            
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
              {fileType === 'packet_tracer' 
                ? 'Ağ simülasyon dosyası - Tarayıcıda görüntülenemez' 
                : 'Bu dosya türü tarayıcıda önizlenemiyor'}
            </p>
            
            <a
              href={fileUrl}
              download={file.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                backgroundColor: config.color,
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              <Download size={20} />
              Dosyayı İndir
            </a>
          </div>
        );

      default:
        return (
          <div style={{ 
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#64748b' }}>Bu dosya önizlenemiyor</p>
            <a
              href={fileUrl}
              download={file.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <Download size={18} />
              İndir
            </a>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name} size="xl">
      <div style={{ position: 'relative' }}>
        {/* Toolbar - Sadece resimler için zoom/rotate */}
        {fileType === 'image' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ZoomOut size={16} />
              Küçült
            </button>
            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '60px', textAlign: 'center' }}>
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ZoomIn size={16} />
              Büyüt
            </button>
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '8px'
              }}
            >
              <RotateCw size={16} />
              Döndür
            </button>
          </div>
        )}

        {/* Preview Content */}
        <div style={{
          backgroundColor: fileType === 'video' ? '#000' : '#f8fafc',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {renderPreview()}
        </div>

        {/* Download Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '16px'
        }}>
          <a
            href={fileUrl}
            download={file.name}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Download size={16} />
            İndir
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
