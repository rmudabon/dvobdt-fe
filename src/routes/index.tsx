import { createFileRoute } from '@tanstack/react-router'
import { PinMap } from '@/components/map/PinMap'

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
          <ul className='text-lg list-inside list-disc'>
            <li>SM Lanang Premier</li>
            <li>Abreeza Mall</li>
          </ul>
        </div>
      </div>
      <div className='flex-1 max-md:hidden'>
        <PinMap />
      </div>
    </div>
  )
}
