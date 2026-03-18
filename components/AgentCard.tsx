'use client'

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    tools: string[]
    model: string
  }
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold text-slate-900">{agent.name}</h3>
            <span className="text-xs text-slate-500">Agent</span>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
          {agent.model}
        </span>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
        {agent.description}
      </p>

      {agent.tools && agent.tools.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.tools.slice(0, 4).map((tool, index) => (
            <span key={index} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {tool}
            </span>
          ))}
          {agent.tools.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-slate-400">
              +{agent.tools.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
