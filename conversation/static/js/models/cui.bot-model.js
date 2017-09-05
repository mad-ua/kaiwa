/**
 * @file Defines the class CUI.InputOptionModel
 */

var CUI = CUI || {};
CUI.models = CUI.models || {};

/**
 * Model for an input option in the chat.
 * @class
 * @param {Object} data               - The data used to generate the bot with messages.
 * @param {boolean} data.reanswering  - The value of reanswering field.
 * @param {Array} data.addMessages    - Array of objects with messages to add.
 * @returns {CUI.BotModel}
 */
CUI.BotModel = function(data){
  // Check that data has all required properties
  // if(!data.value) throw new Error('CUI.BotModel(): Invalid data.value.');
  // if(!data.text) throw new Error('CUI.BotModel(): No data.text.');

  /**
   * The value of reanswering field
   * @type {boolean}
   * @public
   */
  this.reanswering = data.reanswering || false;

  /**
  * Create bot messages as instances of cui.message-model
  *
  */
  if (data.addMessages) {
    this.messages = []
    for (var i in data.addMessages) {
      this.messages.push(new CUI.ChatMessageModel(data.addMessages[i]));
    }
  }

  /**
   * The message to show.
   * @type {ChatMessageModel}
   * @public
   */
   if (this.messages.length) {
    this.message = this.messages[0];
  } else {
    this.message = undefined;
  }
  if (data.input) {
    this.input = data.input;
  }
  return this;
};
