import { CustomTileLayer } from '@/components/map/CustomTileLayer'
import { Button } from '@/components/ui/button'
import { QueryResolver } from '@/components/ui/query-resolver'
import { useLocation } from '@/hooks/useLocations'
import { BOUNDS, CUSTOM_MARKER_ICON } from '@/utils/constants'
import { createFileRoute } from '@tanstack/react-router'
import { MapContainer, Marker } from 'react-leaflet'

enum StallType {
    M = "Male",
    F = "Female",
    U = "Unisex"
}

export const Route = createFileRoute('/bidets/$bidetId')({
  component: RouteComponent,
})

function RouteComponent() {
    const { bidetId } = Route.useParams()
    const query = useLocation(Number(bidetId))

    return (
        <QueryResolver query={query}>
            {(location) => (
                <div className='p-8'>
                    <h1 className='text-3xl font-semibold'>{location.name}</h1>
                    {location.image_url && (
                        <img
                            src={location.image_url}
                            alt={location.name}
                            className='mt-4 w-full max-h-72 object-cover rounded-md'
                        />
                    )}
                    <MapContainer center={[location.lat, location.lng]} zoom={17} maxBounds={BOUNDS} className='mt-8 h-96 rounded-md'>
                        <CustomTileLayer />
                        <Marker
                            position={[location.lat, location.lng]}
                            icon={CUSTOM_MARKER_ICON}
                        />
                    </MapContainer>
                    <div className='my-4'>
                        <Button asChild size='lg' className='w-full'>
                            <a
                                href={`https://www.google.com/maps/place/${location.lat},${location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                
                                View on Google Maps
                            </a>
                        </Button>
                    </div>
                    <div className='py-2'>
                        <p className='text-base text-primary'>Address</p>
                        <p className='text-lg'>{location.address}</p>
                    </div>
                    <div className='py-2'>
                        <p className='text-base text-primary'>Stall Type</p>
                        <p className='text-lg'>{StallType[location.stall_type]}</p>
                    </div>
                    <div className='py-2'>
                        <p className='text-base text-primary'>Additional Information</p>
                        <p className='text-lg'>{location.description}</p>
                    </div>
                    
                </div>
            )}
        </QueryResolver>
    )
}
