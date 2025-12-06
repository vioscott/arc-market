import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Read markets from database
        const dbPath = path.join(process.cwd(), '..', 'contracts', 'scripts', 'database', 'markets.json');

        let markets: any[] = [];
        if (fs.existsSync(dbPath)) {
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            markets = Object.values(data.markets || {});
        }

        // Apply filters
        let filtered = markets;

        if (category && category !== 'all') {
            filtered = filtered.filter((m: any) =>
                m.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (status && status !== 'all') {
            filtered = filtered.filter((m: any) => m.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((m: any) =>
                m.question.toLowerCase().includes(searchLower)
            );
        }

        // Sort by creation time (newest first)
        filtered.sort((a: any, b: any) => b.createdAt - a.createdAt);

        return NextResponse.json({ markets: filtered });
    } catch (error) {
        console.error('Error fetching markets:', error);
        return NextResponse.json({ markets: [] }, { status: 500 });
    }
}
