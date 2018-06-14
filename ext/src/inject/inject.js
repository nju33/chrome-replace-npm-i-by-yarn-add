const getPkgname = () => location.href.match(/[^/][\w-]+$/)[0];

const registKeybind = (keydownCallback, keyupCallback) => {
  let keydown = false;

  document.addEventListener('keydown', ev => {
    if (keydown) {
      return;
    }

    keydownCallback(ev.key.toUpperCase());
    keydown = true;
  });

  document.addEventListener('keyup', ev => {
    keyupCallback();
    keydown = false;
  });
};

const run = () => {
  const pkgname = getPkgname();

  for (const span of Array.from(document.querySelectorAll('span'))) {
    if (span.innerText === `npm i ${pkgname}`) {
      span.innerText = `yarn add ${pkgname}`;
      registKeybind(
        flag => {
          span.innerText = `yarn add -${flag} ${pkgname}`;
        },
        () => {
          span.innerText = `yarn add ${pkgname}`;
        }
      );
    }
  }
};

chrome.extension.sendMessage({}, function(response) {
  const readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);
      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      // console.log('Hello. This message was sent from scripts/inject.js');
      // ----------------------------------------------------------
      run();
    }
  }, 10);
});
