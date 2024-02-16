// Import data from JSON file
import data from "./tana.json";

// Convert the imported data to a string
const str = JSON.stringify(data);

// Define a regular expression to match URLs
const regex = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.#]+\.[\w/\-?=%.#]+/g;

// Find all URLs in the stringified data
const matches = str.match(regex);

// Remove duplicate URLs
const dedupe = Array.from(new Set(matches));

// Define a regular expression to match unwanted URL parameters
const paramRegex =
  /s|ck_subscriber_id|utm_source|utm_medium|utm_campaign|fbclid|ref|src/;

// Normalize the URLs
const normalized = Array.from(
  new Set(
    dedupe
      // Filter out invalid URLs and non-http(s) URLs
      .filter((url) => {
        try {
          new URL(url);
          return /^https?/.test(url);
        } catch (error) {
          return false;
        }
      })
      // Filter out URLs from certain domains
      .filter(
        (url) =>
          !/firebasestorage|camo.githubusercontent|zoom.us|googleusercontent/.test(
            url
          )
      )
      // Replace 'twitter.com' with 'x.com'
      .map((url) => url.replace("twitter.com", "x.com"))
      // Replace 'youtube.com' with 'youtu.be' and remove 'watch?v='
      .map((url) =>
        url.replace("youtube.com", "youtu.be").replace("watch?v=", "")
      )
      // Filter out YouTube live and shorts URLs
      .filter((url) => !/https:\/\/youtu.be\/(live|shorts)/.test(url))
      // Trim whitespace from the start and end of the URLs
      .map((url) => url.trim())
      // Remove trailing periods from the URLs
      .map((url) => url.replace(/\.$/g, ""))
      // Remove trailing slashes from the URLs
      .map((url) => url.replace(/\/+$/g, ""))
      // Decode URL-encoded characters
      .map((url) => decodeURIComponent(url))
      // Remove unwanted URL parameters
      .map((url) => {
        const urlObj = new URL(url);
        urlObj.searchParams.forEach((value, param) => {
          if (paramRegex.test(param)) {
            urlObj.searchParams.delete(param);
          }
        });
        // Convert the URL object back to a string and remove any trailing slashes
        return urlObj.toString().replace(/\/+$/g, "");
      })
  )
);

// Write the normalized URLs to a file, sorted in ascending order
Bun.write("urls.txt", normalized.sort().join("\n"));
