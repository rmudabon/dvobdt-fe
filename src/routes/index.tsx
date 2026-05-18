import { createFileRoute, Link } from '@tanstack/react-router'
import { PinMap } from '@/components/map/PinMap'
import { MapPin } from 'lucide-react'
import { useLocations } from '@/hooks/useLocations'
import { QueryResolver } from '@/components/ui/query-resolver'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const query = useLocations()
  return (
    <div className='p-8 flex gap-8 h-full flex-col xl:flex-row bg-secondary'>
      <div className='flex flex-col justify-center gap-4 xl:basis-xl'>
        <h1 className='text-3xl text-primary font-semibold'>dvobdt</h1>
        <div className='border rounded-md border-primary p-4 space-y-4'>
          <h2 className='text-xl font-medium'>Nearest Bidets</h2>
          <QueryResolver query={query}>
            {(locations) => (
              <ul className='text-lg space-y-2'>
                {locations.map((location) => (
                  <li key={location.id} className='flex items-center gap-2'>
                    <MapPin className='text-primary' />
                    <Link 
                      to='/bidets/$bidetId' 
                      params={{
                        bidetId: location.id.toString()
                      }} 
                      className='hover:text-primary transition-colors'
                    >
                      {location.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueryResolver>
        </div>
      </div>
      <div className='flex-1'>
        <PinMap />
      </div>
    </div>
  )
}
