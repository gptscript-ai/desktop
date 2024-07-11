export default function RunLayout({
	children,
}: {
	children: React.ReactNode;
}) {
    return (
        <section className="absolute left-0 top-16">
            <div className="border-t-2 dark:border-zinc-800" style={{ width: `100vw`, height: `calc(100vh - 66px)`}}>
                {children}
            </div>
        </section>
    );
}
