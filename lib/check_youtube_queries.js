import {size, get, map} from "lodash/fp";
import {collect} from "dashp";
import {envelope as env} from "@sugarcube/core";
import moment from "moment";
import fetch from "node-fetch";
import {channelSearch} from "../node_modules/@sugarcube/plugin-youtube/_dist/api";

import {testingYoutube} from "./testingchannels";

const querySource = "youtube_channel";

const part = [
  // "id",
  "status",
  // "topicDetails",
].join(",");

const getChannel = (key, id) =>
  fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=${part}&id=${id}&key=${key}`
  ).then(res => res.json());

const plugin = (envelope, {log, cfg}) => {
  log.info(`Calling a plugin with ${size(envelope.data)} units.`);
  const key = get("youtube.api_key", cfg);

  let checked = 0; // eslint-disable-line
  let removed = 0; // eslint-disable-line

  const f = async q => {
    console.log("----");
    console.log(q);
    checked += 1;
    const pl = await getChannel(key, q); // channelSearch(key, range, q);
    const channel = get("items.0", pl);
    console.log(channel);
    if (!channel) removed += 1;
    return q;
  };

  const checkChannels = () => {
    console.log("checking channels");
    console.log(envelope.queries);
    return collect(f, map("term", envelope.queries));
    // return env.flatMapQueriesAsync(f, querySource, envelope);
  };

  return checkChannels().then(r => {
    console.log(size(r));
    log.info(`Checked ${size(checked)} queries - ${size(removed)} removed.`);
    return r;
  });
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
