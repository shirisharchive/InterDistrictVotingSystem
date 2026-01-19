const Joi = require("joi");

class politicalPartyValidation {
  validatePoliticalPartyData = async (data) => {
    try {
      const rules = Joi.object({
        PartyName: Joi.string().min(2).max(100).required(),
        PartyLogo: Joi.string().uri().required(),
        District: Joi.string().min(2).max(100).required(),
        AreaNo: Joi.number().integer().min(1).required(),
      });
      let response = await rules.validateAsync(data);
      console.log("Political party data validation successful");
      return response;
    } catch (error) {
      throw error;
    }
  };
}
const politicalPartySVC = new politicalPartyValidation();
module.exports = politicalPartySVC;
