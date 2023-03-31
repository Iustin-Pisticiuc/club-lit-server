import * as admin from "firebase-admin";
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";

export const getCollectionReference = (
  collection: string
): CollectionReference => {
  const collectionFound = admin.firestore().collection(collection);

  return collectionFound;
};
export const getDocumentQuerySnapshotData = (
  collection: string
): Promise<QuerySnapshot<DocumentData>> => {
  const collectionFound = admin.firestore().collection(collection).get();

  return collectionFound;
};

export const getDocumentReference = (
  collection: string,
  id: string
): DocumentReference => {
  const reference = getCollectionReference(collection).doc(id);

  return reference;
};

export const getDocumentSnapshot = async (
  collection: string,
  id: string
): Promise<DocumentSnapshot> => {
  const snapshot = await getCollectionReference(collection).doc(id).get();

  return snapshot;
};

export const getDocumentSnapshotData = async (
  collection: string,
  id: string
): Promise<DocumentSnapshot<DocumentData>> => {
  const collectionReference = getCollectionReference(collection).doc(id);

  const documentReference = await collectionReference
    .get()
    .then((snapshot: { data: () => any }) => {
      return snapshot.data();
    });

  return documentReference;
};
