import cyv from "./check_youtube_videos";
import cyq from "./check_youtube_queries";
import edq from "./expand_date_query";

export const plugins = {
  check_youtube_videos: cyv,
  check_youtube_queries: cyq,
  expand_date_query: edq,
};

export default {plugins};
