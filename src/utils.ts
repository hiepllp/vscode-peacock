// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Settings, ColorSettings, builtInColors } from './enums';

export async function changeColorSetting(
  backgroundHex: string,
  foregroundHex: string
) {
  const colorCustomizations = await vscode.workspace
    .getConfiguration()
    .get('workbench.colorCustomizations');

  let newSettings = {
    titleBarSettings: {},
    activityBarSettings: {},
    statusBarSettings: {}
  };

  if (await isSelected('titleBar')) {
    newSettings.titleBarSettings = {
      [ColorSettings.titleBar_activeBackground]: backgroundHex,
      [ColorSettings.titleBar_activeForeground]: foregroundHex,
      [ColorSettings.titleBar_inactiveBackground]: backgroundHex,
      [ColorSettings.titleBar_inactiveForeground]: foregroundHex
    };
  }

  if (await isSelected('activityBar')) {
    newSettings.activityBarSettings = {
      [ColorSettings.activityBar_background]: backgroundHex,
      [ColorSettings.activityBar_foreground]: foregroundHex,
      [ColorSettings.activityBar_inactiveForeground]: foregroundHex
    };
  }

  if (await isSelected('statusBar')) {
    newSettings.statusBarSettings = {
      [ColorSettings.statusBar_background]: backgroundHex,
      [ColorSettings.statusBar_foreground]: foregroundHex
    };
  }

  // Merge all color settings
  const newColorCustomizations = {
    ...colorCustomizations,
    ...newSettings.activityBarSettings,
    ...newSettings.titleBarSettings,
    ...newSettings.statusBarSettings
  };

  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorCustomizations', newColorCustomizations, false);
}

export async function resetColorSettings() {
  // Domain of all color settings we affect
  const colorCustomizations = await vscode.workspace
    .getConfiguration()
    .get('workbench.colorCustomizations');

  const newColorCustomizations: any = {
    ...colorCustomizations
  };
  Object.values(ColorSettings).forEach(setting => {
    delete newColorCustomizations[setting];
  });

  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorCustomizations', newColorCustomizations, false);
}

export async function promptForHexColor() {
  const options: vscode.InputBoxOptions = {
    ignoreFocusOut: true,
    placeHolder: builtInColors.vue,
    prompt: 'Enter a background color for the title bar in RGB hex format',
    value: builtInColors.vue // default to Vue green
    // placeHolder: localize("cmd.otherOptions.preserve.placeholder"),
    // prompt: localize("cmd.otherOptions.preserve.prompt")
  };
  const input = await vscode.window.showInputBox(options);
  const hexInput = formatHex(input);
  return hexInput;
}

export function invertColor(hex: string) {
  // credit: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error(`Invalid HEX color ${hex}`);
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // credit: http://stackoverflow.com/a/3943023/112731
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '000000' : 'FFFFFF';
}

export function isValidHexColor(input: string) {
  return /^#[0-9A-F]{6}$/i.test(input);
}

export function formatHex(input: string = '') {
  return input.substr(0, 1) === '#' ? input : `#${input}`;
}

export function generateRandomHexColor() {
  // credit: https://www.paulirish.com/2009/random-hex-color-code-snippets/
  const hex = (
    '000000' + Math.floor(Math.random() * 16777215).toString(16)
  ).slice(-6);
  return '#' + hex;
}

export async function isSelected(setting: string) {
  // grab the settings array from their settings.json file
  const peacockAffectedSettings: string[] = await vscode.workspace
    .getConfiguration('peacock')
    .get(Settings.affectedSettings, []);

  // check if they requested a setting
  const itExists: boolean = !!(
    peacockAffectedSettings && peacockAffectedSettings.includes(setting)
  );

  return itExists;
}
