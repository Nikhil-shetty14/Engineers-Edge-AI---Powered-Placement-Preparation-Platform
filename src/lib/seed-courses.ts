'use client';
import { Firestore, collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { placementCourses } from "./course-data";

/**
 * Seeds the 'courses' collection in Firestore with predefined placement-related courses.
 * It checks for existing courses by title to prevent duplicates.
 *
 * @param {Firestore} db - The Firestore database instance.
 */
export async function seedCourses(db: Firestore) {
  const coursesRef = collection(db, "courses");
  const coursesAdded = [];

  for (const courseData of placementCourses) {
    // Check if a course with the same title already exists
    const q = query(coursesRef, where("title", "==", courseData.title));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no course with this title exists, add it.
      try {
        const docRef = await addDoc(coursesRef, courseData);
        coursesAdded.push({ id: docRef.id, ...courseData });
      } catch (error) {
        console.error(`Error adding course "${courseData.title}":`, error);
        throw new Error(`Failed to add course: ${courseData.title}`);
      }
    } else {
      console.log(`Course "${courseData.title}" already exists. Skipping.`);
    }
  }

  if (coursesAdded.length > 0) {
    console.log(`Successfully added ${coursesAdded.length} new courses.`);
  } else {
    console.log("No new courses were added. The database is already up-to-date.");
  }
}
