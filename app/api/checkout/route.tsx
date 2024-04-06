import paypal from "@paypal/checkout-server-sdk"
import { useAppSelector } from "@/Redux/hooks";
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server";

// COSITAS DE PAYPAL XD
const clientId = process.env.PAYPAL_CLIENT_ID as string;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string;


export async function POST(req: any, res: any) {
    const HOST = req.headers.host;
    const { products } = await req.json();
    const request = await fetch('https://api-m.sandbox.paypal.com', {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ACCESS-TOKEN",
      }
    })
    
    const itemTotal = getTotalPrice(products)
    const shippingFee = itemTotal > 399 ? 0 : 150
    const grandTotal = itemTotal + shippingFee
 
    if (!products || !Array.isArray(products)) {
        return NextResponse.json({
            error: "Invalid or missing product info.",
        })
    }
 
    console.log(products, "ROUTE")
 
    req.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: String(grandTotal),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: String(itemTotal),
                },
                shipping_discount: {
                  currency_code: "USD",
                  value: "0.00",
                },
                discount: {
                  currency_code: "USD",
                  value: "0.00",
                },
                tax_total: {
                  currency_code: "USD",
                  value: "0.00",
                },
                shipping: {
                  currency_code: "USD",
                  value: String(shippingFee),
                },
                handling: {
                  currency_code: "USD",
                  value: "0.00",
                },
                insurance: {
                  currency_code: "USD",
                  value: "0.00",
                },
              },
            },
            items: products.map((product: any) => ({
              name: product.name,
              category: "PHYSICAL_GOODS",
              description: product.description,
              quantity: product.quantity,
              unit_amount: {
                currency_code: "MXN",
                value: product.price.toString(),
              },
            })),
          },
        ],
      });
 
    const response = await client.execute(request);
    console.log(response);
 
    return NextResponse.json({
        id: response.result.id
    });
}
 
function getTotalPrice(products: any[]) {
  return products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

export const runtime = 'edge';
