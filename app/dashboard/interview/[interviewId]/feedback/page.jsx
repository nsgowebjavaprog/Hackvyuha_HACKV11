import Feedback from "./Feedback";

export default async function Page({ params }) {
  const { interviewId } = await params; // Await params for Next.js 14+
  return <Feedback interviewId={interviewId} />;
}
