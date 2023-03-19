import Joi from "joi";

export const votedSongSchema = Joi.object({
  title: Joi.string().required(),
  thumbnails: Joi.object().keys({
    url: Joi.string().required(),
    height: Joi.string().required(),
    width: Joi.string().required(),
  }),
  channelTitle: Joi.string().required(),
  publishedAt: Joi.string().required(),
});
