let events = [];
let stopFn;
let stopEl = null;
let inputEl = null;
let replayer = null;
let playerRoot = null;

function replay(eventData) {
  if (!replayer) {
    let playerLayer = document.createElement('div');
    playerLayer.className = 'witness-player-layer';
    playerLayer.innerHTML = `
      <div class="witness-player-root"></div>
      <div class="witness-player-close-btn">×</div>
    `
    document.body.appendChild(playerLayer);
    playerRoot = document.querySelector('.witness-player-root');
    let closeBtn = document.querySelector('.witness-player-close-btn');
    closeBtn.addEventListener('click', () => {
      replayer.pause();
      document.body.removeChild(playerLayer);
      playerLayer = null;
      replayer = null;
      closeBtn = null;
      playerRoot = null;
    });
  }
  playerRoot.innerHTML = '';
  replayer = new rrweb.Replayer(eventData, {
    root: document.querySelector('.witness-player-root'),
  });
  replayer.play();
}

chrome.extension.onMessage.addListener(function (request) {
  switch (request.action) {
    case 'record':
      if (stopEl) {
        alert('当前存在录制中的进程');
        return;
      }
      stopFn = rrweb.record({
        emit(event) {
          events.push(event);
        },
      });
      stopEl = document.createElement('div');
      stopEl.innerText = '停止录制';
      stopEl.className = 'witness-stop-el';
      document.body.appendChild(stopEl);
      stopEl.addEventListener('click', () => {
        stopFn();
        document.body.removeChild(stopEl);
        stopEl = null;
        const content = JSON.stringify(events);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'result.json');
        events = [];
      });
      break;
    case 'replay':
      if (!inputEl) {
        inputEl = document.createElement('input');
        inputEl.type = 'file';
        inputEl.accept = 'application/json';
        inputEl.className = 'witness-input-el';
        document.body.appendChild(inputEl);
        inputEl.addEventListener('change', function () {
          const reader = new FileReader();
          const file = this.files[0];
          reader.readAsText(file);
          reader.onload = function () {
            const parseEvents = toJSON(this.result);
            if (!parseEvents) {
              alert('回放文件格式有误');
              return;
            }
            replay(parseEvents);
          };
        });
      }
      inputEl.value = '';
      inputEl.click();
    default:
  }
});
