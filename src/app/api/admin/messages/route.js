import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function GET() {
  try {
    await dbConnect();
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error('Fetch Admin Messages Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing message ID' }, { status: 400 });
    }

    await dbConnect();
    await Message.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Message deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete Message Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}