import TeamProfileClient from "./TeamProfileClient";

export default function TeamMemberPage({ params }) {
  const { id } = params;
  return <TeamProfileClient memberId={id} />;
}