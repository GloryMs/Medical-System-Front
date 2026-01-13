import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Ticket,
  ArrowLeft,
  RefreshCw,
  Download,
  Send,
  XCircle,
  Copy,
  Search
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import adminCouponService from '../../services/api/adminCouponService';
import { toast } from 'react-toastify';

const CouponStatusBadge = ({ status }) => {
  const statusConfig = {
    CREATED: { color: 'bg-blue-100 text-blue-800', label: 'Created' },
    DISTRIBUTED: { color: 'bg-green-100 text-green-800', label: 'Distributed' },
    USED: { color: 'bg-gray-100 text-gray-800', label: 'Used' },
    EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired' },
    CANCELLED: { color: 'bg-orange-100 text-orange-800', label: 'Cancelled' }
  };
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const CouponBatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { execute, loading } = useApi();

  const [batch, setBatch] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [distributeForm, setDistributeForm] = useState({ beneficiaryType: 'MEDICAL_SUPERVISOR', beneficiaryId: '' });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadBatchDetails();
    loadSupervisors();
  }, [batchId]);

  useEffect(() => {
    let filtered = [...coupons];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.couponCode?.toLowerCase().includes(term) || c.beneficiaryName?.toLowerCase().includes(term));
    }
    if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, statusFilter]);

  const loadBatchDetails = async () => {
    try {
      const [batchRes, couponsRes] = await Promise.all([
        execute(() => adminCouponService.getBatchById(batchId)),
        execute(() => adminCouponService.getBatchCoupons(batchId))
      ]);
      setBatch(batchRes?.data);
      setCoupons(couponsRes?.data || []);
    } catch (error) {
      toast.error('Failed to load batch details');
    }
  };

  const loadSupervisors = async () => {
    try {
      const response = await execute(() => adminCouponService.getMedicalSupervisors());
      setSupervisors(response?.data || []);
    } catch (error) {
      console.error('Error loading supervisors:', error);
    }
  };

  const handleDistribute = async () => {
    if (!distributeForm.beneficiaryId) { toast.error('Please select a beneficiary'); return; }
    try {
      await execute(() => adminCouponService.distributeCoupon(selectedCoupon.id, distributeForm));
      toast.success('Coupon distributed successfully');
      setShowDistributeModal(false);
      setSelectedCoupon(null);
      setDistributeForm({ beneficiaryType: 'MEDICAL_SUPERVISOR', beneficiaryId: '' });
      await loadBatchDetails();
    } catch (error) {
      toast.error('Failed to distribute coupon');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      await execute(() => adminCouponService.cancelCoupon(selectedCoupon.id, cancelReason));
      toast.success('Coupon cancelled');
      setShowCancelModal(false);
      setSelectedCoupon(null);
      setCancelReason('');
      await loadBatchDetails();
    } catch (error) {
      toast.error('Failed to cancel coupon');
    }
  };

  const handleExportBatch = async () => {
    try {
      const response = await adminCouponService.exportBatchCoupons(batchId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_${batch?.batchCode}_coupons.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied'); };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const stats = {
    total: coupons.length,
    created: coupons.filter(c => c.status === 'CREATED').length,
    distributed: coupons.filter(c => c.status === 'DISTRIBUTED').length,
    used: coupons.filter(c => c.status === 'USED').length,
    expired: coupons.filter(c => c.status === 'EXPIRED').length,
    cancelled: coupons.filter(c => c.status === 'CANCELLED').length
  };

  if (!batch && !loading) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Batch Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/app/admin/coupons')}>Back to Coupons</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/admin/coupons')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{batch?.batchName || 'Batch Details'}</h1>
            <p className="text-sm text-gray-500 font-mono">{batch?.batchCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadBatchDetails}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExportBatch}><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Discount</p>
              <p className="text-lg font-semibold text-gray-900">
                {batch?.discountType === 'PERCENTAGE' && `${batch?.discountValue}%`}
                {batch?.discountType === 'FIXED_AMOUNT' && `$${batch?.discountValue}`}
                {batch?.discountType === 'FULL_COVERAGE' && 'Full Coverage'}
              </p>
            </div>
          </div>
          <div><p className="text-sm text-gray-500">Created</p><p className="text-lg font-semibold">{formatDate(batch?.createdAt)}</p></div>
          <div><p className="text-sm text-gray-500">Beneficiary Type</p><p className="text-lg font-semibold">{batch?.beneficiaryType === 'MEDICAL_SUPERVISOR' ? 'Supervisors' : 'Patients'}</p></div>
          <div><p className="text-sm text-gray-500">Status</p><CouponStatusBadge status={batch?.status} /></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4"><p className="text-sm text-blue-600">Created</p><p className="text-2xl font-bold text-blue-700">{stats.created}</p></div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4"><p className="text-sm text-green-600">Distributed</p><p className="text-2xl font-bold text-green-700">{stats.distributed}</p></div>
        <div className="bg-gray-50 rounded-lg border p-4"><p className="text-sm text-gray-600">Used</p><p className="text-2xl font-bold text-gray-700">{stats.used}</p></div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4"><p className="text-sm text-red-600">Expired</p><p className="text-2xl font-bold text-red-700">{stats.expired}</p></div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4"><p className="text-sm text-orange-600">Cancelled</p><p className="text-2xl font-bold text-orange-700">{stats.cancelled}</p></div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search coupons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
            <option value="">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="DISTRIBUTED">Distributed</option>
            <option value="USED">Used</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coupon Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  {loading ? <><RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Loading...</> : <><Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p>No coupons found</p></>}
                </td></tr>
              ) : filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-mono font-medium">{coupon.couponCode}</span>
                      <button onClick={() => copyToClipboard(coupon.couponCode)} className="ml-2 text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{coupon.beneficiaryName || <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><CouponStatusBadge status={coupon.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(coupon.expiresAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {coupon.status === 'CREATED' && <button onClick={() => { setSelectedCoupon(coupon); setShowDistributeModal(true); }} className="text-blue-400 hover:text-blue-600"><Send className="w-5 h-5" /></button>}
                      {['CREATED', 'DISTRIBUTED'].includes(coupon.status) && <button onClick={() => { setSelectedCoupon(coupon); setShowCancelModal(true); }} className="text-red-400 hover:text-red-600"><XCircle className="w-5 h-5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showDistributeModal} onClose={() => { setShowDistributeModal(false); setSelectedCoupon(null); }} title="Distribute Coupon">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Distribute <span className="font-mono font-medium">{selectedCoupon?.couponCode}</span> to:</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Type</label>
            <select value={distributeForm.beneficiaryType} onChange={(e) => setDistributeForm({ ...distributeForm, beneficiaryType: e.target.value, beneficiaryId: '' })} className="w-full px-3 py-2 border rounded-lg">
              <option value="MEDICAL_SUPERVISOR">Medical Supervisor</option>
              <option value="PATIENT">Patient</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select {distributeForm.beneficiaryType === 'MEDICAL_SUPERVISOR' ? 'Supervisor' : 'Patient'}</label>
            <select value={distributeForm.beneficiaryId} onChange={(e) => setDistributeForm({ ...distributeForm, beneficiaryId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select...</option>
              {distributeForm.beneficiaryType === 'MEDICAL_SUPERVISOR' && supervisors.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDistributeModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDistribute} disabled={!distributeForm.beneficiaryId}><Send className="w-4 h-4 mr-2" />Distribute</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setSelectedCoupon(null); setCancelReason(''); }}
        onConfirm={handleCancel}
        title="Cancel Coupon"
        message={
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Cancel coupon <span className="font-mono font-medium">{selectedCoupon?.couponCode}</span>?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Cancellation reason..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        }
        confirmText="Cancel Coupon"
        confirmVariant="danger"
        disabled={!cancelReason.trim()}
      />
    </div>
  );
};

export default CouponBatchDetails;