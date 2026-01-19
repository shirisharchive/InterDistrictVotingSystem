const Joi = require("joi");

class ElectionAreaValidation {
  validateElectionAreaData = async (data) => {
    try {
      const rules = Joi.object({
        District: Joi.string().min(2).max(100).required(),
        AreaNo: Joi.number().integer().min(1).required(),
      });
      let response = await rules.validateAsync(data);
      console.log("Election area data validation successful");
      return response;
    } catch (error) {
      throw error;
    }
  };
}
const electionAreaSVC = new ElectionAreaValidation();
module.exports = electionAreaSVC;
