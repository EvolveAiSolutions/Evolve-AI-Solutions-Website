const { GoogleGenerativeAI } = require("@google/generative-ai");

// This is a version number for our diagnostic test.
const SCRIPT_VERSION = "v4_DIAGNOSTIC";

exports.handler = async function (event) {
  // This will print the version number to the Netlify log.
  console.log(`Executing generate-ideas function. Version: ${SCRIPT_VERSION}`);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { businessType, businessChallenge } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured in Netlify environment variables.");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Final attempt with the base model name.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `I run a small business.
My business type is: "${businessType}".
My biggest challenge is: "${businessChallenge}".
Based on this, generate three high-level, strategic AI-powered solution ideas. For each idea, provide a clear title in bold, followed by a short paragraph explaining the strategic benefit. Do not provide detailed implementation steps.
After the three ideas, add a final paragraph with a strong call to action, exactly like this: "<p><strong>Ready to turn these ideas into action?</strong> Book a consultation with Evolve AI Solutions to get a personalised strategy.</p>"
Format the entire response as simple HTML with <p> and <strong> tags.`;

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
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

