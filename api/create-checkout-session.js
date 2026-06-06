const Stripe = require("stripe");

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string") {
    return Promise.resolve(JSON.parse(req.body || "{}"));
  }

  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = getStripe();

  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }

  try {
    const { name, email, phone } = await readJsonBody(req);

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone are required." });
    }

    const baseUrl =
      process.env.SITE_URL ||
      `https://${req.headers["x-forwarded-host"] || req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100,
            product_data: {
              name: "Apex Fit Elite Starter Package",
              description: "One-time starter package with 24/7 access, two personal training sessions, and nutrition support."
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        name,
        phone
      },
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Unable to start checkout." });
  }
};
