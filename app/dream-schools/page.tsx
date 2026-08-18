import CollegePriorityManager from "@/components/academic/CollegePriorityManager";

export default function DreamSchoolsPage() {
  return (
    <CollegePriorityManager
      flag="is_dream"
      eyebrow="Academic · College Planning"
      title="Dream Schools"
      subtitle="Keep aspirational schools visible as a priority on your canonical college list without replacing how the school entered your list or creating a second datastore."
      activeLabel="Dream Schools"
      emptyTitle="Choose the schools that inspire you most"
      emptyCopy="Save schools in College Search, then mark the strongest aspirational possibilities as Dream Schools here."
      promoteHeading="Promote a school to Dream status"
      promoteLabel="Mark as Dream School"
      removeLabel="Remove Dream priority"
    />
  );
}
