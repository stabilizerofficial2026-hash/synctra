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

async function loadMember(user) {
  currentUser = user;
  message(dashboardMessage, "");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, bio, age_verified_at, account_status")
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
  await loadFeed();
  await loadGroups();
}

$("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || !currentProfile) return;
  const display_name = $("edit-display").value.trim();
  const bio = $("edit-bio").value.trim();
  if (!display_name || display_name.length > 60 || bio.length > 300)
    return message(dashboardMessage, "Please check the display name and bio length.", true);
  const { error } = await supabase.from("profiles").update({ display_name, bio }).eq("user_id", currentUser.id);
  if (error) return message(dashboardMessage, error.message, true);
  currentProfile.display_name = display_name;
  currentProfile.bio = bio;
  $("member-display").textContent = display_name;
  $("profile-name").textContent = display_name;
  $("avatar-letter").textContent = display_name.trim().charAt(0).toUpperCase();
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
    identity.append(node("b", "", author?.display_name || "SyncTrA member"));
    identity.append(node("small", "", "@" + (author?.username || "member")));
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
    const meta=document.createElement("small"); meta.textContent=`${active.length} active members · capacity ${Number(g.member_limit).toLocaleString()} · ${g.owner_id===currentUser.id?"You own this group":"Member"}`;
    const actions=document.createElement("div"); actions.className="group-card-actions";
    const open=document.createElement("button"); open.type="button"; open.className="primary"; open.textContent="Open group"; open.addEventListener("click",()=>openGroup(g));
    actions.append(open);
    if(g.owner_id===currentUser.id){
      const copy=document.createElement("button"); copy.type="button"; copy.className="secondary"; copy.textContent="Copy invitation ID";
      copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(g.id);message($("groups-message"),"Invitation ID copied. Share it privately with the intended member.");}catch{message($("groups-message"),"Copy unavailable. Group ID: "+g.id);}});
      actions.append(copy);
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
    const item=document.createElement("div");item.className="group-message";
    const author=document.createElement("b");author.textContent=map.get(row.sender_id)||"Member";
    const body=document.createElement("p");body.textContent=row.body;
    const time=document.createElement("small");time.textContent=new Date(row.created_at).toLocaleString();
    item.append(author,body,time);$("group-chat-list").append(item);
  }
}
$("group-create-form").addEventListener("submit",async e=>{
  e.preventDefault();const name=$("new-group-name").value.trim(),description=$("new-group-description").value.trim();
  const btn=$("create-group-button");btn.disabled=true;
  const {data,error}=await supabase.rpc("synctra_create_group",{p_group_name:name,p_description:description});
  btn.disabled=false;
  if(error)return message($("groups-message"),error.message,true);
  e.currentTarget.reset();message($("groups-message"),"Private group created. Invitation ID: "+data);
  await loadGroups();
});
$("group-join-form").addEventListener("submit",async e=>{
  e.preventDefault();const id=$("group-invite-id").value.trim();
  const {data,error}=await supabase.rpc("synctra_request_group_membership",{p_group_id:id});
  if(error)return message($("groups-message"),error.message,true);
  message($("groups-message"),data==="already_member"?"You are already a member.":"Join request sent. The group owner must approve it.");
  e.currentTarget.reset();
});
$("refresh-groups").addEventListener("click",loadGroups);
$("close-group-room").addEventListener("click",()=>{$("group-room").classList.add("hidden");activeGroupId=null;});
$("group-message-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!activeGroupId||!currentUser)return;
  const body=$("group-message-body").value.trim();if(!body)return;
  const button=e.currentTarget.querySelector("button");button.disabled=true;
  const {error}=await supabase.from("group_messages").insert({group_id:activeGroupId,sender_id:currentUser.id,body});
  button.disabled=false;
  if(error)return message($("groups-message"),"Message not sent: "+error.message,true);
  $("group-message-body").value="";await loadGroupMessages();
});


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
