const Joi = require("joi");
class CandidateValidation {
  validateCandidateData = async (data) => {
    try {
      const rules = Joi.object({
        CandidateName: Joi.string().min(3).max(100).required(),
        CandidateParty: Joi.string().min(2).max(100).required(),
        CandidatePosition: Joi.string().min(2).max(100).required(),
        CandidateElectionLogo: Joi.string().uri().required(),
        CandidateImage: Joi.string().uri().required(),
        District: Joi.string().min(2).max(100).required(),
        AreaNo: Joi.number().integer().min(1).required(),
      });
      let response = await rules.validateAsync(data);
      console.log("Candidate data validation successful");
      return response;
    } catch (error) {
      throw error;
    }
  };
}
const candidateSVC = new CandidateValidation();
module.exports = candidateSVC;
