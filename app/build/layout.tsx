export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
    return (
        <section className="absolute left-0 top-16">
            <div className="border" style={{ width: `100vw`, height: `calc(100vh - 66px)`}}>
                {children}
            </div>
        </section>
    );
}
