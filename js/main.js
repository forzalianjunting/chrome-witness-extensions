class Replayer {
  static getInstance() {
    if (!Replayer.instance) {
      Replayer.instance = new Replayer();
      return Replayer.instance;
    }
    return Replayer.instance;
  }
  constructor() {
    this.playerLayer = null;
    this.rrreplayer = null;
    this.inputEl = null;
  }
  load() {
    const that = this;
    if (!that.inputEl) {
      that.inputEl = document.createElement('input');
      that.inputEl.type = 'file';
      that.inputEl.accept = 'application/json';
      that.inputEl.className = 'witness-input-el';
      document.body.appendChild(that.inputEl);
      that.inputEl.addEventListener('change', function () {
        const reader = new FileReader();
        const file = this.files[0];
        reader.readAsText(file);
        reader.onload = function () {
          const parseEvents = toJSON(this.result);
          if (!parseEvents) {
            alert('回放文件格式有误');
            return;
          }
          that.replay(parseEvents);
        };
      });
    }
    that.inputEl.value = '';
    that.inputEl.click();
  }
  replay(eventData) {
    const that = this;
    if (!that.playerLayer) {
      that.playerLayer = document.createElement('div');
      that.playerLayer.className = 'witness-player-layer';
      that.playerLayer.innerHTML = `
        <div class="witness-player-root"></div>
        <div class="witness-player-close-btn">
          <svg t="1594951950399" class="witness-player-close-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2553" width="128" height="128"><path d="M556.8 512L832 236.8c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0L512 467.2l-275.2-277.333333c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8l275.2 277.333333-277.333333 275.2c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333L512 556.8 787.2 832c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333c12.8-12.8 12.8-32 0-44.8L556.8 512z" p-id="2554"></path></svg>
        </div>
      `;
      document.body.appendChild(that.playerLayer);
      let closeBtn = document.querySelector('.witness-player-close-btn');
      closeBtn.addEventListener('click', () => {
        that.stop();
      });
    }
    that.playerLayer.style.display = 'block';
    const playerRoot = document.querySelector('.witness-player-root');
    playerRoot.innerHTML = '';
    that.rrreplayer = new rrweb.Replayer(eventData, {
      root: playerRoot,
    });
    that.rrreplayer.play();
  }
  stop() {
    this.rrreplayer.pause();
    this.playerLayer.style.display = 'none';
    this.rrreplayer = null;
  }
}

class Recorder {
  static getInstance() {
    if (!Recorder.instance) {
      Recorder.instance = new Recorder();
      return Recorder.instance;
    }
    return Recorder.instance;
  }
  constructor() {
    this.stopFn = null;
    this.stopEl = null;
    this.events = [];
  }
  record() {
    const that = this;
    if (that.stopFn) {
      alert('当前存在录制中的进程');
      return;
    }
    that.stopFn = rrweb.record({
      emit(event) {
        that.events.push(event);
      },
    });
    if (!that.stopEl) {
      that.stopEl = document.createElement('div');
      that.stopEl.innerText = '停止录制';
      that.stopEl.className = 'witness-stop-el';
      document.body.appendChild(that.stopEl);
      that.stopEl.addEventListener('click', () => {
        that.stop();
      });
    }
    that.stopEl.style.display = 'block';
  }
  stop() {
    this.stopFn();
    this.stopEl.style.display = 'none';
    const content = JSON.stringify(this.events);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'result.json');
    this.events = [];
  }
}

/**
 * 监听 ContextMenu 点击事件分发的消息，根据类型做出记录与回放操作
 */
chrome.extension.onMessage.addListener(function (request) {
  switch (request.action) {
    case 'record':
      const recorder = Recorder.getInstance();
      recorder.record();
      break;
    case 'replay':
      const replayer = Replayer.getInstance();
      replayer.load();
    default:
  }
});
