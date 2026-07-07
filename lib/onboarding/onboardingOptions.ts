export const COLLEGE_OPTIONS = [
  "UC Berkeley","UCLA","UC Davis","UC Irvine","UC Merced","UC Riverside","UC San Diego","UC Santa Barbara","UC Santa Cruz",
  "Cal State East Bay","Cal State LA","Cal Poly Pomona","Cal Poly San Luis Obispo","San Francisco State University","San José State University",
  "Sacramento State","Fresno State","San Diego State University","USC","Stanford University","Howard University","Spelman College",
  "Morehouse College","Clark Atlanta University","Florida A&M University","Tuskegee University","North Carolina A&T State University",
  "American University of Antigua"
];

export const CAREER_OPTIONS = [
  "Doctor","Nurse","Attorney","Teacher","School Counselor","Social Worker","Engineer","Software Developer","Data Analyst",
  "Entrepreneur","Financial Advisor","Investment Advisor","Mortgage Loan Originator","Insurance Professional","Real Estate Developer",
  "Professional Athlete","Coach","Athletic Director","Sports Agent","Physical Therapist","Psychologist","Therapist","Artist",
  "Filmmaker","Journalist","Policy Analyst","City Planner","Nonprofit Executive","Business Owner","Chef","Electrician",
  "Carpenter","Pilot","Architect","Scientist","Marketing Director","Product Manager"
];

export const ACTIVITY_OPTIONS = [
  "Basketball","Football","Soccer","Track & Field","Volleyball","Baseball/Softball","Cheer","Dance","Student Government",
  "Debate","Robotics","Music","Theater","Visual Arts","Church/faith community","Volunteering","Part-time job","Caregiving",
  "Entrepreneurship","Internship","Community organizing"
];

export const CALIFORNIA_DISTRICTS = [
  "Oakland Unified School District","Vallejo City Unified School District","West Contra Costa Unified School District",
  "San Francisco Unified School District","Berkeley Unified School District","Alameda Unified School District",
  "San Leandro Unified School District","Hayward Unified School District","Fremont Unified School District",
  "Los Angeles Unified School District","Long Beach Unified School District","San Diego Unified School District",
  "Fresno Unified School District","Sacramento City Unified School District","Stockton Unified School District"
];


export const MAJOR_UNIVERSITY_OPTIONS = [
  "Brown University","Columbia University","Cornell University","Dartmouth College","Harvard University",
  "University of Pennsylvania","Princeton University","Yale University",
  "Arizona State University","Auburn University","Baylor University","Boston College","Boston University",
  "Brigham Young University","Carnegie Mellon University","Clemson University","Duke University",
  "Emory University","Florida State University","Georgetown University","Georgia Institute of Technology",
  "Gonzaga University","Indiana University Bloomington","Johns Hopkins University","Louisiana State University",
  "Michigan State University","New York University","Northwestern University","Ohio State University",
  "Oregon State University","Penn State University","Pepperdine University","Portland State University",
  "Purdue University","Rice University","Rutgers University","Syracuse University","Temple University",
  "Texas A&M University","Texas Southern University","Tulane University","University of Alabama",
  "University of Arizona","University of Arkansas","University of California, Berkeley",
  "University of California, Los Angeles","University of California, Davis","University of California, Irvine",
  "University of California, San Diego","University of California, Santa Barbara","University of Chicago",
  "University of Colorado Boulder","University of Florida","University of Georgia","University of Houston",
  "University of Illinois Urbana-Champaign","University of Iowa","University of Kansas","University of Kentucky",
  "University of Louisville","University of Maryland","University of Miami","University of Michigan",
  "University of Minnesota","University of Mississippi","University of Missouri","University of Nevada, Las Vegas",
  "University of North Carolina at Chapel Hill","University of Notre Dame","University of Oklahoma",
  "University of Oregon","University of Pittsburgh","University of Rhode Island","University of San Diego",
  "University of San Francisco","University of South Carolina","University of Southern California",
  "University of Tennessee","University of Texas at Austin","University of Virginia","University of Washington",
  "University of Wisconsin-Madison","Vanderbilt University","Villanova University","Virginia Tech",
  "Wake Forest University","Washington University in St. Louis"
];

export const ALL_COLLEGE_OPTIONS = Array.from(new Set([
  ...COLLEGE_OPTIONS,
  ...MAJOR_UNIVERSITY_OPTIONS
])).sort();
