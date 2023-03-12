import * as cors from "cors";

const whitelist = [process.env.LOCAL_CLIENT_URL, process.env.CLIENT_URL];

const corsOptionsDelegate = (req: any, callback: any) => {
  let corsOptions;

  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

const corsHandler = cors(corsOptionsDelegate);

export default corsHandler;
