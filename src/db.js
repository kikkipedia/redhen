import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {doc, setDoc, serverTimestamp, getDocs, collection, addDoc, getDoc } from "firebase/firestore";

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
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Creates the document for new users and updates it for returning users.
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
      { merge: true },
    );

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    };
  } catch (error) {
    console.error("Google sign-in failed:", error);

    switch (error.code) {
      case "auth/popup-closed-by-user":
        throw new Error("Google-inloggningen avbröts.");

      case "auth/popup-blocked":
        throw new Error("Webbläsaren blockerade inloggningsfönstret.");

      case "auth/cancelled-popup-request":
        throw new Error("En annan inloggning pågår redan.");

      case "auth/account-exists-with-different-credential":
        throw new Error(
          "E-postadressen används redan med en annan inloggningsmetod.",
        );

      case "auth/unauthorized-domain":
        throw new Error(
          "Den här domänen är inte godkänd i Firebase Authentication.",
        );

      default:
        throw new Error(error.message || "Google-inloggningen misslyckades.");
    }
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

    const user = userCredential.user;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    };
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
          "För många misslyckade försök. Försök igen senare.",
        );

      case "auth/network-request-failed":
        throw new Error("Nätverksfel. Kontrollera internetanslutningen.");

      default:
        throw new Error(error.message || "Inloggningen misslyckades.");
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
  const dateId = reportData.date
  const userId = reportData.userId

  if (!userId) {
    throw new Error("User ID missing.")
  }

  try {
    const reportRef = doc(
      db,
      "reports",
      dateId,
      "entries",
      userId
    )

    const existingReport = await getDoc(reportRef)

    if (existingReport.exists()) {
      await setDoc(
        reportRef,
        {
          ...reportData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      return {
        success: true,
        reportId: dateId,
        updated: true,
      }
    }

    await setDoc(reportRef, {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      reportId: dateId,
      updated: false,
    }

  } catch (error) {
    console.error("Could not save report:", error)
    throw new Error("Could not save report.")
  }
}

export async function fetchReports() {
  try {
    const reportsSnapshot = await getDocs(collection(db, "reports"));
    console.log('Fetched reports snapshot:', reportsSnapshot);
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
