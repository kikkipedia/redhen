import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {doc, setDoc, serverTimestamp, getDocs, collection, addDoc, getDoc, collectionGroup, query, where } from "firebase/firestore";

export async function registerUser({
  email,
  password,
  displayName,
}) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Ange email");
  }
  if (!password) {
    throw new Error("Ange lösenord");
  }
  try {
    // Create the Firebase Authentication account.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );
    const user = userCredential.user;
    // Add the display name to the Authentication profile.
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName,
      });
    }

    // Create a Firestore document using the Firebase Auth UID.
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
    };
  } catch (error) {
    console.error("Could not register user:", error);
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("An account with this email already exists.");
      case "auth/invalid-email":
        throw new Error("The email address is invalid.");
      case "auth/weak-password":
        throw new Error("The password is too weak.");
      case "auth/operation-not-allowed":
        throw new Error(
          "Email and password registration is not enabled in Firebase.",
        );
      case "auth/network-request-failed":
        throw new Error("Network error. Check your internet connection.");
      default:
        throw new Error(error.message || "Could not register the user.");
    }
  }
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    await setPersistence(auth, browserLocalPersistence);

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: "google",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    localStorage.setItem("uid", user.uid);
    localStorage.setItem(
      "user",
      user.displayName || user.email || ""
    );

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    };
  } catch (error) {
    console.error("Google sign-in failed:", error);

    throw error;
  }
}

export async function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Ange email");
  }

  if (!password) {
    throw new Error("Ange lösenord");
  }

  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    };

    localStorage.setItem("uid", user.uid);
    localStorage.setItem(
      "user",
      user.displayName || user.email || ""
    );

    return userData;
  } catch (error) {
    console.error("Could not log in:", error);

    switch (error.code) {
      case "auth/invalid-email":
        throw new Error("Ogiltig e-postadress.");

      case "auth/invalid-credential":
        throw new Error("Fel e-postadress eller lösenord.");

      case "auth/user-disabled":
        throw new Error("Kontot har inaktiverats.");

      case "auth/too-many-requests":
        throw new Error(
          "För många misslyckade försök. Försök igen senare."
        );

      case "auth/network-request-failed":
        throw new Error(
          "Nätverksfel. Kontrollera internetanslutningen."
        );

      default:
        throw new Error(
          error.message || "Inloggningen misslyckades."
        );
    }
  }
}

export function getDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Can save multiple erports for same day 
export async function saveReport(reportData) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const dateId =
    typeof reportData.date === "string"
      ? reportData.date
      : getDate(reportData.date || new Date());

  try {
    const entriesRef = collection(
      db,
      "reports",
      dateId,
      "entries"
    );

    const reportRef = await addDoc(entriesRef, {
      ...reportData,

      userId: user.uid,

      displayName:
        user.displayName ||
        user.email ||
        "Okänd användare",

      date: dateId,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      reportId: dateId,
      entryId: reportRef.id,
    };
  } catch (error) {
    console.error(
      "Could not save report:",
      error
    );

    throw new Error(
      "Could not save report."
    );
  }
}

export async function fetchReports() {
  try {
    const reportsSnapshot = await getDocs(collection(db, "reports"));

    const reports = reportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return reports;
  } catch (error) {
    console.error("Could not fetch reports:", error);
    throw new Error("Could not fetch reports.");
  }
}

export async function fetchUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User data not found.");
    }
  } catch (error) {
    console.error("Could not fetch user data:", error);
    throw new Error("Could not fetch user data.");
  }
}

export async function resetPassword(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Ange email");
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);

    return {
      success: true,
      message: "Ett återställningsmail har skickats.",
    };
  } catch (error) {
    console.error("Could not send password reset email:", error);

    switch (error.code) {
      case "auth/invalid-email":
        throw new Error("Ogiltig e-postadress.");

      case "auth/too-many-requests":
        throw new Error(
          "För många försök. Vänta en stund och försök igen."
        );

      case "auth/network-request-failed":
        throw new Error(
          "Nätverksfel. Kontrollera internetanslutningen."
        );

      default:
        throw new Error(
          error.message || "Kunde inte skicka återställningsmail."
        );
    }
  }
}

export async function fetchReportsByDate(dateId) {
  try {
    const snapshot = await getDocs(
      collection(db, "reports", dateId, "entries")
    )

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Could not fetch reports:", error)
    throw new Error("Could not fetch reports.")
  }
}

export async function fetchReportsForWeek(startDate, endDate) {
  try {
    const q = query(
      collectionGroup(db, 'entries'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Could not fetch weekly reports:', error)
    throw new Error('Could not fetch weekly reports.')
  }
}

export async function enableAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Could not enable auth persistence:", error);
    throw error;
  }
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
    } else {
      callback(null);
    }
  });
}

export function getCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
  };
}

export async function logoutUser() {
  try {
    await signOut(auth);

    localStorage.removeItem("uid");
    localStorage.removeItem("user");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Could not log out:", error);
    throw new Error("Utloggningen misslyckades.");
  }
}