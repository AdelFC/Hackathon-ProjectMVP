import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ 
  className, 
  variant = 'default',
  padding = 'md',
  hover = false,
  children, 
  ...props 
}: CardProps) {
  const baseClasses = 'bg-white dark:bg-gray-900 rounded-xl'
  
  const variants = {
    default: '',
    bordered: 'border border-gray-200 dark:border-gray-800',
    elevated: 'shadow-lg'
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const hoverClass = hover ? 'transition-shadow hover:shadow-lg cursor-pointer' : ''
  
  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        hoverClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div 
      className={clsx('pb-4 border-b border-gray-200 dark:border-gray-800', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={clsx('py-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div 
      className={clsx('pt-4 border-t border-gray-200 dark:border-gray-800', className)} 
      {...props}
    >
      {children}
    </div>
  )
}