app.netrequest = {
  "display": {
    "badge": {
      "text": async function (e) {
        if (chrome.declarativeNetRequest) {
          var displayActionCountAsBadgeText = e !== undefined ? e : true;
          await chrome.declarativeNetRequest.setExtensionActionOptions({
            "displayActionCountAsBadgeText": displayActionCountAsBadgeText
          });
        }
      }
    }
  },
  "remove": {
    "action": {
      "type": async function (type, key) {
        if (chrome.declarativeNetRequest) {
          if (type) {
            var addRules = app.netrequest.dynamic.rules.stack;
            if (addRules && addRules.length) {
              var removeRuleIds = addRules.filter(function (e) {
                if (e) {
                  if (e.action) {
                    if (e.action.type === type) {
                      if (key) {
                        if (key in e.action) {
                          return true;
                        }
                      } else {
                        return true;
                      }
                    }
                  }
                }
                /*  */
                return false;
              }).map(function (e) {return e.id});
              /*  */
              if (removeRuleIds && removeRuleIds.length) {
                await chrome.declarativeNetRequest.updateDynamicRules({"removeRuleIds": removeRuleIds});
                app.netrequest.dynamic.rules.stack = await chrome.declarativeNetRequest.getDynamicRules();
              }
            }
          }
        }
      }
    }
  },
  "dynamic": {
    "rules": {
      "stack": [],
      "add": function (e) {
        if (e) {
          if (e.action && e.condition) {
            var id = app.netrequest.dynamic.rules.find.next.available.id();
            if (id) {
              app.netrequest.dynamic.rules.stack.push({
                "id": id,
                "action": e.action,
                "condition": e.condition
              });
            }
          }
        }
      },
      "update": async function () {
        if (chrome.declarativeNetRequest) {
          var rules = await chrome.declarativeNetRequest.getDynamicRules();
          if (rules && rules.length) {
            var removeRuleIds = rules.map(function (e) {return e.id});
            if (removeRuleIds && removeRuleIds.length) {
              await chrome.declarativeNetRequest.updateDynamicRules({"removeRuleIds": removeRuleIds});
            }
          }
          /*  */
          var addRules = app.netrequest.dynamic.rules.stack;
          if (addRules && addRules.length) {
            await chrome.declarativeNetRequest.updateDynamicRules({"addRules": addRules});
          }
        }
      },
      "find": {
        "next": {
          "available": {
            "id": function () {
              var target = 1;
              /*  */
              var addRules = app.netrequest.dynamic.rules.stack;
              if (addRules && addRules.length) {
                var addRulesIds = addRules.map(function (e) {return e.id}).sort(function (a, b) {return a - b});
                if (addRulesIds && addRulesIds.length) {
                  for (var index in addRulesIds) {
                    if (addRulesIds[index] > -1 && addRulesIds[index] === target) {
                      target++;
                    }
                  }
                }
              }
              /*  */
              return target;
            }
          }
        }
      }
    }
  }
};