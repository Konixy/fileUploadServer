import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import cors from "cors";
import config from "./config";

const app = express();

app.use(cors());

app.use(
  fileUpload({
    limits: {
      fileSize: 10000000,
    },
    abortOnLimit: true,
  })
);

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/public/index.html`);
});

app.post("/upload", (req, res) => {
  const files = req.files;

  if (!files || !files.file)
    return res.send({ success: false, message: "no files provided" });

  const file = files.file as UploadedFile;

  if (!file.mimetype.match(/^(image|application\/octet-stream)/)) {
    return res.send({
      success: false,
      message: "this type of file is not allowed",
    });
  }
  const newFileName = file.name.replace(/\s/g, "_");
  file.mv(`${__dirname}/${config.saveDir}/${newFileName}`).then(
    () => {
      return res.send({
        success: true,
        url: `/${config.saveDir}/${newFileName}`,
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
