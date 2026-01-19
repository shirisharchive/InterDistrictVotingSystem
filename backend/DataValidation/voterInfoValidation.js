const Joi = require("joi");

class voterInfoValidation {
  validateVoterInfoData = async (data) => {
    try {
      const rules = Joi.object({
        VoterName: Joi.string().min(2).max(100).required(),
        VoterId: Joi.string().min(5).max(50).required(),
        PassportNo: Joi.string().min(5).max(20).optional(),
        District: Joi.string().min(2).max(100).required(),
        AreaNo: Joi.number().integer().min(1).required(),
      });
      let response = await rules.validateAsync(data);
      console.log("Voter info data validation successful");
      return response;
    } catch (error) {
      throw error;
    }
  };
}
const voterInfoSVC = new voterInfoValidation();
module.exports = voterInfoSVC;
