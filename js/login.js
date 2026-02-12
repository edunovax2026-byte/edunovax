import { auth } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

// ===============================
// 🔐 LOGIN SYSTEM
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔥 Email Verification Check
        if (!user.emailVerified) {
            alert("Please verify your email before login.");
            await signOut(auth);
            return;
        }

        alert("Login Successful!");
        window.location.href = "dashboard.html";

    } catch (error) {

        if (error.code === "auth/user-not-found") {
            alert("No account found with this email.");
        } 
        else if (error.code === "auth/wrong-password") {
            alert("Incorrect password.");
        } 
        else if (error.code === "auth/invalid-email") {
            alert("Invalid email format.");
        }
        else {
            alert(error.message);
        }

    }
});


// ===============================
// 🔁 FORGOT PASSWORD SYSTEM
// ===============================
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();

        if (!email) {
            alert("Please enter your email first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent! Please check your inbox or spam folder.");
        } catch (error) {

            if (error.code === "auth/user-not-found") {
                alert("No account found with this email.");
            } 
            else if (error.code === "auth/invalid-email") {
                alert("Invalid email format.");
            }
            else {
                alert(error.message);
            }

        }
    });
}
