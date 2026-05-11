import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user profile
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Project functions
export const saveProject = async (userId: string, projectData: { name: string, language: string, code: string, id?: string, userId: string }) => {
  const projectsRef = collection(db, 'projects');
  const id = projectData.id || doc(projectsRef).id;
  const projectDoc = doc(db, 'projects', id);
  
  const data = {
    ...projectData,
    id,
    userId,
    updatedAt: serverTimestamp(),
    createdAt: projectData.id ? undefined : serverTimestamp()
  };
  
  // Clean up undefined for merge
  Object.keys(data).forEach(key => (data as any)[key] === undefined && delete (data as any)[key]);

  await setDoc(projectDoc, data, { merge: true });
  return id;
};

export const getProjects = async (userId: string) => {
  const q = query(collection(db, 'projects'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};
