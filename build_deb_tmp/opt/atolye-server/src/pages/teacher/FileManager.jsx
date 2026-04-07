import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  Home, 
  ChevronRight, 
  Download,
  Eye,
  Trash2,
  FolderPlus,
  Search,
  Grid,
  List as ListIcon,
  FileText,
  Image as ImageIcon,
  FileArchive
} from 'lucide-react';
import { ConfirmModal } from '../../components/ui';

const FileManager = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => {},
    type: 'warning'
  });

  useEffect(() => {
    loadDirectory();
  }, [currentPath]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/file-manager/browse?path=${encodeURIComponent(currentPath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Klasör yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    } else {
      handlePreview(item);
    }
  };

  const handlePreview = (item) => {
    setPreviewFile(item);
    setShowPreviewModal(true);
  };

  const handleDownload = (item) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    link.click();
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Öğeyi Sil',
      message: `"${item.name}" öğesini silmek istediğinize emin misiniz?`,
      confirmText: 'Sil',
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3001/api/file-manager/delete', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: item.path })
          });

          if (response.ok) {
            loadDirectory();
          }
        } catch (error) {
          console.error('Silme hatası:', error);
        }
      }
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/file-manager/create-folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          path: currentPath,
          folderName: newFolderName 
        })
      });

      if (response.ok) {
        setShowCreateFolderModal(false);
        setNewFolderName('');
        loadDirectory();
      }
    } catch (error) {
      console.error('Klasör oluşturma hatası:', error);
    }
  };

  const navigateToPath = (pathIndex) => {
    const pathParts = currentPath.split('/').filter(p => p);
    const newPath = pathParts.slice(0, pathIndex + 1).join('/');
    setCurrentPath(newPath);
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const goHome = () => {
    setCurrentPath('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon style={{ width: '20px', height: '20px' }} />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive style={{ width: '20px', height: '20px' }} />;
    }
    return <FileText style={{ width: '20px', height: '20px' }} />;
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pathParts = currentPath.split('/').filter(p => p);

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>Dosya Gezgini</h1>
            <div style={styles.headerActions}>
              <button style={styles.createFolderBtn} onClick={() => setShowCreateFolderModal(true)}>
                <FolderPlus style={{ width: '16px', height: '16px' }} />
                Yeni Klasör
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div style={styles.breadcrumb}>
            <button style={styles.breadcrumbBtn} onClick={goHome}>
              <Home style={{ width: '16px', height: '16px' }} />
            </button>
            {pathParts.map((part, index) => (
              <React.Fragment key={index}>
                <ChevronRight style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                <button 
                  style={styles.breadcrumbBtn}
                  onClick={() => navigateToPath(index)}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Toolbar */}
          <div style={styles.toolbar}>
            <button 
              style={{...styles.backBtn, opacity: currentPath ? 1 : 0.5}}
              onClick={goBack}
              disabled={!currentPath}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Geri
            </button>

            <div style={styles.searchBox}>
              <Search style={{ width: '16px', height: '16px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Dosya veya klasör ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.viewToggle}>
              <button
                style={{...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {})}}
                onClick={() => setViewMode('grid')}
              >
                <Grid style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                style={{...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {})}}
                onClick={() => setViewMode('list')}
              >
                <ListIcon style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Yükleniyor...</div>
          ) : filteredItems.length === 0 ? (
            <div style={styles.empty}>
              <Folder style={{ width: '64px', height: '64px', opacity: 0.3, marginBottom: '16px' }} />
              <p style={styles.emptyText}>
                {searchQuery ? 'Eşleşen öğe bulunamadı' : 'Bu klasör boş'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={styles.grid}>
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  style={styles.gridItem}
                  onClick={() => handleItemClick(item)}
                >
                  <div style={styles.gridItemIcon}>
                    {item.type === 'folder' ? (
                      <Folder style={{ width: '48px', height: '48px', color: '#3b82f6' }} />
                    ) : (
                      getFileIcon(item.name)
                    )}
                  </div>
                  <div style={styles.gridItemName} title={item.name}>
                    {item.name}
                  </div>
                  {item.type === 'file' && (
                    <div style={styles.gridItemSize}>
                      {formatFileSize(item.size)}
                    </div>
                  )}
                  <div style={styles.gridItemActions}>
                    {item.type === 'file' && (
                      <>
                        <button 
                          style={styles.iconBtn}
                          onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button 
                          style={styles.iconBtn}
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                        >
                          <Download style={{ width: '14px', height: '14px' }} />
                        </button>
                      </>
                    )}
                    <button 
                      style={styles.iconBtn}
                      onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.list}>
              <div style={styles.listHeader}>
                <div style={styles.listColumnName}>Ad</div>
                <div style={styles.listColumnSize}>Boyut</div>
                <div style={styles.listColumnDate}>Değiştirilme</div>
                <div style={styles.listColumnActions}>İşlemler</div>
              </div>
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => handleItemClick(item)}
                >
                  <div style={styles.listColumnName}>
                    <div style={styles.listItemIcon}>
                      {item.type === 'folder' ? (
                        <Folder style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                      ) : (
                        getFileIcon(item.name)
                      )}
                    </div>
                    {item.name}
                  </div>
                  <div style={styles.listColumnSize}>
                    {item.type === 'file' ? formatFileSize(item.size) : '-'}
                  </div>
                  <div style={styles.listColumnDate}>
                    {new Date(item.modified).toLocaleString('tr-TR')}
                  </div>
                  <div style={styles.listColumnActions}>
                    {item.type === 'file' && (
                      <>
                        <button 
                          style={styles.iconBtn}
                          onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button 
                          style={styles.iconBtn}
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                        >
                          <Download style={{ width: '14px', height: '14px' }} />
                        </button>
                      </>
                    )}
                    <button 
                      style={styles.iconBtn}
                      onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCreateFolderModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Yeni Klasör Oluştur</h2>
              <input
                type="text"
                placeholder="Klasör adı"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                style={styles.modalInput}
                autoFocus
              />
              <div style={styles.modalActions}>
                <button style={styles.modalCancelBtn} onClick={() => setShowCreateFolderModal(false)}>
                  İptal
                </button>
                <button style={styles.modalCreateBtn} onClick={handleCreateFolder}>
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && previewFile && (
          <div style={styles.modalOverlay} onClick={() => setShowPreviewModal(false)}>
            <div style={styles.previewModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.previewHeader}>
                <h2 style={styles.previewTitle}>{previewFile.name}</h2>
                <button style={styles.closeBtn} onClick={() => setShowPreviewModal(false)}>×</button>
              </div>
              <div style={styles.previewContent}>
                {previewFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={previewFile.url} alt={previewFile.name} style={styles.previewImage} />
                ) : previewFile.name.match(/\.(pdf)$/i) ? (
                  <iframe src={previewFile.url} style={styles.previewIframe} />
                ) : (
                  <div style={styles.previewUnsupported}>
                    <FileText style={{ width: '64px', height: '64px', opacity: 0.3 }} />
                    <p>Önizleme desteklenmiyor</p>
                    <button style={styles.downloadBtn} onClick={() => handleDownload(previewFile)}>
                      <Download style={{ width: '16px', height: '16px' }} />
                      İndir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          {...confirmModal}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </TeacherLayout>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: '100vh'
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  createFolderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  breadcrumbBtn: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    outline: 'none'
  },
  viewToggle: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '4px'
  },
  viewBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  viewBtnActive: {
    backgroundColor: '#ffffff',
    color: '#3b82f6'
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    minHeight: '500px'
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#64748b'
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  emptyText: {
    margin: 0,
    fontSize: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px'
  },
  gridItem: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    position: 'relative'
  },
  gridItemIcon: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'center',
    color: '#64748b'
  },
  gridItemName: {
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  gridItemSize: {
    fontSize: '12px',
    color: '#64748b'
  },
  gridItemActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '8px',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  list: {
    width: '100%'
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 180px 120px',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  listItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 180px 120px',
    gap: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    alignItems: 'center'
  },
  listItemIcon: {
    display: 'inline-flex',
    marginRight: '8px',
    color: '#64748b'
  },
  listColumnName: {
    display: 'flex',
    alignItems: 'center',
    color: '#1e293b'
  },
  listColumnSize: {
    color: '#64748b'
  },
  listColumnDate: {
    color: '#64748b'
  },
  listColumnActions: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'flex-end'
  },
  iconBtn: {
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90%'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px'
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  modalCancelBtn: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer'
  },
  modalCreateBtn: {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    cursor: 'pointer'
  },
  previewModal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '80%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  closeBtn: {
    fontSize: '32px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    lineHeight: 1
  },
  previewContent: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  previewIframe: {
    width: '100%',
    height: '600px',
    border: 'none'
  },
  previewUnsupported: {
    textAlign: 'center',
    color: '#64748b'
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '16px'
  }
};

export default FileManager;
