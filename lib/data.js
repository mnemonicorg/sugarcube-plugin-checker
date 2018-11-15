import {curry, merge, set, concat} from "lodash/fp";

const blank = {
  _sc_checker: {
    checks: [],
    online: undefined,
    last_online: undefined,
    last_change: undefined,
    last_check: undefined,
  },
};

const updateChecker = (check, oldChecker) => ({
  checks: concat(oldChecker.checks, [check]),
  online: check.online,
  last_online: check.online === true ? check.date : oldChecker.last_online,
  last_change:
    check.online !== oldChecker.online ? check.date : oldChecker.last_change,
  last_check: check.date,
});

export const updateU = curry(async (checkFunk, unit) => {
  const u = merge(blank, unit);

  const online = await checkFunk(unit);
  const date = Date.now();

  const check = {date, online};

  const newU = set("_sc_checker", updateChecker(check, u._sc_checker), u);
  console.log(newU);
  return newU;
});

export default {
  updateU,
};
