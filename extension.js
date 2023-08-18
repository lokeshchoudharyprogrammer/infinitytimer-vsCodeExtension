const vscode = require('vscode');
const player = require('play-sound')({ player: 'afplay' }); // Change 'afplay' to your preferred audio player
const path = require('path');

let alarmInterval;
let alarmTime;
let alarmIntervalId;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register the "Set Alarm" command
  let disposableSetAlarm = vscode.commands.registerCommand('alarmclock.setAlarm', () => {
    vscode.window.showInputBox({ prompt: 'Enter alarm time (HH:MM AM/PM)' }).then((time) => {
      if (time) {
        setAlarm(time);
      }
    });
  });

  context.subscriptions.push(disposableSetAlarm);
}

function setAlarm(timeString) {
  if (alarmInterval) {
    clearInterval(alarmIntervalId);
  }

  alarmTime = parseTime(timeString);

  if (alarmTime) {
    alarmInterval = true;
    alarmIntervalId = setInterval(checkAlarm, 1000);
    vscode.window.showInformationMessage(`Alarm set for ${formatTime(alarmTime)}.`);
  } else {
    vscode.window.showErrorMessage('Invalid time format. Please use HH:MM AM/PM.');
  }
}

function parseTime(timeString) {
  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
  const matches = timeString.match(timePattern);

  if (matches) {
    let hours = parseInt(matches[1]);
    let minutes = parseInt(matches[2]);
    const meridiem = matches[3] ? matches[3].toLowerCase() : 'am';

    if (meridiem === 'pm' && hours !== 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }

    return new Date(0, 0, 0, hours, minutes);
  }

  return null;
}

function checkAlarm() {
  const now = new Date();
  if (alarmTime && now.getHours() === alarmTime.getHours() && now.getMinutes() === alarmTime.getMinutes()) {
    clearInterval(alarmIntervalId);
    vscode.window.showInformationMessage('Time to wake up! Alarm is ringing.');

    // Play the sound when the alarm time is reached
    const soundPath = path.join(__dirname, './BestAlarm.mp3'); // Change this to the path of your audio file
    player.play(soundPath, (err) => {
      if (err) {
        console.error('Error playing sound:', err);
      }
    });
  }
}

function formatTime(time) {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${meridiem}`;
}

function deactivate() {
  if (alarmInterval) {
    clearInterval(alarmIntervalId);
  }
}

module.exports = {
  activate,
  deactivate
};
