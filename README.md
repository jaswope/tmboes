# TMBO Enhancement Suite

> Chrome extensions with useful tweaks and utilities for browsing TMBO

Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/tmbo-enhancement-suite/jmmfkicbkkndiamonmkcbgblehlioeod)

## Features

 * Right click and select "Share to TMBO" for any image on the web
 * Improved upload interface with built in resizing and resampling
 * Show which comments where added while tab wasn't not visible
 * Summarize votes on comment pages
 * Link previews for images and other topics in comments
 * Night mode for the image stream

## Building

Install node and npm, and then run `npm install` in the source directory. 

Build the project using `grunt default`. This task creates a minified version of the extension in `build/`. It is
 recommended to test against that version before committing or submitting a pull request.