import { Button } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ 
  href, 
  label = 'Back', 
  className = 'mb-4' 
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={className}
    >
      <ArrowLeft size={16} className="mr-2" />
      {label}
    </Button>
  )
}
