import { NextResponse } from 'next/server';
import { loadClaudeUsageData } from '../../../lib/claude-usage';

export async function GET() {
  try {
    const claudeUsage = await loadClaudeUsageData();
    return NextResponse.json({ stats: claudeUsage });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data', stats: {} },
      { status: 500 }
    );
  }
}
