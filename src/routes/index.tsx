import { createFileRoute, Link } from '@tanstack/react-router'
import { PinMap } from '@/components/map/PinMap'
import { MapPin } from 'lucide-react'
import { PIN_COLOR } from '@/utils/constants'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='p-8 flex gap-8 h-full flex-col md:flex-row'>
      <div className='basis-xl flex flex-col justify-center gap-4 max-md:flex-1'>
        <h1 className='text-3xl text-teal-700 font-semibold'>dvobdt</h1>
        <div className='border rounded-md border-teal-700 p-4 space-y-4'>
          <h2 className='text-xl font-medium'>Nearest Bidets</h2>
          <ul className='text-lg space-y-2'>
            <li className='flex items-center gap-2'><MapPin color={PIN_COLOR}/><Link to='/' className='hover:text-teal-700 transition-colors'>SM Lanang</Link></li>
            <li className='flex items-center gap-2'><MapPin color={PIN_COLOR}/><Link to='/' className='hover:text-teal-700 transition-colors'>Abreeza Mall</Link></li>
          </ul>
        </div>
      </div>
      <div className='flex-1 max-md:hidden'>
        <PinMap />
      </div>
    </div>
  )
}
