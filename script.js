const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptElement = document.getElementById('transcript');
const saveBtn = document.getElementById('saveBtn');
const playBtn = document.getElementById('playBtn');
const statusElement = document.getElementById('status');

const googleSpeechApiKey = '%%GOOGLE_SPEECH_API_KEY%%';

let recognition;
let transcript = '';
let synth; 
function displayStatus(message) {
  statusElement.textContent = message;
}

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onerror = (error) => {
    console.error('Speech recognition error:', error);
  };

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
      }
    }
    transcriptElement.textContent = transcript;
  };

  recognition.start();
  displayStatus('Recording...');
});

stopBtn.addEventListener('click', () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  saveBtn.disabled = false;
  playBtn.disabled = transcript.length === 0; 
  recognition.stop();
  displayStatus('');
});

saveBtn.addEventListener('click', () => {
  if (transcript.length === 0) { 
    alert('No transcript to save!');
    return;
  }

 
  const blob = new Blob([transcript], { type: 'text/plain' });


  const filename = `transcription_${Date.now()}.txt`;

 
  const url = window.URL.createObjectURL(blob);

 
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

 
  link.click();


  window.URL.revokeObjectURL(url);
  displayStatus('Transcript saved!');
  setTimeout(() => { displayStatus('') }, 2000); 
});


playBtn.addEventListener('click', () => {
  if (transcript.length === 0) {
      alert('No transcript to play!');
      return;
  }

  if (!synth) {
      synth = window.speechSynthesis || null;
      if (!synth) {
          alert('Text-to-speech not supported by your browser.');
          return;
      }
  }

  function tryPlaying() {
      if (synth.speaking) {
          displayStatus('Speech engine busy. Retrying...');
          setTimeout(tryPlaying, 1000); 
          return;
      }

      const utterance = new SpeechSynthesisUtterance(transcript);
      synth.speak(utterance);
      displayStatus('Playing...');

      utterance.onend = () => {
          displayStatus('');
      }

      utterance.onerror = (error) => {
          displayStatus('Error playing transcript: ' + error.message);
      }
  }

  tryPlaying();
});

