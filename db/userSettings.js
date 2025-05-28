const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, 'userSettings.json');

function loadSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) return {};
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function getUserSettings(userId) {
  const settings = loadSettings();
  return settings[userId] || {};
}

function saveUserSetting(userId, key, value) {
  const settings = loadSettings();
  if (!settings[userId]) settings[userId] = {};
  settings[userId][key] = value;
  saveSettings(settings);
}

module.exports = { getUserSettings, saveUserSetting };