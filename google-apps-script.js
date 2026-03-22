/**
 * Imaginal Agility — Pilot Signup Google Apps Script
 *
 * Setup:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. Click Deploy > New deployment
 * 4. Select "Web app"
 * 5. Set "Execute as" → Me
 * 6. Set "Who has access" → Anyone
 * 7. Click Deploy and copy the URL
 */

const SHEET_NAME = 'Pilot Signups';
const TAB_NAME = 'Responses';

function getOrCreateSheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  // If run standalone (not bound to a sheet), create one
  if (!ss) {
    const files = DriveApp.getFilesByName(SHEET_NAME);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(SHEET_NAME);
    }
  }

  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Full Name',
      'Email Address',
      'Organisation/Company',
      'Role/Title',
      'Country',
      'Pilot Type',
      'What Draws You',
      'Video Standout'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    ensureHeaders(sheet);

    sheet.appendRow([
      new Date(),
      data.fullName || '',
      data.email || '',
      data.organisation || '',
      data.role || '',
      data.country || '',
      data.pilotType || '',
      data.whatDraws || '',
      data.videoStandout || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Pilot Signup script is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
