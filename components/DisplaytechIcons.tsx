import { getTechLogos } from '@/lib/utils'
import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
const DisplaytechIcons =  async( {techStack } : TechIconProps) => {
    const techIcons = await getTechLogos(techStack)
  return (
    <div className='flex flex-row'>{techIcons.slice(0,3).map(({tech,url}, index) => (
        <div key={tech} className={cn('realtive group bg-dark-300 rounded-full p-2 flex-center', index > 1 && '-ml-4')}>
            <span className='tech-tooltip'>{tech}</span>
            <Image src={url} alt={tech} height={100} width={100}  className='size-5'/>
        </div>
    ))}</div>
  )
}

export default DisplaytechIcons