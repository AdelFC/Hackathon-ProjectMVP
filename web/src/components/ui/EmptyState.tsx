import { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
  ...props
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg'
    }
  }
  
  const currentSize = sizes[size]
  
  const defaultIcon = (
    <svg 
      className={clsx('text-gray-400', currentSize.icon)} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  )
  
  return (
    <div 
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        currentSize.container,
        className
      )}
      {...props}
    >
      {(icon || !action) && (
        <div className="mb-4">
          {icon || defaultIcon}
        </div>
      )}
      
      <h3 className={clsx('font-semibold text-gray-900 dark:text-gray-100', currentSize.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={clsx('mt-2 text-gray-600 dark:text-gray-400 max-w-md', currentSize.description)}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}