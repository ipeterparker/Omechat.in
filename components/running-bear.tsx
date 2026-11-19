import { cn } from '@/lib/utils'

// tone 'auto' follows the site's Light/Dark mode; tone 'light' is always white (for use on dark cards like the promo).
export function RunningBear({ className, tone = 'auto' }: { className?: string; tone?: 'auto' | 'light' }) {
  return (
    <span className={cn('relative inline-flex h-[18px] w-[22px] shrink-0 -translate-y-[3px]', className)} aria-hidden="true">
      <span
        className={cn(
          'bear-run relative block size-full bg-[url(/images/bear-run.png)] bg-no-repeat brightness-0 [background-size:600%_100%]',
          tone === 'light' ? 'invert' : 'dark:invert',
        )}
      />
    </span>
  )
}
