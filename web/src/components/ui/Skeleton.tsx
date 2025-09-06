import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-800'
  
  const variants = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }
  
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }
  
  const defaultHeights = {
    text: 'h-4',
    rectangular: 'h-32',
    circular: 'h-12 w-12'
  }
  
  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        animations[animation],
        !height && defaultHeights[variant],
        className
      )}
      style={{
        width: width,
        height: height,
        ...style
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number
  lastLineWidth?: string
}

export function SkeletonText({ 
  lines = 3, 
  lastLineWidth = '80%',
  className,
  ...props 
}: SkeletonTextProps) {
  return (
    <div className={clsx('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  )
}