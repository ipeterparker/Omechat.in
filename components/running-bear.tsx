import { cn } from '@/lib/utils'

export function RunningBear({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-[18px] w-[22px] shrink-0 -translate-y-[3px]', className)} aria-hidden="true">
      <span className="bear-run relative block size-full bg-[url(/images/bear-run.png)] bg-no-repeat brightness-0 invert [background-size:600%_100%]" />
    </span>
  )
}
