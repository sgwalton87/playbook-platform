export const AG_COURSES: Record<string, string[]> = {
  A: ["World History","U.S. History","U.S. History and Geography","Government","Economics","AP World History","AP U.S. History","AP Government","AP Economics","AP Macroeconomics","AP Microeconomics","AP Human Geography","IB History","IB Economics","Geography","Civics","Social Studies","Contemporary World Problems"],
  B: ["English 9","English 10","English 11","English 12","American Literature","World Literature","Composition I","Composition II","AP English Language","AP English Literature","IB English","Creative Writing","Journalism","Speech & Debate","Advanced Composition","British Literature"],
  C: ["Algebra I","Geometry","Algebra II","Pre-Calculus","Calculus","AP Calculus AB","AP Calculus BC","AP Statistics","IB Mathematics","Statistics","Trigonometry","Integrated Math I","Integrated Math II","Integrated Math III","Discrete Math","Linear Algebra"],
  D: ["Biology","Chemistry","Physics","AP Biology","AP Chemistry","AP Physics 1","AP Physics 2","AP Physics C","AP Environmental Science","IB Biology","IB Chemistry","IB Physics","Anatomy","Physiology","Marine Biology","Earth Science","Ecology","Forensic Science","Astronomy"],
  E: ["Spanish I","Spanish II","Spanish III","Spanish IV","AP Spanish Language","AP Spanish Literature","French I","French II","French III","AP French","Mandarin I","Mandarin II","Mandarin III","AP Chinese","Japanese I","Japanese II","AP Japanese","American Sign Language I","American Sign Language II","Latin I","Latin II","Arabic I","Arabic II","Korean I","Korean II"],
  F: ["Art I","Art II","AP Art History","AP Studio Art","Digital Photography","Photography I","Photography II","Film Studies","Cinema Literature","Drama I","Drama II","Theater Arts","Music Theory","AP Music Theory","Band","Orchestra","Choir","Dance I","Dance II","Ceramics","Graphic Design","Digital Art","Video Production"],
  G: ["Personal Finance","Psychology","Sociology","Philosophy","Computer Science","AP Computer Science A","AP Computer Science Principles","Health","Health and Wellness","World Religions","Ethnic Studies","Environmental Science","Astronomy","Nutrition","Child Development","Introduction to Engineering","Robotics","Accounting","Business","Entrepreneurship","Medical Terminology","Sports Medicine","Archery"],
};

export const AG_SUBJECT_NAMES: Record<string, string> = {
  A: "History / Social Science",
  B: "English",
  C: "Mathematics",
  D: "Laboratory Science",
  E: "Language Other Than English",
  F: "Visual & Performing Arts",
  G: "College-Prep Elective",
};

export const AG_REQUIREMENTS: Record<string, number> = {
  A: 2, B: 4, C: 3, D: 2, E: 2, F: 1, G: 1,
};
