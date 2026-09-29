const { GEMINI_API_KEY } = require('../config/env');
const Analysis = require('../models/Analysis');

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  /**
   * Main entrypoint to analyze project idea with Gemini AI
   */
  async analyzeProject(project, versionNumber = 1) {
    let aiResult;

    if (this.apiKey && this.apiKey.trim() !== '') {
      try {
        console.log('[GeminiService] Calling Gemini API for project:', project.title);
        aiResult = await this.callGeminiAPI(project);
      } catch (apiError) {
        console.warn('[GeminiService] Gemini API call failed, using intelligent fallback analysis:', apiError.message);
        aiResult = this.generateFallbackAnalysis(project, `Gemini API Notice: ${apiError.message}`);
      }
    } else {
      console.log('[GeminiService] No GEMINI_API_KEY set. Generating deterministic domain heuristic analysis.');
      aiResult = this.generateFallbackAnalysis(project, 'Generated with local heuristic analysis engine (GEMINI_API_KEY not configured in .env).');
    }

    // Validate structured fields
    const validatedAnalysis = this.validateAndNormalize(aiResult, project);

    // Save to MongoDB Analysis collection
    const saved = await Analysis.findOneAndUpdate(
      { projectId: project._id, versionNumber },
      {
        projectId: project._id,
        versionNumber,
        ...validatedAnalysis
      },
      { upsert: true, new: true }
    );

    return saved;
  }

  /**
   * Direct API call to Gemini 1.5 Flash using fetch or Google Generative AI
   */
  async callGeminiAPI(project) {
    const prompt = `
You are a senior academic and venture innovation architect. Analyze this student project idea and respond ONLY with a valid JSON object matching the requested schema. Do not include markdown codeblocks (\`\`\`json) or extra text.

Project Information:
Title: ${project.title}
Domain: ${project.domain}
Problem Statement: ${project.problemStatement}
Proposed Solution: ${project.proposedSolution}
Target Users: ${project.targetUsers}
Technologies: ${(project.technologies || []).join(', ')}
Key Features: ${(project.keyFeatures || []).join('; ')}
Expected Outcome: ${project.expectedOutcome}

JSON Response Structure:
{
  "projectSummary": "Concise 2-3 sentence executive summary of the idea",
  "problemAnalysis": "Evaluation of the problem depth, urgency, and relevance",
  "targetUsersAnalysis": "Evaluation of target user persona needs and adoption barriers",
  "solutionAnalysis": "Critique of proposed technical solution architecture",
  "technologiesAnalysis": "Assessment of stack suitability, scalability, and modern best practices",
  "strengths": ["3-5 clear strengths"],
  "weaknesses": ["3-5 notable weaknesses or blind spots"],
  "potentialChallenges": ["3-5 deployment, security, or data hurdles"],
  "innovationOpportunities": ["3-5 ways to make this stand out"],
  "possibleImprovements": {
    "featureImprovements": ["2-3 specific feature additions"],
    "technologyImprovements": ["2-3 tech upgrades/architectures"],
    "userExperienceImprovements": ["2-3 UX enhancements"],
    "scalabilityImprovements": ["2-3 scalability guidelines"],
    "differentiationOpportunities": ["2-3 angles to differentiate from standard solutions"]
  },
  "suggestedAdditionalFeatures": ["3-5 advanced features"],
  "potentialRealWorldApplications": ["3-4 commercial or societal use cases"],
  "potentialLimitations": ["2-3 inherent constraints"],
  "overallScore": 82
}
`;

    // Use native fetch to call Gemini v1beta endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned empty response structure');
    }

    let parsed;
    try {
      const cleanJson = candidateText.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
    }

    parsed.aiModelUsed = 'gemini-1.5-flash';
    parsed.isFallback = false;
    return parsed;
  }

  /**
   * Fallback heuristic generator when API key is missing or network/quota error occurs
   */
  generateFallbackAnalysis(project, note = '') {
    const domain = project.domain || 'Software Engineering';
    const techList = (project.technologies || []).join(', ') || 'Modern full-stack technologies';

    return {
      projectSummary: `"${project.title}" addresses critical challenges in ${domain} by utilizing ${techList}. The system targets ${project.targetUsers || 'end users'} with an emphasis on automation and practical workflow delivery.`,
      problemAnalysis: `The identified problem statement demonstrates strong domain awareness. In ${domain}, manual, fragmented, or legacy systems often cause inefficiencies that ${project.title} systematically resolves.`,
      targetUsersAnalysis: `Targeting ${project.targetUsers} aligns well with the proposed feature set. Ensuring smooth onboarding and minimal cognitive load will be decisive for user retention.`,
      solutionAnalysis: `The proposed architecture directly maps technical capabilities to the problem scope. Prioritizing modular microservices or decoupled frontend/backend patterns will preserve long-term maintainability.`,
      technologiesAnalysis: `The chosen stack (${techList}) is viable and widely supported. Integrating automated unit testing, CI/CD pipelines, and secure API gateways will strengthen technical execution.`,
      strengths: [
        `Direct alignment between user pain points and the core feature roadmap`,
        `Solid foundational technology choices utilizing ${techList}`,
        `Practical domain application with clear tangible outcomes`,
        `High potential for modular expansion across academic or commercial contexts`
      ],
      weaknesses: [
        `Initial risk of scope creep without tightly defined MVP boundaries`,
        `Dependency on consistent, high-quality data input from ${project.targetUsers}`,
        `Need for comprehensive test suites covering edge cases and concurrency`
      ],
      potentialChallenges: [
        `Ensuring real-time responsiveness and low-latency database queries under peak loads`,
        `Strict adherence to data privacy and role-based access control compliance`,
        `Integration bottlenecks when communicating with external APIs or hardware sensors`
      ],
      innovationOpportunities: [
        `Incorporate predictive AI assistance to automate routine actions for ${project.targetUsers}`,
        `Introduce end-to-end telemetry and audit trails for transparency and reporting`,
        `Develop cross-platform PWA (Progressive Web App) support for offline capability`
      ],
      possibleImprovements: {
        featureImprovements: [
          `Add automated notifications and contextual action reminders`,
          `Implement role-based customizable dashboards for different user tiers`,
          `Support exportable PDF and CSV reports for institutional compliance`
        ],
        technologyImprovements: [
          `Implement Redis caching for high-frequency queries and session management`,
          `Adopt Docker containerization for standardized deployment environments`,
          `Incorporate centralized structured logging (e.g., Winston/Morgan) with log aggregation`
        ],
        userExperienceImprovements: [
          `Provide an interactive guided walkthrough for first-time onboarding`,
          `Implement instant inline form validation with accessible ARIA standards`,
          `Introduce dark mode theme switching with user preference persistence`
        ],
        scalabilityImprovements: [
          `Index high-cardinality MongoDB query attributes to optimize read performance`,
          `Decouple long-running tasks into asynchronous worker queues`,
          `Implement rate limiting and token bucket throttles to safeguard public endpoints`
        ],
        differentiationOpportunities: [
          `Focus on specialized domain workflows unique to ${domain} rather than generic CRUD`,
          `Incorporate collaborative real-time sync capabilities between peers and supervisors`,
          `Offer verifiable audit trails and automated compliance checks`
        ]
      },
      suggestedAdditionalFeatures: [
        `Automated anomaly detection and alerts for abnormal data patterns`,
        `Integrated feedback loop allowing users to rate and suggest workflow improvements`,
        `REST and Webhook integration capabilities for third-party systems`,
        `Advanced analytical charts tracking domain KPIs over time`
      ],
      potentialRealWorldApplications: [
        `Educational institutions and universities managing departmental workflows`,
        `Enterprise teams seeking structured operational tracking and oversight`,
        `Independent open-source community deployments with localized hosting`
      ],
      potentialLimitations: [
        `Requires persistent network connectivity unless offline sync is introduced`,
        `Heavily dependent on user diligence in entering complete and accurate data`
      ],
      overallScore: 78,
      aiModelUsed: 'heuristic-innovation-engine-v1',
      isFallback: true,
      fallbackNote: note
    };
  }

  /**
   * Validate and guarantee all fields match the Analysis schema
   */
  validateAndNormalize(aiResult, project) {
    return {
      projectSummary: aiResult.projectSummary || `${project.title} project overview.`,
      problemAnalysis: aiResult.problemAnalysis || 'Detailed problem analysis generated.',
      targetUsersAnalysis: aiResult.targetUsersAnalysis || 'Target audience analysis.',
      solutionAnalysis: aiResult.solutionAnalysis || 'Proposed solution assessment.',
      technologiesAnalysis: aiResult.technologiesAnalysis || 'Technology stack assessment.',
      strengths: Array.isArray(aiResult.strengths) ? aiResult.strengths : ['Feasible architecture'],
      weaknesses: Array.isArray(aiResult.weaknesses) ? aiResult.weaknesses : ['Requires rigorous testing'],
      potentialChallenges: Array.isArray(aiResult.potentialChallenges) ? aiResult.potentialChallenges : ['Deployment complexity'],
      innovationOpportunities: Array.isArray(aiResult.innovationOpportunities) ? aiResult.innovationOpportunities : ['AI enhancements'],
      possibleImprovements: {
        featureImprovements: aiResult.possibleImprovements?.featureImprovements || [],
        technologyImprovements: aiResult.possibleImprovements?.technologyImprovements || [],
        userExperienceImprovements: aiResult.possibleImprovements?.userExperienceImprovements || [],
        scalabilityImprovements: aiResult.possibleImprovements?.scalabilityImprovements || [],
        differentiationOpportunities: aiResult.possibleImprovements?.differentiationOpportunities || []
      },
      suggestedAdditionalFeatures: Array.isArray(aiResult.suggestedAdditionalFeatures) ? aiResult.suggestedAdditionalFeatures : [],
      potentialRealWorldApplications: Array.isArray(aiResult.potentialRealWorldApplications) ? aiResult.potentialRealWorldApplications : [],
      potentialLimitations: Array.isArray(aiResult.potentialLimitations) ? aiResult.potentialLimitations : [],
      overallScore: typeof aiResult.overallScore === 'number' ? Math.min(Math.max(aiResult.overallScore, 0), 100) : 75,
      aiModelUsed: aiResult.aiModelUsed || 'gemini-1.5-flash',
      isFallback: Boolean(aiResult.isFallback)
    };
  }
}

module.exports = new GeminiService();
