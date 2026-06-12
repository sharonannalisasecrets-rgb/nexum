import { propertyApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingFlow } from '@/components/worshipper/BookingFlow';
import { PropertyGallery } from '@/components/shared/PropertyGallery';
import { Badge, Card, CardContent } from '@/components/ui';
import { Building2, MapPin, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [propertyRes, roomsRes] = await Promise.all([
    propertyApi.get(params.id),
    propertyApi.getRoomTypes(params.id),
  ]);

  if (!propertyRes.success || !propertyRes.data) notFound();

  const property = propertyRes.data;
  const rooms = roomsRes.data ?? [];
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.address}</span>
            </div>
          </div>
          <Badge variant={property.status === 'Approved' ? 'success' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Photo gallery — shows all images with lightbox */}
      <PropertyGallery
        photos={property.photoUrls ?? []}
        propertyName={property.name}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* About */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-2">About this property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Hosted by {property.hostName}</span>
              </div>
              {property.lastSupervisedAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last supervised: {formatDate(property.lastSupervisedAt)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room types */}
          <h2 className="font-semibold mb-3">Available Room Types</h2>
          <div className="space-y-4">
            {rooms.map(room => (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {room.amenities.map(a => (
                          <span key={a}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Sleeps {room.capacity}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-lg text-primary">
                        ₦{room.pricePerNight.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">per night</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking panel */}
        <div>
          <BookingFlow
            property={property}
            rooms={rooms}
            session={session}
          />
        </div>
      </div>
    </div>
  );
}
