import {size, get, isEmpty} from "lodash/fp";
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

  const checkId = id =>
    videosList(key, id).then(r => {
      if (isEmpty(r)) {
        return false;
      }
      return true;
    });

  const checkUnit = unit => {
    const id = get("id", unit);
    if (!id) return false;
    return checkId(id);
  };

  const updateYoutube = updateU(checkUnit);

  // return env.fmapDataAsync(f, envelope);
  return collect(updateYoutube, testingYoutube).then(() => envelope);
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
