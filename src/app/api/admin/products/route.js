import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import StockAlert from '@/models/StockAlert';
import nodemailer from 'nodemailer';

// GET /api/admin/products - Fetch all products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/products - Create a new product
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { title, description, price, offer, category, sizes, colors, images, sideImage, stock, isFeatured } = body;

    // Validation: Description is optional
    if (!title || price == null || !category || !images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please fill in title, price, category, and upload an image.' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      description: description ? description.trim() : '',
      price: Number(price) || 0,
      offer: offer != null && offer !== '' ? Number(offer) : 0,
      category,
      sizes: sizes || ['S', 'M', 'L'],
      colors: colors || [],
      images,
      sideImage: sideImage || '',
      stock: stock != null ? Number(stock) : 0,
      isFeatured: isFeatured || false,
      trendingAt: isFeatured ? new Date() : null,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/products - Update an existing product & trigger restock alerts
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for updates' },
        { status: 400 }
      );
    }

    // 1. Fetch current product state before updating to check previous stock level
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // 2. Explicitly enforce numeric & trimmed values
    if ('price' in updateData) {
      updateData.price = Number(updateData.price) || 0;
    }
    if ('offer' in updateData) {
      updateData.offer = updateData.offer !== '' && updateData.offer != null ? Number(updateData.offer) : 0;
    }
    if ('stock' in updateData) {
      updateData.stock = Number(updateData.stock) || 0;
    }
    if ('description' in updateData) {
      updateData.description = updateData.description ? updateData.description.trim() : '';
    }

    // Track when an item joins/leaves Trending so the homepage rail keeps the admin's order
    if ('isFeatured' in updateData && Boolean(updateData.isFeatured) !== Boolean(existingProduct.isFeatured)) {
      updateData.trendingAt = updateData.isFeatured ? new Date() : null;
    }

    // 3. Update product in database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // 4. RESTOCK CHECK: Trigger emails if stock went from 0 to > 0
    if (existingProduct.stock <= 0 && updatedProduct.stock > 0) {
      const pendingAlerts = await StockAlert.find({ 
        productId: String(id), 
        notified: false 
      });

      const gmailUser = process.env.GMAIL_USER?.trim();
      const gmailPass = process.env.GMAIL_APP_PASS?.trim().replace(/\s+/g, '');

      if (pendingAlerts.length > 0 && gmailUser && gmailPass) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const baseUrl = process.env.STOREFRONT_URL || process.env.NEXTAUTH_URL || 'https://clothes-shop-beta-black.vercel.app';

        for (const alertRecord of pendingAlerts) {
          try {
            await transporter.sendMail({
              from: `"Attire Store" <${gmailUser}>`,
              to: alertRecord.email,
              subject: `🎉 Back in Stock: ${updatedProduct.title}!`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px;">
                  <h2 style="font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 8px;">Good news!</h2>
                  <h3 style="font-size: 16px; font-weight: 700; margin-top: 0;">${updatedProduct.title} is back in stock!</h3>
                  <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                    The item you were waiting for has just been restocked (${updatedProduct.stock} items available). Grab yours before it runs out again!
                  </p>
                  <div style="margin-top: 24px;">
                    <a href="${baseUrl}/product/${updatedProduct._id}" 
                       style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block;">
                       Shop Product Now
                    </a>
                  </div>
                  <hr style="border: none; border-top: 1px solid #f3f4f6; margin-top: 32px; margin-bottom: 16px;" />
                  <p style="font-size: 12px; color: #9ca3af; margin: 0;">You received this because you requested a restock alert on Attire Store.</p>
                </div>
              `,
            });

            // Mark as notified so they don't receive duplicate emails later
            alertRecord.notified = true;
            await alertRecord.save();
          } catch (emailErr) {
            console.error(`Failed to send restock alert to ${alertRecord.email}:`, emailErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/products - Delete a product
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Clean up any pending stock alerts for this deleted product
    await StockAlert.deleteMany({ productId: String(id) });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}