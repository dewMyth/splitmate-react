import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveUserToFirestore = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};
