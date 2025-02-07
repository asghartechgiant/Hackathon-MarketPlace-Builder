import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
export async function POST(req: NextRequest) {
  try {
    const { cartItems, shippingDetails, totalPrice } = await req.json();

    console.log(cartItems, shippingDetails, totalPrice);

    // Create the order in Sanity
    const order = await client.create({
      _type: "order",
      status: "Pending",
      cartItems: cartItems.map(
        (item: {
          title: string;
          quantity: number;
          price: number;
          imageUrl: string;
        }) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })
      ),
      shippingDetails,
      totalPrice,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      { error: "Failed to place order", details: error },
      { status: 500 }
    );
  }
}
