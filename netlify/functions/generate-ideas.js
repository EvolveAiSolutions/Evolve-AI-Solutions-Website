// This line imports the necessary Google AI toolkit
const { GoogleGenerativeAI } = require("@google/generative-ai");

// This is the main function that runs when your website calls it
exports.handler = async function (event) {
  
  // Security check: Only allow POST requests (how web forms send data)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Get the data the user typed in (business type and challenge)
    const { businessType, businessChallenge } = JSON.parse(event.body);
    
    // 2. Securely get your secret API key from the Netlify "vault"
    const apiKey = process.env.GEMINI_API_KEY;

    // 3. Safety checks
    if (!apiKey) {
      throw new Error("API key is not configured in Netlify environment variables.");
    }
    if (!businessType || !businessChallenge) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Business type and challenge are required." }),
      };
    }

    // 4. Set up the connection to the Google AI model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 5. Create the detailed instruction (prompt) for the AI
    const prompt = `I run a small business.
My business type is: "${businessType}".
My biggest challenge is: "${businessChallenge}".

Based on this, generate three high-level, strategic AI-powered solution ideas. For each idea, provide a clear title in bold, followed by a short paragraph explaining the strategic benefit. Do not provide detailed implementation steps or specific prompt examples. Keep the explanations brief and focused on the 'what' and 'why', not the 'how'.
After the three ideas, add a final paragraph with a strong call to action, exactly like this: "<p><strong>Ready to turn these ideas into action?</strong> Book a consultation with Evolve AI Solutions to get a personalised strategy and learn how to implement these solutions for your business.</p>"
Format the entire response as simple HTML with <p> and <strong> tags. Do not include markdown.`;

    // 6. Send the prompt to the AI and get the result
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 7. Send the generated ideas back to the website to be displayed
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideas: text }),
    };

  } catch (error) {
    // If anything goes wrong, log the error and send a helpful message back
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong on the server.", details: error.message }),
    };
  }
};