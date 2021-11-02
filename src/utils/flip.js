export const flipGroup = (el, direction = 'vertical') => {
  // Get the first position.
  const first = el.getBoundingClientRect();

  // Now set the element to the last position.
  el.classList.add('totes-at-the-end');

  // Read again. This forces a sync
  // layout, so be careful.
  const last = el.getBoundingClientRect();

  // You can do this for other computed
  // styles as well, if needed. Just be
  // sure to stick to compositor-only
  // props like transform and opacity
  // where possible.
  const invert = first.top - last.top;

  // Invert.
  el.style.transform =
    `translateY(${invert}px)`;

  // Wait for the next frame so we
  // know all the style changes have
  // taken hold.
  requestAnimationFrame(function () {

    // Switch on animations.
    el.classList.add('animate-on-transforms');

    // GO GO GOOOOOO!
    el.style.transform = '';
  });
}
