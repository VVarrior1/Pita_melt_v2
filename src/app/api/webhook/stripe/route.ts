import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log("🚀 WEBHOOK CALLED!", new Date().toISOString());

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    console.log("📝 Webhook body length:", body.length);
    console.log("🔐 Signature present:", !!signature);
    console.log("🔑 Webhook secret configured:", !!webhookSecret);
    console.log(
      "🔍 Webhook secret prefix:",
      webhookSecret ? webhookSecret.substring(0, 15) + "..." : "NOT SET"
    );
    console.log(
      "🔍 Signature prefix:",
      signature ? signature.substring(0, 20) + "..." : "NOT SET"
    );

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Webhook signature verified successfully");
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    console.log("🎯 Event type received:", event.type);
    console.log("🆔 Event ID:", event.id);

    switch (event.type) {
      case "checkout.session.completed":
        console.log("💰 CHECKOUT SESSION COMPLETED!");
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💳 Payment successful for session:", session.id);
        console.log("📋 Session metadata:", session.metadata);
        console.log("👤 Customer details:", session.customer_details);

        try {
          // Parse cart items from metadata
          const orderItems = JSON.parse(session.metadata?.orderItems || "[]");
          const pickupTime =
            session.metadata?.estimatedPickupTime || new Date().toISOString();

          console.log("Parsed order items:", orderItems);
          console.log("Pickup time:", pickupTime);

          // Create order in database - only include fields if they have values
          const orderData: any = {
            stripe_session_id: session.id,
            customer_name:
              session.customer_details?.name ||
              session.metadata?.customerName ||
              "Anonymous Customer",
            total_amount: (session.amount_total || 0) / 100,
            status: "confirmed" as const,
            payment_status: "succeeded" as const,
            items: orderItems,
          };

          // Only add optional fields if they exist
          if (
            session.customer_details?.email ||
            session.metadata?.customerEmail
          ) {
            orderData.customer_email =
              session.customer_details?.email ||
              session.metadata?.customerEmail;
          }

          if (
            session.customer_details?.phone ||
            session.metadata?.customerPhone
          ) {
            orderData.customer_phone =
              session.customer_details?.phone ||
              session.metadata?.customerPhone;
          }

          if (pickupTime) {
            orderData.pickup_time = new Date(pickupTime).toISOString();
          }

          if (session.metadata?.specialInstructions) {
            orderData.special_instructions =
              session.metadata.specialInstructions;
          }

          console.log(
            "💾 Order data to insert:",
            JSON.stringify(orderData, null, 2)
          );
          console.log("🔄 Attempting to save to Supabase...");

          const { data, error } = await supabaseAdmin
            .from("orders")
            .insert(orderData)
            .select();

          if (error) {
            console.error("❌ ERROR creating order:", error);
            console.error("📋 Error details:", JSON.stringify(error, null, 2));
            console.error(
              "🚨 Order data that failed:",
              JSON.stringify(orderData, null, 2)
            );
                     } else {
             console.log("✅ ORDER CREATED SUCCESSFULLY!");
             console.log(
               "📋 Created order data:",
               JSON.stringify(data, null, 2)
             );
             console.log("🆔 Order ID:", data?.[0]?.id);
             console.log("🔔 NEW ORDER INSERTED - Admin should be notified via Realtime!");
             
             // Manually trigger a Realtime broadcast since auto-detection might not work
             try {
               const broadcastChannel = supabaseAdmin.channel('order-notifications');
               await broadcastChannel.send({
                 type: 'broadcast',
                 event: 'new-order',
                 payload: { orderId: data?.[0]?.id, timestamp: new Date().toISOString() }
               });
               console.log("📡 Sent manual broadcast notification for new order");
             } catch (broadcastError) {
               console.error("Failed to send broadcast:", broadcastError);
             }
           }
        } catch (error) {
          console.error("Error processing checkout session:", error);
        }

        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment intent succeeded:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", failedPayment.id);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 WEBHOOK CRITICAL ERROR:", error);
    console.error(
      "🔍 Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
