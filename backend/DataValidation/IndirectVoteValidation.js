const Joi = require("joi");

class IndirectVoteInfoValidation {
  validateIndirectVoteData = async (data) => {
    try {
      const rules = Joi.object({
        VoterId: Joi.number().integer().required(),
        PartyId: Joi.number().integer().required(),
        District: Joi.string().min(2).max(100).required(),
        AreaNo: Joi.number().integer().min(1).required(),
        VoteTime: Joi.date().optional(),
      });
      let response = await rules.validateAsync(data);
      console.log("Indirect vote data validation successful");
      return response;
    } catch (error) {
      throw error;
    }
  };
}
const indirectVoteInfoSVC = new IndirectVoteInfoValidation();
module.exports = indirectVoteInfoSVC;
