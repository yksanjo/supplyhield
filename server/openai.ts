import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access 
// without requiring your own API key. Charges are billed to your Replit credits.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface VendorInfo {
  name: string;
  industry?: string;
  description?: string;
  products?: Array<{
    name: string;
    description?: string;
    dataAccessLevel?: string;
    businessCriticality?: string;
  }>;
}

interface RiskAnalysisResult {
  overallScore: number;
  securityScore: number;
  complianceScore: number;
  financialScore: number;
  operationalScore: number;
  findings: string;
  recommendations: string;
  aiAnalysis: string;
}

export async function analyzeVendorRisk(vendor: VendorInfo): Promise<RiskAnalysisResult> {
  const productsList = vendor.products?.map(p => 
    `- ${p.name}: ${p.description || 'No description'} (Data Access: ${p.dataAccessLevel || 'Unknown'}, Criticality: ${p.businessCriticality || 'Unknown'})`
  ).join('\n') || 'No products registered';

  const prompt = `You are a cybersecurity risk analyst specializing in third-party risk management (TPRM). 
Analyze the following vendor and provide a comprehensive risk assessment.

VENDOR INFORMATION:
Name: ${vendor.name}
Industry: ${vendor.industry || 'Unknown'}
Description: ${vendor.description || 'No description provided'}

PRODUCTS/SERVICES USED:
${productsList}

Provide your analysis in the following JSON format:
{
  "overallScore": <0-100, higher = more risk>,
  "securityScore": <0-100, higher = more risk>,
  "complianceScore": <0-100, higher = more risk>,
  "financialScore": <0-100, higher = more risk>,
  "operationalScore": <0-100, higher = more risk>,
  "findings": "<2-3 paragraphs describing key risk findings>",
  "recommendations": "<2-3 paragraphs with actionable recommendations>",
  "aiAnalysis": "<1-2 paragraphs of overall risk analysis summary>"
}

Consider the following factors in your analysis:
1. Industry-specific risks and regulations
2. Data access levels and potential for data breaches
3. Business criticality and dependency risks
4. Common vulnerabilities in the vendor's industry
5. Supply chain attack vectors

Be specific and actionable in your recommendations. If there are limited products registered, note that more product information would improve assessment accuracy.`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI model");
    }

    const result = JSON.parse(content);
    
    // Validate and sanitize the response
    return {
      overallScore: Math.min(100, Math.max(0, result.overallScore || 50)),
      securityScore: Math.min(100, Math.max(0, result.securityScore || 50)),
      complianceScore: Math.min(100, Math.max(0, result.complianceScore || 50)),
      financialScore: Math.min(100, Math.max(0, result.financialScore || 50)),
      operationalScore: Math.min(100, Math.max(0, result.operationalScore || 50)),
      findings: result.findings || "Unable to generate findings.",
      recommendations: result.recommendations || "Unable to generate recommendations.",
      aiAnalysis: result.aiAnalysis || "Unable to generate analysis.",
    };
  } catch (error) {
    console.error("Error analyzing vendor risk:", error);
    
    // Return a default assessment if AI fails
    return {
      overallScore: 50,
      securityScore: 50,
      complianceScore: 50,
      financialScore: 50,
      operationalScore: 50,
      findings: "AI analysis was unable to complete. Please try again or perform manual assessment.",
      recommendations: "Consider conducting a manual security review of this vendor.",
      aiAnalysis: "Automated risk analysis encountered an error. Manual review recommended.",
    };
  }
}
