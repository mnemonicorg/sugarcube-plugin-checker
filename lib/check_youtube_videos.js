import {
  size,
  concat,
  get,
  map,
  compact,
  chunk,
  flatten,
  without,
  flow,
} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";
import {collect} from "dashp";
import {videosList} from "../node_modules/@sugarcube/plugin-youtube/_dist/api";

// import {testingBulk, testingYoutube} from "./testunits";
import {updateU} from "./data";

// sheets import must be included, because some of the data had the sheets become the source
const sourceType = ["youtube_channel", "youtube_video", "sheets_import"];

const plugin = (envelope, {log, cfg}) => {
  const key = get("youtube.api_key", cfg);
  log.info(
    `Checking youtube videos from sources ${sourceType} in ${size(envelope.data)} units.` // eslint-disable-line
  );

  // counts and other variables to update as we progress
  let countRemoved = 0; // eslint-disable-line
  let removed = [];
  let checked = 0; // eslint-disable-line

  // a function to get the youtube id from any SC unit
  const unitId = unit => {
    const source = unit._sc_source;
    const id = get("id", unit);
    if (!id) return undefined;
    if (!sourceType.includes(source)) return undefined;
    return id;
  };

  // given units, get the youtube ids
  const youtubeIds = flow([map(unitId), compact]); // compact(map(unitId, units))

  const checkUnits = async units => {
    // get out just the ids of youtube videos
    const uids = youtubeIds(units);
    // this is the amount we will check
    checked += size(uids);
    // get the date of the check
    const date = Date.now();
    // call the youtube api to see which videos we will find online
    // collect the chunked version, as the sugarcube youtube api doesn't enforce limit
    // but youtube api is capped at 50 per call
    const found = await collect(videosList(key), chunk(100, uids)).then(flatten);
    const foundids = compact(map("id", found));
    // count removed videos
    countRemoved += size(uids) - size(foundids);
    removed = concat(removed, without(foundids, uids));
    // return the unit with updated check data
    return map(u => {
      const check = {
        date,
        online: foundids.includes(u.id),
      };
      return updateU(check, u);
    }, units);
  };

  // get just the data part of the envelope
  // for testing, uncomment the lines after
  const {data} = envelope;
  // const data = testingYoutube
  // const data = testingBulk

  return checkUnits(data) // check the units in the envelope for youtube videos
    .then(r => {
      log.info(
        `Checked ${checked} of ${size(data)} - ${countRemoved} units removed.` // eslint-disable-line
      );
      const newEnv = env.concatDataLeft(r, envelope); // make a new env with new check data
      return newEnv;
    });
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
