import hanzi from 'hanzi';
import { debounce } from './modules/debounce';
import { findTextNode, isChildOf } from './modules/dom';
import { Popup } from './modules/Popup';
import { Selection } from './modules/Selection';
import { Voice } from './modules/Voice';

const _voice = new Voice();
const _popup = new Popup(_voice);
const _selection = new Selection();

const debouncedMousemove = debounce(mousemove, 85);
async function mousemove(event) {
  if (
    isChildOf(event.target, _popup.popup) ||
    isChildOf(event.target, _selection.highlight)
  ) {
    return;
  }

  const node = findTextNode(event.target);
  if (!node) return destroy();

  const selection = _selection.create(event);
  if (!selection) return destroy();

  const character = node.textContent[selection.start];
  if (!character || !hanzi.ifComponentExists(character)) return destroy();

  const box = selection.getBox();
  const popup = await _popup.create({
    x: box.x + box.width,
    y: box.y,
    width: box.width,
    height: box.height,
  });

  popup.setCharacter(character);
}

async function init() {
  hanzi.start();

  const voice = _voice.create();
  if (!voice) return destroy();

  document.addEventListener('mousemove', debouncedMousemove, false);

  console.info('铬汉字。');
}

function destroy() {
  _selection && _selection.destroy();
  _popup && _popup.destroy();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'enable') {
    init();
    return true;
  } else if (message.type === 'disable') {
    destroy();
    return true;
  }

  return false;
});
