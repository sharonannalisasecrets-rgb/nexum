'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { propertyApi } from '@/lib/api';
import {
  Badge, Button, Card, CardContent, Input, Label, Spinner,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2, Plus, Pencil, X, Check, Upload,
  ChevronDown, ChevronUp, BedDouble, Users, Banknote,
} from 'lucide-react';

const STATUS_BADGE: Record<string, any> = {
  PendingApproval: 'warning', Approved: 'success',
  Rejected: 'destructive', Suspended: 'secondary',
};

const MAX_IMAGES = 3;

type PropertyForm = { name: string; description: string; address: string };
type RoomForm = {
  name: string; description: string;
  capacity: string; pricePerNight: string;
  totalUnits: string; amenities: string;
};

const EMPTY_PROPERTY: PropertyForm = { name: '', description: '', address: '' };
const EMPTY_ROOM: RoomForm = {
  name: '', description: '', capacity: '2',
  pricePerNight: '', totalUnits: '1', amenities: '',
};

// ── Image picker ──────────────────────────────────────────────
function ImagePicker({ existingUrls = [], onChange }: {
  existingUrls?: string[];
  onChange: (files: File[], removedUrls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keptUrls, setKeptUrls] = useState<string[]>(existingUrls);

  function notify(files: File[], urls: string[]) {
    const removed = existingUrls.filter(u => !urls.includes(u));
    onChange(files, removed);
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const slots = MAX_IMAGES - keptUrls.length;
    const valid = selected.slice(0, slots).filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`${f.name} must be JPEG, PNG, or WebP`); return false;
      }
      return true;
    });
    valid.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
    const updated = [...newFiles, ...valid];
    setNewFiles(updated);
    notify(updated, keptUrls);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeExisting(url: string) {
    const updated = keptUrls.filter(u => u !== url);
    setKeptUrls(updated);
    notify(newFiles, updated);
  }

  function removeNew(i: number) {
    const updatedFiles = newFiles.filter((_, j) => j !== i);
    const updatedPreviews = previews.filter((_, j) => j !== i);
    setNewFiles(updatedFiles);
    setPreviews(updatedPreviews);
    notify(updatedFiles, keptUrls);
  }

  const total = keptUrls.length + newFiles.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Photos (max {MAX_IMAGES})</Label>
        <span className="text-xs text-muted-foreground">{total}/{MAX_IMAGES}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keptUrls.map(url => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removeExisting(url)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {previews.map((p, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-blue-300 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removeNew(i)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {total < MAX_IMAGES && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 flex flex-col items-center justify-center gap-1 transition-colors">
            <Upload className="h-4 w-4 text-gray-400" />
            <span className="text-[10px] text-gray-400">Add photo</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        multiple className="hidden" onChange={handleSelect} />
      <p className="text-xs text-muted-foreground mt-1">JPEG/PNG/WebP · max 5MB each</p>
    </div>
  );
}

// ── Property form fields ──────────────────────────────────────
function PropertyFields({ form, onChange, existingPhotos, onImagesChange }: {
  form: PropertyForm;
  onChange: (f: PropertyForm) => void;
  existingPhotos?: string[];
  onImagesChange: (files: File[], removed: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block">Property Name *</Label>
        <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })}
          placeholder="Adebayo Guest House" />
      </div>
      <div>
        <Label className="mb-1 block">Address *</Label>
        <Input value={form.address} onChange={e => onChange({ ...form, address: e.target.value })}
          placeholder="5 Redemption Road, Zone A, RCCG Camp" />
      </div>
      <div>
        <Label className="mb-1 block">Description *</Label>
        <textarea value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          placeholder="Clean, comfortable rooms with 24/7 security..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
      </div>
      <ImagePicker existingUrls={existingPhotos} onChange={onImagesChange} />
    </div>
  );
}

// ── Room type form ────────────────────────────────────────────
function RoomTypeForm({ form, onChange }: {
  form: RoomForm;
  onChange: (f: RoomForm) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="mb-1 block">Room Name *</Label>
          <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })}
            placeholder="Standard Room, Deluxe Suite..." />
        </div>
        <div>
          <Label className="mb-1 block">Price/Night (₦) *</Label>
          <Input value={form.pricePerNight}
            onChange={e => onChange({ ...form, pricePerNight: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="15000" type="number" min="1" />
        </div>
        <div>
          <Label className="mb-1 block">Capacity (people)</Label>
          <Input value={form.capacity} type="number" min="1" max="20"
            onChange={e => onChange({ ...form, capacity: e.target.value })}
            placeholder="2" />
        </div>
        <div>
          <Label className="mb-1 block">Number of Units</Label>
          <Input value={form.totalUnits} type="number" min="1"
            onChange={e => onChange({ ...form, totalUnits: e.target.value })}
            placeholder="1" />
        </div>
        <div>
          <Label className="mb-1 block">Description</Label>
          <Input value={form.description}
            onChange={e => onChange({ ...form, description: e.target.value })}
            placeholder="Air-conditioned en-suite room" />
        </div>
        <div className="col-span-2">
          <Label className="mb-1 block">Amenities (comma separated)</Label>
          <Input value={form.amenities}
            onChange={e => onChange({ ...form, amenities: e.target.value })}
            placeholder="WiFi, Air Conditioning, Hot Water, TV" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function HostPropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [roomsByProperty, setRoomsByProperty] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState<string | null>(null);

  // Create property
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<PropertyForm>(EMPTY_PROPERTY);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);

  // Edit property
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PropertyForm>(EMPTY_PROPERTY);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // Add room type
  const [addingRoomFor, setAddingRoomFor] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState<RoomForm>(EMPTY_ROOM);
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    if (!session) return;
    propertyApi.list({ page: 1, pageSize: 50 }).then(res => {
      if (res.success) {
        const all = (res.data as any)?.items ?? [];
        setProperties(all.filter((p: any) => p.hostId === session.user.id));
      }
      setLoading(false);
    });
  }, [session]);

  async function toggleExpand(propertyId: string) {
    if (expanded === propertyId) { setExpanded(null); return; }
    setExpanded(propertyId);
    // Load rooms if not already loaded
    if (!roomsByProperty[propertyId]) {
      setLoadingRooms(propertyId);
      const res = await propertyApi.getRoomTypes(propertyId);
      if (res.success) setRoomsByProperty(prev => ({ ...prev, [propertyId]: res.data ?? [] }));
      setLoadingRooms(null);
    }
  }

  // ── Create property ───────────────────────────────────────
  async function handleCreate() {
    if (!createForm.name || !createForm.description || !createForm.address) {
      toast.error('Fill in all required fields'); return;
    }
    setCreating(true);
    const res = await propertyApi.create(session!.accessToken, createForm);
    if (!res.success) {
      toast.error((res as any).error?.message ?? 'Failed to create property');
      setCreating(false); return;
    }
    const newProp = res.data as any;
    let photoUrls: string[] = [];
    if (createImages.length > 0) {
      const imgRes = await propertyApi.uploadImages(session!.accessToken, newProp.id, createImages);
      if (imgRes.success) photoUrls = imgRes.data ?? [];
      else toast.error('Property created but image upload failed');
    }
    setProperties(prev => [{ ...newProp, photoUrls }, ...prev]);
    setRoomsByProperty(prev => ({ ...prev, [newProp.id]: [] }));
    setShowCreate(false);
    setCreateForm(EMPTY_PROPERTY);
    setCreateImages([]);
    setCreating(false);
    setExpanded(newProp.id); // auto-expand so host can add rooms
    toast.success('Property submitted for approval — now add room types below');
  }

  // ── Edit property ─────────────────────────────────────────
  function startEdit(property: any) {
    setEditingId(property.id);
    setEditForm({ name: property.name, description: property.description, address: property.address });
    setEditImages([]);
    setShowCreate(false);
  }

  async function handleSave(property: any) {
    if (!editForm.name || !editForm.description || !editForm.address) {
      toast.error('Fill in all required fields'); return;
    }
    setSaving(true);
    const res = await propertyApi.update(session!.accessToken, property.id, editForm);
    if (!res.success) {
      toast.error((res as any).error?.message ?? 'Update failed');
      setSaving(false); return;
    }
    let newPhotos = property.photoUrls ?? [];
    if (editImages.length > 0) {
      const imgRes = await propertyApi.replaceImages(session!.accessToken, property.id, editImages);
      if (imgRes.success) newPhotos = imgRes.data ?? [];
    }
    setProperties(prev => prev.map(p =>
      p.id === property.id ? { ...p, ...editForm, photoUrls: newPhotos } : p
    ));
    setEditingId(null);
    setSaving(false);
    toast.success('Property updated');
  }

  // ── Add room type ─────────────────────────────────────────
  function startAddRoom(propertyId: string) {
    setAddingRoomFor(propertyId);
    setRoomForm(EMPTY_ROOM);
  }

  async function handleAddRoom(propertyId: string) {
    if (!roomForm.name || !roomForm.pricePerNight) {
      toast.error('Room name and price are required'); return;
    }
    const price = parseFloat(roomForm.pricePerNight);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }

    setSavingRoom(true);
    const res = await propertyApi.addRoomType(session!.accessToken, propertyId, {
      name: roomForm.name,
      description: roomForm.description,
      capacity: parseInt(roomForm.capacity) || 2,
      pricePerNight: price,
      totalUnits: parseInt(roomForm.totalUnits) || 1,
      amenities: roomForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
    });
    setSavingRoom(false);

    if (res.success) {
      setRoomsByProperty(prev => ({
        ...prev,
        [propertyId]: [...(prev[propertyId] ?? []), res.data],
      }));
      setAddingRoomFor(null);
      setRoomForm(EMPTY_ROOM);
      toast.success('Room type added');
    } else {
      toast.error((res as any).error?.message ?? 'Failed to add room type');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Properties must be approved by admin before guests can book
          </p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setEditingId(null); }}>
          <Plus className="h-4 w-4" /> Add Property
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="mb-6 border-teal-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">New Property</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <PropertyFields form={createForm} onChange={setCreateForm}
              onImagesChange={files => setCreateImages(files)} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleCreate} loading={creating}>Submit for Approval</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-3 opacity-30" />
            <p>No properties yet</p>
            <p className="text-xs mt-1">Add a property above to start receiving bookings</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map(property => {
            const isEditing = editingId === property.id;
            const isExpanded = expanded === property.id;
            const rooms = roomsByProperty[property.id] ?? [];

            return (
              <Card key={property.id}
                className={isEditing ? 'border-teal-400 ring-1 ring-teal-400' : ''}>
                <CardContent className="p-0">
                  {/* Property header row */}
                  <div className="p-5">
                    {isEditing ? (
                      /* Edit mode */
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-teal-700">Editing: {property.name}</h3>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <PropertyFields
                          form={editForm}
                          onChange={setEditForm}
                          existingPhotos={property.photoUrls ?? []}
                          onImagesChange={files => setEditImages(files)}
                        />
                        <div className="flex gap-3 mt-4">
                          <Button onClick={() => handleSave(property)} loading={saving}
                            className="bg-teal-600 hover:bg-teal-700">
                            <Check className="h-4 w-4" /> Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      /* View mode */
                      <div className="flex items-start gap-4">
                        {property.photoUrls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={property.photoUrls[0]} alt={property.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold truncate">{property.name}</h3>
                            <Badge variant={STATUS_BADGE[property.status] ?? 'secondary'}>
                              {property.status === 'PendingApproval' ? 'Pending' : property.status}
                            </Badge>
                            {rooms.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {rooms.length} room type{rooms.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{property.address}</p>
                          {property.status === 'PendingApproval' && (
                            <p className="text-xs text-amber-600 mt-1">⏳ Awaiting admin review</p>
                          )}
                          {property.status === 'Rejected' && (
                            <p className="text-xs text-red-600 mt-1">✕ Not approved — edit and resubmit</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => startEdit(property)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <button
                            onClick={() => toggleExpand(property.id)}
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
                          >
                            {isExpanded ? (
                              <><ChevronUp className="h-4 w-4" /> Hide rooms</>
                            ) : (
                              <><ChevronDown className="h-4 w-4" /> Room types</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room types section */}
                  {isExpanded && !isEditing && (
                    <div className="border-t bg-gray-50 px-5 pb-5 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm text-gray-700">
                          Room Types ({rooms.length})
                        </h4>
                        {addingRoomFor !== property.id && (
                          <Button size="sm" variant="outline"
                            onClick={() => startAddRoom(property.id)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Room Type
                          </Button>
                        )}
                      </div>

                      {/* Loading rooms */}
                      {loadingRooms === property.id && (
                        <div className="flex items-center justify-center py-6">
                          <Spinner className="h-5 w-5" />
                        </div>
                      )}

                      {/* Room list */}
                      {loadingRooms !== property.id && rooms.length === 0 && addingRoomFor !== property.id && (
                        <div className="text-center py-6 text-muted-foreground">
                          <BedDouble className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No room types yet</p>
                          <p className="text-xs mt-1">Add room types so guests can see pricing and book</p>
                        </div>
                      )}

                      {loadingRooms !== property.id && rooms.map((room: any) => (
                        <div key={room.id}
                          className="bg-white rounded-lg border p-4 mb-2 last:mb-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{room.name}</span>
                                <Badge variant={room.isActive ? 'success' : 'secondary'}>
                                  {room.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              {room.description && (
                                <p className="text-xs text-muted-foreground mb-2">{room.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5" />
                                  {formatCurrency(room.pricePerNight)}/night
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  Sleeps {room.capacity}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BedDouble className="h-3.5 w-3.5" />
                                  {room.totalUnits ?? 1} unit{(room.totalUnits ?? 1) !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {room.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {room.amenities.map((a: string) => (
                                    <span key={a}
                                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add room type form */}
                      {addingRoomFor === property.id && (
                        <div className="bg-white rounded-lg border border-teal-200 p-4 mt-2">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-sm text-teal-700">New Room Type</h5>
                            <button onClick={() => setAddingRoomFor(null)}
                              className="text-gray-400 hover:text-gray-600">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <RoomTypeForm form={roomForm} onChange={setRoomForm} />
                          <div className="flex gap-2 mt-3">
                            <Button size="sm"
                              onClick={() => handleAddRoom(property.id)}
                              loading={savingRoom}
                              className="bg-teal-600 hover:bg-teal-700">
                              <Check className="h-3.5 w-3.5 mr-1" /> Add Room Type
                            </Button>
                            <Button size="sm" variant="outline"
                              onClick={() => setAddingRoomFor(null)}>
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
