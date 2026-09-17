/* Decorative rolling display of the owner-confirmed total, not a live funding feed. */
(() => {
  const metric = document.querySelector('[data-funded-volume]');
  if (!metric) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  const digits = [...metric.querySelectorAll('.funded-digit')];
  const finalDigits = digits.map(digit => digit.textContent.trim());
  let visible = false;
  const stop = () => {
    animations.splice(0).forEach(animation => animation.cancel());
    digits.forEach((digit, index) => { digit.textContent = finalDigits[index]; });
  };
  const update = () => {
    if (motion.matches) { stop(); return; }
    if (!animations.length && visible) {
      digits.forEach((digit, index) => {
        if (typeof digit.animate !== 'function') return;
        const final = Number(finalDigits[index]);
        const steps = 10 * (index + 1);
        const strip = document.createElement('span');
        strip.className = 'funded-strip';
        for (let i = 0; i <= steps; i++) {
          const number = document.createElement('span');
          number.textContent = String((final + i) % 10);
          strip.append(number);
        }
        digit.replaceChildren(strip);
        animations.push(strip.animate([
          { transform: 'translateY(0)', offset: 0 },
          { transform: `translateY(-${steps}em)`, offset: .88 },
          { transform: `translateY(-${steps}em)`, offset: 1 }
        ], { duration: 4800, easing: 'cubic-bezier(.25,.5,.25,1)', iterations: Infinity }));
      });
    }
    animations.forEach(animation => visible && !document.hidden ? animation.play() : animation.pause());
  };
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  }, { threshold: .5 }).observe(metric);
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
