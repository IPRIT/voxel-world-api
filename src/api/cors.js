import cors from 'cors';
import { config } from "../../config";

let corsOptions = {
  origin: config.cors.origins.join(' '),
  methods: config.cors.methods,
  allowedHeaders: config.cors.headers
};

export default cors( corsOptions );