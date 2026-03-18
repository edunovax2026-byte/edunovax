// Firebase SDKs Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    onAuthStateChanged, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firestore Database Import
import { 
    getFirestore, collection, addDoc, getDocs, query, where,
    doc, deleteDoc, updateDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVrKnCoaXZU3ARHaIuzpYwlodcagKaYRQ",
  authDomain: "edunovax-899b0.firebaseapp.com",
  projectId: "edunovax-899b0",
  storageBucket: "edunovax-899b0.firebasestorage.app",
  messagingSenderId: "263688823638",
  appId: "1:263688823638:web:9af68e764c749af1b82cf7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🌟 ANTI-COPY & RIGHT-CLICK PROTECTION 🌟
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123) { return false; } 
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; } 
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; } 
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; } 
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; } 
};

function showNotification(message, type = 'info') {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        document.body.appendChild(toast);
    }
    toast.className = `custom-toast show ${type}`;
    toast.innerText = message;
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

const burger = document.getElementById('burger-menu');
const nav = document.querySelector('.nav-links');
if (burger) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });
}

const heroSlider = document.getElementById('hero-slider');
if (heroSlider) {
    async function loadHeroImages() {
        try {
            const docRef = doc(db, "settings", "website");
            const docSnap = await getDoc(docRef);
            let images = [];
            if (docSnap.exists() && docSnap.data().hero_images) {
                images = docSnap.data().hero_images;
            } else {
                images = ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600'];
            }
            heroSlider.innerHTML = '';
            images.forEach((url, index) => {
                const slide = document.createElement('div');
                slide.className = index === 0 ? 'hero-slide active' : 'hero-slide';
                slide.style.backgroundImage = `url('${url}')`;
                heroSlider.appendChild(slide);
            });
            if (images.length > 1) {
                let currentIndex = 0;
                setInterval(() => {
                    const slides = document.querySelectorAll('.hero-slide');
                    if(slides.length > 0) {
                        slides[currentIndex].classList.remove('active');
                        currentIndex = (currentIndex + 1) % slides.length;
                        slides[currentIndex].classList.add('active');
                    }
                }, 4000);
            }
        } catch (error) { console.error(error); }
    }
    loadHeroImages();
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            updateProfile(user, { displayName: name }).then(() => {
                sendEmailVerification(user).then(() => {
                    showNotification("Registration successful!", "success");
                    signOut(auth); 
                    setTimeout(() => { window.location.href = 'login.html'; }, 3000);
                });
            });
        }).catch((error) => { showNotification(error.message, "error"); });
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            if (userCredential.user.emailVerified) {
                showNotification("Login successful!", "success");
                setTimeout(() => { window.location.href = 'notes.html'; }, 1500);
            } else {
                showNotification("Your email is not verified yet!", "error");
                signOut(auth); 
            }
        }).catch((error) => { showNotification("Invalid email or password!", "error"); });
    });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signOut(auth).then(() => { window.location.href = 'login.html'; });
    });
}

// --- Admin Panel Logic ---
const adminForm = document.getElementById('admin-upload-form');
const adminNotesList = document.getElementById('admin-notes-list');

if (adminForm) {
    const noteTypeSelect = document.getElementById('note-type');
    const linkInputDiv = document.getElementById('link-input-div');
    const textInputDiv = document.getElementById('text-input-div');
    const imageInputDiv = document.getElementById('image-input-div'); 
    
    const uploadBtn = document.getElementById('upload-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('admin-form-title');
    const editNoteIdInput = document.getElementById('edit-note-id');

    const tabUpload = document.getElementById('tab-upload');
    const tabManage = document.getElementById('tab-manage');
    const secUpload = document.getElementById('section-upload');
    const secManage = document.getElementById('section-manage');

    if(tabUpload && tabManage) {
        tabUpload.addEventListener('click', () => {
            tabUpload.classList.add('active'); tabManage.classList.remove('active');
            secUpload.classList.add('active'); secManage.classList.remove('active');
        });
        tabManage.addEventListener('click', () => {
            tabManage.classList.add('active'); tabUpload.classList.remove('active');
            secManage.classList.add('active'); secUpload.classList.remove('active');
            loadAdminNotes(); 
        });
    }

    noteTypeSelect.addEventListener('change', function() {
        linkInputDiv.style.display = this.value === 'link' ? 'block' : 'none';
        textInputDiv.style.display = this.value === 'text' ? 'block' : 'none';
        if(imageInputDiv) imageInputDiv.style.display = this.value === 'image' ? 'block' : 'none';
    });

    async function loadAdminNotes() {
        if(!adminNotesList) return;
        adminNotesList.innerHTML = '<div class="cyber-spinner" style="margin: 20px auto;"></div>';
        try {
            const querySnapshot = await getDocs(collection(db, "notes"));
            if (querySnapshot.empty) {
                adminNotesList.innerHTML = '<p style="text-align:center; color:#94a3b8;">No notes uploaded yet.</p>';
                return;
            }
            let cardsHTML = `<div class="admin-cards-grid">`;
            querySnapshot.forEach((documentSnapshot) => {
                const note = documentSnapshot.data();
                const noteId = documentSnapshot.id;
                const safeTitle = note.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                const safeContent = note.content.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "\\n");
                cardsHTML += `
                    <div class="admin-card scale-in-bounce">
                        <div class="admin-card-header">
                            <span class="badge">${note.subject}</span><span class="badge semester">${note.semester}</span>
                        </div>
                        <h3>${note.title}</h3>
                        <div class="admin-actions">
                            <button class="action-btn btn-edit" onclick="editAdminNote('${noteId}', '${note.subject}', '${note.semester}', '${safeTitle}', '${note.type}', '${safeContent}')">✏️ Edit</button>
                            <button class="action-btn btn-del" onclick="deleteAdminNote('${noteId}')">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });
            cardsHTML += `</div>`;
            adminNotesList.innerHTML = cardsHTML;
        } catch (error) { adminNotesList.innerHTML = '<p class="error-text">Failed to connect to database.</p>'; }
    }

    loadAdminNotes();

    window.deleteAdminNote = async function(id) {
        if(confirm("⚠️ Are you sure you want to completely delete this note?")) {
            try { await deleteDoc(doc(db, "notes", id)); showNotification("Note deleted successfully!", "success"); loadAdminNotes(); } 
            catch (error) { showNotification("Error deleting note.", "error"); }
        }
    };

    window.editAdminNote = function(id, subject, semester, title, type, content) {
        if(tabUpload) tabUpload.click();
        formTitle.innerText = "Edit Selected Note"; uploadBtn.innerText = "Update Note"; cancelEditBtn.style.display = "block";
        editNoteIdInput.value = id;
        document.getElementById('note-subject').value = subject;
        document.getElementById('note-semester').value = semester;
        document.getElementById('note-title').value = title;
        document.getElementById('note-type').value = type;
        
        if(type === 'link') {
            document.getElementById('note-link').value = content;
            linkInputDiv.style.display = 'block'; textInputDiv.style.display = 'none'; if(imageInputDiv) imageInputDiv.style.display = 'none';
        } else if (type === 'text') {
            document.getElementById('note-text').value = content;
            linkInputDiv.style.display = 'none'; textInputDiv.style.display = 'block'; if(imageInputDiv) imageInputDiv.style.display = 'none';
        } else if (type === 'image') {
            if(document.getElementById('note-image')) document.getElementById('note-image').value = content;
            linkInputDiv.style.display = 'none'; textInputDiv.style.display = 'none'; if(imageInputDiv) imageInputDiv.style.display = 'block';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    cancelEditBtn.addEventListener('click', () => {
        adminForm.reset(); editNoteIdInput.value = ''; formTitle.innerText = "Upload New Notes";
        uploadBtn.innerText = "Upload Note"; cancelEditBtn.style.display = "none";
        linkInputDiv.style.display = 'block'; textInputDiv.style.display = 'none'; if(imageInputDiv) imageInputDiv.style.display = 'none';
    });

    adminForm.addEventListener('submit', async function(e) {
        e.preventDefault(); uploadBtn.innerText = "Saving Data..."; uploadBtn.disabled = true;

        const noteId = editNoteIdInput.value;
        const subject = document.getElementById('note-subject').value;
        const semester = document.getElementById('note-semester').value;
        const title = document.getElementById('note-title').value;
        const type = document.getElementById('note-type').value;
        const link = document.getElementById('note-link').value;
        const text = document.getElementById('note-text').value;
        const image = document.getElementById('note-image') ? document.getElementById('note-image').value : '';

        if (type === 'link' && link.trim() === '') { showNotification("Enter Google Drive link.", "error"); uploadBtn.innerText = "Upload Note"; uploadBtn.disabled = false; return; }
        if (type === 'text' && text.trim() === '') { showNotification("Paste some text.", "error"); uploadBtn.innerText = "Upload Note"; uploadBtn.disabled = false; return; }
        if (type === 'image' && image.trim() === '') { showNotification("Enter Image URL.", "error"); uploadBtn.innerText = "Upload Note"; uploadBtn.disabled = false; return; }

        let contentToSave = type === 'link' ? link : (type === 'text' ? text : image);

        try {
            const dataToSave = { subject: subject, semester: semester, title: title, type: type, content: contentToSave, timestamp: new Date() };
            if (noteId) { await updateDoc(doc(db, "notes", noteId), dataToSave); showNotification("Database Record Updated!", "success"); } 
            else { await addDoc(collection(db, "notes"), dataToSave); showNotification("New Module Uploaded Successfully!", "success"); }
            cancelEditBtn.click(); if(tabManage && tabManage.classList.contains('active')) loadAdminNotes(); 
        } catch (error) { showNotification("Data Error: " + error.message, "error"); }
        uploadBtn.innerText = "Upload Note"; uploadBtn.disabled = false;
    });
}

// --- 7. STUDENT PANEL FETCH & DISPLAY ---
const subjectsView = document.getElementById('subjects-view');
const notesListView = document.getElementById('notes-list-view');
const dynamicSubjectsDiv = document.getElementById('dynamic-subjects');
const notesContentArea = document.getElementById('notes-content-area');
const currentSubjectTitle = document.getElementById('current-subject-title');
const systemLoading = document.getElementById('system-loading');
const backBtn = document.getElementById('back-to-subjects');
const textNoteModal = document.getElementById('text-note-modal');
const closeTextModalBtn = document.getElementById('close-text-modal');

const allSubjects = ["Zoology", "Botany", "Applied Zoology", "English", "Geography", "Envs", "Constitutional Values"];
const allSemesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
let availableNotesMap = new Set();

async function initializeNotesSystem() {
    if (!subjectsView) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "notes"));
        querySnapshot.forEach((doc) => { availableNotesMap.add(`${doc.data().subject}-${doc.data().semester}`); });

        dynamicSubjectsDiv.innerHTML = ''; 
        allSubjects.forEach((subject, index) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'subject-group';
            groupDiv.style.animation = `fadeInUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${index * 0.1}s forwards`;
            groupDiv.style.opacity = '0'; 
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'subject-header';
            headerDiv.innerHTML = `<span>${subject}</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            
            const gridDiv = document.createElement('div');
            gridDiv.className = 'semester-grid';
            
            allSemesters.forEach(semester => {
                const btn = document.createElement('button');
                const isAvailable = availableNotesMap.has(`${subject}-${semester}`);
                if (isAvailable) {
                    btn.className = 'sem-btn unlocked';
                    btn.innerHTML = `<span class="icon">📘</span> <span>${semester}</span>`;
                    btn.addEventListener('click', (e) => { e.stopPropagation(); openNotesList(subject, semester); });
                } else {
                    btn.className = 'sem-btn locked';
                    btn.innerHTML = `<span class="icon">🔒</span> <span>${semester}</span>`;
                    btn.addEventListener('click', (e) => { e.stopPropagation(); showNotification(`No notes uploaded for ${subject} - ${semester}.`, "error"); });
                }
                gridDiv.appendChild(btn);
            });
            
            headerDiv.addEventListener('click', () => {
                document.querySelectorAll('.subject-group').forEach(group => { if(group !== groupDiv) group.classList.remove('active'); });
                groupDiv.classList.toggle('active');
            });
            groupDiv.appendChild(headerDiv); groupDiv.appendChild(gridDiv); dynamicSubjectsDiv.appendChild(groupDiv);
        });

        systemLoading.style.display = 'none';
        subjectsView.style.display = 'block';
    } catch (error) { showNotification("System Error: Failed to connect to database.", "error"); }
}

async function openNotesList(subject, semester) {
    subjectsView.style.display = 'none'; notesListView.style.display = 'block'; currentSubjectTitle.innerText = `${subject} - ${semester}`;
    notesContentArea.innerHTML = '<div class="cyber-spinner" style="margin: 50px auto;"></div>';

    try {
        const q = query(collection(db, "notes"), where("subject", "==", subject), where("semester", "==", semester));
        const querySnapshot = await getDocs(q);
        
        notesContentArea.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
            const note = doc.data();
            const card = document.createElement('div');
            card.className = 'modern-note-card scale-in-bounce'; 
            
            const title = document.createElement('h3');
            title.innerText = note.title;
            card.appendChild(title);
            
            // 🌟 A4 PAGE READER LOGIC FOR MOBILE 🌟
            if (note.type === 'link') {
                const readBtn = document.createElement('button');
                readBtn.className = 'neon-btn'; readBtn.innerText = 'View Document';
                readBtn.onclick = () => {
                    document.getElementById('text-note-title').innerText = ''; // Hide modal title for clean A4 view
                    let driveLink = note.content.replace(/\/view.*/, '/preview');
                    
                    document.getElementById('text-note-body').innerHTML = `
                        <div class="a4-paper">
                            <div class="pdf-page-border">
                                <div class="pdf-header">
                                    <div class="pdf-brand">
                                        <h1>Edu<span>Nova</span>X</h1>
                                        <p>Premium Educational Resources</p>
                                    </div>
                                </div>
                                <div class="pdf-divider-line"></div>
                                <div class="pdf-title">${note.title}</div>
                                
                                <div style="position: relative; width: 100%; height: 60vh; min-height: 400px; border-radius: 5px; overflow: hidden; background: #f8f9fa; border: 1px solid #bdc3c7;">
                                    <iframe src="${driveLink}" width="100%" height="100%" style="border: none; position: relative; z-index: 1;"></iframe>
                                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 50px; background: transparent; z-index: 999; cursor: default;"></div>
                                </div>
                                
                                <div class="pdf-disclaimer">
                                    <strong>Disclaimer:</strong> These study materials are curated for supplementary learning and reference purposes only. EduNovaX does not guarantee that specific questions from these notes will appear in official examinations.
                                </div>
                                <div class="pdf-footer">© ${new Date().getFullYear()} EduNovaX Official Document</div>
                            </div>
                        </div>
                    `;
                    textNoteModal.style.display = 'flex';
                };
                card.appendChild(readBtn);

            } else if (note.type === 'text' || note.type === 'image') {
                const readBtn = document.createElement('button');
                readBtn.className = 'neon-btn';
                readBtn.innerText = note.type === 'image' ? 'View Image Note' : 'Read Note';
                
                readBtn.onclick = () => {
                    document.getElementById('text-note-title').innerText = ''; // Hide modal title for clean A4 view
                    
                    let contentHtml = '';
                    if(note.type === 'image') {
                        contentHtml = `
                            <div style="text-align: center; user-select: none; pointer-events: none; width: 100%; margin: 20px 0;">
                                <img src="${note.content}" style="max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" alt="Note Image">
                            </div>`;
                    } else {
                        contentHtml = `
                            <div class="pdf-body">
                                ${note.content.replace(/\n/g, '<br>')}
                            </div>`;
                    }

                    document.getElementById('text-note-body').innerHTML = `
                        <div class="a4-paper">
                            <div class="pdf-page-border">
                                <div class="pdf-header">
                                    <div class="pdf-brand">
                                        <h1>Edu<span>Nova</span>X</h1>
                                        <p>Premium Educational Resources</p>
                                    </div>
                                </div>
                                <div class="pdf-divider-line"></div>
                                <div class="pdf-title">${note.title}</div>
                                
                                ${contentHtml}
                                
                                <div class="pdf-disclaimer">
                                    <strong>Disclaimer:</strong> These study materials are curated for supplementary learning and reference purposes only. EduNovaX does not guarantee that specific questions from these notes will appear in official examinations.
                                </div>
                                <div class="pdf-footer">© ${new Date().getFullYear()} EduNovaX Official Document</div>
                            </div>
                        </div>
                    `;
                    textNoteModal.style.display = 'flex';
                };
                card.appendChild(readBtn);
            }
            notesContentArea.appendChild(card);
        });
    } catch (error) { notesContentArea.innerHTML = '<p class="error-text">Error fetching notes.</p>'; }
}

if (backBtn) { backBtn.addEventListener('click', () => { notesListView.style.display = 'none'; subjectsView.style.display = 'block'; }); }
if (closeTextModalBtn) { closeTextModalBtn.addEventListener('click', () => { textNoteModal.style.display = 'none'; }); }

onAuthStateChanged(auth, (user) => {
    const isNotesPage = window.location.pathname.includes('notes.html');
    if (user && user.emailVerified) {
        if (isNotesPage) {
            initializeNotesSystem();
            const popup = document.getElementById('welcome-popup');
            if(popup) {
                document.getElementById('welcome-message').innerText = `Welcome, ${user.displayName || "Student"}!`;
                popup.style.display = 'flex';
                document.getElementById('close-popup').addEventListener('click', () => { popup.style.display = 'none'; });
            }
        }
    } else {
        if (isNotesPage) window.location.href = 'login.html';
    }
});  

const backToTopBtn = document.getElementById("backToTopBtn");
if(backToTopBtn) { backToTopBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); }); }  

// FAQ & Privacy Observer logic kept same as before...
setTimeout(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            const answerDiv = item.querySelector('.faq-answer');
            questionBtn.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
                } else {
                    answerDiv.style.maxHeight = null;
                }
            });
        });
    }
}, 300);
