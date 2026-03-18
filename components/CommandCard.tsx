'use client'

interface CommandCardProps {
  command: {
    id: string
    name: string
    description: string
  }
}

export default function CommandCard({ command }: CommandCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="font-semibold text-slate-900">/{command.name}</h3>
            <span className="text-xs text-slate-500">命令</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2">
        {command.description}
      </p>
    </div>
  )
}
