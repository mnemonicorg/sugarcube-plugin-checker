import {size, get, map, isEmpty, compact, take} from "lodash/fp";
// import {envelope as env} from "@sugarcube/core";
import {collect} from "dashp";
import {videosList} from "../node_modules/@sugarcube/plugin-youtube/_dist/api";

import {testingYoutube} from "./testunits";
import {updateU} from "./data";

const sourceType = ["youtube_channel", "youtube_video"];

const plugin = (envelope, {log, cfg}) => {
  const key = get("youtube.api_key", cfg);
  log.info(
    `Checking youtube videos from sources ${sourceType} in ${size(envelope.data)} units.` // eslint-disable-line
  );

  let countRemoved = 0; // eslint-disable-line
  let checked = 0; // eslint-disable-line

  const checkId = id =>
    videosList(key, id).then(r => {
      checked += 1;
      if (isEmpty(r)) {
        countRemoved += 1;
        return false;
      }
      return true;
    });

  const checkUnit = unit => {
    const id = get("id", unit);
    if (!id) return false;
    return checkId(id);
  };

  const checkUs = collect(async u => {
    const date = Date.now();
    const online = await checkUnit(u);
    const check = {date, online};
    return updateU(check, u);
  });

  // return env.fmapDataAsync(f, envelope);
  return checkUs(envelope.data).then(r => {
    console.log(size(r));
    log.info(
      `Checked ${checked} units - ${countRemoved} units removed.` // eslint-disable-line
    );
    return envelope;
  });
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
