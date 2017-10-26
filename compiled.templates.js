(function() {
  var template = Handlebars.template, templates = CUI = CUI || {};
templates['conversation/static/js/views/chatBreakpoint'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<div class=\"chat-breakpoint\" data-message-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <span>"
    + ((stack1 = ((helper = (helper = helpers.html || (depth0 != null ? depth0.html : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"html","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span>\n</div>\n";
},"useData":true});
templates['conversation/static/js/views/chatMedia'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " chat-message-media-thumbnail ";
},"3":function(container,depth0,helpers,partials,data) {
    return " chat-message-with-caption ";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "        <div class=\"caption\">\n          "
    + ((stack1 = ((helper = (helper = helpers.caption || (depth0 != null ? depth0.caption : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"caption","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n        </div>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"chat-actions\">\n            <div class=\"chat-actions-toggle\"><span></span><span></span><span></span></div>\n\n            <ul>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.overflow : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </ul>\n          </div>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "              <li data-action=\""
    + alias4(((helper = (helper = helpers.action || (depth0 != null ? depth0.action : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"action","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"chat-message chat-message-media "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.thumbnail : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.caption : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-message-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"chat-container\">\n    <div class=\"inner\">\n      <img src=\""
    + alias4(((helper = (helper = helpers.avatar || (depth0 != null ? depth0.avatar : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"avatar","hash":{},"data":data}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"chat-avatar\">\n\n      <div class=\"chat-bubble\">\n        "
    + ((stack1 = ((helper = (helper = helpers.html || (depth0 != null ? depth0.html : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"html","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.caption : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.overflow : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['conversation/static/js/views/chatMessage'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " chat-message-user ";
},"3":function(container,depth0,helpers,partials,data) {
    return "chat-message-advisor";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"chat-actions\">\n            <div class=\"chat-actions-toggle\"><span></span><span></span><span></span></div>\n\n            <ul>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.overflow : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </ul>\n          </div>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "              <li data-action=\""
    + alias4(((helper = (helper = helpers.action || (depth0 != null ? depth0.action : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"action","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"chat-message chat-message-text "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.userMessage : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.adviserMessage : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-message-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"chat-container\">\n    <div class=\"inner\">\n      <img src=\""
    + alias4(((helper = (helper = helpers.avatar || (depth0 != null ? depth0.avatar : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"avatar","hash":{},"data":data}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"chat-avatar\">\n\n      <div class=\"chat-bubble\">\n        "
    + ((stack1 = ((helper = (helper = helpers.html || (depth0 != null ? depth0.html : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"html","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.overflow : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['conversation/static/js/views/inputOption'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<button class=\"btn chat-option\" data-option-value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" data-option-score=\""
    + alias4(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"score","hash":{},"data":data}) : helper)))
    + "\" data-option-kc=\""
    + alias4(((helper = (helper = helpers.kc || (depth0 != null ? depth0.kc : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"kc","hash":{},"data":data}) : helper)))
    + "\" data-option-weight=\""
    + alias4(((helper = (helper = helpers.weight || (depth0 != null ? depth0.weight : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"weight","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</button>\n";
},"useData":true});
templates['conversation/static/js/views/sidebarBreakpoint'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " unlocked ";
},"3":function(container,depth0,helpers,partials,data) {
    return " started ";
},"5":function(container,depth0,helpers,partials,data) {
    return " done ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isStarted : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isStarted : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isUnlocked : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isDone : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-href=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  "
    + ((stack1 = ((helper = (helper = helpers.html || (depth0 != null ? depth0.html : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"html","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</li>\n";
},"useData":true});
templates['conversation/static/js/views/sidebarResources'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " unlocked ";
},"3":function(container,depth0,helpers,partials,data) {
    return " started ";
},"5":function(container,depth0,helpers,partials,data) {
    return " done ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isUnlocked : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n           "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isStarted : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n           "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isDone : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"\n           data-href=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\n           data-ul=\""
    + alias4(((helper = (helper = helpers.ul || (depth0 != null ? depth0.ul : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ul","hash":{},"data":data}) : helper)))
    + "\">\n  "
    + ((stack1 = ((helper = (helper = helpers.html || (depth0 != null ? depth0.html : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"html","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</li>\n";
},"useData":true});
templates['conversation/static/node_modules/yargs/completion.sh'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "###-begin-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n#\n# yargs command completion script\n#\n# Installation: "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bashrc\n#    or "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bash_profile on OSX.\n#\n_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word=\"${COMP_WORDS[COMP_CWORD]}\"\n    args=(\"${COMP_WORDS[@]}\")\n\n    # ask yargs to generate completions.\n    type_list=$("
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " --get-yargs-completions \"${args[@]}\")\n\n    COMPREPLY=( $(compgen -W \"${type_list}\" -- ${cur_word}) )\n\n    # if no match was found, fall back to filename completion\n    if [ ${#COMPREPLY[@]} -eq 0 ]; then\n      COMPREPLY=( $(compgen -f -- \"${cur_word}\" ) )\n    fi\n\n    return 0\n}\ncomplete -F _yargs_completions "
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "\n###-end-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n";
},"useData":true});
templates['conversation/static/node_modules/gulp-uglify/node_modules/yargs/completion.sh'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "###-begin-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n#\n# yargs command completion script\n#\n# Installation: "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bashrc\n#    or "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bash_profile on OSX.\n#\n_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word=\"${COMP_WORDS[COMP_CWORD]}\"\n    args=$(printf \"%s \" \"${COMP_WORDS[@]}\")\n\n    # ask yargs to generate completions.\n    type_list=`"
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " --get-yargs-completions $args`\n\n    COMPREPLY=( $(compgen -W \"${type_list}\" -- ${cur_word}) )\n    return 0\n}\ncomplete -F _yargs_completions "
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "\n###-end-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n";
},"useData":true});
templates['conversation/static/node_modules/handlebars/node_modules/yargs/completion.sh'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "###-begin-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n#\n# yargs command completion script\n#\n# Installation: "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bashrc\n#    or "
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " completion >> ~/.bash_profile on OSX.\n#\n_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word=\"${COMP_WORDS[COMP_CWORD]}\"\n    args=$(printf \"%s \" \"${COMP_WORDS[@]}\")\n\n    # ask yargs to generate completions.\n    type_list=`"
    + alias4(((helper = (helper = helpers.app_path || (depth0 != null ? depth0.app_path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_path","hash":{},"data":data}) : helper)))
    + " --get-yargs-completions $args`\n\n    COMPREPLY=( $(compgen -W \"${type_list}\" -- ${cur_word}) )\n    return 0\n}\ncomplete -F _yargs_completions "
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "\n###-end-"
    + alias4(((helper = (helper = helpers.app_name || (depth0 != null ? depth0.app_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"app_name","hash":{},"data":data}) : helper)))
    + "-completions-###\n";
},"useData":true});
})();