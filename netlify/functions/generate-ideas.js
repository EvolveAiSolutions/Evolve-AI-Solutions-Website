const { GoogleGenerativeAI } = require("@google/generative-ai");

// This is your secure "back office" function.
exports.handler = async function (event) {
  // We only accept POST requests.
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Get the user's input from the request body.
    const { businessType, businessChallenge } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured in Netlify environment variables.");
    }
    
    // Initialize the Google AI client with your API key.
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // THE FIX IS HERE: We are now using the correct, stable model name "gemini-pro".
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // This is the prompt we send to the AI.
    const prompt = `I run a small business.
My business type is: "${businessType}".
My biggest challenge is: "${businessChallenge}".

Based on this, generate three high-level, strategic AI-powered solution ideas. For each idea, provide a clear title in bold, followed by a short paragraph explaining the strategic benefit. Do not provide detailed implementation steps or specific prompt examples. Keep the explanations brief and focused on the 'what' and 'why', not the 'how'.
After the three ideas, add a final paragraph with a strong call to action, exactly like this: "<p><strong>Ready to turn these ideas into action?</strong> Book a consultation with Evolve AI Solutions to get a personalised strategy and learn how to implement these solutions for your business.</p>"
Format the entire response as simple HTML with <p> and <strong> tags. Do not include markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideas: text }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    // Return a structured error message.
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
