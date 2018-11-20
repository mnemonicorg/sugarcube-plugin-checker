import {size, find, map, set, isEmpty} from "lodash/fp";
import moment from "moment";
// import {envelope as env} from "@sugarcube/core";

const plugin = (envelope, {log}) => {
  log.info(
    `Expanding the date queries ${size(envelope.queries)} queries.` // eslint-disable-line
  );

  console.log("wheeeee");
  console.log(envelope.queries);

  const q = find(i => i.type === "expand_date_query")(envelope.queries);
  console.log(q);
  if (!q) return envelope;

  const start = moment(q.term.start);
  const end = moment(q.term.end);
  const timeValues = [];

  console.log(start);
  console.log(end);

  while (end > start) {
    timeValues.push(moment(start));
    console.log(start);
    start.add(5, "days");
    console.log(start);
  }

  console.log(timeValues);
  if (isEmpty(timeValues)) return envelope;

  const dateQuery = (s, e) => ({
    type: "mongodb_query_units",
    term: {
      "_sc_pubdates.source": {
        // for some reason this works lol mongodb:
        $gte: new Date(s.format("YYYY-MM-DD")),
        $lt: new Date(e.format("YYYY-MM-DD")),
      },
    },
  });

  let lastD = timeValues[0];
  const qs = map(d => {
    const dq = dateQuery(lastD, d);
    lastD = d;
    return dq;
  })(timeValues);

  console.log(qs);

  return set("queries", qs, envelope);
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
