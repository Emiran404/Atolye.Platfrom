import { useState } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDate, formatRelativeTime } from '../../utils/dateHelpers';
import {
  Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle,
  FileText, User, MessageSquare, ChevronRight
} from 'lucide-react';

const EditRequests = () => {
  const { exams, approveEditRequest, rejectEditRequest } = useExamStore();
  const { grantEditPermission } = useSubmissionStore();
  const { addNotification } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Tüm sınavlardan düzenleme taleplerini topla
  const allRequests = exams.flatMap(exam => 
    (exam.editRequests || []).map(req => ({
      ...req,
      examId: exam.id,
      examTitle: exam.title,
      examType: exam.type
    }))
  );

  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.studentNumber?.includes(searchQuery) ||
                         req.examTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

  const handleApprove = async (request) => {
    setProcessing(true);
    try {
      approveEditRequest(request.examId, request.id);
      grantEditPermission(request.submissionId, 5); // 5 dakika düzenleme süresi

      addNotification({
        type: 'edit_approved',
        title: 'Düzenleme Talebi Onaylandı',
        message: `${request.examTitle} için düzenleme talebiniz onaylandı. 5 dakika içinde düzenleme yapabilirsiniz.`,
        targetType: 'student',
        targetId: request.studentId,
        relatedId: request.examId
      });

      setShowDetailModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request) => {
    if (!rejectReason.trim()) return;
    
    setProcessing(true);
    try {
      rejectEditRequest(request.examId, request.id, rejectReason);

      addNotification({
        type: 'edit_rejected',
        title: 'Düzenleme Talebi Reddedildi',
        message: `${request.examTitle} için düzenleme talebiniz reddedildi. Sebep: ${rejectReason}`,
        targetType: 'student',
        targetId: request.studentId,
        relatedId: request.examId
      });

      setShowDetailModal(false);
      setRejectReason('');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Bekliyor</Badge>;
      case 'approved':
        return <Badge variant="success">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="danger">Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>;
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Düzenleme Talepleri</h1>
            <p className="text-muted-foreground">
              Öğrencilerin dosya düzenleme taleplerini yönetin
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Onaylanan</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Reddedilen</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 w-full md:max-w-xs">
              <Input
                placeholder="Öğrenci veya sınav ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekleyenler</option>
                <option value="approved">Onaylananlar</option>
                <option value="rejected">Reddedilenler</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Talep Bulunamadı</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'pending'
                ? 'Bekleyen düzenleme talebi bulunmuyor.'
                : 'Arama kriterlerine uygun talep bulunamadı.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Card 
                key={request.id}
                className="p-4 hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      request.status === 'pending' ? 'bg-warning/10' :
                      request.status === 'approved' ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className={`w-6 h-6 text-warning`} />
                      ) : request.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-danger" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{request.studentName}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{request.studentNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{request.examTitle}</span>
                        <Badge variant={(request.examType === 'exam' || request.examType === 'final_exam') ? 'primary' : 'secondary'} size="sm">
                          {(request.examType === 'exam' || request.examType === 'final_exam') ? 'Sınav' : 'Ödev'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(request.requestedAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {request.reason && (
                  <div className="mt-3 pl-16">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{request.reason}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setRejectReason('');
          }}
          title="Düzenleme Talebi Detayı"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Öğrenci</label>
                  <p className="font-medium text-foreground">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Numara</label>
                  <p className="font-medium text-foreground">{selectedRequest.studentNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sınıf</label>
                  <p className="font-medium text-foreground">{selectedRequest.className}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Talep Tarihi</label>
                  <p className="font-medium text-foreground">{formatDate(selectedRequest.requestedAt)}</p>
                </div>
              </div>

              {/* Exam Info */}
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedRequest.examTitle}</p>
                    <Badge variant={(selectedRequest.examType === 'exam' || selectedRequest.examType === 'final_exam') ? 'primary' : 'secondary'} size="sm">
                      {(selectedRequest.examType === 'exam' || selectedRequest.examType === 'final_exam') ? 'Sınav' : 'Ödev'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Talep Sebebi</label>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-foreground">{selectedRequest.reason || 'Sebep belirtilmemiş'}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Durum</label>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectReason && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Ret Sebebi</label>
                  <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                    <p className="text-foreground">{selectedRequest.rejectReason}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">
                      Ret Sebebi (Reddetmek için gerekli)
                    </label>
                    <Input
                      placeholder="Ret sebebini yazın..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(selectedRequest)}
                      disabled={!rejectReason.trim() || processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Onayla
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Kapat
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </TeacherLayout>
  );
};

export default EditRequests;
