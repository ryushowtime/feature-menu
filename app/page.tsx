import { getSkills, getAgents, getCommands } from '@/lib/api'
import ClientPage from './ClientPage'

export default async function Page() {
  const [skills, agents, commands] = await Promise.all([
    getSkills(),
    getAgents(),
    getCommands(),
  ])

  return <ClientPage skills={skills} agents={agents} commands={commands} />
}
