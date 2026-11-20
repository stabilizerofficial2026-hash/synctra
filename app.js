import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://pbhuxeuwyhmdemvtsshy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9Y5Cqm-g22XPJjyn_-4wsg_xqEiWFxN";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const authView = $("auth-view");
const dashboardView = $("dashboard-view");
const authMessage = $("auth-message");
const dashboardMessage = $("dashboard-message");
const feedMessage = $("feed-message");
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

$("welcome-express").addEventListener("click", () => {
  $("welcome-screen").classList.add("hidden");
  authView.classList.remove("hidden");
  showTab("login");
  $("login-email").focus();
});
$("welcome-evolve").addEventListener("click", () => {
  $("welcome-screen").classList.add("hidden");
  authView.classList.remove("hidden");
  showTab("signup");
  $("signup-username").focus();
});
document.querySelectorAll("[data-plan-cta]").forEach((button) => {
  button.addEventListener("click", () => $("welcome-evolve").click());
});
$("back-to-welcome").addEventListener("click", () => {
  authView.classList.add("hidden");
  $("welcome-screen").classList.remove("hidden");
  message(authMessage, "");
});


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

  if (!/^[A-Za-z0-9_]{3,24}$/.test(username))
    return message(authMessage, "Username must be 3–24 letters, numbers or underscores.", true);
  if (calculateAge(dob) < 18)
    return message(authMessage, "SyncTrA is for adults aged 18 and older.", true);
  if (!$("age-check").checked || !$("rules-check").checked)
    return message(authMessage, "Please confirm the age requirement and community rules.", true);

  setBusy(form, true);
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { username, display_name: displayName, date_of_birth: dob } }
  });
  setBusy(form, false);
  if (error) return message(authMessage, error.message, true);
  if (data.session) {
    message(authMessage, "Account created. Your member space is opening…");
    await loadMember(data.user);
  } else {
    message(authMessage, "Registration received. Check your email, then log in.");
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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  message(authMessage, error ? error.message : "If the email exists, a password reset link will be sent.", Boolean(error));
});

async function renderMembershipGate(status, subscription = null) {
  $("member-content").classList.add("hidden");
  $("membership-gate").classList.remove("hidden");
  const title = $("gate-title");
  const description = $("gate-description");
  if (status === "pending") {
    title.textContent = "Payment verification pending";
    description.textContent = "We have a membership record, but it is not active yet. SyncTrA will unlock your private space only after payment is verified by the payment provider.";
  } else if (["expired", "cancelled", "past_due", "suspended"].includes(status)) {
    title.textContent = "Your membership needs renewal";
    description.textContent = "Your subscription is not currently active. Renew through secure checkout when it becomes available to restore member access.";
  } else {
    title.textContent = "Welcome to SyncTrA — membership required";
    description.textContent = "Choose a membership tier to join the private creator community. Access is granted only after the payment provider verifies your payment.";
  }
  if (subscription?.current_period_end) {
    const expiry = new Date(subscription.current_period_end);
    if (!Number.isNaN(expiry.getTime())) description.textContent += ` Current period ends: ${expiry.toLocaleDateString()}.`;
  }
  const host = $("membership-plans");
  host.replaceChildren();
  const { data: plans, error } = await supabase.from("subscription_plans")
    .select("id,name,monthly_price_minor,currency,monthly_credits,profile_music_seconds,group_member_limit,marketplace_selling")
    .eq("active", true).order("monthly_price_minor", { ascending: true });
  if (error) {
    message($("membership-gate-message"), "Membership options could not be loaded. Please try again later.", true);
    return;
  }
  for (const plan of plans || []) {
    const card = node("article", "plan-card");
    card.append(node("p", "eyebrow", plan.id.replaceAll("_", " ").toUpperCase()));
    card.append(node("h3", "", plan.name));
    card.append(node("strong", "plan-price", plan.monthly_price_minor > 0 ? `${plan.currency} ${(plan.monthly_price_minor / 100).toFixed(2)} / month` : "Price to be announced"));
    const storageByPlan = { creator: "512 MiB storage", creator_plus: "2 GiB storage", creator_pro: "10 GiB storage" };
    const details = [
      `${Number(plan.monthly_credits).toLocaleString()} monthly credits`,
      `Groups up to ${Number(plan.group_member_limit).toLocaleString()} members`,
      storageByPlan[plan.id] || "Storage allocation shown in account details",
      `${plan.profile_music_seconds}s profile soundtrack`
    ];
    if (plan.marketplace_selling) details.push("Marketplace selling access");
    const featureList = node("ul", "plan-feature-list");
    details.forEach((detail) => featureList.append(node("li", "", detail)));
    card.append(featureList);
    const action = node("button", "secondary", "Checkout coming soon");
    action.type = "button";
    action.disabled = true;
    action.setAttribute("aria-disabled", "true");
    card.append(action);
    host.append(card);
  }
  message($("membership-gate-message"), "Payment processing is not connected yet. No plan selection can activate an account.");
}

async function loadMember(user) {
  currentUser = user;
  message(dashboardMessage, "");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, bio, personality_type, hobbies, age_verified_at, account_status")
    .eq("user_id", user.id).single();

  if (error) {
    await supabase.auth.signOut();
    currentUser = null;
    authView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
    showTab("login");
    return message(authMessage, "Profile could not be loaded. " + error.message, true);
  }
  if (profile.account_status !== "active" || !profile.age_verified_at) {
    await supabase.auth.signOut();
    currentUser = null;
    return message(authMessage, "This account is not currently eligible for member access.", true);
  }

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id,status,plan_id,current_period_start,current_period_end,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(1);
  if (subscriptionError) {
    await supabase.auth.signOut();
    currentUser = null;
    return message(authMessage, "Membership status could not be verified. Please try again.", true);
  }
  const subscription = subscriptions?.[0] || null;
  const isPaidActive = subscription?.status === "active" && subscription.current_period_end && new Date(subscription.current_period_end).getTime() > Date.now();

  currentProfile = profile;
  $("member-display").textContent = profile.display_name || "Creator";
  $("profile-name").textContent = profile.display_name || "Member";
  $("profile-username").textContent = "@" + profile.username;
  $("profile-bio").textContent = profile.bio?.trim() || "Add a little introduction to your creative world.";
  $("profile-personality").textContent = profile.personality_type || "Not set";
  $("profile-hobbies").textContent = profile.hobbies?.trim() || "Not set";
  $("profile-email").textContent = user.email || "";
  $("avatar-letter").textContent = (profile.display_name || "S").trim().charAt(0).toUpperCase();
  $("edit-display").value = profile.display_name || "";
  $("edit-bio").value = profile.bio || "";
  $("edit-personality").value = profile.personality_type || "";
  $("edit-hobbies").value = profile.hobbies || "";
  $("profile-form").classList.add("hidden");
  $("profile-edit-open").classList.remove("hidden");
  $("welcome-screen").classList.add("hidden");
  authView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  if (!isPaidActive) {
    await renderMembershipGate(subscription?.status || "none", subscription);
    return;
  }
  $("membership-gate").classList.add("hidden");
  $("member-content").classList.remove("hidden");
  $("membership-status").textContent = `Active · ${subscription.plan_id.replaceAll("_", " ")}`;
  await loadFeed();
  await loadBlockedUsers();
  await loadMyReports();
  await loadGroups();
  await loadCommunityRooms();
  await loadNotifications();
  await loadMessages();
  await loadNetwork();
  await loadModeratorQueue();
}

function resetProfileEditor() {
  if (!currentProfile) return;
  $("edit-display").value = currentProfile.display_name || "";
  $("edit-bio").value = currentProfile.bio || "";
  $("edit-personality").value = currentProfile.personality_type || "";
  $("edit-hobbies").value = currentProfile.hobbies || "";
}

$("profile-edit-open").addEventListener("click", () => {
  resetProfileEditor();
  $("profile-form").classList.remove("hidden");
  $("profile-edit-open").classList.add("hidden");
  message(dashboardMessage, "");
  $("edit-display").focus();
});

$("profile-edit-cancel").addEventListener("click", () => {
  resetProfileEditor();
  $("profile-form").classList.add("hidden");
  $("profile-edit-open").classList.remove("hidden");
  message(dashboardMessage, "");
});

$("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || !currentProfile) return;
  const display_name = $("edit-display").value.trim();
  const bio = $("edit-bio").value.trim();
  const personality_type = $("edit-personality").value;
  const hobbies = $("edit-hobbies").value.trim();
  const allowedPersonalities = ["", "Sanguine", "Choleric", "Melancholic", "Phlegmatic", "Mixed"];
  if (!display_name || display_name.length > 60 || bio.length > 300 || hobbies.length > 180 || !allowedPersonalities.includes(personality_type))
    return message(dashboardMessage, "Please check your profile details and character limits.", true);
  const { data: savedProfile, error } = await supabase
    .from("profiles")
    .update({ display_name, bio, personality_type: personality_type || null, hobbies: hobbies || null })
    .eq("user_id", currentUser.id)
    .select("user_id, display_name, bio, personality_type, hobbies")
    .single();
  if (error) return message(dashboardMessage, "Profile could not be saved: " + error.message, true);
  if (!savedProfile) return message(dashboardMessage, "No profile row was updated. Please sign out and sign in again.", true);
  currentProfile.display_name = savedProfile.display_name;
  currentProfile.bio = savedProfile.bio || "";
  currentProfile.personality_type = savedProfile.personality_type || null;
  currentProfile.hobbies = savedProfile.hobbies || null;
  $("profile-bio").textContent = savedProfile.bio?.trim() || "Add a little introduction to your creative world.";
  $("profile-personality").textContent = savedProfile.personality_type || "Not set";
  $("profile-hobbies").textContent = savedProfile.hobbies?.trim() || "Not set";
  $("member-display").textContent = display_name;
  $("profile-name").textContent = display_name;
  $("avatar-letter").textContent = display_name.trim().charAt(0).toUpperCase();
  $("profile-form").classList.add("hidden");
  $("profile-edit-open").classList.remove("hidden");
  message(dashboardMessage, "Profile saved.");
});

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
async function loadFeed() {
  if (!currentUser) return;
  message(feedMessage, "Loading member posts…");
  $("feed-list").replaceChildren();
  const { data: posts, error } = await supabase.from("posts")
    .select("id, author_id, body, created_at")
    .is("group_id", null).eq("visibility", "members").eq("status", "published")
    .order("created_at", { ascending: false }).limit(30);

  if (error) {
    message(feedMessage, "Feed could not be loaded: " + error.message, true);
    return;
  }
  if (!posts?.length) {
    message(feedMessage, "No posts yet. Be the first to share an update.");
    return;
  }

  const ids = posts.map(p => p.id);
  const authorIds = [...new Set(posts.map(p => p.author_id))];
  const [{ data: profiles }, { data: reactions }, { data: comments }] = await Promise.all([
    supabase.from("profiles").select("user_id, username, display_name").in("user_id", authorIds),
    supabase.from("reactions").select("post_id, user_id").in("post_id", ids),
    supabase.from("comments").select("id, post_id, author_id, body, created_at").in("post_id", ids).eq("status", "published").order("created_at", { ascending: true })
  ]);
  const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
  const reactionRows = reactions || [];
  const commentRows = comments || [];

  for (const post of posts) {
    const author = profileMap.get(post.author_id);
    const card = node("article", "panel post-card");
    const top = node("div", "post-top");
    const avatar = node("div", "post-avatar", (author?.display_name || "M").trim().charAt(0).toUpperCase());
    const identity = node("div", "post-identity");
    avatar.setAttribute("role", "button"); avatar.setAttribute("tabindex", "0"); avatar.setAttribute("aria-label", "View member profile");
    avatar.addEventListener("click", () => openMemberProfile(post.author_id));
    avatar.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") openMemberProfile(post.author_id); });
    const authorName = node("button", "member-link", author?.display_name || "SyncTrA member");
    authorName.type = "button";
    authorName.addEventListener("click", () => openMemberProfile(post.author_id));
    const authorHandle = node("button", "member-link member-handle", "@" + (author?.username || "member"));
    authorHandle.type = "button";
    authorHandle.addEventListener("click", () => openMemberProfile(post.author_id));
    identity.append(authorName, authorHandle);
    top.append(avatar, identity, node("time", "post-time", formatDate(post.created_at)));
    const body = node("p", "post-body", post.body);
    const postReactions = reactionRows.filter(r => r.post_id === post.id);
    const ownReaction = postReactions.some(r => r.user_id === currentUser.id);
    const postComments = commentRows.filter(c => c.post_id === post.id);
    const actions = node("div", "post-actions");
    const like = node("button", ownReaction ? "reaction-button liked" : "reaction-button", `♥ ${postReactions.length} Like`);
    like.type = "button";
    like.addEventListener("click", () => toggleLike(post.id, ownReaction));
    const commentToggle = node("button", "reaction-button", `Comment · ${postComments.length}`);
    commentToggle.type = "button";
    actions.append(like, commentToggle);
    const share=node("button","reaction-button","Share");
    share.type="button";
    share.addEventListener("click",async()=>{
      const username=window.prompt("Share this post. Enter the member username:");
      if(username===null)return;
      try{
        const recipient=await profileForUsername(username);
        if(!recipient)return message(feedMessage,"No active member found with that username.",true);
        if(recipient.user_id===currentUser.id)return message(feedMessage,"Choose another member to share this post with.",true);
        const {error}=await supabase.from("post_shares").insert({post_id:post.id,shared_by:currentUser.id,recipient_id:recipient.user_id});
        if(error)return message(feedMessage,error.code==="23505"?"You've already shared this post with that member.":error.message,true);
        message(feedMessage,`Post shared with @${recipient.username}.`);
        await loadNotifications();
      }catch(err){message(feedMessage,err.message,true);}
    });
    actions.append(share);
    if (post.author_id !== currentUser.id) {
      const report = node("button", "reaction-button safety-action", "Report");
      report.type = "button";
      report.addEventListener("click", () => reportPost(post.id));
      const block = node("button", "reaction-button safety-action", "Block member");
      block.type = "button";
      block.addEventListener("click", () => blockMember(post.author_id, author?.display_name || "this member"));
      actions.append(report, block);
    }

    const commentsBox = node("div", "comments-box");
    for (const c of postComments) {
      const cp = profileMap.get(c.author_id);
      const line = node("p", "comment-line");
      const strong = node("b", "", (cp?.display_name || "Member") + ": ");
      line.append(strong, document.createTextNode(c.body));
      commentsBox.append(line);
    }
    const commentForm = node("form", "comment-form");
    const input = node("input", "comment-input");
    input.type = "text"; input.maxLength = 1000; input.required = true;
    input.placeholder = "Write a respectful comment…";
    const send = node("button", "secondary comment-send", "Send");
    send.type = "submit";
    commentForm.append(input, send);
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      send.disabled = true;
      const { error } = await supabase.from("comments").insert({
        post_id: post.id, author_id: currentUser.id, body: input.value.trim()
      });
      send.disabled = false;
      if (error) return message(feedMessage, "Comment failed: " + error.message, true);
      await loadFeed();
    });
    commentToggle.addEventListener("click", () => commentsBox.classList.toggle("expanded"));
    commentsBox.append(commentForm);
    card.append(top, body, actions, commentsBox);
    $("feed-list").append(card);
  }
  message(feedMessage, `Showing ${posts.length} latest post${posts.length === 1 ? "" : "s"}.`);
  await loadBlockedUsers();
}

async function reportPost(postId) {
  const reason = window.prompt("Why are you reporting this post? Include a clear reason (at least 3 characters).");
  if (reason === null) return;
  const clean = reason.trim();
  if (clean.length < 3 || clean.length > 1000) {
    return message(feedMessage, "Please enter a report reason between 3 and 1,000 characters.", true);
  }
  const { error } = await supabase.from("content_reports").insert({
    reporter_id: currentUser.id, target_type: "post", target_id: postId, reason: clean
  });
  if (error) return message(feedMessage, "Report could not be submitted: " + error.message, true);
  message(feedMessage, "Report submitted privately. It will be reviewed under the community rules.");
}

async function blockMember(userId, displayName) {
  if (!window.confirm(`Block ${displayName}? Their posts will be hidden from your feed. You can unblock them later.`)) return;
  const { error } = await supabase.from("blocked_users").insert({
    blocker_id: currentUser.id, blocked_user_id: userId
  });
  if (error) return message(feedMessage, "Member could not be blocked: " + error.message, true);
  message(feedMessage, "Member blocked. Their posts are now hidden from your feed.");
  await loadFeed();
  await loadBlockedUsers();
}

async function loadBlockedUsers() {
  if (!currentUser || !$("blocked-list")) return;
  const host = $("blocked-list");
  host.replaceChildren();
  const { data, error } = await supabase.from("blocked_users")
    .select("blocked_user_id,created_at")
    .eq("blocker_id", currentUser.id)
    .order("created_at", { ascending: false });
  if (error) return message($("blocked-message"), "Blocked list unavailable: " + error.message, true);
  if (!data?.length) {
    message($("blocked-message"), "You haven't blocked any members.");
    return;
  }
  const ids = data.map(row => row.blocked_user_id);
  const { data: profiles, error: profileError } = await supabase.from("profiles")
    .select("user_id,display_name,username").in("user_id", ids);
  if (profileError) return message($("blocked-message"), "Member details unavailable: " + profileError.message, true);
  const map = new Map((profiles || []).map(p => [p.user_id, p]));
  for (const row of data) {
    const profile = map.get(row.blocked_user_id);
    const item = node("div", "blocked-row");
    const label = node("span", "", `${profile?.display_name || "SyncTrA member"} (@${profile?.username || "member"})`);
    const unblock = node("button", "secondary unblock-button", "Unblock");
    unblock.type = "button";
    unblock.addEventListener("click", async () => {
      const { error: removeError } = await supabase.from("blocked_users")
        .delete().eq("blocker_id", currentUser.id).eq("blocked_user_id", row.blocked_user_id);
      if (removeError) return message($("blocked-message"), "Could not unblock member: " + removeError.message, true);
      await loadFeed();
      await loadBlockedUsers();
    });
    item.append(label, unblock);
    host.append(item);
  }
  message($("blocked-message"), `${data.length} blocked member${data.length === 1 ? "" : "s"}.`);
}

async function toggleLike(postId, alreadyLiked) {
  if (!currentUser) return;
  let result;
  if (alreadyLiked) {
    result = await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", currentUser.id);
  } else {
    result = await supabase.from("reactions").insert({ post_id: postId, user_id: currentUser.id, reaction_type: "like" });
  }
  if (result.error) return message(feedMessage, "Reaction failed: " + result.error.message, true);
  await loadFeed();
}

$("post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const form = event.currentTarget;
  const body = $("post-body").value.trim();
  if (!body || body.length > 3000) return message(feedMessage, "Write a post between 1 and 3,000 characters.", true);
  setBusy(form, true);
  const { error } = await supabase.from("posts").insert({
    author_id: currentUser.id, body, visibility: "members", status: "published"
  });
  setBusy(form, false);
  if (error) return message(feedMessage, "Post could not be published: " + error.message, true);
  form.reset();
  await loadFeed();
});
$("refresh-feed").addEventListener("click", loadFeed);


let activeGroupId = null;
let groupMessageSending = false;
let activeGroupName = null;
async function loadGroups() {
  if (!currentUser) return;
  message($("groups-message"), "Loading your private groups…");
  $("groups-list").replaceChildren();
  const { data: plans } = await supabase.from("subscriptions")
    .select("plan_id,status,subscription_plans(group_member_limit,name)")
    .eq("user_id", currentUser.id).eq("status","active").limit(1);
  const activePlan = plans?.[0];
  const limit = activePlan?.subscription_plans?.group_member_limit;
  $("group-plan-note").textContent = activePlan
    ? `Your active ${activePlan.subscription_plans.name} plan allows you to create groups with up to ${Number(limit).toLocaleString()} members.`
    : "Creating a group requires an active subscription. Your current account has no active paid plan; no charges or plan changes have been made.";
  $("create-group-button").disabled = !activePlan;
  const { data: groups, error } = await supabase.from("groups")
    .select("id,owner_id,group_name,description,member_limit,created_at")
    .eq("status","active").order("created_at",{ascending:false}).limit(50);
  if (error) return message($("groups-message"),"Groups could not load: "+error.message,true);
  if (!groups?.length) return message($("groups-message"),"You have no groups yet. Create one with an active plan or request access using a group invitation ID.");
  const ids = groups.map(g=>g.id);
  const [{data:members},{data:profiles}] = await Promise.all([
    supabase.from("group_members").select("group_id,user_id,member_role,membership_status").in("group_id",ids),
    supabase.from("profiles").select("user_id,display_name,username")
  ]);
  const profileMap = new Map((profiles||[]).map(p=>[p.user_id,p]));
  for (const g of groups) {
    const groupMembers = (members||[]).filter(m=>m.group_id===g.id);
    const active = groupMembers.filter(m=>m.membership_status==="active");
    const card=document.createElement("article"); card.className="panel group-card";
    const h=document.createElement("h3"); h.textContent=g.group_name;
    const desc=document.createElement("p"); desc.className="muted"; desc.textContent=g.description||"A private SyncTrA group.";
    const meta=document.createElement("small"); meta.textContent=`${active.length} active members · capacity ${Number(g.member_limit).toLocaleString()} · ${g.owner_id===currentUser.id?"You own this group":"Member"} · ID ${g.id.slice(0,8)}`;
    const actions=document.createElement("div"); actions.className="group-card-actions";
    const open=document.createElement("button"); open.type="button"; open.className="primary"; open.textContent="Open group"; open.addEventListener("click",()=>openGroup(g));
    actions.append(open);
    if(g.owner_id===currentUser.id){
      const copy=document.createElement("button"); copy.type="button"; copy.className="secondary"; copy.textContent="Copy invitation ID";
      copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(g.id);message($("groups-message"),"Invitation ID copied. Share it privately with the intended member.");}catch{message($("groups-message"),"Copy unavailable. Group ID: "+g.id);}});
      actions.append(copy);
      const remove=node("button","danger-button","Delete group");
      remove.type="button";
      remove.addEventListener("click",async()=>{
        const confirmText=`Delete “${g.group_name}”? This permanently removes the group, its membership records and its group messages. This cannot be undone.`;
        if(!window.confirm(confirmText)) return;
        remove.disabled=true;
        const {error:deleteError}=await supabase.from("groups").delete().eq("id",g.id).eq("owner_id",currentUser.id);
        remove.disabled=false;
        if(deleteError) return message($("groups-message"),"Group could not be deleted: "+deleteError.message,true);
        if(activeGroupId===g.id){$("group-room").classList.add("hidden");activeGroupId=null;activeGroupName=null;}
        message($("groups-message"),"Group deleted.");
        await loadGroups();
      });
      actions.append(remove);
      const pending=groupMembers.filter(m=>m.membership_status==="pending");
      for(const req of pending){
        const row=document.createElement("div");row.className="pending-row";
        const who=profileMap.get(req.user_id);
        const label=document.createElement("span");label.textContent=`Join request: ${who?.display_name||"Member"} (@${who?.username||"unknown"})`;
        const yes=document.createElement("button");yes.type="button";yes.className="secondary";yes.textContent="Approve";
        yes.addEventListener("click",()=>reviewGroupRequest(g.id,req.user_id,true));
        const no=document.createElement("button");no.type="button";no.className="secondary";no.textContent="Decline";
        no.addEventListener("click",()=>reviewGroupRequest(g.id,req.user_id,false));
        row.append(label,yes,no);card.append(row);
      }
    }
    card.append(h,desc,meta,actions); $("groups-list").append(card);
  }
  message($("groups-message"),`Showing ${groups.length} group${groups.length===1?"":"s"} you can access.`);
}
async function reviewGroupRequest(groupId,userId,approve){
  const {error}=await supabase.rpc("synctra_review_group_member",{p_group_id:groupId,p_user_id:userId,p_approve:approve});
  if(error)return message($("groups-message"),error.message,true);
  message($("groups-message"),approve?"Member approved.":"Request declined.");
  await loadGroups();
}
async function openGroup(group){
  activeGroupId=group.id;activeGroupName=group.group_name;
  $("group-room-title").textContent=group.group_name;
  $("group-room").classList.remove("hidden");
  await loadGroupMessages();
  $("group-room").scrollIntoView({behavior:"smooth",block:"start"});
}
async function loadGroupMessages(){
  if(!activeGroupId)return;
  $("group-chat-list").replaceChildren();
  const {data:rows,error}=await supabase.from("group_messages")
    .select("id,sender_id,body,created_at").eq("group_id",activeGroupId)
    .order("created_at",{ascending:true}).limit(100);
  if(error)return message($("groups-message"),"Messages unavailable: "+error.message,true);
  const ids=[...new Set((rows||[]).map(r=>r.sender_id))];
  const {data:profiles}=ids.length?await supabase.from("profiles").select("user_id,display_name").in("user_id",ids):{data:[]};
  const map=new Map((profiles||[]).map(p=>[p.user_id,p.display_name]));
  if(!rows?.length){const empty=document.createElement("p");empty.className="muted";empty.textContent="No messages yet. Start the conversation."; $("group-chat-list").append(empty);}
  for(const row of rows||[]){
    const item=document.createElement("div");item.className="group-message "+(row.sender_id===currentUser.id?"chat-bubble-own":"chat-bubble-incoming");
    const author=document.createElement("b");author.textContent=map.get(row.sender_id)||"Member";
    const body=document.createElement("p");body.textContent=row.body;
    const time=document.createElement("small");time.textContent=new Date(row.created_at).toLocaleString();
    item.append(author,body,time);$("group-chat-list").append(item);
  }
}
$("group-create-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;const name=$("new-group-name").value.trim(),description=$("new-group-description").value.trim();
  const btn=$("create-group-button");btn.disabled=true;
  const {data,error}=await supabase.rpc("synctra_create_group",{p_group_name:name,p_description:description});
  btn.disabled=false;
  if(error)return message($("groups-message"),error.message,true);
  form.reset();message($("groups-message"),"Private group created. Invitation ID: "+data);
  await loadGroups();
});
$("group-join-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;const id=$("group-invite-id").value.trim();
  const {data,error}=await supabase.rpc("synctra_request_group_membership",{p_group_id:id});
  if(error)return message($("groups-message"),error.message,true);
  message($("groups-message"),data==="already_member"?"You are already a member.":"Join request sent. The group owner must approve it.");
  form.reset();
});
$("refresh-groups").addEventListener("click",loadGroups);
$("close-group-room").addEventListener("click",()=>{$("group-room").classList.add("hidden");activeGroupId=null;});
$("group-message-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!activeGroupId||!currentUser||groupMessageSending)return;
  const body=$("group-message-body").value.trim();if(!body)return;
  const groupId=activeGroupId;
  const button=e.currentTarget.querySelector("button");groupMessageSending=true;button.disabled=true;
  const {error}=await supabase.from("group_messages").insert({group_id:groupId,sender_id:currentUser.id,body});
  groupMessageSending=false;button.disabled=false;
  if(error)return message($("groups-message"),"Message not sent: "+error.message,true);
  $("group-message-body").value="";await loadGroupMessages();
});



// Phase 11 — OPEN MINDS community rooms, 15-second server-enforced slow mode and procedural ambience.
let activeCommunityRoom = null;
let communityRealtimeChannel = null;
let communityMessageLoadToken = 0;
let communityMessageSending = false;
let communityAudioContext = null;
let communityAudioNodes = [];
let communityAudioOn = false;
let communityAudioVolume = 0.12;
const roomToneMap = {open:174.61,islam:196,christianity:220,buddhism:164.81,taoism:146.83,science:261.63,atheism:185,satanism:155.56,tech:207.65,hinduism:233.08,judaism:246.94,activists:130.81};

async function loadCommunityRooms(){
  const host=$("community-rooms"); if(!host || !currentUser)return;
  host.replaceChildren();
  const {data:rooms,error}=await supabase.from("community_rooms").select("id,slug,room_name,description,icon,soundscape,is_default").eq("is_active",true).order("is_default",{ascending:false}).order("room_name");
  if(error){host.textContent="Open Minds rooms could not load: "+error.message;return;}
  const {data:mine, error:memberError}=await supabase.from("community_room_members").select("room_id").eq("user_id",currentUser.id);
  if(memberError){host.textContent="Your room memberships could not load.";return;}
  let joined=new Set((mine||[]).map(x=>x.room_id));
  const defaultRoom=(rooms||[]).find(r=>r.is_default);
  if(defaultRoom&&!joined.has(defaultRoom.id)){
    const {error:joinError}=await supabase.rpc("join_community_room",{p_room_id:defaultRoom.id});
    if(!joinError)joined.add(defaultRoom.id);
  }
  const refreshed=await supabase.from("community_room_members").select("room_id").eq("user_id",currentUser.id);
  joined=new Set((refreshed.data||[]).map(x=>x.room_id));
  const roomIntro={islam:"Beliefs, culture, history and perspectives",christianity:"Faith, scripture, culture and perspectives",buddhism:"Mindfulness, philosophy and practice",taoism:"Balance, nature and the Tao",science:"Evidence, discovery and questions",atheism:"Reason, ethics and secular philosophy",satanism:"Traditions, philosophy and perspectives",tech:"Ethical cybersecurity and technology",hinduism:"Hindu philosophy, scriptures, culture and traditions",judaism:"Jewish faith, history, teachings and traditions",activists:"Human rights, equality and positive social action",open:"A shared space for curious minds"};
  for(const room of rooms||[]){
    const card=document.createElement("article");card.className="community-room-card";
    const artworkSlug=({open:"open-discussion",tech:"hacker-community"})[room.slug]||room.slug;
    card.style.setProperty("--room-artwork", `url("assets/open-minds/${artworkSlug}.webp")`);
    card.dataset.roomSlug=room.slug;
    const top=document.createElement("div");top.className="community-room-card-top";
    const icon=document.createElement("span");icon.className="community-room-icon";icon.textContent=room.icon;
    const title=document.createElement("h3");title.textContent=room.room_name;
    top.append(icon,title);
    const desc=document.createElement("p");desc.textContent=roomIntro[room.slug]||room.description;
    const action=document.createElement("button");action.type="button";action.className="room-enter-button";
    action.textContent="Enter room";
    action.addEventListener("click",async()=>{
      if(!joined.has(room.id)){
        action.disabled=true;const {error:joinErr}=await supabase.rpc("join_community_room",{p_room_id:room.id});action.disabled=false;
        if(joinErr)return message($("groups-message"),joinErr.message,true);
      }
      message($("groups-message"),"");
      await openCommunityRoom(room);
    });
    card.append(top,desc,action);host.append(card);
  }
}

async function openCommunityRoom(room){
  activeCommunityRoom=room;
  $("community-room-panel").dataset.roomSlug=room.slug;
  const artworkSlug=({open:"open-discussion",tech:"hacker-community"})[room.slug]||room.slug;
  $("community-room-panel").style.setProperty("--room-background", `url("assets/open-minds/${artworkSlug}.webp")`);
  document.body.classList.add("community-room-open");
  $("community-room-title").textContent=room.icon+"  "+room.room_name;
  $("community-room-description").textContent=room.description;
  $("community-room-panel").classList.remove("hidden");
  await loadCommunityMessages();
  if(communityRealtimeChannel){await supabase.removeChannel(communityRealtimeChannel);communityRealtimeChannel=null;}
  communityRealtimeChannel=supabase.channel("open-minds-"+room.id)
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"community_messages",filter:"room_id=eq."+room.id},()=>loadCommunityMessages())
    .subscribe();
  if(communityAudioOn)startCommunityAmbience(room.soundscape);
  $("community-message-body").focus({ preventScroll: true });
}

async function loadCommunityMessages(){
  if(!activeCommunityRoom)return;
  const roomId=activeCommunityRoom.id;
  const loadToken=++communityMessageLoadToken;
  const host=$("community-chat-list");
  const {data:rows,error}=await supabase.from("community_messages").select("id,sender_id,body,created_at").eq("room_id",roomId).eq("moderation_status","published").order("created_at",{ascending:true}).limit(100);
  if(loadToken!==communityMessageLoadToken||activeCommunityRoom?.id!==roomId)return;
  if(error){message($("community-chat-feedback"),"Messages unavailable: "+error.message,true);return;}
  const ids=[...new Set((rows||[]).map(r=>r.sender_id))];
  const {data:profiles}=ids.length?await supabase.from("profiles").select("user_id,display_name").in("user_id",ids):{data:[]};
  if(loadToken!==communityMessageLoadToken||activeCommunityRoom?.id!==roomId)return;
  const names=new Map((profiles||[]).map(x=>[x.user_id,x.display_name]));
  host.replaceChildren();
  if(!rows?.length){const empty=document.createElement("p");empty.className="muted";empty.textContent="No messages yet. Start with a thoughtful question or idea.";host.append(empty);}
  const renderedIds=new Set();
  for(const row of rows||[]){
    if(renderedIds.has(row.id))continue;
    renderedIds.add(row.id);
    const item=document.createElement("article");item.className="community-message "+(row.sender_id===currentUser.id?"chat-bubble-own":"chat-bubble-incoming");
    const head=document.createElement("div");head.className="community-message-head";
    const author=document.createElement("b");author.textContent=names.get(row.sender_id)||"SyncTrA member";
    const time=document.createElement("small");time.textContent=new Date(row.created_at).toLocaleString();head.append(author,time);
    const body=document.createElement("p");body.textContent=row.body;item.append(head,body);
    if(row.sender_id!==currentUser.id){const report=document.createElement("button");report.type="button";report.className="text-button community-report";report.textContent="Report message";report.addEventListener("click",async()=>{
      const reason=window.prompt("Why are you reporting this message? (Spam, harassment, hate speech, threat, or other)");if(!reason?.trim())return;
      const {error:reportError}=await supabase.from("content_reports").insert({reporter_id:currentUser.id,target_type:"community_message",target_id:row.id,reason:reason.trim().slice(0,500)});
      message($("community-chat-feedback"),reportError?"Report could not be submitted: "+reportError.message:"Thank you. Your report has been submitted for review.",Boolean(reportError));
    });item.append(report);}
    host.append(item);
  }
  host.scrollTop=host.scrollHeight;
}

function stopCommunityAmbience(){
  for(const n of communityAudioNodes){try{n.stop?.();n.disconnect?.();}catch{}}
  communityAudioNodes=[];
  if(communityAudioContext){communityAudioContext.close().catch(()=>{});communityAudioContext=null;}
}
function startCommunityAmbience(soundscape="ambient"){
  stopCommunityAmbience();
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass){message($("community-chat-feedback"),"This browser does not support ambient audio.",true);return;}
  communityAudioContext=new AudioContextClass();
  const ctx=communityAudioContext;
  const base=roomToneMap[soundscape]||174.61;
  const master=ctx.createGain();master.gain.value=communityAudioVolume;master.connect(ctx.destination);communityAudioNodes.push(master);
  [1,1.5,2].forEach((ratio,index)=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";osc.frequency.value=base*ratio;gain.gain.value=index===0?0.34:index===1?0.13:0.055;
    osc.connect(gain);gain.connect(master);osc.start();communityAudioNodes.push(osc,gain);
  });
  ctx.resume().catch(()=>{});
  $("community-audio-status").textContent="Soft generated ambient tones · "+(activeCommunityRoom?.room_name||"Open Minds");
}

$("community-audio-toggle").addEventListener("click",()=>{
  communityAudioOn=!communityAudioOn;
  $("community-audio-toggle").textContent=communityAudioOn?"♫ Sound on":"♫ Sound off";
  $("community-audio-toggle").setAttribute("aria-pressed",String(communityAudioOn));
  if(communityAudioOn){startCommunityAmbience(activeCommunityRoom?.soundscape||"open");$("community-audio-status").textContent="Ambient sound is playing";}
  else{stopCommunityAmbience();$("community-audio-status").textContent="Ambient sound is off";}
});
$("community-audio-volume").addEventListener("input",e=>{communityAudioVolume=Number(e.target.value)/100;if(communityAudioOn&&communityAudioNodes[0])communityAudioNodes[0].gain.value=communityAudioVolume;});
$("community-room-leave").addEventListener("click",async()=>{
  if(!activeCommunityRoom)return;
  const room=activeCommunityRoom;
  const {error}=await supabase.rpc("leave_community_room",{p_room_id:room.id});
  if(error){message($("community-chat-feedback"),error.message,true);return;}
  $("community-room-panel").classList.add("hidden");activeCommunityRoom=null;
  document.body.classList.remove("community-room-open");
  if(communityRealtimeChannel){await supabase.removeChannel(communityRealtimeChannel);communityRealtimeChannel=null;}
  if(communityAudioOn){stopCommunityAmbience();$("community-audio-status").textContent="Sound paused outside the room";}
  message($("groups-message"),"You left "+room.room_name+".");await loadCommunityRooms();
});
$("community-room-close").addEventListener("click",async()=>{
  $("community-room-panel").classList.add("hidden");activeCommunityRoom=null;
  document.body.classList.remove("community-room-open");
  if(communityRealtimeChannel){await supabase.removeChannel(communityRealtimeChannel);communityRealtimeChannel=null;}
  if(communityAudioOn){stopCommunityAmbience();$("community-audio-status").textContent="Sound paused outside the room";}
});
$("community-message-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!activeCommunityRoom||!currentUser||communityMessageSending)return;
  const input=$("community-message-body"),body=input.value.trim();if(!body)return;
  const roomId=activeCommunityRoom.id;
  const button=e.currentTarget.querySelector("button");
  communityMessageSending=true;button.disabled=true;input.disabled=true;
  const {error}=await supabase.rpc("send_community_message",{p_room_id:roomId,p_body:body});
  communityMessageSending=false;button.disabled=false;input.disabled=false;
  if(error){message($("community-chat-feedback"),error.message,true);return;}
  input.value="";message($("community-chat-feedback"),"Message sent. Slow mode allows one message every 15 seconds.");
  // Realtime INSERT is the single source of refresh; do not issue a second fetch here.
});

// Phase 8C — private notifications, direct messaging, in-app sharing and follows.
async function openMemberProfile(userId) {
  if (!userId || userId === currentUser?.id) {
    $("profile-card").scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  const panel = $("member-profile-view");
  panel.classList.remove("hidden");
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  message($("public-profile-status"), "Loading member profile…");
  $("public-profile-posts").replaceChildren();
  const {data: profile, error} = await supabase.from("profiles")
    .select("user_id,username,display_name,bio,personality_type,hobbies")
    .eq("user_id", userId).maybeSingle();
  if (error || !profile) return message($("public-profile-status"), "This member profile is unavailable.", true);
  $("public-profile-name").textContent = profile.display_name || "SyncTrA member";
  $("public-profile-username").textContent = "@" + profile.username;
  $("public-profile-bio").textContent = profile.bio?.trim() || "This member hasn't added a bio yet.";
  $("public-profile-personality").textContent = profile.personality_type || "Not set";
  $("public-profile-hobbies").textContent = profile.hobbies?.trim() || "Not set";
  const {data: relation} = await supabase.from("follows").select("follower_id")
    .eq("follower_id", currentUser.id).eq("followed_id", userId).maybeSingle();
  const follow = $("public-profile-follow");
  follow.textContent = relation ? "Following" : "Follow";
  follow.onclick = async () => {
    follow.disabled = true;
    const result = relation
      ? await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("followed_id", userId)
      : await supabase.from("follows").insert({follower_id:currentUser.id,followed_id:userId});
    follow.disabled = false;
    if (result.error) return message($("public-profile-status"), result.error.message, true);
    await loadNetwork(); await loadNotifications(); await openMemberProfile(userId);
  };
  $("public-profile-message").onclick = () => {
    $("message-username").value = profile.username;
    $("messages-panel").scrollIntoView({behavior:"smooth",block:"start"});
    $("message-first-body").focus();
  };
  const {data: posts, error: postError} = await supabase.from("posts")
    .select("id,body,created_at").eq("author_id", userId).eq("visibility","members")
    .eq("status","published").is("group_id",null).order("created_at",{ascending:false}).limit(12);
  const host = $("public-profile-posts");
  if (postError) return message($("public-profile-status"), "Profile loaded, but posts could not be displayed.", true);
  if (!posts?.length) host.append(node("p","muted","No public posts yet."));
  for (const post of posts || []) {
    const card = node("article","panel post-card");
    card.append(node("p","post-body",post.body),node("small","post-time",formatDate(post.created_at)));
    host.append(card);
  }
  message($("public-profile-status"), "Viewing public profile information. Private account details are not shown.");
}
$("close-public-profile")?.addEventListener("click", () => $("member-profile-view").classList.add("hidden"));

async function profileForUsername(username) {
  const clean = username.trim().replace(/^@/,"");
  const {data,error}=await supabase.from("profiles")
    .select("user_id,username,display_name").eq("username",clean).maybeSingle();
  if(error) throw error;
  return data;
}
async function loadNotifications(){
  if(!currentUser)return;
  const host=$("notifications-list");host.replaceChildren();
  const {data,error}=await supabase.from("notifications")
    .select("id,notification_type,reference_id,read_at,created_at")
    .eq("user_id",currentUser.id).order("created_at",{ascending:false}).limit(40);
  if(error)return message($("notifications-message"),"Notifications unavailable: "+error.message,true);
  const unread=(data||[]).filter(n=>!n.read_at).length;
  $("notification-count").textContent=unread>99?"99+":String(unread);
  if(!data?.length){message($("notifications-message"),"You're all caught up. New activity will appear here.");return;}
  const labels={new_follower:"Started following you",direct_message:"Sent you a private message",post_shared:"Shared a post with you",post_reaction:"Reacted to your post",post_comment:"Commented on your post"};
  for(const n of data){
    const row=node("div",n.read_at?"social-row":"social-row unread");
    const title=node("b","",labels[n.notification_type]||"New SyncTrA activity");
    const meta=node("small","",formatDate(n.created_at));
    const mark=node("button","text-button",n.read_at?"Read":"Mark read");mark.type="button";
    mark.addEventListener("click",async()=>{
      const {error:updateError}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",n.id).eq("user_id",currentUser.id);
      if(updateError)return message($("notifications-message"),updateError.message,true);
      await loadNotifications();
    });
    row.append(title,meta,mark);host.append(row);
  }
  message($("notifications-message"),`${data.length} recent notification${data.length===1?"":"s"} · ${unread} unread.`);
}
async function loadMessages(){
  if(!currentUser)return;
  const host=$("messages-list");host.replaceChildren();
  const {data:rows,error}=await supabase.from("direct_messages")
    .select("id,sender_id,recipient_id,body,read_at,created_at")
    .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
    .order("created_at",{ascending:false}).limit(80);
  if(error)return message($("messages-message"),"Messages unavailable: "+error.message,true);
  if(!rows?.length){message($("messages-message"),"Your private inbox is empty. Start a conversation using a member username.");return;}
  const ids=[...new Set(rows.map(r=>r.sender_id===currentUser.id?r.recipient_id:r.sender_id))];
  const {data:profiles,error:profileError}=await supabase.from("profiles").select("user_id,username,display_name").in("user_id",ids);
  if(profileError)return message($("messages-message"),"Could not load conversation members: "+profileError.message,true);
  const pmap=new Map((profiles||[]).map(p=>[p.user_id,p]));
  const conversations=new Map();
  for(const r of rows){
    const other=r.sender_id===currentUser.id?r.recipient_id:r.sender_id;
    if(!conversations.has(other))conversations.set(other,[]);
    conversations.get(other).push(r);
  }
  // Keep conversations ordered by most recent activity, but show every fetched
  // message inside each conversation from oldest to newest.
  const unreadIncoming=[];
  for(const [other,messages] of conversations){
    const p=pmap.get(other);if(!p)continue;
    messages.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    const thread=node("section","social-row message-thread");
    thread.append(node("b","",`${p.display_name} (@${p.username})`));
    const history=node("div","message-history");
    for(const r of messages){
      const mine=r.sender_id===currentUser.id;
      const entry=node("div",mine?"message-entry message-own":"message-entry message-incoming");
      entry.append(node("small","",mine?"You":p.display_name));
      entry.append(node("p","",r.body));
      entry.append(node("small","",formatDate(r.created_at)));
      history.append(entry);
      if(!mine&&!r.read_at)unreadIncoming.push(r.id);
    }
    thread.append(history);
    const form=node("form","inline-reply");
    const input=node("input","comment-input");input.maxLength=4000;input.required=true;input.placeholder="Reply privately…";
    const send=node("button","secondary","Send");send.type="submit";form.append(input,send);
    form.addEventListener("submit",async e=>{
      e.preventDefault();const body=input.value.trim();if(!body)return;
      send.disabled=true;
      const {error:sendError}=await supabase.from("direct_messages").insert({sender_id:currentUser.id,recipient_id:other,body});
      send.disabled=false;
      if(sendError)return message($("messages-message"),"Message not sent: "+sendError.message,true);
      await loadMessages();await loadNotifications();
    });
    thread.append(form);host.append(thread);
  }
  if(unreadIncoming.length){
    const {error:readError}=await supabase.from("direct_messages").update({read_at:new Date().toISOString()}).in("id",unreadIncoming);
    if(readError)message($("messages-message"),"Messages loaded, but read status could not be updated: "+readError.message,true);
  }
  message($("messages-message"),"Conversation history is preserved and displayed (up to the 80 most recent inbox messages). Messages are visible only to their sender and recipient.");
}
async function loadNetwork(){
  if(!currentUser)return;
  const [{data:followers,error:e1},{data:following,error:e2}]=await Promise.all([
    supabase.from("follows").select("follower_id,created_at").eq("followed_id",currentUser.id).order("created_at",{ascending:false}),
    supabase.from("follows").select("followed_id,created_at").eq("follower_id",currentUser.id).order("created_at",{ascending:false})
  ]);
  if(e1||e2)return message($("network-message"),(e1||e2).message,true);
  $("followers-count").textContent=(followers||[]).length;
  $("following-count").textContent=(following||[]).length;
  const ids=[...(followers||[]).map(x=>x.follower_id),...(following||[]).map(x=>x.followed_id)];
  const {data:profiles}=ids.length?await supabase.from("profiles").select("user_id,username,display_name").in("user_id",[...new Set(ids)]):{data:[]};
  const pmap=new Map((profiles||[]).map(p=>[p.user_id,p]));
  const fill=(id,rows,key,allowUnfollow)=>{
    const host=$(id);host.replaceChildren();
    if(!rows?.length){host.append(node("small","muted","No members yet."));return;}
    for(const r of rows){const p=pmap.get(r[key]);if(!p)continue;
      const line=node("div","network-person");line.append(node("span","",`${p.display_name} · @${p.username}`));
      if(allowUnfollow){const b=node("button","text-button","Unfollow");b.type="button";b.addEventListener("click",async()=>{
        const {error}=await supabase.from("follows").delete().eq("follower_id",currentUser.id).eq("followed_id",p.user_id);
        if(error)return message($("network-message"),error.message,true);await loadNetwork();
      });line.append(b);}
      host.append(line);
    }
  };
  fill("followers-list",followers,"follower_id",false);
  fill("following-list",following,"followed_id",true);
  message($("network-message"),"Follow relationships are private to signed-in SyncTrA members.");
}
$("follow-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;
  try{
    const profile=await profileForUsername($("follow-username").value);
    if(!profile)return message($("network-message"),"No active member found with that username.",true);
    if(profile.user_id===currentUser.id)return message($("network-message"),"You cannot follow your own account.",true);
    const {error}=await supabase.from("follows").insert({follower_id:currentUser.id,followed_id:profile.user_id});
    if(error)return message($("network-message"),error.code==="23505"?"You're already following this member.":error.message,true);
    form.reset();await loadNetwork();await loadNotifications();
  }catch(err){message($("network-message"),err.message,true);}
});
$("new-message-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;
  try{
    const profile=await profileForUsername($("message-username").value);
    if(!profile)return message($("messages-message"),"No active member found with that username.",true);
    if(profile.user_id===currentUser.id)return message($("messages-message"),"You cannot message yourself.",true);
    const body=$("message-first-body").value.trim();if(!body)return;
    const {error}=await supabase.from("direct_messages").insert({sender_id:currentUser.id,recipient_id:profile.user_id,body});
    if(error)return message($("messages-message"),error.message,true);
    form.reset();await loadMessages();await loadNotifications();
  }catch(err){message($("messages-message"),err.message,true);}
});
$("refresh-notifications").addEventListener("click",loadNotifications);
$("refresh-messages").addEventListener("click",loadMessages);
$("refresh-network").addEventListener("click",loadNetwork);


// Phase 6 Moderator Center. Moderator authorization is enforced by Supabase RPCs.
async function loadModeratorQueue() {
  const panel = $("moderator-panel");
  const host = $("moderator-queue");
  const status = $("moderator-message");
  if (!currentUser || !panel || !host || !status) return;
  status.textContent = "Checking administrator access…";
  host.replaceChildren();

  const { data, error } = await supabase.rpc("synctra_moderation_queue");
  if (error) {
    panel.classList.add("hidden");
    return; // Normal members do not see the admin panel.
  }
  panel.classList.remove("hidden");
  status.textContent = `${data.length} report(s) waiting for review.`;
  await loadModeratorAppeals();
  if (!data.length) {
    host.append(node("p", "muted", "No reports are waiting for review."));
    return;
  }

  for (const report of data) {
    const card = node("article", "panel moderation-card");
    const heading = node("h3", "", `${report.target_type} report · ${report.report_status}`);
    const reason = node("p", "moderation-reason", report.reason);
    const meta = node("small", "", `Report ID: ${report.report_id} · ${formatDate(report.created_at)}`);
    const label = node("label", "moderation-label", "Decision explanation");
    const note = node("textarea", "moderation-note");
    note.maxLength = 2000; note.rows = 3;
    note.placeholder = "Explain the policy reason and action…";
    label.append(note);
    const actions = node("div", "group-card-actions");
    for (const [caption, nextStatus] of [["Mark reviewing","reviewing"],["Take action","actioned"],["Dismiss report","dismissed"]]) {
      const button = node("button", "secondary", caption);
      button.type = "button";
      button.addEventListener("click", async () => {
        const explanation = note.value.trim();
        if (nextStatus !== "reviewing" && explanation.length < 5) {
          message(status, "Enter an explanation of at least 5 characters before a final decision.", true);
          return;
        }
        button.disabled = true;
        const { error: saveError } = await supabase.rpc("synctra_review_report", {
          p_report_id: report.report_id, p_status: nextStatus, p_note: explanation
        });
        button.disabled = false;
        if (saveError) {
          message(status, "Decision could not be saved: " + saveError.message, true);
          return;
        }
        message(status, "Decision saved to the audit log.");
        await loadModeratorQueue();
      });
      actions.append(button);
    }
    card.append(heading, reason, meta, label, actions);
    host.append(card);
  }
}

async function loadMyReports() {
  const host = $("my-reports-list");
  const status = $("my-reports-message");
  if (!currentUser || !host || !status) return;
  host.replaceChildren();
  const { data: reports, error } = await supabase.from("content_reports")
    .select("id,target_type,reason,report_status,created_at")
    .eq("reporter_id", currentUser.id)
    .order("created_at", { ascending: false }).limit(30);
  if (error) return message(status, "Your reports could not be loaded: " + error.message, true);
  if (!reports?.length) return message(status, "You have not submitted any reports.");

  const reportIds = reports.map(r => r.id);
  const { data: appeals, error: appealError } = await supabase.from("moderation_appeals")
    .select("id,report_id,appeal_reason,appeal_status,moderator_note,created_at")
    .eq("appellant_id", currentUser.id).in("report_id", reportIds);
  if (appealError) return message(status, "Appeal status could not be loaded: " + appealError.message, true);
  const appealMap = new Map((appeals || []).map(a => [a.report_id, a]));

  for (const report of reports) {
    const card = node("article", "panel member-report-card");
    const heading = node("h4", "", `${report.target_type.replaceAll("_", " ")} · ${report.report_status}`);
    const reason = node("p", "moderation-reason", report.reason);
    const meta = node("small", "", `Submitted ${formatDate(report.created_at)}`);
    card.append(heading, reason, meta);
    const appeal = appealMap.get(report.id);
    if (appeal) {
      const appealStatus = node("p", "appeal-status", `Appeal: ${appeal.appeal_status}`);
      card.append(appealStatus);
      if (appeal.moderator_note) card.append(node("p", "muted", `Moderator response: ${appeal.moderator_note}`));
      card.append(node("small", "", `Appeal submitted ${formatDate(appeal.created_at)}`));
    } else if (["actioned", "dismissed"].includes(report.report_status)) {
      const label = node("label", "moderation-label", "Request an appeal (10–2,000 characters)");
      const field = node("textarea", "moderation-note");
      field.rows = 3; field.maxLength = 2000;
      field.placeholder = "Explain why you believe the decision should be reviewed…";
      const submit = node("button", "secondary", "Submit appeal");
      submit.type = "button";
      submit.addEventListener("click", async () => {
        const text = field.value.trim();
        if (text.length < 10) return message(status, "Please provide at least 10 characters explaining your appeal.", true);
        submit.disabled = true;
        const { error: saveError } = await supabase.from("moderation_appeals").insert({
          report_id: report.id, appellant_id: currentUser.id, appeal_reason: text
        });
        submit.disabled = false;
        if (saveError) return message(status, saveError.code === "23505" ? "An appeal already exists for this report." : "Appeal could not be submitted: " + saveError.message, true);
        message(status, "Your appeal has been submitted for moderator review.");
        await loadMyReports();
      });
      label.append(field); card.append(label, submit);
    }
    host.append(card);
  }
  message(status, `${reports.length} report(s) shown.`);
}

async function loadModeratorAppeals() {
  const host = $("moderator-appeals");
  const status = $("moderator-message");
  if (!host || !status) return;
  host.replaceChildren();
  const { data, error } = await supabase.rpc("synctra_appeal_queue");
  if (error) {
    host.append(node("p", "muted", "Appeal queue unavailable: " + error.message));
    return;
  }
  if (!data?.length) {
    host.append(node("p", "muted", "No appeals are waiting for review."));
    return;
  }
  for (const appeal of data) {
    const card = node("article", "panel moderation-card");
    card.append(node("h4", "", `Appeal · ${appeal.appeal_status}`));
    card.append(node("p", "moderation-reason", appeal.appeal_reason));
    card.append(node("small", "", `${appeal.appellant_name} (@${appeal.appellant_username || "member"}) · ${appeal.target_type} · ${formatDate(appeal.appeal_created_at)}`));
    card.append(node("p", "muted", `Original report: ${appeal.report_reason}`));
    const label = node("label", "moderation-label", "Moderator decision note");
    const note = node("textarea", "moderation-note"); note.rows = 3; note.maxLength = 2000;
    note.placeholder = "Explain the appeal decision…"; label.append(note);
    const actions = node("div", "group-card-actions");
    for (const [caption, nextStatus] of [["Mark reviewing", "reviewing"], ["Accept appeal", "accepted"], ["Reject appeal", "rejected"]]) {
      const button = node("button", nextStatus === "accepted" ? "primary" : "secondary", caption);
      button.type = "button";
      button.addEventListener("click", async () => {
        const explanation = note.value.trim();
        if (nextStatus !== "reviewing" && explanation.length < 5) return message(status, "Add at least 5 characters explaining the final decision.", true);
        button.disabled = true;
        const { error: saveError } = await supabase.rpc("synctra_review_appeal", {
          p_appeal_id: appeal.appeal_id, p_status: nextStatus, p_note: explanation
        });
        button.disabled = false;
        if (saveError) return message(status, "Appeal decision could not be saved: " + saveError.message, true);
        message(status, "Appeal decision saved to the audit log.");
        await loadModeratorQueue();
      });
      actions.append(button);
    }
    card.append(label, actions); host.append(card);
  }
}

$("moderator-refresh")?.addEventListener("click", loadModeratorQueue);

$("logout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return message(dashboardMessage, error.message, true);
  currentUser = null; currentProfile = null;
  dashboardView.classList.add("hidden");
  authView.classList.remove("hidden");
  $("login-form").reset();
  showTab("login");
});
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    currentUser = null; currentProfile = null;
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
  }
});
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) await loadMember(session.user);

// Compact mobile quick-access menu; all original feature destinations remain available.
const closeQuickMenu = () => {
  $("quick-menu")?.classList.remove("menu-open");
  $("quick-menu-toggle")?.setAttribute("aria-expanded", "false");
};
$("quick-menu-toggle")?.addEventListener("click", () => {
  const menu = $("quick-menu");
  const open = menu.classList.toggle("menu-open");
  $("quick-menu-toggle").setAttribute("aria-expanded", String(open));
});
$("quick-menu")?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeQuickMenu));
document.addEventListener("keydown", event => { if(event.key === "Escape") closeQuickMenu(); });
document.addEventListener("click", event => {
  if(!$("quick-menu")?.classList.contains("menu-open"))return;
  if(event.target.closest("#quick-menu, #quick-menu-toggle"))return;
  closeQuickMenu();
});

// Phase 12 — compact app-style workspace navigation.
// Keep the existing features and belief/philosophy rooms intact, but show one
// workspace at a time so members do not need to scroll through every section.
(() => {
  const dashboard = $("dashboard-view");
  const memberContent = $("member-content");
  const drawer = $("quick-menu");
  const drawerLinks = [...(drawer?.querySelectorAll('a[href^="#"]') || [])]
    .filter(a => !a.classList.contains("app-nav-brand"));
  const bottomLinks = [...document.querySelectorAll(".mobile-bottom-nav a[href^='#']")];
  const allLinks = [...drawerLinks, ...bottomLinks];
  let activeTarget = "feed-section";

  function focusWorkspace(targetId, sourceLink = null, scroll = true) {
    const target = $(targetId);
    if (!target || !memberContent || !memberContent.contains(target)) return;
    // Reveal the selected path and collapse its sibling panels at every level.
    let branch = target;
    while (branch && branch !== memberContent) {
      const parent = branch.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) {
        if (sibling === branch) continue;
        sibling.classList.add("workspace-collapsed");
      }
      branch.classList.remove("workspace-collapsed");
      branch = parent;
    }
    activeTarget = targetId;
    allLinks.forEach(link => {
      const active = link.getAttribute("href") === "#" + targetId ||
        (link.dataset.workspace === "stream" && targetId === "feed-section") ||
        (link.dataset.workspace === "garden" && targetId === "groups-section") ||
        (link.dataset.workspace === "create" && targetId === "creative-space") ||
        (link.dataset.workspace === "chat" && targetId === "messages-panel") ||
        (link.dataset.workspace === "you" && targetId === "profile-card");
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    if (sourceLink && drawer?.contains(sourceLink)) closeQuickMenu();
    if (scroll) window.scrollTo({top: 0, behavior: "smooth"});
  }

  allLinks.forEach(link => link.addEventListener("click", event => {
    const targetId = link.getAttribute("href")?.slice(1);
    if (!targetId || !$(targetId) || !memberContent.contains($(targetId))) return;
    event.preventDefault();
    focusWorkspace(targetId, link);
  }));

  // Open on the Stream view after login; preserve the rest of the app in the drawer.
  const observer = new MutationObserver(() => {
    if (!dashboard.classList.contains("hidden") && !dashboard.dataset.workspaceReady) {
      dashboard.dataset.workspaceReady = "true";
      focusWorkspace("feed-section", null, false);
    }
    if (dashboard.classList.contains("hidden")) delete dashboard.dataset.workspaceReady;
  });
  observer.observe(dashboard, {attributes:true, attributeFilter:["class"]});

  // Swipeable public AI art gallery on the welcome page.
  const galleryTrack = $("ai-gallery-track");
  if (galleryTrack) {
    const gallerySlides = [...galleryTrack.querySelectorAll(".gallery-slide")];
    const galleryDots = [...document.querySelectorAll("#gallery-dots .gallery-dot")];
    const galleryCount = $("gallery-count");
    let galleryIndex = 0;
    const setGalleryIndex = index => {
      galleryIndex = Math.max(0, Math.min(gallerySlides.length - 1, index));
      gallerySlides[galleryIndex]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
      galleryDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === galleryIndex);
        if (i === galleryIndex) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
      });
      if (galleryCount) galleryCount.textContent = `${String(galleryIndex + 1).padStart(2,"0")} / ${String(gallerySlides.length).padStart(2,"0")}`;
    };
    $("gallery-prev")?.addEventListener("click", () => setGalleryIndex((galleryIndex - 1 + gallerySlides.length) % gallerySlides.length));
    $("gallery-next")?.addEventListener("click", () => setGalleryIndex((galleryIndex + 1) % gallerySlides.length));
    galleryDots.forEach((dot, i) => dot.addEventListener("click", () => setGalleryIndex(i)));
    let galleryScrollTimer;
    galleryTrack.addEventListener("scroll", () => {
      clearTimeout(galleryScrollTimer);
      galleryScrollTimer = setTimeout(() => {
        const center = galleryTrack.getBoundingClientRect().left + galleryTrack.clientWidth / 2;
        let nearest = 0, distance = Infinity;
        gallerySlides.forEach((slide, i) => {
          const rect = slide.getBoundingClientRect();
          const d = Math.abs(rect.left + rect.width / 2 - center);
          if (d < distance) { distance = d; nearest = i; }
        });
        galleryIndex = nearest;
        galleryDots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === nearest);
          if (i === nearest) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
        });
        if (galleryCount) galleryCount.textContent = `${String(nearest + 1).padStart(2,"0")} / ${String(gallerySlides.length).padStart(2,"0")}`;
      }, 90);
    }, {passive:true});
    $("gallery-join")?.addEventListener("click", () => $("welcome-evolve")?.click());
  }

  // Swipe horizontally between the five primary mobile destinations only.
  const primary = ["feed-section", "groups-section", "creative-space", "messages-panel", "profile-card"];
  let sx=0, sy=0, started=0;
  const ignored = 'input,textarea,select,button,a,[contenteditable="true"],.app-nav,.feed-list,.community-chat-list,.group-chat-list';
  dashboard.addEventListener("touchstart", event => {
    if (event.touches.length !== 1 || event.target.closest(ignored)) return;
    sx=event.touches[0].clientX; sy=event.touches[0].clientY; started=Date.now();
  }, {passive:true});
  dashboard.addEventListener("touchend", event => {
    if (!started || event.changedTouches.length !== 1) return;
    const dx=event.changedTouches[0].clientX-sx, dy=event.changedTouches[0].clientY-sy;
    const elapsed=Date.now()-started; started=0;
    if (Math.abs(dx)<75 || Math.abs(dx)<Math.abs(dy)*1.3 || elapsed>700) return;
    const index=primary.indexOf(activeTarget);
    if(index<0)return;
    const next=Math.max(0,Math.min(primary.length-1,index+(dx<0?1:-1)));
    focusWorkspace(primary[next]);
  }, {passive:true});
})();
