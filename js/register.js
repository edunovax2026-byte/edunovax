import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { states } from "./state-district-data.js";

const form = document.getElementById("registerForm");
const dobInput = document.getElementById("dob");
const ageInput = document.getElementById("age");
const stateSelect = document.getElementById("state");
const districtSelect = document.getElementById("district");


// ===============================
// 🔥 AGE CALCULATOR
// ===============================
dobInput.addEventListener("change", () => {

    if (!dobInput.value) return;

    const dob = new Date(dobInput.value);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
        monthDiff < 0 || 
        (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
        age--;
    }

    ageInput.value = age > 0 ? age : "";
});


// ===============================
// 🔥 LOAD STATES
// ===============================
function loadStates() {
    stateSelect.innerHTML = "<option value=''>Select State</option>";

    for (let state in states) {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    }
}

loadStates();


// ===============================
// 🔥 LOAD DISTRICTS
// ===============================
stateSelect.addEventListener("change", () => {

    districtSelect.innerHTML = "<option value=''>Select District</option>";
    const selectedState = stateSelect.value;

    if (selectedState && states[selectedState]) {
        states[selectedState].forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
});


// ===============================
// 🔥 REGISTER SYSTEM
// ===============================
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const dob = dobInput.value;
    const age = ageInput.value;
    const state = stateSelect.value;
    const district = districtSelect.value;
    const police = document.getElementById("police").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const postoffice = document.getElementById("postoffice").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // 🔐 Confirm Password Check
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // 🔐 Required Fields Check
    if (!name || !dob || !age || !state || !district || !email || !password) {
        alert("Please fill all required fields.");
        return;
    }

    try {

        // ✅ Create Firebase Auth Account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Send Email Verification
        await sendEmailVerification(user);

        // ✅ Save Student Data
        await setDoc(doc(db, "students", user.uid), {
            name,
            dob,
            age,
            state,
            district,
            police,
            pincode,
            postoffice,
            phone,
            email,
            emailVerified: false,
            createdAt: new Date()
        });

        alert("Registration Successful! Please verify your email before login.");

        form.reset();
        ageInput.value = "";
        districtSelect.innerHTML = "<option value=''>Select District</option>";

    } catch (error) {

        if (error.code === "auth/email-already-in-use") {
            alert("This email is already registered.");
        } else if (error.code === "auth/weak-password") {
            alert("Password must be at least 6 characters.");
        } else {
            alert(error.message);
        }

    }

});
