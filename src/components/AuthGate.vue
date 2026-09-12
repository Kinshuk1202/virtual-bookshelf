<template>
  <div class="auth-page">
    <div class="auth-card">
      <span class="eyebrow">The Reading Room</span>
      <h1>My Virtual Bookshelf</h1>
      <p class="sub">
        {{
          mode === 'signin'
            ? 'Sign in to your shelves.'
            : mode === 'signup'
              ? 'Create an account to start your shelves.'
              : "Enter your email and we'll send you a reset link."
        }}
      </p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <input
          v-if="mode === 'signup'"
          v-model="displayName"
          type="text"
          placeholder="Display name"
          autocomplete="name"
        />
        <input v-model="email" type="email" placeholder="Email" autocomplete="email" required />
        <div v-if="mode !== 'reset'" class="password-field">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="eye-toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '🙈' : '👁' }}
          </button>
        </div>
        <button
          v-if="mode === 'signin'"
          type="button"
          class="link forgot-link"
          @click="goToReset"
        >
          Forgot password?
        </button>
        <button class="btn" type="submit" :disabled="loading">
          {{
            loading
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset email'
          }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="resetSent" class="success">Password reset email sent — check your inbox.</p>

      <template v-if="mode !== 'reset'">
        <div class="divider"><span>or</span></div>

        <button class="btn dark google-btn" type="button" :disabled="loading" @click="onGoogle">
          Sign in with Google
        </button>
      </template>

      <p class="switch">
        <template v-if="mode === 'signin'">
          Don't have an account?
          <button type="button" class="link" @click="mode = 'signup'">Create one</button>
        </template>
        <template v-else-if="mode === 'signup'">
          Already have an account?
          <button type="button" class="link" @click="mode = 'signin'">Sign in</button>
        </template>
        <template v-else>
          <button type="button" class="link" @click="mode = 'signin'">Back to sign in</button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { signIn, signUp, signInWithGoogle, resetPassword } from '../lib/auth'

const mode = ref('signin') // 'signin' | 'signup' | 'reset'
const email = ref('')
const password = ref('')
const displayName = ref('')
const loading = ref(false)
const error = ref('')
const resetSent = ref(false)
const showPassword = ref(false)

// Any change of mode clears stale feedback from whatever was tried before.
watch(mode, () => {
  error.value = ''
  resetSent.value = false
})

function goToReset() {
  mode.value = 'reset'
}

function friendlyError(e) {
  const code = e?.code || ''
  if (code.includes('invalid-email')) return 'That email address looks invalid.'
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Incorrect email or password.'
  }
  if (code.includes('email-already-in-use')) return 'An account with that email already exists.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was closed before finishing.'
  return e?.message || 'Something went wrong. Please try again.'
}

async function onSubmit() {
  error.value = ''
  resetSent.value = false
  loading.value = true
  try {
    if (mode.value === 'signup') {
      await signUp(email.value, password.value, displayName.value)
    } else if (mode.value === 'reset') {
      await resetPassword(email.value)
      resetSent.value = true
    } else {
      await signIn(email.value, password.value)
    }
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    loading.value = false
  }
}

async function onGoogle() {
  error.value = ''
  loading.value = true
  try {
    await signInWithGoogle()
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: #17100a;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  padding: 34px 30px;
  text-align: center;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
}
.auth-card h1 {
  font-size: 28px;
  color: var(--text-main);
  margin: 8px 0 10px;
}
.sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 22px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.auth-form input {
  background: #100b06;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 11px 14px;
  color: var(--text-main);
  font-size: 14px;
}
.auth-form input:focus {
  outline: none;
  border-color: var(--gold);
}
.password-field {
  position: relative;
}
.password-field input {
  width: 100%;
  padding-right: 40px;
}
.eye-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 15px;
  line-height: 1;
  color: var(--text-muted);
  padding: 4px;
}
.eye-toggle:hover {
  color: var(--gold);
}
.forgot-link {
  align-self: flex-end;
  font-size: 12.5px;
  margin-top: -2px;
}
.error {
  color: var(--danger-strong);
  font-size: 13px;
  margin: 0 0 14px;
}
.success {
  color: var(--gold);
  font-size: 13px;
  margin: 0 0 14px;
}
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-dim);
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 4px 0 14px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-soft);
}
.google-btn {
  width: 100%;
}
.switch {
  margin-top: 18px;
  font-size: 13px;
  color: var(--text-muted);
}
.link {
  color: var(--gold);
  text-decoration: underline;
  font-size: inherit;
}
</style>
