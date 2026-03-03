import { defineMovieModel } from './MovieManager.js';
import { defineUserModel } from './User.js';

const models = {
  Movie: defineMovieModel,
  User: defineUserModel,
};

const handler = {
  get(obj, prop) {
    if (prop in obj) return obj[prop];

    const pascalize = (string) =>
      string.slice(0, 1).toUpperCase() + string.slice(1);

    throw new ReferenceError(
      `models.${prop} is not defined. Did you create ${pascalize(
        prop
      )}.js and did you register it in models/index.js?`
    );
  },
};

export default new Proxy(models, handler);
