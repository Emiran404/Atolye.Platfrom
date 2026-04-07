// Dosya boyutunu formatla
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Dosya uzantısını al
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

// Dosya tipi geçerli mi kontrol
export const isValidFileType = (file, allowedTypes) => {
  const extension = getFileExtension(file.name);
  const mimeType = file.type;
  
  const typeMap = {
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    xls: ['application/vnd.ms-excel'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ppt: ['application/vnd.ms-powerpoint'],
    pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    zip: ['application/zip', 'application/x-zip-compressed'],
    rar: ['application/x-rar-compressed', 'application/vnd.rar'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    gif: ['image/gif'],
    // Video formatları
    mp4: ['video/mp4'],
    avi: ['video/x-msvideo', 'video/avi'],
    mov: ['video/quicktime'],
    wmv: ['video/x-ms-wmv'],
    mkv: ['video/x-matroska'],
    webm: ['video/webm']
  };

  return allowedTypes.some(type => {
    if (typeMap[type]) {
      return typeMap[type].includes(mimeType) || extension === type;
    }
    return extension === type;
  });
};

// Unique dosya adı oluştur
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_${timestamp}_${random}.${extension}`;
};

// Dosya tipine göre ikon adı al
export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);
  const iconMap = {
    pdf: 'FileText',
    doc: 'FileText',
    docx: 'FileText',
    xls: 'FileSpreadsheet',
    xlsx: 'FileSpreadsheet',
    ppt: 'Presentation',
    pptx: 'Presentation',
    zip: 'FileArchive',
    rar: 'FileArchive',
    jpg: 'Image',
    jpeg: 'Image',
    png: 'Image',
    gif: 'Image'
  };
  return iconMap[ext] || 'File';
};

// Dosya boyutu kontrolü
export const isFileSizeValid = (file, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// İzin verilen formatlar listesi
export const ALLOWED_FORMATS = {
  pdf: { label: 'PDF', extensions: ['.pdf'] },
  word: { label: 'Word', extensions: ['.doc', '.docx'] },
  excel: { label: 'Excel', extensions: ['.xls', '.xlsx'] },
  powerpoint: { label: 'PowerPoint', extensions: ['.ppt', '.pptx'] },
  image: { label: 'Resim', extensions: ['.jpg', '.jpeg', '.png', '.gif'] },
  video: { label: 'Video', extensions: ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'] },
  archive: { label: 'Arşiv', extensions: ['.zip', '.rar'] },
  packet_tracer: { label: 'Packet Tracer', extensions: ['.pkt'] }
};
