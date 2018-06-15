const getPkgname = () => {
  if (/@/.test(location.href)) {
    return `@${location.href.match(/(?:[\w-/]+){1}$/)[0]}`;
  }

  return location.href.match(/[^/][\w-]+$/)[0];
}

const registKeybind = keydownCallback => {
  let keydown = false;

  document.addEventListener('keydown', ev => {
    if (keydown) {
      return;
    }

    keydownCallback(ev.key.toUpperCase());
    keydown = true;
  });

  document.addEventListener('keyup', ev => {
    keydown = false;
  });
};

let _pkgname = '';

const run = () => {
  if (document.getElementById('readme') === null) {
    return;
  }

  const pkgname = getPkgname();
  for (const span of Array.from(document.querySelectorAll('span'))) {
    if (span.innerText === `npm i ${pkgname}` || /^yarn\sadd(?:-D)?\s.+$/.test(span.innerText)) {
      _pkgname = pkgname;
      span.innerText = `yarn add ${pkgname}`;
      registKeybind(
        flag => {
          if (/D|P|O/.test(flag)) {
            span.innerText = `yarn add -${flag} ${pkgname}`;
          } else if (flag === 'S') {
            span.innerText = `yarn add ${pkgname}`;
          }
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

      const mo = new MutationObserver(mutations => {
        mutationLoop: for (const mutation of mutations) {
          // pkgページからpkgページ
          if (mutation.target.id === 'readme') {
            setTimeout(run, 1000);
            break;
          }

          // 検索リストからpkgページ
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.id === 'top' || node.id === 'readme') {
              run();
              break mutationLoop;
            }
          }
        }
      })

      mo.observe(
        document.getElementById('app'),
        {
          attributes: false,
          characterData: false,
          childList: true,
          subtree: true
        }
      );
    }
  }, 10);
});
