import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://pbhuxeuwyhmdemvtsshy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9Y5Cqm-g22XPJjyn_-4wsg_xqEiWFxN";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const authView = $("auth-view");
const dashboardView = $("dashboard-view");
const authMessage = $("auth-message");
const dashboardMessage = $("dashboard-message");
let currentUser = null;
let currentProfile = null;

function message(el, text, error = false) {
  el.textContent = text || "";
  el.classList.toggle("error", Boolean(error));
}
function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = busy;
    button.dataset.original ||= button.textContent;
    button.textContent = busy ? "Please wait…" : button.dataset.original;
  }
}
function showTab(which) {
  const login = which === "login";
  $("login-form").classList.toggle("hidden", !login);
  $("signup-form").classList.toggle("hidden", login);
  $("tab-login").classList.toggle("active", login);
  $("tab-signup").classList.toggle("active", !login);
  message(authMessage, "");
}
$("tab-login").addEventListener("click", () => showTab("login"));
$("tab-signup").addEventListener("click", () => showTab("signup"));

function calculateAge(dobText) {
  const dob = new Date(`${dobText}T00:00:00`);
  if (!dobText || Number.isNaN(dob.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday = today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age--;
  return age;
}

$("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  message(authMessage, "");
  const username = $("signup-username").value.trim();
  const displayName = $("signup-display").value.trim();
  const email = $("signup-email").value.trim();
  const password = $("signup-password").value;
  const dob = $("signup-dob").value;

  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    return message(authMessage, "Username must be 3–24 letters, numbers or underscores.", true);
  }
  if (calculateAge(dob) < 18) {
    return message(authMessage, "SyncTrA is for adults aged 18 and older.", true);
  }
  if (!$("age-check").checked || !$("rules-check").checked) {
    return message(authMessage, "Please confirm the age requirement and community rules.", true);
  }

  setBusy(form, true);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        date_of_birth: dob
      }
    }
  });
  setBusy(form, false);

  if (error) return message(authMessage, error.message, true);
  if (data.session) {
    message(authMessage, "Account created. Your member space is opening…");
    await loadMember(data.user);
  } else {
    message(authMessage, "Registration received. Check your email for the confirmation link, then log in. If no email arrives, check spam or the Supabase email settings.");
    $("signup-form").reset();
    showTab("login");
  }
});

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  message(authMessage, "");
  setBusy(form, true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-password").value
  });
  setBusy(form, false);
  if (error) return message(authMessage, error.message, true);
  await loadMember(data.user);
});

$("forgot-password").addEventListener("click", async () => {
  const email = $("login-email").value.trim();
  if (!email) return message(authMessage, "Enter your email address first.", true);
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  message(authMessage, error ? error.message : "If the email exists, a password reset link will be sent. Check your inbox and spam folder.", Boolean(error));
});

async function loadMember(user) {
  currentUser = user;
  message(dashboardMessage, "");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, bio, age_verified_at, account_status")
    .eq("user_id", user.id)
    .single();

  if (error) {
    await supabase.auth.signOut();
    currentUser = null;
    authView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
    showTab("login");
    return message(authMessage, "Your account is signed in, but the member profile could not be loaded. Please contact SyncTrA support. " + error.message, true);
  }
  if (profile.account_status !== "active" || !profile.age_verified_at) {
    await supabase.auth.signOut();
    currentUser = null;
    return message(authMessage, "This account is not currently eligible for member access.", true);
  }

  currentProfile = profile;
  $("member-display").textContent = profile.display_name || "Creator";
  $("profile-name").textContent = profile.display_name || "Member";
  $("profile-username").textContent = "@" + profile.username;
  $("profile-email").textContent = user.email || "";
  $("avatar-letter").textContent = (profile.display_name || "S").trim().charAt(0).toUpperCase();
  $("edit-display").value = profile.display_name || "";
  $("edit-bio").value = profile.bio || "";

  authView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

$("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || !currentProfile) return;
  const display_name = $("edit-display").value.trim();
  const bio = $("edit-bio").value.trim();
  if (!display_name || display_name.length > 60 || bio.length > 300) {
    return message(dashboardMessage, "Please check the display name and bio length.", true);
  }
  const { error } = await supabase.from("profiles")
    .update({ display_name, bio })
    .eq("user_id", currentUser.id);
  if (error) return message(dashboardMessage, error.message, true);
  currentProfile.display_name = display_name;
  currentProfile.bio = bio;
  $("member-display").textContent = display_name;
  $("profile-name").textContent = display_name;
  $("avatar-letter").textContent = display_name.trim().charAt(0).toUpperCase();
  message(dashboardMessage, "Profile saved.");
});

$("logout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return message(dashboardMessage, error.message, true);
  currentUser = null;
  currentProfile = null;
  dashboardView.classList.add("hidden");
  authView.classList.remove("hidden");
  $("login-form").reset();
  showTab("login");
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    currentUser = null;
    currentProfile = null;
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
  }
});

const { data: { session } } = await supabase.auth.getSession();
if (session?.user) await loadMember(session.user);
