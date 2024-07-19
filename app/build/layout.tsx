export default function BuildLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <section className="absolute left-0 top-16">
            <div className="border-t-1 border-gray-300 dark:border-gray-700"
                 style={{width: `100vw`, height: `calc(100vh - 66px)`}}>
                {children}
            </div>
        </section>
    );
}
