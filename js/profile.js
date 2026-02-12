const auth = firebase.auth();
const db = firebase.firestore();

let currentUserId = null;
let originalData = {};

auth.onAuthStateChanged(user => {
  if(user){
    currentUserId = user.uid;
    loadProfile(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

function loadProfile(uid){
  db.collection("students").doc(uid).get()
  .then(doc=>{
    if(doc.exists){
      const data = doc.data();
      originalData = data;

      document.getElementById("name").value = data.name;
      document.getElementById("email").value = data.email;
      document.getElementById("department").value = data.department;
      document.getElementById("semester").value = data.semester;
    }
  });
}

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

editBtn.onclick = () => {
  toggleEdit(true);
};

cancelBtn.onclick = () => {
  document.getElementById("name").value = originalData.name;
  document.getElementById("department").value = originalData.department;
  document.getElementById("semester").value = originalData.semester;
  toggleEdit(false);
};

saveBtn.onclick = () => {
  const updatedData = {
    name: document.getElementById("name").value,
    department: document.getElementById("department").value,
    semester: document.getElementById("semester").value
  };

  db.collection("students").doc(currentUserId).update(updatedData)
  .then(()=>{
    document.getElementById("message").innerText = "Profile Updated Successfully!";
    document.getElementById("message").style.color = "green";
    originalData = {...originalData, ...updatedData};
    toggleEdit(false);
  })
  .catch(()=>{
    document.getElementById("message").innerText = "Update Failed!";
    document.getElementById("message").style.color = "red";
  });
};

function toggleEdit(enable){
  document.getElementById("name").disabled = !enable;
  document.getElementById("department").disabled = !enable;
  document.getElementById("semester").disabled = !enable;

  editBtn.style.display = enable ? "none" : "block";
  saveBtn.style.display = enable ? "block" : "none";
  cancelBtn.style.display = enable ? "block" : "none";
}
