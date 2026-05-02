import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
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
      participantIds: group.participantsIds,
      expenses: [],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving group to Firestore:", error);
  }
};

export const getGroupFromFirestoreForAUser = async (userId) => {
  try {
    // Fetch the groups that user is a participant of
    const q = query(
      collection(db, "groups"),
      where("participantIds", "array-contains", userId),
    );

    const snapshot = await getDocs(q);

    // Return the groups as an array of objects
    const groupsOfUser = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return groupsOfUser;
  } catch (error) {
    console.error("Error fetching group from Firestore:", error);
    return null;
  }
};

export const getGroupDataFromFirestoreByGroupId = async (groupId) => {
  try {
    const docRef = doc(db, "groups", groupId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Group data fetched from Firestore:", docSnap.data());
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("No such group!");

      return null;
    }
  } catch (error) {
    console.error("Error fetching group:", error);

    return null;
  }
};
