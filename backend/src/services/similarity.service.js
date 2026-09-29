const Project = require('../models/Project');
const SimilarityResult = require('../models/SimilarityResult');
const {
  tokenize,
  extractKeywords,
  getTermFrequency,
  cosineSimilarity,
  jaccardSimilarity
} = require('../utils/textProcessors');

class SimilarityService {
  /**
   * Run similarity analysis for a given project against all other projects in MongoDB
   */
  async analyzeSimilarity(project, versionNumber = 1) {
    const existingProjects = await Project.find({
      _id: { $ne: project._id },
      isArchived: { $ne: true }
    }).select('title problemStatement proposedSolution domain technologies keyFeatures expectedOutcome');

    if (!existingProjects || existingProjects.length === 0) {
      const emptyResult = await SimilarityResult.create({
        projectId: project._id,
        versionNumber,
        topMatches: [],
        totalProjectsCompared: 0,
        highestSimilarityPercentage: 0,
        averageSimilarityPercentage: 0
      });
      return emptyResult;
    }

    const currentProjectTokens = {
      title: tokenize(project.title),
      problem: tokenize(project.problemStatement),
      solution: tokenize(project.proposedSolution),
      all: tokenize(`${project.title} ${project.problemStatement} ${project.proposedSolution} ${(project.keyFeatures || []).join(' ')}`)
    };

    const currentTfAll = getTermFrequency(currentProjectTokens.all);
    const currentTfProblem = getTermFrequency(currentProjectTokens.problem);
    const currentTfSolution = getTermFrequency(currentProjectTokens.solution);
    const currentTechSet = new Set((project.technologies || []).map(t => t.toLowerCase().trim()));

    const matches = [];

    for (const other of existingProjects) {
      const otherTokens = {
        title: tokenize(other.title),
        problem: tokenize(other.problemStatement),
        solution: tokenize(other.proposedSolution),
        all: tokenize(`${other.title} ${other.problemStatement} ${other.proposedSolution} ${(other.keyFeatures || []).join(' ')}`)
      };

      const otherTfAll = getTermFrequency(otherTokens.all);
      const otherTfProblem = getTermFrequency(otherTokens.problem);
      const otherTfSolution = getTermFrequency(otherTokens.solution);
      const otherTechSet = new Set((other.technologies || []).map(t => t.toLowerCase().trim()));

      // 1. Domain match
      const domainMatch = (project.domain || '').toLowerCase().trim() === (other.domain || '').toLowerCase().trim();
      const domainScore = domainMatch ? 1.0 : 0.0;

      // 2. Technology match
      const matchingTech = (project.technologies || []).filter(t => otherTechSet.has(t.toLowerCase().trim()));
      const techScore = jaccardSimilarity(project.technologies || [], other.technologies || []);

      // 3. Problem & Solution similarity
      const problemSim = cosineSimilarity(currentTfProblem, otherTfProblem);
      const solutionSim = cosineSimilarity(currentTfSolution, otherTfSolution);
      const overallTextSim = cosineSimilarity(currentTfAll, otherTfAll);

      // 4. Matching concepts (intersection of top keywords)
      const currentProbKeywords = extractKeywords(project.problemStatement, 10);
      const otherProbKeywords = new Set(extractKeywords(other.problemStatement, 10));
      const matchingProblemConcepts = currentProbKeywords.filter(k => otherProbKeywords.has(k));

      const currentSolKeywords = extractKeywords(project.proposedSolution, 10);
      const otherSolKeywords = new Set(extractKeywords(other.proposedSolution, 10));
      const matchingSolutionConcepts = currentSolKeywords.filter(k => otherSolKeywords.has(k));

      // 5. Distinct differences
      const differences = [];
      const uniqueTech = (other.technologies || []).filter(t => !currentTechSet.has(t.toLowerCase().trim()));
      if (uniqueTech.length > 0) {
        differences.push(`Uses distinct technologies: ${uniqueTech.slice(0, 3).join(', ')}`);
      }
      if (!domainMatch) {
        differences.push(`Different operational domain (${other.domain})`);
      }
      if (other.keyFeatures && other.keyFeatures.length > 0) {
        const diffFeatures = other.keyFeatures.filter(f => !(project.keyFeatures || []).includes(f));
        if (diffFeatures.length > 0) {
          differences.push(`Features focus: "${diffFeatures[0]}"`);
        }
      }

      // Weighted Composite Similarity (0 - 100%)
      // 35% overall text, 25% technology, 20% solution, 10% problem, 10% domain
      const compositeScore =
        overallTextSim * 0.35 +
        techScore * 0.25 +
        solutionSim * 0.20 +
        problemSim * 0.10 +
        domainScore * 0.10;

      const percentage = Math.min(Math.round(compositeScore * 100), 99);

      matches.push({
        similarProjectId: other._id,
        title: other.title,
        domain: other.domain,
        similarityPercentage: percentage,
        domainMatch,
        technologyMatchScore: Math.round(techScore * 100),
        textMatchScore: Math.round(overallTextSim * 100),
        matchingTechnologies: matchingTech,
        matchingProblemConcepts,
        matchingSolutionConcepts,
        differences
      });
    }

    // Sort descending by similarity percentage
    matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

    const topMatches = matches.slice(0, 10);
    const highestSimilarity = topMatches.length > 0 ? topMatches[0].similarityPercentage : 0;
    const avgSimilarity =
      topMatches.length > 0
        ? Math.round(topMatches.reduce((acc, m) => acc + m.similarityPercentage, 0) / topMatches.length)
        : 0;

    // Persist or update similarity result
    const savedResult = await SimilarityResult.findOneAndUpdate(
      { projectId: project._id, versionNumber },
      {
        projectId: project._id,
        versionNumber,
        topMatches,
        totalProjectsCompared: existingProjects.length,
        highestSimilarityPercentage: highestSimilarity,
        averageSimilarityPercentage: avgSimilarity
      },
      { upsert: true, new: true }
    );

    return savedResult;
  }
}

module.exports = new SimilarityService();
