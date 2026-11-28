const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const trigger of document.querySelectorAll('[data-project]')) {
  const dialog = document.getElementById('case-' + trigger.dataset.project);
  const closeButton = dialog.querySelector('.dismiss');
  let closing = false;

  trigger.addEventListener('click', () => {
    dialog.showModal();
    dialog.scrollTop = 0;
  });

  async function dismiss() {
    if (closing) return;
    closing = true;
    dialog.classList.add('closing');
    if (!reducedMotion.matches) {
      await Promise.allSettled(dialog.getAnimations().map(animation => animation.finished));
    }
    dialog.close();
    dialog.classList.remove('closing');
    trigger.focus({preventScroll: true});
    closing = false;
  }

  closeButton.addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dismiss();
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom)) dismiss();
  });
}
