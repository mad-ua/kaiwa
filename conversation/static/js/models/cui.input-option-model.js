/**
 * @file Defines the class CUI.InputOptionModel
 */

var CUI = CUI || {};
CUI.models = CUI.models || {};

/**
 * Model for an input option in the chat.
 * @class
 * @param {Object} data               - The data used to generate the input option.
 * @param {string} data.value         - The value of the input option.
 * @param {string} data.text          - The text of the input option.
 * @returns {CUI.InputOptionModel}
 */
CUI.InputOptionModel = function(data){
  // Check that data has all required properties
  if(!data.value) throw new Error('CUI.InputOptionModel(): Invalid data.value.');
  if(!data.text) throw new Error('CUI.InputOptionModel(): No data.text.');

  /**
   * The value of the input option.
   * @type {string}
   * @public
   */
  this.value = data.value;

  this.kc = data.kc;

  this.weight = data.weight;

  /**
  * Score of each answer is stored here.
  * @type {integer}
  * @public
  **/
  this.score = data.score;

  /**
   * The text of the input option.
   * @type {string}
   * @public
   */
  this.text = data.text;

  if (data.bot) {
    this.bot = new CUI.BotModel(data.bot);
  }

  return this;
};
