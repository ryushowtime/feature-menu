import { NextResponse } from 'next/server';
import { scanAll } from '../../../lib/scanner';

export async function GET() {
  try {
    const data = await scanAll();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan data', details: String(error) },
      { status: 500 }
    );
  }
}
