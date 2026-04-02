document.addEventListener('DOMContentLoaded', () => {
  // Utility for email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Toggle password visibility
  function initPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle-btn');
    passwordToggles.forEach(toggle => {
      // Remove existing listeners if any
      toggle.replaceWith(toggle.cloneNode(true));
    });

    const newToggles = document.querySelectorAll('.password-toggle-btn');
    newToggles.forEach(toggle => {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        if (!passwordInput) return;

        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Update eye icon color for active state
        const eyeIcon = this.querySelector('.eye-icon');
        if (eyeIcon) {
          if (type === 'text') {
            eyeIcon.style.color = 'var(--primary-color)';
            eyeIcon.style.stroke = 'var(--primary-color)';
          } else {
            eyeIcon.style.color = 'var(--text-light)';
            eyeIcon.style.stroke = 'currentColor';
          }
        }
      });
    });
  }

  initPasswordToggles();

  // --- LOGIN FORM ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      let isValid = true;

      // Reset
      emailInput.classList.remove('is-invalid');
      passwordInput.classList.remove('is-invalid');
      const loginError = document.getElementById('loginError');
      loginError.style.display = 'none';

      // Validate Email
      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        isValid = false;
      }

      // Validate Password
      if (!passwordInput.value.trim()) {
        passwordInput.classList.add('is-invalid');
        isValid = false;
      }

      if (isValid) {
        try {
          const user = DB.login(emailInput.value, passwordInput.value);
          // Redirect based on role
          if (user.role.toLowerCase() === 'admin') {
            window.location.href = '../admin/dashboard.html';
          } else if (user.role.toLowerCase() === 'retailer') {
            if (user.isFirstTime) {
              window.location.href = '../Retailer module/Retailer-intitial.html';
            } else {
              window.location.href = '../Retailer module/Retialer_Dashboard.html';
            }
          } else if (user.role.toLowerCase() === 'supplier') {
            if (user.isFirstTime) {
              window.location.href = '../supplier module/supplier-initial.html';
            } else {
              window.location.href = '../supplier module/supplier-dashboard.html';
            }
          } else {
            window.location.href = '../customer module/consumer-landingpage.html';
          }
        } catch (error) {
          loginError.textContent = error.message;
          loginError.style.display = 'block';
        }
      }
    });

    // Real-time validation clearing on input
    loginForm.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        document.getElementById('loginError').style.display = 'none';
      });
    });
  }

  // --- REGISTER FORM ---
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        role: document.getElementById('role')
      };

      let isValid = true;

      // Reset invalid state
      Object.keys(inputs).forEach(key => {
        inputs[key].classList.remove('is-invalid');
      });

      // Name >= 4
      if (inputs.name.value.trim().length < 4) {
        inputs.name.classList.add('is-invalid');
        isValid = false;
      }

      // Valid Email
      if (!inputs.email.value.trim() || !isValidEmail(inputs.email.value)) {
        inputs.email.classList.add('is-invalid');
        isValid = false;
      }

      // Password >= 8
      if (inputs.password.value.length < 8) {
        inputs.password.classList.add('is-invalid');
        isValid = false;
      }

      // Confirm Password matches
      if (inputs.confirmPassword.value !== inputs.password.value) {
        inputs.confirmPassword.classList.add('is-invalid');
        isValid = false;
      }

      // Role selected
      if (!inputs.role.value) {
        inputs.role.classList.add('is-invalid');
        isValid = false;
      }

      if (isValid) {
        const users = DB.getUsers();
        // Check if email already exists
        if (users.find(u => u.email === inputs.email.value)) {
          inputs.email.classList.add('is-invalid');
          inputs.email.nextElementSibling.textContent = 'Email already registered.';
          return;
        }

        // Add new user
        const newUser = {
          id: Date.now().toString(),
          name: inputs.name.value.trim(),
          email: inputs.email.value.trim(),
          password: inputs.password.value,
          role: inputs.role.value,
          status: 'Active',
          store: 'Unassigned',
          isFirstTime: true
        };

        users.push(newUser);
        DB.saveUsers(users);

        // Auto-login the new user and send them straight to onboarding
        localStorage.setItem('so_session', JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          store: newUser.store,
          isFirstTime: true
        }));

        // Route to the correct onboarding page based on role
        const role = newUser.role;
        if (role === 'retailer') {
          window.location.href = '../Retailer module/Retailer-intitial.html';
        } else if (role === 'supplier') {
          window.location.href = '../supplier module/supplier-initial.html';
        } else {
          window.location.href = 'login.html';
        }
      }
    });

    registerForm.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });
  }

  // --- FORGOT PASSWORD FORM ---
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const emailFeedback = document.getElementById('emailFeedback');
      emailInput.classList.remove('is-invalid');

      const enteredEmail = emailInput.value.trim();

      // Basic format check
      if (!enteredEmail || !isValidEmail(enteredEmail)) {
        emailFeedback.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('is-invalid');
        return;
      }

      // Check if email exists in mock data
      const users = DB.getUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === enteredEmail.toLowerCase());

      if (!matchedUser) {
        emailFeedback.textContent = 'No account found with this email address.';
        emailInput.classList.add('is-invalid');
        return;
      }

      // Store email in sessionStorage to pass it across pages
      sessionStorage.setItem('reset_email', matchedUser.email);

      // Redirect to OTP page
      window.location.href = 'otp-verification.html';
    });

    document.getElementById('email').addEventListener('input', function () {
      this.classList.remove('is-invalid');
    });
  }

  // --- OTP VERIFICATION ---
  const otpForm = document.getElementById('otpForm');
  if (otpForm) {
    // Make sure a reset email was set (guard)
    const resetEmail = sessionStorage.getItem('reset_email');
    if (!resetEmail) {
      window.location.href = 'forgot-password.html';
      return;
    }

    // Show masked email in subtitle
    const subtitle = document.getElementById('otpSubtitle');
    if (subtitle) {
      const [user, domain] = resetEmail.split('@');
      const masked = user.slice(0, 2) + '***@' + domain;
      subtitle.textContent = `Enter the OTP sent to ${masked}.`;
    }

    // OTP auto-focus logic
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        // Allow only digits
        input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
        if (input.value && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          otpInputs[idx - 1].focus();
        }
      });

      // Allow paste of 4-digit code
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        [...pasted.slice(0, 4)].forEach((char, i) => {
          if (otpInputs[i]) otpInputs[i].value = char;
        });
        const lastFilled = Math.min(pasted.length, 4) - 1;
        if (otpInputs[lastFilled]) otpInputs[lastFilled].focus();
      });
    });

    // Focus first box on load
    otpInputs[0] && otpInputs[0].focus();

    // Resend OTP
    document.getElementById('resendOtp').addEventListener('click', (e) => {
      e.preventDefault();
      otpInputs.forEach(i => { i.value = ''; i.classList.remove('is-invalid'); });
      otpInputs[0].focus();
      document.getElementById('otpError').style.display = 'none';
      // Show a brief flash message
      const resendLink = e.target;
      resendLink.textContent = 'OTP Resent!';
      setTimeout(() => { resendLink.textContent = 'Resend OTP'; }, 2000);
    });

    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const otpError = document.getElementById('otpError');
      const values = [...otpInputs].map(i => i.value);
      const allFilled = values.every(v => v.length === 1);

      if (!allFilled) {
        otpInputs.forEach(i => i.classList.add('is-invalid'));
        otpError.style.display = 'block';
        return;
      }

      // Any 4-digit OTP is accepted — proceed to reset password
      otpError.style.display = 'none';
      window.location.href = 'reset-password.html';
    });
  }

  // --- RESET PASSWORD FORM ---
  const resetForm = document.getElementById('resetPasswordForm');
  if (resetForm) {
    // Guard: must have a reset_email
    const resetEmail = sessionStorage.getItem('reset_email');
    if (!resetEmail) {
      window.location.href = 'forgot-password.html';
      return;
    }

    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newPwd = document.getElementById('newPassword');
      const confirmPwd = document.getElementById('confirmNewPassword');
      let isValid = true;

      newPwd.classList.remove('is-invalid');
      confirmPwd.classList.remove('is-invalid');

      if (newPwd.value.length < 8) {
        newPwd.classList.add('is-invalid');
        isValid = false;
      }

      if (confirmPwd.value !== newPwd.value) {
        confirmPwd.classList.add('is-invalid');
        isValid = false;
      }

      if (!isValid) return;

      // Update password in mock data
      const users = DB.getUsers();
      const userIdx = users.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
      if (userIdx !== -1) {
        users[userIdx].password = newPwd.value;
        DB.saveUsers(users);
      }

      // Clear the reset session
      sessionStorage.removeItem('reset_email');

      // Redirect to success screen
      window.location.href = 'reset-success.html';
    });

    resetForm.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });
  }
});
