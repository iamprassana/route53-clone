export default function HealthChecksPage() { return <ComingSoon title="Health checks" />; }
function ComingSoon({ title }: { title: string }) { return <section className="console-panel coming-soon"><h1>{title}</h1><p>Coming soon</p></section>; }
