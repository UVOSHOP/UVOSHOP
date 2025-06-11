// Firebase init copied
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// On load, redirect accordingly
auth.onAuthStateChanged(user => {
  if (location.pathname.endsWith('login.html')) return;
  if (!user) return location.href = 'login.html';
  loadProfile(user.uid);
});

// Login & register
document.getElementById('loginBtn')?.onclick = () => {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(() => location.href = 'akun.html');
};
document.getElementById('registerBtn')?.onclick = () => {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(cred => db.ref('users/' + cred.user.uid).set({ email: email.value, saldo: 0 }))
    .then(() => alert('Registered!'));
};

function loadProfile(uid) {
  db.ref('users/' + uid).once('value').then(snap => {
    const data = snap.val();
    document.getElementById('profile').innerHTML = `
      <p>Email: ${data.email}</p>
      <p>Saldo: Rp ${data.saldo.toLocaleString()}</p>
    `;
    document.getElementById('logoutBtn').onclick = () => auth.signOut().then(() => location.href = 'login.html');
  });
}