/* ==========================================================
   CONTACT.JS
   Purpose: Validate the contact form, then hand the message
   off to the visitor's own email app via a mailto: link
   addressed to kd0960336@gmail.com.

   IMPORTANT — how this actually works:
   This is a static site with no backend, so there is no way
   to silently send an email from JavaScript alone. On submit,
   this script builds a mailto: link from the form fields and
   opens it, which launches the VISITOR's default email app
   (Mail, Outlook, Gmail app, etc.) with a message pre-filled
   and addressed to your inbox — they still press send in their
   own mail app. If a visitor has no email client configured,
   nothing will open, which is why the raw address is also
   shown as a clickable mailto: link above the form.

   To get a true "silent" submit (no email app required) later,
   this would need either a backend endpoint (e.g. a small PHP
   mail script, since you already work with PHP) or a
   third-party form service like EmailJS or Formspree — both
   need an account/API key that isn't something I can set up
   on your behalf. Ask me when you're ready and I can wire
   either one in.
   ========================================================== */

const CONTACT_EMAIL = 'kd0960336@gmail.com';

window.KD = window.KD || {};

KD.initContact = function initContact() {
  const form = document.getElementById('contactForm');

  if (!form) {
    return;
  }

  const status = document.getElementById('contactStatus');
  const fields = {
    name: { input: form.elements.name, error: document.getElementById('contactNameError') },
    email: { input: form.elements.email, error: document.getElementById('contactEmailError') },
    message: { input: form.elements.message, error: document.getElementById('contactMessageError') }
  };

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(field, message) {
    fields[field].input.classList.toggle('has-error', Boolean(message));
    fields[field].error.textContent = message || '';
  }

  function validate() {
    let valid = true;

    const name = fields.name.input.value.trim();
    const email = fields.email.input.value.trim();
    const message = fields.message.input.value.trim();

    if (!name) {
      setError('name', 'Please enter your name.');
      valid = false;
    } else {
      setError('name', '');
    }

    if (!email || !isValidEmail(email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    } else {
      setError('email', '');
    }

    if (!message) {
      setError('message', 'Please enter a message.');
      valid = false;
    } else {
      setError('message', '');
    }

    return valid;
  }

  // Clear a field's error as soon as the visitor fixes it
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('input', function () {
      if (fields[key].input.classList.contains('has-error')) {
        validate();
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validate()) {
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    const name = fields.name.input.value.trim();
    const email = fields.email.input.value.trim();
    const message = fields.message.input.value.trim();

    const subject = encodeURIComponent('New project inquiry from ' + name);
    const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    const mailtoLink = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;

    status.textContent = 'Opening your email app, addressed to ' + CONTACT_EMAIL + '…';
    window.location.href = mailtoLink;
  });
};
