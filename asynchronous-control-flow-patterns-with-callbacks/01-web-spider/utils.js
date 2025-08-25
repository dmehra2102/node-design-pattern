import slug from "slug";
import { mkdirp } from "mkdirp";
import { extname, join } from "node:path";
import { constants, access } from "node:fs";

export function exists(filePath, cb) {
  access(filePath, constants.F_OK, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        // the file does not exist
        return cb(null, false);
      }
      // unexpected error checking the file
      return cb(err);
    }

    // file exists
    return cb(null, true);
  });
}

export function urlToFilename(url) {
  const parsedUrl = new URL(url);
  const urlComponents = parsedUrl.pathname.split("/");
  const originalFileName = urlComponents.pop();
  const urlPath = urlComponents
    .filter((component) => component != "")
    .map((component) => slug(component, { remove: null }))
    .join("/");

  const basePath = join(parsedUrl.hostname, urlPath);
  const missingExtension =
    !originalFileName || extname(originalFileName) === "";

  if (missingExtension) {
    return join(basePath, originalFileName, "index.html");
  }

  return join(basePath, originalFileName);
}

export function get(url, cb) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      // NOTE: this loads all the content in memory and therefore is not suitable
      // to handle large payloads.
      // For large payloads, we would need to use a stream-based approach
      return response.arrayBuffer();
    })
    .then((content) => cb(null, Buffer.from(content)))
    .catch((err) => cb(err));
}

export function recursiveMkdir(path, cb) {
  mkdirp(path)
    .then(() => cb(null))
    .catch((e) => cb(e));
}
