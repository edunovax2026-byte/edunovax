import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const contentArea = document.getElementById("contentArea");
const welcomeText = document.getElementById("welcomeText");
const navItems = document.querySelectorAll(".nav-item");
const logoutBtn = document.getElementById("logoutBtn");

let studentData = null;

/* ================= AUTH ================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const docRef = doc(db, "students", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    studentData = docSnap.data();
    welcomeText.textContent = `Welcome, ${studentData.name}`;
    loadDashboard();
  }
});

/* ================= SECTIONS ================= */

function loadDashboard() {
  contentArea.innerHTML = `
    <div class="card-grid">
      <div class="card">
        <h3>Total Courses</h3>
        <p>5</p>
      </div>
      <div class="card">
        <h3>Status</h3>
        <p>Active</p>
      </div>
      <div class="card">
        <h3>Account Type</h3>
        <p>Student</p>
      </div>
    </div>
  `;
}

function loadProfile() {
  contentArea.innerHTML = `
    <h2>Profile Information</h2>
    <div class="profile-grid">
      <div class="profile-item"><b>DOB:</b> ${studentData.dob}</div>
      <div class="profile-item"><b>Age:</b> ${studentData.age}</div>
      <div class="profile-item"><b>State:</b> ${studentData.state}</div>
      <div class="profile-item"><b>District:</b> ${studentData.district}</div>
      <div class="profile-item"><b>Police:</b> ${studentData.police}</div>
      <div class="profile-item"><b>Pincode:</b> ${studentData.pincode}</div>
      <div class="profile-item"><b>Post Office:</b> ${studentData.postoffice}</div>
      <div class="profile-item"><b>Phone:</b> ${studentData.phone}</div>
      <div class="profile-item"><b>Email:</b> ${studentData.email}</div>
    </div>
  `;
}

function loadSettings() {
  contentArea.innerHTML = `
    <h2>Settings</h2>
    <p>More enterprise features coming soon...</p>
  `;
}

/* ================= NAVIGATION ================= */

navItems.forEach(item => {
  item.addEventListener("click", () => {

    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;

    if (section === "home") loadDashboard();
    if (section === "profile") loadProfile();
    if (section === "settings") loadSettings();
  });
});

/* ================= LOGOUT ================= */

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
