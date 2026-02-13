import { auth, db } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  doc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const contentArea = document.getElementById("contentArea");
const welcomeText = document.getElementById("welcomeText");
const navItems = document.querySelectorAll(".nav-item");
const logoutBtn = document.getElementById("logoutBtn");

let studentData = null;
let currentUser = null;

/* ================= AUTH ================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const docRef = doc(db, "students", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    studentData = docSnap.data();
    welcomeText.textContent = `Welcome, ${studentData.name}`;
    loadDashboard();
  }

});

/* ================= DASHBOARD ================= */

function loadDashboard() {
  contentArea.innerHTML = `
    <div class="card-grid">
      <div class="card">
        <h3>Name</h3>
        <p>${studentData?.name || "-"}</p>
      </div>
      <div class="card">
        <h3>Email</h3>
        <p>${studentData?.email || currentUser.email}</p>
      </div>
      <div class="card">
        <h3>Status</h3>
        <p>Active</p>
      </div>
    </div>
  `;
}

/* ================= PROFILE ================= */

function loadProfile() {

  const firstLetter = studentData?.name 
    ? studentData.name.charAt(0).toUpperCase() 
    : "S";

  contentArea.innerHTML = `
    <div class="profile-container fade-in">

      <div class="profile-header">
        <div class="avatar">${firstLetter}</div>
        <div>
          <h2>${studentData?.name || "-"}</h2>
          <p>${studentData?.email || currentUser.email}</p>
        </div>
      </div>

      <div class="profile-card-grid">

        <div class="profile-card">
          <span class="profile-label">Date of Birth</span>
          <span class="profile-value">${studentData?.dob || "-"}</span>
        </div>

        <div class="profile-card">
          <span class="profile-label">Age</span>
          <span class="profile-value">${studentData?.age || "-"}</span>
        </div>

        <div class="profile-card">
          <span class="profile-label">State</span>
          <span class="profile-value">${studentData?.state || "-"}</span>
        </div>

        <div class="profile-card">
          <span class="profile-label">District</span>
          <span class="profile-value">${studentData?.district || "-"}</span>
        </div>

        <div class="profile-card">
          <span class="profile-label">Phone</span>
          <span class="profile-value">${studentData?.phone || "-"}</span>
        </div>

        <div class="profile-card">
          <span class="profile-label">Email</span>
          <span class="profile-value">${studentData?.email || currentUser.email}</span>
        </div>

      </div>

      <button id="editBtn" class="edit-btn">Edit Profile</button>

    </div>
  `;

  document.getElementById("editBtn")
    .addEventListener("click", loadEditForm);
}

/* ================= EDIT FORM ================= */

function loadEditForm() {

  contentArea.innerHTML = `
    <h2 style="margin-bottom:20px;">Edit Profile</h2>

    <form id="editForm" class="edit-form">

      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="name" value="${studentData?.name || ""}" required>
      </div>

      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" id="dob" value="${studentData?.dob || ""}">
      </div>

      <div class="form-group">
        <label>Age</label>
        <input type="number" id="age" value="${studentData?.age || ""}">
      </div>

      <div class="form-group">
        <label>State</label>
        <input type="text" id="state" value="${studentData?.state || ""}">
      </div>

      <div class="form-group">
        <label>District</label>
        <input type="text" id="district" value="${studentData?.district || ""}">
      </div>

      <div class="form-group">
        <label>Phone</label>
        <input type="text" id="phone" value="${studentData?.phone || ""}">
      </div>

      <button type="submit" class="save-btn">Save Profile Changes</button>

      <hr style="margin:30px 0;">

      <h3 style="margin-bottom:15px;">Change Password</h3>

      <div class="form-group">
        <label>Current Password</label>
        <input type="password" id="currentPassword">
      </div>

      <div class="form-group">
        <label>New Password</label>
        <input type="password" id="newPassword">
      </div>

      <div class="form-group">
        <label>Confirm New Password</label>
        <input type="password" id="confirmPassword">
      </div>

      <button type="button" id="changePasswordBtn" class="save-btn">
        Update Password
      </button>

      <div class="form-buttons">
        <button type="button" id="cancelBtn" class="cancel-btn">Cancel</button>
      </div>

    </form>
  `;

  document.getElementById("editForm").addEventListener("submit", saveProfile);
  document.getElementById("changePasswordBtn").addEventListener("click", handlePasswordChange);
  document.getElementById("cancelBtn").addEventListener("click", loadProfile);
}

/* ================= SAVE PROFILE ================= */

async function saveProfile(e) {
  e.preventDefault();

  const updatedData = {
    name: document.getElementById("name").value,
    dob: document.getElementById("dob").value,
    age: document.getElementById("age").value,
    state: document.getElementById("state").value,
    district: document.getElementById("district").value,
    phone: document.getElementById("phone").value
  };

  try {

    await updateDoc(doc(db, "students", currentUser.uid), updatedData);

    studentData = { ...studentData, ...updatedData };

    alert("Profile Updated Successfully!");
    welcomeText.textContent = `Welcome, ${studentData.name}`;
    loadProfile();

  } catch (error) {
    console.error(error);
    alert("Error updating profile");
  }
}

/* ================= PASSWORD CHANGE ================= */

async function handlePasswordChange() {

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match!");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);

    alert("Password Updated Successfully! Please login again.");

    await signOut(auth);
    window.location.href = "login.html";

  } catch (error) {
    console.error("Password update error:", error);
    alert(error.message);
  }
}

/* ================= NAVIGATION ================= */

navItems.forEach(item => {
  item.addEventListener("click", () => {

    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;

    if (section === "home") loadDashboard();
    if (section === "profile") loadProfile();
    if (section === "settings") {
      contentArea.innerHTML = "<h2>Settings</h2><p>Coming soon...</p>";
    }

  });
});

/* ================= LOGOUT ================= */

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
