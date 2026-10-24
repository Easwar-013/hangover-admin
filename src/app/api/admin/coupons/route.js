import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { code, discountPercent, minOrderAmount, expiresAt } = await req.json();

    if (!code || !discountPercent || !expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Code, discount percentage, and expiration date are required.' },
        { status: 400 }
      );
    }

    const newCoupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      minOrderAmount: Number(minOrderAmount) || 0,
      expiresAt: new Date(expiresAt),
      isActive: true,
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A coupon with this code already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID required' }, { status: 400 });
    }

    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { id, isActive } = await req.json();

    const updated = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}