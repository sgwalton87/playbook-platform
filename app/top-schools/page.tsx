import CollegePriorityManager from "@/components/academic/CollegePriorityManager";

export default function TopSchoolsPage() {
  return (
    <CollegePriorityManager
      flag="is_top"
      eyebrow="Academic · College Planning"
      title="Top Schools"
      subtitle="Build a focused best-fit shortlist on the same canonical college list used by College Search, Dream Schools, deadlines, and application planning."
      activeLabel="Top Schools"
      emptyTitle="Build your best-fit shortlist"
      emptyCopy="Save schools in College Search, then mark the schools you are prioritizing most strongly as Top Schools. A school may also remain a Dream School."
      promoteHeading="Promote a school to Top status"
      promoteLabel="Mark as Top School"
      removeLabel="Remove Top priority"
    />
  );
}
