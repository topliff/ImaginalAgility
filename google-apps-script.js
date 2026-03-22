/**
 * Imaginal Agility — Web Forms Google Apps Script
 *
 * Handles two form types: "pilot" and "contact"
 * Each writes to its own tab in the same spreadsheet.
 *
 * Setup:
 * 1. Rename your Google Sheet to "Imaginal Agility Web Forms"
 * 2. Rename the existing "Responses" tab to "Pilot Signups"
 * 3. Paste this entire file into Code.gs
 * 4. Click Deploy > Manage deployments > Edit > New version > Deploy
 */

function getSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    var files = DriveApp.getFilesByName('Imaginal Agility Web Forms');
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('Imaginal Agility Web Forms');
    }
  }
  return ss;
}

function getOrCreateTab(ss, tabName) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet();
    var formType = data.formType || 'pilot';

    if (formType === 'contact') {
      var sheet = getOrCreateTab(ss, 'Contact Form');
      ensureHeaders(sheet, ['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
      sheet.appendRow([
        new Date(),
        data.name || '',
        data.email || '',
        data.subject || '',
        data.message || ''
      ]);

      // Email notification
      var emailSubject = 'New IA Contact Form: ' + (data.subject || '(no subject)');
      var emailBody = 'Name: ' + (data.name || '') + '\n'
        + 'Email: ' + (data.email || '') + '\n'
        + 'Subject: ' + (data.subject || '') + '\n\n'
        + 'Message:\n' + (data.message || '');
      MailApp.sendEmail('esbin@5x5teams.com', emailSubject, emailBody, { replyTo: data.email || '' });
      MailApp.sendEmail('brad@selfactual.com', emailSubject, emailBody, { replyTo: data.email || '' });
    } else {
      var sheet = getOrCreateTab(ss, 'Pilot Signups');
      ensureHeaders(sheet, [
        'Timestamp', 'Full Name', 'Email Address', 'Organisation/Company',
        'Role/Title', 'Country', 'Pilot Type', 'What Draws You', 'Video Standout'
      ]);
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
    }

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
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Imaginal Agility Web Forms script is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
