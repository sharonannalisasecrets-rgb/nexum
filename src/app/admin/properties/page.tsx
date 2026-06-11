'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminPropertyApi } from '@/lib/api';
import {
  Badge, Button, Card, CardContent, Input,
  Label, Select, Spinner,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Building2, CheckCircle, XCircle, ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';

type PropertyStatus = 'PendingApproval' | 'Approved' | 'Rejected' | 'Suspended';

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  hostId: string;
  hostName: string;
  status: PropertyStatus;
  photoUrls: string[];
  lastSupervisedAt?: string;
  nextSupervisionDue?: string;
  createdAt: string;
}

const STATUS_BADGE: Record<PropertyStatus, any> = {
  PendingApproval: 'warning',
  Approved:        'success',
  Rejected:        'destructive',
  Suspended:       'secondary',
};

const STATUS_OPTIONS = [
  { value: '',                label: 'All Statuses'   },
  { value: 'PendingApproval', label: 'Pending Approval' },
  { value: 'Approved',        label: 'Approved'        },
  { value: 'Rejected',        label: 'Rejected'        },
  { value: 'Suspended',       label: 'Suspended'       },
];

export default function AdminPropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Action states
  const [acting, setActing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [superviseId, setSuperviseId] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  async function load(status = statusFilter) {
    if (!session) return;
    setLoading(true);
    const res = await adminPropertyApi.list(session.accessToken, {
      page: 1, pageSize: 50, status: status || undefined,
    });
    if (res.success) setProperties((res.data as any)?.items ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [session]);

  async function handleApprove(id: string) {
    if (!session) return;
    setActing(id);
    const res = await adminPropertyApi.approve(session.accessToken, id);
    setActing(null);
    if (res.success) {
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, status: 'Approved' } : p
      ));
      toast.success('Property approved — now visible to worshippers');
    } else {
      toast.error((res as any).error?.message ?? 'Approval failed');
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) { toast.error('Enter a rejection reason'); return; }
    if (!session) return;
    setActing(id);
    const res = await adminPropertyApi.reject(session.accessToken, id, rejectReason);
    setActing(null);
    if (res.success) {
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, status: 'Rejected' } : p
      ));
      setRejectId(null);
      setRejectReason('');
      toast.success('Property rejected');
    } else {
      toast.error((res as any).error?.message ?? 'Rejection failed');
    }
  }

  async function handleSupervise(id: string) {
    if (!session) return;
    setActing(id);
    const res = await adminPropertyApi.supervise(session.accessToken, id, visitDate);
    setActing(null);
    if (res.success) {
      const next = new Date(visitDate);
      next.setMonth(next.getMonth() + 18);
      setProperties(prev => prev.map(p =>
        p.id === id
          ? { ...p, lastSupervisedAt: visitDate, nextSupervisionDue: next.toISOString() }
          : p
      ));
      setSuperviseId(null);
      toast.success('Supervision visit recorded — next due in 18 months');
    } else {
      toast.error((res as any).error?.message ?? 'Failed to record supervision');
    }
  }

  const pending   = properties.filter(p => p.status === 'PendingApproval');
  const approved  = properties.filter(p => p.status === 'Approved');
  const overdue   = approved.filter(p =>
    p.nextSupervisionDue && new Date(p.nextSupervisionDue) < new Date()
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {properties.length} total · {pending.length} pending approval · {approved.length} approved
          </p>
        </div>
      </div>

      {/* Alert banners */}
      {pending.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <span className="text-lg">⏳</span>
          <div>
            <div className="text-sm font-semibold text-amber-800">
              {pending.length} propert{pending.length !== 1 ? 'ies' : 'y'} awaiting approval
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              Guests cannot book these until they are approved
            </div>
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <span className="text-lg">🔍</span>
          <div>
            <div className="text-sm font-semibold text-red-800">
              {overdue.length} propert{overdue.length !== 1 ? 'ies' : 'y'} overdue for supervision
            </div>
            <div className="text-xs text-red-700 mt-0.5">
              Properties should be supervised every 18 months
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <Select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); load(e.target.value); }}
          className="w-48"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <span className="text-sm text-muted-foreground">{properties.length} results</span>
      </div>

      {/* Properties list */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-3 opacity-30" />
            <p>No properties found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {properties.map(property => {
            const isExpanded = expanded === property.id;
            const isOverdue = property.nextSupervisionDue
              && new Date(property.nextSupervisionDue) < new Date();

            return (
              <Card key={property.id}
                className={property.status === 'PendingApproval' ? 'border-amber-200' : ''}>
                <CardContent className="p-0">
                  {/* Header row — always visible */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : property.id)}
                  >
                    {/* Property icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{property.name}</span>
                        <Badge variant={STATUS_BADGE[property.status]}>
                          {property.status === 'PendingApproval' ? 'Pending' : property.status}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">Supervision Overdue</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate mt-0.5">
                        {property.address} · Host: {property.hostName}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Quick approve for pending */}
                      {property.status === 'PendingApproval' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            loading={acting === property.id}
                            onClick={e => { e.stopPropagation(); handleApprove(property.id); }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm" variant="destructive"
                            onClick={e => {
                              e.stopPropagation();
                              setRejectId(property.id);
                              setExpanded(property.id);
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Description</div>
                          <div>{property.description}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Last Supervised</div>
                          <div>{property.lastSupervisedAt
                            ? formatDate(property.lastSupervisedAt)
                            : <span className="text-amber-600">Never</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Next Supervision Due</div>
                          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {property.nextSupervisionDue
                              ? formatDate(property.nextSupervisionDue)
                              : '—'}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {property.status === 'PendingApproval' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              loading={acting === property.id}
                              onClick={() => handleApprove(property.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve Property
                            </Button>
                            <Button
                              size="sm" variant="destructive"
                              onClick={() => setRejectId(property.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Property
                            </Button>
                          </>
                        )}

                        {property.status === 'Approved' && (
                          <Button
                            size="sm" variant="outline"
                            onClick={() => setSuperviseId(property.id)}
                          >
                            <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Record Supervision Visit
                          </Button>
                        )}

                        {property.status === 'Approved' && (
                          <Button
                            size="sm" variant="destructive"
                            loading={acting === property.id}
                            onClick={() => {
                              setRejectId(property.id);
                              setRejectReason('Property suspended pending review');
                            }}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>

                      {/* Reject reason input */}
                      {rejectId === property.id && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <Label className="mb-1 block text-red-800">
                            Reason for rejection *
                          </Label>
                          <Input
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="e.g. Property does not meet safety standards"
                            className="mb-2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="destructive"
                              loading={acting === property.id}
                              onClick={() => handleReject(property.id)}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              onClick={() => { setRejectId(null); setRejectReason(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Supervision date input */}
                      {superviseId === property.id && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Label className="mb-1 block text-blue-800">
                            Supervision visit date
                          </Label>
                          <div className="flex gap-2 items-end">
                            <Input
                              type="date"
                              value={visitDate}
                              onChange={e => setVisitDate(e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              className="w-44"
                            />
                            <Button
                              size="sm"
                              loading={acting === property.id}
                              onClick={() => handleSupervise(property.id)}
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Record Visit
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              onClick={() => setSuperviseId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
