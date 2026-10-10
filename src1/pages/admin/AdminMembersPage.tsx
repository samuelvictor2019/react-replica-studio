import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, CheckCircle, Clock, Phone, Mail, MapPin, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { adminRequest } from '@/lib/adminApi';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  occupation?: string;
  status: 'pending' | 'approved' | 'integrated';
  registrationDate: string;
  integrationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'manual' | 'form';
  formType?: string;
  formSubmissionId?: string;
};

type FormSubmission = {
  id: string;
  type: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  notes?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};


const AdminMembersPage = () => {
  const { can, user } = useOutletContext<AdminOutletContext>();
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    maritalStatus: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    occupation: '',
    status: 'pending' as 'pending' | 'approved' | 'integrated',
    notes: ''
  });

  const splitName = (fullName: string) => {
    const clean = (fullName || '').trim().replace(/\s+/g, ' ');
    if (!clean) return { firstName: 'Unknown', lastName: 'Member' };
    const parts = clean.split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  };

  const mapFormStatusToMemberStatus = (status?: string): Member['status'] => {
    if (status === 'completed' || status === 'archived') return 'integrated';
    if (status === 'in_progress') return 'approved';
    return 'pending';
  };

  const mapMaritalStatus = (value?: string): Member['maritalStatus'] => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'single' || normalized === 'married' || normalized === 'divorced' || normalized === 'widowed') {
      return normalized;
    }
    return 'single';
  };

  const loadMembers = async () => {
    try {
      const res = await adminRequest<{ data: Member[] }>('/members');
      setMembers(res.data || []);
    } catch (error) {
      console.warn('Failed to load members from API:', error);
      setMembers([]);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      maritalStatus: 'single',
      occupation: '',
      status: 'pending',
      notes: ''
    });
    setEditingMember(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      address: member.address,
      dateOfBirth: member.dateOfBirth || '',
      maritalStatus: member.maritalStatus,
      occupation: member.occupation || '',
      status: member.status,
      notes: member.notes || ''
    });
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const openViewDialog = (member: Member) => {
    setViewingMember(member);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await adminRequest(`/members/${editingMember.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await adminRequest('/members', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadMembers();
    } catch (e: any) {
      console.warn('Failed to save member:', e.message);
      alert(e.message || 'Failed to save member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member record?')) return;
    try {
      await adminRequest(`/members/${id}`, { method: 'DELETE' });
      loadMembers();
    } catch (e: any) {
      console.warn('Failed to delete member:', e.message);
      alert(e.message || 'Failed to delete member');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'integrated': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'integrated': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.status]) acc[member.status] = [];
    acc[member.status].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const stats = {
    total: members.length,
    pending: groupedMembers.pending?.length || 0,
    approved: groupedMembers.approved?.length || 0,
    integrated: groupedMembers.integrated?.length || 0,
    newThisMonth: members.filter(m => {
      const regDate = new Date(m.registrationDate);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Member Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">New Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage new member registrations</p>
        </div>
        {can('content.create') && (
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold">{stats.newThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="integrated" className="text-xs sm:text-sm">Integrated ({groupedMembers.integrated?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {members.length === 0 ? (
            <p className="text-muted-foreground">No members found</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-500">{member.occupation || 'No occupation'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(member.status)}
                              {member.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(member.registrationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(member)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {can('content.update') && (
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {can('content.delete') && (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {['pending', 'approved', 'integrated'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {groupedMembers[status]?.length === 0 ? (
              <p className="text-muted-foreground">No {status} members found</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedMembers[status]?.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-gray-500">{member.occupation || 'No occupation'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(member.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(member.status)}
                                {member.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(member.registrationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openViewDialog(member)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {can('content.update') && (
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {can('content.delete') && (
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Marital Status</label>
                <Select value={formData.maritalStatus} onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => setFormData(prev => ({ ...prev, maritalStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'pending' | 'approved' | 'integrated') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="integrated">Integrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Occupation</label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="Professional occupation"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the member"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingMember ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={!!viewingMember} onOpenChange={() => setViewingMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {viewingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold">{viewingMember.firstName} {viewingMember.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getStatusColor(viewingMember.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(viewingMember.status)}
                      {viewingMember.status}
                    </div>
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <p>{viewingMember.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <p>{viewingMember.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <p>{viewingMember.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p>{viewingMember.dateOfBirth ? new Date(viewingMember.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="capitalize">{viewingMember.maritalStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p>{viewingMember.occupation || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p>{new Date(viewingMember.registrationDate).toLocaleDateString()}</p>
                </div>
                {viewingMember.integrationDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Integration Date</label>
                    <p>{new Date(viewingMember.integrationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {viewingMember.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="mt-1">{viewingMember.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembersPage;
