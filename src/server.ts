import express, { Express } from "express";
import bodyParser from "body-parser";
import {
  filterImageFromURL,
  deleteLocalFile,
  stringIsAValidUrl,
} from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // What is done:
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query;
    if (typeof image_url !== "string") {
      return res
        .status(400)
        .send({ message: "Query param 'image_url' has to be of type string." });
    }
    if (!req.query.image_url) {
      return res
        .status(400)
        .send({ message: "image_url query parameter is missing." });
    }
    if (!stringIsAValidUrl(image_url)) {
      return res.status(400).send({ message: "URL is invalid." });
    }
    filterImageFromURL(image_url)
      .then((processedImgPath) =>
        res.sendFile(processedImgPath, () => deleteLocalFile(processedImgPath))
      )
      .catch((error) =>
        res.status(422).send({ message: error.message, stack: error.stack })
      );
  });
  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
