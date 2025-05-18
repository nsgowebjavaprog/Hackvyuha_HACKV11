import StartInterview from "./StartInterview";

export default async function Page({ params }) {
  const { interviewId } = await params; // Next.js 14+ requires await
  return <StartInterview interviewId={interviewId} />;
}