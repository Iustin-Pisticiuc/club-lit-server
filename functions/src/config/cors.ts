import * as cors from "cors";

const whitelist = [process.env.LOCAL_CLIENT_URL, process.env.CLIENT_URL];

const corsOptionsDelegate = (req: any, callback: any) => {
  let corsOptions;

  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

const corsHandler = cors(corsOptionsDelegate);

export default corsHandler;
