let events = []; // 事件数组
let stopFn; // 停止录制方法
let stopEl = null; // 停止按钮元素
let inputEl = null; // 读取 JSON 文件表单元素
let replayer = null; // 播放器对象
let playerLayer = null; // 播放器外部容器

/**
 * 播放
 * 创建播放器容器和实例
 */
function replay(eventData) {
  if (!playerLayer) {
    playerLayer = document.createElement('div');
    playerLayer.className = 'witness-player-layer';
    playerLayer.innerHTML = `
      <div class="witness-player-root"></div>
      <div class="witness-player-close-btn">
        <svg t="1594951950399" class="witness-player-close-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2553" width="128" height="128"><path d="M556.8 512L832 236.8c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0L512 467.2l-275.2-277.333333c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8l275.2 277.333333-277.333333 275.2c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333L512 556.8 787.2 832c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333c12.8-12.8 12.8-32 0-44.8L556.8 512z" p-id="2554"></path></svg>
      </div>
    `;
    document.body.appendChild(playerLayer);
    let closeBtn = document.querySelector('.witness-player-close-btn');
    closeBtn.addEventListener('click', () => {
      replayer.pause();
      playerLayer.style.display = 'none';
      replayer = null;
    });
  }
  playerLayer.style.display = 'block';
  const playerRoot = document.querySelector('.witness-player-root');
  playerRoot.innerHTML = '';
  replayer = new rrweb.Replayer(eventData, {
    root: playerRoot,
  });
  replayer.play();
}

/**
 * 监听 ContextMenu 点击事件分发的消息，根据类型做出记录与回放操作
 */
chrome.extension.onMessage.addListener(function (request) {
  switch (request.action) {
    case 'record':
      if (stopFn) {
        alert('当前存在录制中的进程');
        return;
      }
      stopFn = rrweb.record({
        emit(event) {
          events.push(event);
        },
      });
      if (!stopEl) {
        stopEl = document.createElement('div');
        stopEl.innerText = '停止录制';
        stopEl.className = 'witness-stop-el';
        document.body.appendChild(stopEl);
      }
      stopEl.style.display = 'block';
      stopEl.addEventListener('click', () => {
        stopFn();
        stopEl.style.display = 'none';
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
