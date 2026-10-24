import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import '@/models/User';

// GET /api/admin/orders - Fetch all orders
export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/orders - Update order status or payment status
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, status, isPaid } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (typeof isPaid === 'boolean') updateFields.isPaid = isPaid;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}