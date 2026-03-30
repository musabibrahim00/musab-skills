#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import https from "https";

const args = process.argv.slice(2);

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
        reject("Failed to fetch skill");
        return;
      }

      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
  });
}

async function install(repo, skill) {
  if (!repo || !skill) {
    console.error("Usage: musab-skills add <repo> --skill <name>");
    process.exit(1);
  }

  const url = `https://raw.githubusercontent.com/${repo}/main/skills/${skill}/SKILL.md`;

  const content = await download(url);

  const targetDir = path.join(os.homedir(), ".claude", "skills", skill);
  fs.mkdirSync(targetDir, { recursive: true });

  const targetFile = path.join(targetDir, "SKILL.md");
  fs.writeFileSync(targetFile, content);

  console.log(`Installed ${skill}`);
}

async function main() {
  const { command, repo, skill } = parseArgs(args);

  if (command === "add") {
    await install(repo, skill);
  } else {
    console.log("Only 'add' supported");
  }
}

main();
