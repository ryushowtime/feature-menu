import { NextResponse } from 'next/server';
import { scanAll } from '../../../lib/scanner';

export async function GET() {
  try {
    // forceRefresh=true to get latest data including from all skills directories
    const data = await scanAll(true);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan data', details: String(error) },
      { status: 500 }
    );
  }
}
