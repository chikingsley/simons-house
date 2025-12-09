import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const TRAILING_SLASH_REGEX = /\/$/;
const SLASH_REGEX = /\//g;
const HTML_EXTENSION_REGEX = /\.html$/;

const urls = [
  "https://www.couchsurfing.com/",
  "https://www.couchsurfing.com/about/",
  "https://www.couchsurfing.com/about/about-us/",
  "https://www.couchsurfing.com/about/ambassadors/",
  "https://www.couchsurfing.com/about/faq/",
  "https://www.couchsurfing.com/about/guidelines/",
  "https://www.couchsurfing.com/about/how-it-works/",
  "https://www.couchsurfing.com/about/jobs/",
  "https://www.couchsurfing.com/about/jobs/android.html",
  "https://www.couchsurfing.com/about/jobs/chef.html",
  "https://www.couchsurfing.com/about/jobs/designer.html",
  "https://www.couchsurfing.com/about/jobs/frontend.html",
  "https://www.couchsurfing.com/about/jobs/ios.html",
  "https://www.couchsurfing.com/about/jobs/principal.html",
  "https://www.couchsurfing.com/about/jobs/product_analyst.html",
  "https://www.couchsurfing.com/about/jobs/qa.html",
  "https://www.couchsurfing.com/about/jobs/rails.html",
  "https://www.couchsurfing.com/about/jobs/support.html",
  "https://www.couchsurfing.com/about/jobs/vpp.html",
  "https://www.couchsurfing.com/about/license/",
  "https://www.couchsurfing.com/about/mobile/",
  "https://www.couchsurfing.com/about/policies/",
  "https://www.couchsurfing.com/about/press/",
  "https://www.couchsurfing.com/about/privacy-policy/",
  "https://www.couchsurfing.com/about/resource-center/",
  "https://www.couchsurfing.com/about/safety/",
  "https://www.couchsurfing.com/about/team/",
  "https://www.couchsurfing.com/about/terms-of-use/",
  "https://www.couchsurfing.com/about/thanks/",
  "https://www.couchsurfing.com/about/tips/",
  "https://www.couchsurfing.com/about/trademark/",
  "https://www.couchsurfing.com/about/values/",
  "https://www.couchsurfing.com/m/privacy-policy.html",
  "https://www.couchsurfing.com/m/terms-of-use.html",
];

const outputDir =
  "/Users/chiejimofor/Documents/Github/nešvęsk-vienas-3/downloads/couchsurfing";

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function urlToFilename(url) {
  // Remove protocol and domain
  let filename = url.replace("https://www.couchsurfing.com/", "");
  // Handle root URL
  if (filename === "" || filename === "/") {
    filename = "index";
  }
  // Replace slashes and remove trailing slash
  filename = filename
    .replace(TRAILING_SLASH_REGEX, "")
    .replace(SLASH_REGEX, "-");
  // Remove .html extension if present
  filename = filename.replace(HTML_EXTENSION_REGEX, "");
  // Add .md extension
  return `${filename}.md`;
}

function fetchUrl(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;

  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        Authorization:
          "Bearer jina_8f09152dc0dd4bfb9cb171691793b436Q-_-kMlzgZPQuBoEmEt1UBrOzNPG",
        "X-Engine": "browser",
      },
    };

    https
      .get(jinaUrl, options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function processUrls() {
  for (const url of urls) {
    const filename = urlToFilename(url);
    const filepath = path.join(outputDir, filename);

    console.log(`Fetching: ${url}`);
    console.log(`  -> ${filename}`);

    try {
      const content = await fetchUrl(url);
      fs.writeFileSync(filepath, content);
      console.log("  ✓ Saved");

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

processUrls();
