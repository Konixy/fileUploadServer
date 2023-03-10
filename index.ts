import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import cors from "cors";
import config from "./config";
import morgan from "morgan";

const app = express();

app.use(
  cors((req, callback) => {
    let corsOptions = { origin: false };
    const origin = req.header("Origin");
    if (origin && config.allowedOrigins.indexOf(origin) !== -1) {
      corsOptions.origin = true;
    } else {
      corsOptions.origin = false;
    }
    callback(null, corsOptions);
  })
);

app.use(morgan("dev"));

app.use(
  fileUpload({
    limits: {
      fileSize: 10000000,
    },
    abortOnLimit: true,
  })
);

app.use("/uploads", express.static(__dirname + "/uploads"));

app.post("/upload", (req, res) => {
  const files = req.files;
  let location: string | null = null;
  if (
    req.query.location &&
    (req.query.location as string).match(/^(images|files|torrents)$/)
  ) {
    location = req.query.location as string;
  }

  if (!files || !files.file)
    return res.send({ success: false, message: "Veuillez inclure un fichier" });

  const file = files.file as UploadedFile;

  if (
    !file.mimetype.match(
      /^(image|application\/octet-stream|application\/x-bittorrent)/
    )
  ) {
    return res.send({
      success: false,
      message: `Ce type de fichier n'est pas autorisé (${file.mimetype})`,
    });
  }
  const newFileName = ((req.query.name as string) || file.name)
    .replace(/\s/g, "_")
    .replace(/[$&+,:;=?@#|'<>^*()%!]/gi, "");

  const path = `/${config.saveDir}/${location || "files"}/${newFileName}`;
  file.mv(`${__dirname}${path}`).then(
    () => {
      return res.send({
        success: true,
        message: "Fichier enregistré sur le serveur !",
        url: path,
      });
    },
    (e) => {
      console.log(e);
      return res.send({ success: false, message: e.message });
    }
  );
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
