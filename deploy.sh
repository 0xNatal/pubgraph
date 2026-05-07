#!/bin/bash
# Deploy the built site to the gh-pages branch of this repo.
# Requires SSH key access to github.com:0xNatal/pubgraph.git.

set -e

rm -rf dist
mkdir dist
npm run build

(
  cd dist
  git init
  git checkout -b gh-pages
  git add .
  git commit -m "Deployed to GitHub Pages"
  git push --force git@github.com:0xNatal/pubgraph.git gh-pages:gh-pages
)
