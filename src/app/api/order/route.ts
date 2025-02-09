import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import shipengine from "@/lib/shipEngine";
export async function POST(req: NextRequest) {
  try {
    const { cartItems, shippingDetails, totalPrice } = await req.json();

    console.log(shippingDetails);
    //     {
    //   name: 'asghartechgiant',
    //   address: 'fdsfsd',
    //   city: 'sa',
    //   zipCode: '23434',
    //   country: 'dsfsdfsd'
    // }

    const shipRateResponse = await shipengine.getRatesWithShipmentDetails({
      rateOptions: {
        carrierIds: [process.env.COURIER_ID!].filter(Boolean),
      },
      shipment: {
        shipTo: {
          name: shippingDetails.name,
          phone: "555-555-5555",
          addressLine1: shippingDetails.address,
          cityLocality: shippingDetails.city,
          stateProvince: "CA",
          postalCode: shippingDetails.zipCode,
          countryCode: "US",
          addressResidentialIndicator: "no",
        },
        shipFrom: {
          companyName: "Example Corp.",
          name: "John Doe",
          phone: "111-111-1111",
          addressLine1: "4009 Marathon Blvd",
          addressLine2: "Suite 300",
          cityLocality: "Austin",
          stateProvince: "TX",
          postalCode: "78756",
          countryCode: "US",
          addressResidentialIndicator: "no",
        },
        packages: [
          {
            weight: {
              value: 1.0,
              unit: "ounce",
            },
          },
        ],
      },
    });

    console.log(shipRateResponse.rateResponse.rates?.[0].rateId);

    const rateId = shipRateResponse.rateResponse.rates?.[0].rateId;

    const labelDetails = await shipengine.createLabelFromRate({
      rateId: rateId!,
    });

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
      {
        message: "Order placed successfully",
        order,
        shipmentId: labelDetails.shipmentId,
      },
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
