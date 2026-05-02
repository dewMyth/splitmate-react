import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveUserToFirestore = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

export const saveGroupToFirestore = async (group) => {
  try {
    const groupRef = doc(db, "groups", group.id);
    await setDoc(groupRef, {
      name: group.name,
      emoji: group.emoji,
      category: group.category,
      participants: group.participants,
    });
  } catch (error) {
    console.error("Error saving group to Firestore:", error);
  }
};
