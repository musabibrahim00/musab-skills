#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import https from "https";

const args = process.argv.slice(2);

function log(msg) {
  console.log(msg);
}

function error(msg) {
  console.error("Error:", msg);
  process.exit(1);
}

function parseArgs(args) {
  const command = args[0];
  const repo = args[1];

  let skill = null;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--skill") {
      skill = args[i + 1];
      i++;
    }
  }

  return { command, repo, skill };
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(`Failed to fetch file (${res.statusCode})`);
        return;
      }

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    }).on("error", reject);
  });
}

async function installSkill(repo, skill) {
  if (!repo) error("Missing repo. Example: musab-skills add owner/repo --skill skill-name");
  if (!skill) error("Missing --skill <skill-name>");

  const url = `https://raw.githubusercontent.com/${repo}/main/skills/${skill}/SKILL.md`;

  log(`Downloading ${skill} from ${repo}...`);

  const content = await download(url);

  const targetDir = path.join(os.homedir(), ".claude", "skills", skill);
  const targetFile = path.join(targetDir, "SKILL.md");

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, content, "utf8");

  log(`Installed ${skill} → ${targetFile}`);
}

async function main() {
  const { command, repo, skill } = parseArgs(args);

  if (command !== "add") {
    error("Only 'add' command is supported.\nExample: musab-skills add owner/repo --skill skill-name");
  }

  try {
    await installSkill(repo, skill);
  } catch (err) {
    error(err);
  }
}

main();
