export default function RunLayout({children}: {children: React.ReactNode}) {
    return (
        <section className="absolute left-0 top-[50px]">
            <div className="border-t-1 dark:border-zinc-800" style={{width: `100vw`, height: `calc(100vh - 50px)`}}>
                {children}
            </div>
        </section>
    );
}
