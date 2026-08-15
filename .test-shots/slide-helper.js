// vben playground 滑块验证码辅助函数：粘贴到浏览器 console 使用
// 用法：拖动到终点并等待验证通过 => await vbenSlide()
// 原理：组件监听 handle 的 mousedown + wrapper 的 mousemove/mouseup（见 slider-captcha/index.vue）
window.vbenSlide = async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const handle = document.querySelector('[name=captcha-action]');
  const wrapper = handle.closest('[name=captcha]');
  const hr = handle.getBoundingClientRect();
  const wr = wrapper.getBoundingClientRect();
  const sx = hr.x + hr.width / 2;
  const sy = hr.y + hr.height / 2;
  const ex = wr.x + wr.width - hr.width / 2 - 3;
  const fire = (el, type, x) =>
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true, cancelable: true, composed: true,
        clientX: x, clientY: sy, screenX: x, screenY: sy,
        button: 0, buttons: 1,
        view: window,
      }),
    );
  // pageX 由浏览器根据 clientX + scroll 自动计算（无滚动时相等），MouseEvent 只读 getter 会处理
  fire(handle, 'mousedown', sx);
  for (let i = 1; i <= 10; i++) {
    fire(wrapper, 'mousemove', sx + ((ex - sx) * i) / 10);
    await sleep(30);
  }
  fire(wrapper, 'mouseup', ex);
  await sleep(500);
  return wrapper.innerText.includes('验证通过') ? 'PASS' : 'FAIL:' + wrapper.innerText.slice(0, 12);
};
